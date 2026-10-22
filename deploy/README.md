# rlsok.com deployment (GitHub pull, no SSH)

```
local: build site -> site/ + RELEASE.sha256 -> commit -> tag site-YYYYMMDD.N -> push
server (every 5 min): newest site-* tag -> download tag archive -> verify -> new release dir
                      -> switch /srv/rlsok/current -> check what Caddy serves -> keep, or roll back
```

Installers and other large files are GitHub Release assets (`v<version>`, `cad-addon-<n>`, `bird-r1`),
never in git and never on the server.

## Publish a new website version

```
python website/sync_public_repo.py               # private tree: copy site, write RELEASE.sha256, stage release assets
cd publish/rlsok-engineering
git add -A && git commit -m "site: <what changed>" # pre-commit hook scans for secrets and files > 10 MB
git tag site-20261022.1                          # date + counter; the highest tag wins
git push origin main --tags
```

The site is live within about 5 minutes; check `/var/log/rlsok-deploy.log` or the page.

## What the server checks before switching

- every file matches `site/RELEASE.sha256`, and there are no unlisted files and no symlinks;
- `index.html`, `start.html`, `styles.css`, `app.js`, `i18n.js` and `data/download.json` exist; `index.html` is complete; the JSON parses;
- the site is ≤ 150 MB.

After switching it requests `/`, `/start.html` and `/data/download.json` through Caddy and compares `/` with the new `index.html`.
If any of these fail, or the script exits unexpectedly after the switch, `current` goes back to the previous release.
A failed tag is written to `/srv/rlsok/failed/<tag>` and not retried.

## Server setup (once, as root, from the provider console or SSH)

```
curl -fsSL https://codeload.github.com/ZqiEE/rlsok-engineering/tar.gz/refs/heads/main | tar -xz -C /tmp
bash /tmp/rlsok-engineering-main/deploy/install.sh --caddy
```

`--caddy` also installs `deploy/Caddyfile`. It backs up the old file first, validates the new one, and restores the backup if validation fails. The new Caddyfile adds redirects from the old `/downloads/...` URLs to GitHub Releases. Installed apps up to 0.1.5 fetch the CAD add-on from `rlsok.com/downloads/`.

## Control and rollback

| Goal | Command (root on the server) |
| --- | --- |
| See state | `cat /srv/rlsok/DEPLOYED_TAG; readlink -f /srv/rlsok/current; tail /var/log/rlsok-deploy.log` |
| Roll back now to the release before the last switch | `ln -sfn "$(cat /srv/rlsok/PREVIOUS_RELEASE)" /srv/rlsok/current.new && mv -T /srv/rlsok/current.new /srv/rlsok/current && touch /srv/rlsok/HOLD` |
| Roll back to a specific release | `ls -1dt /srv/rlsok/releases/*`, then the same `ln`/`mv` with that directory, and `touch /srv/rlsok/HOLD` |
| Freeze (stop automatic updates) | `touch /srv/rlsok/HOLD` (remove the file to resume) |
| Pin a tag | `echo site-20261022.1 > /srv/rlsok/PIN` (delete the file to follow the newest tag again) |
| Retry a failed tag | `rm /srv/rlsok/failed/<tag>` |
| Roll back without server access | push a new higher tag whose `site/` is the old content: `git checkout <good-tag> -- site && git commit -m "revert site" && git tag site-YYYYMMDD.N && git push origin main --tags` |
| Stop the timer | `systemctl disable --now rlsok-pull-deploy.timer` |

Without `HOLD`, the timer redeploys the newest tag after a manual rollback, so always freeze or pin after rolling back by hand. Old manual releases in `/srv/rlsok/releases/` (not `gh-*`) are never pruned. The 6 newest `gh-*` directories are kept, along with the current and previous ones.

## Local test

`publish/test_pull_deploy.sh` (private tree) runs the script against a fake `/srv/rlsok`. It covers 14 checks: a good tag, a repeat no-op, a tampered file, rollback when the post-switch check fails, HOLD, and manual rollback.
