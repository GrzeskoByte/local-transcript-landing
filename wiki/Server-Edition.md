# Server Edition (self-hosted, Docker)

The server edition runs Local Transcriber on your organization's own server, so a team can use it from the browser. It is the desktop app's interface with a backend for accounts and storage, all in one Docker container.

> **Preview release.** The server edition is new (current image: `0.1.27-rc.1`). Try it on one machine first, back up the `lt-data` volume, and pin a version before your team relies on it.

The full operator guide is [`deploy/README.md`](https://github.com/GrzeskoByte/local-transcript/blob/server/deploy/README.md) on the app's `server` branch. This page is the short version.

## What you get

- **Accounts.** Invite-only local accounts, plus optional single sign-on through any OpenID Connect provider (Keycloak, Authentik, Microsoft Entra ID, Google). A group can grant admin rights.
- **Private per user.** Each user's meetings, recordings and settings live in their own folder in the `/data` volume. No one else can open them, admins included. Saved tokens (GitLab, calendar, AI) are encrypted on disk.
- **Shared transcription.** One whisper.cpp engine and one set of models, downloaded by an admin and shared fairly between users. Speaker detection is included. A CUDA image is available for NVIDIA GPUs.
- **Stays on your server.** Nothing leaves the host except sign-in with your SSO provider and the integrations a user turns on.

**Not available in the browser:** system-sound capture and the desktop-only tools (local folders, Thunderbird, OpenCode, Claude Code). Use the desktop app for those.

## Images

`ghcr.io/grzeskobyte/local-transcribe`

| Tag | Image |
| --- | --- |
| `latest`, `<version>` | CPU, Linux amd64 and arm64 |
| `cuda`, `<version>-cuda` | NVIDIA GPU, amd64 |

Release candidates (for example `0.1.27-rc.1`) get only their version tag.

## Try it on one machine

Needs Docker. The app is reachable from this computer only, and the microphone works on `localhost` without HTTPS.

```sh
umask 077
printf 'LT_ADMIN_EMAIL=you@example.com\nLT_ADMIN_PASSWORD=%s\n' "$(openssl rand -base64 18)" > lt.env
cat lt.env   # your first admin login
docker run -d --name local-transcribe --restart unless-stopped \
  -p 127.0.0.1:8080:8080 -v lt-data:/data --env-file lt.env \
  ghcr.io/grzeskobyte/local-transcribe:latest
```

To stop it: `docker stop local-transcribe`. To remove everything, including all recordings: `docker rm -f local-transcribe && docker volume rm lt-data`.

## Run it for a team (Docker Compose)

```sh
git clone -b server https://github.com/GrzeskoByte/local-transcript.git
cd local-transcript
umask 077
cp deploy/.env.example .env   # set LT_ADMIN_EMAIL and LT_ADMIN_PASSWORD
docker compose up -d
```

Browsers allow the microphone only over HTTPS (or on `localhost`), so other computers need HTTPS. The included Caddy proxy gets a certificate automatically: point a DNS name at the server, open ports 80 and 443, then add to `.env`:

```dotenv
LT_DOMAIN=transcribe.example.com
LT_PUBLIC_URL=https://transcribe.example.com
```

```sh
docker compose --profile https up -d
```

## First sign-in

1. Open `http://localhost:8080` (or your HTTPS address) and sign in with the admin email and password.
2. **Settings → Models**: download a model for everyone. `large-v3-turbo-q5_0` is a good start; `base` is fastest on a small CPU.
3. **Settings → Users**: invite people. Each gets a one-time link to set a password.
4. Remove the `LT_ADMIN_*` lines. The admin account is created only while the database has no users.

## Common tasks

| To | Do |
| --- | --- |
| Turn on single sign-on | Set `LT_OIDC_ISSUER`, `LT_OIDC_CLIENT_ID`, `LT_OIDC_CLIENT_SECRET` (and `LT_OIDC_ADMIN_GROUP`), or use **Settings → Sign-in**. Redirect URI: `<LT_PUBLIC_URL>/auth/oidc/callback`. |
| Use an NVIDIA GPU | `docker compose -f docker-compose.yml -f deploy/docker-compose.gpu.yml up -d` (needs the NVIDIA Container Toolkit). |
| Limit storage per user | `LT_USER_QUOTA_MB=2000` (0 = unlimited). |
| Reach a calendar on your internal network | `LT_CALENDAR_ALLOWED_HOSTS=calendar.company.local,10.0.0.0/8` (private addresses are blocked otherwise). |
| Pin a version | `LT_IMAGE=ghcr.io/grzeskobyte/local-transcribe:<version>` (GPU: `<version>-cuda`). |
| Upgrade | Back up, then `docker compose pull app && docker compose up -d app`. |
| Back up | Stop the app and archive the `lt-data` volume. It holds the accounts, recordings, transcripts, models and the encryption key. |
| Reset a password | `docker compose exec app lt-server admin reset-password --email you@example.com` |
