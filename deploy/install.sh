#!/usr/bin/env bash
# One-time server setup for GitHub pull deploys. Run as root on the rlsok.com server, from a copy of this repo:
#   curl -fsSL https://codeload.github.com/ZqiEE/rlsok-engineering/tar.gz/refs/heads/main | tar -xz -C /tmp
#   bash /tmp/rlsok-engineering-main/deploy/install.sh            # installs the timer, does not touch Caddy
#   bash /tmp/rlsok-engineering-main/deploy/install.sh --caddy    # also installs deploy/Caddyfile (download redirects)
set -Eeuo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
[ "$(id -u)" = 0 ] || { echo "run as root"; exit 1; }

echo "== pre-flight"
for c in curl tar sha256sum flock python3 systemctl; do command -v "$c" >/dev/null || { echo "missing: $c"; exit 1; }; done
command -v git >/dev/null && echo "git: yes (tags via git ls-remote)" || echo "git: no (tags via GitHub API, 60 requests/h limit is enough for 12/h)"
df -h /srv | tail -n 1
[ -L /srv/rlsok/current ] && echo "current -> $(readlink -f /srv/rlsok/current)" || echo "WARNING: /srv/rlsok/current is not a symlink yet"
getent group caddy >/dev/null || { echo "group caddy missing"; exit 1; }

echo "== install script and units"
install -m 755 "$HERE/rlsok-pull-deploy.sh" /usr/local/sbin/rlsok-pull-deploy
install -m 644 "$HERE/rlsok-pull-deploy.service" /etc/systemd/system/rlsok-pull-deploy.service
install -m 644 "$HERE/rlsok-pull-deploy.timer" /etc/systemd/system/rlsok-pull-deploy.timer
mkdir -p /srv/rlsok/releases /srv/rlsok/failed
touch /var/log/rlsok-deploy.log
systemctl daemon-reload

if [ "${1:-}" = "--caddy" ]; then
  echo "== Caddyfile"
  CF="$(systemctl cat caddy 2>/dev/null | grep -o -- '--config [^ ]*' | head -n 1 | cut -d' ' -f2)"; CF="${CF:-/etc/caddy/Caddyfile}"
  BAK="$CF.bak-$(date +%Y%m%d%H%M%S)"
  cp -a "$CF" "$BAK"
  install -m 644 "$HERE/Caddyfile" "$CF"
  if caddy validate --config "$CF" --adapter caddyfile; then
    systemctl reload caddy && echo "caddy reloaded (backup $BAK)"
  else
    cp -a "$BAK" "$CF"; echo "Caddyfile invalid: restored $BAK"; exit 1
  fi
fi

echo "== first run (deploys the newest site-* tag if it is not live yet)"
systemctl start rlsok-pull-deploy.service || true
tail -n 5 /var/log/rlsok-deploy.log || true
systemctl enable --now rlsok-pull-deploy.timer
systemctl list-timers rlsok-pull-deploy.timer --no-pager
echo "done. Freeze: touch /srv/rlsok/HOLD   Pin: echo site-YYYYMMDD.N > /srv/rlsok/PIN   Log: /var/log/rlsok-deploy.log"
