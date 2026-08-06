# Ecolitea Docker and GHCR Release Design

## Purpose

Package Ecolitea as a deployable Docker image and provide a manually dispatched GitHub Actions release workflow. A release starts from an already pushed Git tag, validates that tag's code, publishes an image to GHCR, and creates a GitHub Release with generated notes.

## Scope

Create these repository assets:

- `Dockerfile` for a multi-stage, production Ecolitea image.
- `.dockerignore` to keep local artifacts and credentials out of the build context.
- `docker-compose.yml` for the Ecolitea application, MongoDB, and Caddy.
- A production `Caddyfile` that proxies `DOMAIN` to the application service.
- `.gitignore` that protects runtime secrets and generated local files while keeping `.env.example` tracked.
- A manually dispatched GitHub Actions workflow that builds a selected Git tag, validates it, pushes GHCR images, and creates a Release.
- README additions covering the exact deployment and release workflow.

This implementation does not migrate application data, initialize a Git repository, publish an image, execute a Release, or configure a GitHub repository's package visibility.

## Runtime Architecture

```text
Cloudflare CDN (Full strict)
  -> Caddy container
  -> Ecolitea container (Next.js / Payload, port 3000)
  -> MongoDB container with named persistent volume

Ecolitea container -> Cloudflare R2 public media storage
```

Docker Compose runs three services:

| Service | Image/source | Responsibility |
| --- | --- | --- |
| `ecolitea` | `ghcr.io/GHCR_OWNER/ecolitea:${IMAGE_TAG}` | Runs the built Next.js and Payload application on port 3000. |
| `mongodb` | Pinned `mongo:7.0` image | Stores CMS data in a named persistent volume. |
| `caddy` | Pinned Caddy image | Exposes ports 80 and 443 and reverse-proxies `DOMAIN` to `ecolitea:3000`. |

The first `docker compose up -d` pulls the application, MongoDB, and Caddy images, then initializes the named MongoDB volume. The normal code-release command is limited to the application service:

```bash
docker compose pull ecolitea
docker compose up -d --no-deps ecolitea
```

This leaves the MongoDB container and its volume unchanged. `docker compose down -v` must not be used for normal operations because it removes named volumes.

## Image Build Contract

The Dockerfile uses a Node 20 multi-stage build:

1. Enable Corepack and install the lockfile with pnpm 9.15.4.
2. Build with `corepack pnpm@9.15.4 build:skipDocs`.
3. Copy the production application files and dependencies into a lean runtime stage.
4. Run as a non-root user with `corepack pnpm@9.15.4 start` on port 3000.

The runtime image contains no `.env` file or deployment credential. Docker Compose supplies runtime configuration through an untracked server-side `.env` file.

These public build-time values are supplied from GitHub Actions Variables, not Secrets:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CMS_URL`
- `R2_PUBLIC_URL`

All database URLs, Payload secrets, R2 credentials, and revalidation secrets remain runtime-only values in the server `.env` file.

## Caddy and Cloudflare

Caddy uses `DOMAIN` from its container environment and forwards requests to `ecolitea:3000`. It uses persistent volumes for Caddy data and configuration. Cloudflare is configured externally with a proxied DNS record for `YOUR_DOMAIN` and Full (strict) TLS.

## GitHub Actions Release Flow

The workflow has a `workflow_dispatch` trigger and a required `tag` input. The operator pushes code and a Git tag, then manually starts the workflow and enters that tag.

```text
push repository and tag
  -> manually dispatch workflow with tag
  -> verify tag exists and check out that tag
  -> install dependencies
  -> run TypeScript check and production build against temporary MongoDB
  -> build and push GHCR image
  -> create GitHub Release with --generate-notes
```

The workflow requires `contents: write` and `packages: write` permissions. It uses the repository-provided `GITHUB_TOKEN`; no custom GitHub token is required. It creates these image tags:

- `ghcr.io/GHCR_OWNER/ecolitea:<selected-tag>`
- `ghcr.io/GHCR_OWNER/ecolitea:sha-<short-commit-sha>`

The first published GHCR package must be made public in GitHub package settings. The workflow does not send Slack, webhook, email, or other external notifications. GitHub Actions run status and the generated GitHub Release are the release record.

For CI validation only, the workflow starts a disposable MongoDB service and uses CI-only environment values. It never connects to the production database and does not run Payload migrations.

## Files and Safety Boundaries

`.gitignore` ignores `.env`, `.next`, `node_modules`, logs, Docker local override files, and Caddy runtime data. It explicitly allows `.env.example`.

`.dockerignore` excludes `.env`, `.next`, `node_modules`, Git metadata, logs, local Compose overrides, Caddy runtime data, and documentation from Docker build context.

No actual domain, GitHub owner, image tag, Slack URL, database URI, Payload secret, or R2 credential is stored in committed files. Examples use `YOUR_DOMAIN`, `GHCR_OWNER`, and `YOUR_IMAGE_TAG`.

## Verification

- Validate Compose syntax with `docker compose config` using a temporary placeholder environment file.
- Build the image locally without including `.env` in the build context.
- Run the application with a temporary MongoDB container and confirm that Caddy can reach it.
- Validate workflow YAML and inspect that it has only `workflow_dispatch`, uses the requested tag as checkout ref, checks types, builds, pushes GHCR tags, and creates a generated-notes Release.
- Confirm `.gitignore` and `.dockerignore` do not exclude `.env.example` and do exclude `.env`.

## Acceptance Criteria

- A clean Linux server can initially start Ecolitea, MongoDB, and Caddy with Docker Compose.
- A subsequent application release updates only the Ecolitea image and preserves MongoDB data.
- GitHub Actions can manually release an already pushed tag without using external notification secrets.
- CI validation is isolated from production MongoDB and never runs migrations.
- Committed assets contain no runtime credentials.
