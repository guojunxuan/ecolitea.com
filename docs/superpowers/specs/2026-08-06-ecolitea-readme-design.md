# Ecolitea README Design

## Purpose

Replace the inherited Payload Website README with an English README for Ecolitea: a CMS-driven website built through a Payload customization. The document is for CMS operators, deployment operators, and project maintainers. It must describe Ecolitea as its own system, not as a Payload product.

## Goals

- Explain the CMS-first product positioning and the public website's relationship to managed content.
- Provide a concise, complete overview of active CMS capabilities.
- Document local setup, required environment configuration, and operational commands.
- Define the target production deployment architecture for a cloud server.
- Describe the intended GitHub-to-GHCR release flow and Docker Compose deployment model.
- Use only replaceable placeholders for domains, image names, tags, and credentials.

## Non-goals

- Do not reproduce Payload's official website, Cloud, documentation-sync, GitHub OAuth, or hosts-file instructions.
- Do not describe feature areas that are currently disabled by configuration.
- Do not provide click-by-click instructions for every admin screen.
- Do not include real secrets, database URLs, R2 credentials, domain names, or GitHub namespaces.

## Audience and Tone

The README is written in English. It uses direct, operational language and avoids product-marketing claims. It explains what each CMS capability is for, while reserving detailed editorial workflows for future separate guides.

## README Structure

1. **Ecolitea CMS**
   - Define Ecolitea as a CMS-driven website built on a Payload customization.
   - State that the Payload Admin panel is the primary content-management interface.

2. **Core Capabilities**
   - Content: pages, posts, categories, case studies, reusable content, and flexible content blocks.
   - Assets: media uploads, image resizing, and Cloudflare R2 storage with public media URLs.
   - Site settings: main navigation, footer, top bar, and conversion-oriented site settings.
   - Operations: forms, email notifications, SEO fields, redirects, Google Analytics, and operational counters.
   - Administration: administrator users and content-management access controls.

3. **Architecture**
   - Include a Mermaid diagram for the management and delivery flow:
     `Editors -> Payload Admin -> MongoDB / Cloudflare R2 -> Next.js website`.
   - Include the production path:
     `Cloudflare CDN -> Caddy -> Docker Compose -> Ecolitea and MongoDB`.
   - State that public release images are distributed through GitHub Container Registry (GHCR).

4. **Local Development**
   - List supported prerequisites: Node.js, Corepack, pnpm 9.15.4, and MongoDB.
   - Use the project's actual commands for installation, migrations, development, type checking, and production builds.
   - Explain that the local admin and website require a configured `.env` file.

5. **Environment Configuration**
   - Group variables as required application settings, database settings, Cloudflare R2 media settings, email settings, and optional integrations.
   - Explain every variable's purpose and use format-only examples.
   - Identify `PAYLOAD_SECRET` as a long random value and R2 variables as credentials that must not be committed.

6. **Production Deployment**
   - Describe the target Docker Compose topology: Ecolitea application container, MongoDB container with a persistent volume, and Caddy reverse proxy.
   - Describe Cloudflare DNS/CDN and Full (strict) TLS at the edge, with Caddy serving the origin.
   - Use `YOUR_DOMAIN`, `GHCR_OWNER`, `YOUR_IMAGE_TAG`, and similar placeholders.
   - Define the target upgrade and rollback model: deploy immutable GHCR tags, then select an earlier tag to roll back.
   - State that MongoDB data requires backups; R2 media is managed independently of the application container.

7. **Operations and Troubleshooting**
   - List routine commands and checks for migrations, builds, container status, logs, backups, and version verification.
   - Cover common configuration failures without exposing sensitive values.

## Deployment Contract for Follow-up Work

The later Dockerfile, Docker Compose configuration, production Caddy configuration, and GitHub Actions workflow must follow this README contract:

- Public images are published to GHCR.
- Docker Compose starts Ecolitea and MongoDB by default.
- MongoDB data uses a persistent volume.
- Caddy terminates origin HTTPS and proxies the application container.
- Cloudflare fronts the origin as the CDN and TLS edge.
- Cloudflare R2 stores media outside the container filesystem.

## Acceptance Criteria

- README is English and CMS-first.
- README contains no inherited Payload official-website or Cloud-specific positioning.
- Every listed local command exists in `package.json` or Payload's project CLI.
- Environment examples contain placeholders only.
- The active functionality overview includes all active CMS capability groups.
- The production architecture, GHCR release lifecycle, Docker Compose topology, Caddy, Cloudflare, MongoDB persistence, and R2 responsibilities are explicit.
- Markdown headings, links, and Mermaid code are valid and readable on GitHub.
