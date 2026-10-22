#!/usr/bin/env bash
# rlsok-pull-deploy: publish the newest "site-YYYYMMDD.N" tag of the public GitHub repo to rlsok.com.
# Run by rlsok-pull-deploy.timer every 5 minutes. No SSH, no GitHub credentials (public repo, read only).
#
#   /srv/rlsok/current         -> symlink served by Caddy (switched atomically)
#   /srv/rlsok/releases/gh-<tag>   one directory per deployed tag
#   /srv/rlsok/DEPLOYED_TAG    tag now live          /srv/rlsok/PREVIOUS_RELEASE  directory before the last switch
#   /srv/rlsok/HOLD            if present: do nothing (freeze)
#   /srv/rlsok/PIN             if it holds a tag: deploy exactly that tag instead of the newest
#   /srv/rlsok/failed/<tag>    tag that failed a check; never retried (delete the file to retry)
#   /var/log/rlsok-deploy.log  one line per action
set -Eeuo pipefail
umask 022

REPO="${RLSOK_REPO:-ZqiEE/rlsok-engineering}"
BASE="${RLSOK_BASE:-/srv/rlsok}"
HOST="${RLSOK_HOST:-rlsok.com}"
LOG="${RLSOK_LOG:-/var/log/rlsok-deploy.log}"
KEEP=6                      # gh-* release directories kept besides current and previous
MAX_MB=150                  # site size limit (downloads live in GitHub Releases)
TAG_RE='^site-[0-9]{8}\.[0-9]+$'
# test-only overrides (unset in production): a local .tar.gz instead of GitHub, a plain URL instead of Caddy on :443
SRC_TGZ="${RLSOK_SRC_TGZ:-}"
CHECK_BASE="${RLSOK_CHECK_BASE:-}"

log() { echo "$(date -u +%FT%TZ) $*" >> "$LOG"; }

exec 9>/run/rlsok-deploy.lock
flock -n 9 || exit 0
[ -e "$BASE/HOLD" ] && exit 0
mkdir -p "$BASE/releases" "$BASE/failed"

latest_tag() {
  if command -v git >/dev/null; then
    git ls-remote --tags --refs "https://github.com/$REPO.git" 'site-*' 2>/dev/null | awk -F/ '{print $3}'
  else
    curl -fsS --max-time 30 -H 'Accept: application/vnd.github+json' "https://api.github.com/repos/$REPO/tags?per_page=100" |
      python3 -c 'import json,sys; [print(t["name"]) for t in json.load(sys.stdin)]'
  fi | grep -E "$TAG_RE" | sort -t. -k1,1 -k2,2n | tail -n 1
}

if [ -s "$BASE/PIN" ]; then TAG="$(tr -d ' \r\n' < "$BASE/PIN")"; else TAG="$(latest_tag || true)"; fi
[ -n "$TAG" ] || exit 0
[[ "$TAG" =~ $TAG_RE ]] || { log "SKIP invalid tag name '$TAG'"; exit 0; }
[ "$TAG" = "$(cat "$BASE/DEPLOYED_TAG" 2>/dev/null || true)" ] && exit 0
[ -e "$BASE/failed/$TAG" ] && exit 0

NEW="$BASE/releases/gh-$TAG"
CUR="$(readlink -f "$BASE/current" || true)"
WORK="$(mktemp -d "$BASE/.work.XXXXXX")"
SWITCHED=0; COMMITTED=0
restore() {   # any exit after the switch and before the commit puts the previous release back
  if [ "$SWITCHED" = 1 ] && [ "$COMMITTED" = 0 ] && [ -n "$CUR" ] && [ -d "$CUR" ]; then
    ln -sfn "$CUR" "$BASE/current.new" && mv -T "$BASE/current.new" "$BASE/current"
    log "ROLLBACK $TAG: current restored to $CUR"
    [ -e "$BASE/failed/$TAG" ] || echo "$(date -u +%FT%TZ) unexpected exit after switch" > "$BASE/failed/$TAG"
  fi
  rm -rf "$WORK"
}
trap restore EXIT
fail() { log "FAIL $TAG: $*"; echo "$(date -u +%FT%TZ) $*" > "$BASE/failed/$TAG"; exit 1; }

log "START $TAG (live: $(cat "$BASE/DEPLOYED_TAG" 2>/dev/null || echo none), current -> $CUR)"
[ "$NEW" = "$CUR" ] && fail "target directory is the live one"
[ -e "$NEW" ] && rm -rf "$NEW"                       # leftover of an interrupted run, never the live one (checked above)

# 1. fetch the tag's source archive (public, no credentials)
if [ -n "$SRC_TGZ" ]; then cp "$SRC_TGZ" "$WORK/src.tgz"; else
  curl -fsSL --proto '=https' --max-time 300 --max-filesize $((MAX_MB * 2 * 1048576)) \
    -o "$WORK/src.tgz" "https://codeload.github.com/$REPO/tar.gz/refs/tags/$TAG" || fail "download"
fi
mkdir "$WORK/x"
tar -xzf "$WORK/src.tgz" -C "$WORK/x" --no-same-owner --no-same-permissions || fail "extract"
SITE="$(find "$WORK/x" -mindepth 2 -maxdepth 2 -type d -name site | head -n 1)"
[ -n "$SITE" ] || fail "archive has no site/ directory"

# 2. self-check before switching
[ -s "$SITE/RELEASE.sha256" ] || fail "no RELEASE.sha256"
( cd "$SITE" && sha256sum -c --quiet --strict RELEASE.sha256 ) >/dev/null 2>&1 || fail "checksum mismatch against RELEASE.sha256"
UNLISTED="$(cd "$SITE" && find . -type f ! -name RELEASE.sha256 | sort | comm -23 - <(awk '{print $2}' RELEASE.sha256 | sort))"
[ -z "$UNLISTED" ] || fail "files not in RELEASE.sha256: $(echo "$UNLISTED" | head -n 3 | tr '\n' ' ')"
[ -z "$(find "$SITE" -type l)" ] || fail "symlinks in site/"
for f in index.html start.html styles.css app.js i18n.js data/download.json; do
  [ -s "$SITE/$f" ] || fail "missing $f"
done
grep -q '</html>' "$SITE/index.html" || fail "index.html looks truncated"
python3 -c 'import json,sys; json.load(open(sys.argv[1]))' "$SITE/data/download.json" 2>/dev/null || fail "data/download.json is not valid JSON"
SZ="$(du -sm "$SITE" | cut -f1)"; [ "$SZ" -le "$MAX_MB" ] || fail "site is ${SZ} MB > ${MAX_MB} MB"

# 3. install as a new release directory
mv "$SITE" "$NEW"
chown -R root:caddy "$NEW"
find "$NEW" -type d -exec chmod 755 {} +
find "$NEW" -type f -exec chmod 644 {} +
echo "$TAG" > "$NEW/.tag"; chmod 644 "$NEW/.tag"

# 4. atomic switch, then check what Caddy actually serves; roll back on any failure
ln -sfn "$NEW" "$BASE/current.new" && mv -T "$BASE/current.new" "$BASE/current"
SWITCHED=1
P=""
get() { if [ -n "$CHECK_BASE" ]; then curl -s --max-time 20 "$@" "$CHECK_BASE$P"; else curl -sk --max-time 20 --resolve "$HOST:443:127.0.0.1" "$@" "https://$HOST$P"; fi; }
ok=1
for p in / /start.html /data/download.json; do
  code="$(P="$p" get -o /dev/null -w '%{http_code}' || true)"
  [ "$code" = 200 ] || { ok=0; log "check $p -> $code"; }
done
served="$(P=/ get | sha256sum | cut -c1-64 || true)"
[ "$served" = "$(sha256sum "$NEW/index.html" | cut -c1-64)" ] || { ok=0; log "check / content differs from the new index.html"; }
[ "$ok" = 1 ] || fail "post-switch check failed; current restored to $CUR"     # restore() runs on exit
echo "$CUR" > "$BASE/PREVIOUS_RELEASE"
echo "$TAG" > "$BASE/DEPLOYED_TAG"
COMMITTED=1
log "OK $TAG live: $NEW (previous $CUR)"

# 5. prune old gh-* directories (never the live or previous one)
ls -1dt "$BASE"/releases/gh-site-* 2>/dev/null | while read -r d; do
  [ "$d" = "$NEW" ] || [ "$d" = "$CUR" ] && continue
  echo "$d"
done | tail -n +$((KEEP + 1)) | while read -r d; do rm -rf "$d"; log "pruned $d"; done
exit 0
