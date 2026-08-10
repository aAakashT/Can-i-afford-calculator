# Deployment

The low-cost target is one VPS running Docker Compose behind Cloudflare. Cloudflare can provide DNS, TLS, CDN caching, and the WAF while the VPS runs the frontend, API, and private PostgreSQL container.

## First deploy

1. Install Docker Engine and the Compose plugin on a small VPS.
2. Clone the repository and copy `.env.example` to `.env`.
3. Change `POSTGRES_PASSWORD`, `NEXT_PUBLIC_SITE_URL`, and `FRONTEND_ORIGIN`.
4. Start the stack:

```bash
docker compose up -d --build
docker compose ps
```

5. Put Cloudflare DNS in front of the VPS. During initial setup, use the Cloudflare proxy only after the origin is reachable.

## Reverse proxy / HTTPS

`nginx/nginx.conf` is a starting point for routing `/api` to FastAPI and everything else to Next.js. For production, terminate HTTPS with Cloudflare or a host-level Nginx/Caddy installation and set the Cloudflare SSL mode to Full (strict) with a valid origin certificate.

## Backups

The Postgres volume is not a backup. Run a daily encrypted dump from the host, keep at least 7 daily and 4 weekly copies, and test a restore monthly:

```bash
docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup-$(date +%F).sql
cat backup.sql | docker compose exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

Store dumps outside the VPS when possible. Never put database credentials in git or in CI logs.

## Operations

- Health: `GET /api/v1/health`.
- Logs: `docker compose logs -f backend frontend`.
- Rollback: deploy a previous git commit and run `docker compose up -d --build`.
- Firewall: allow SSH only from trusted IPs and HTTP/HTTPS publicly; do not expose 5432.
- Add uptime monitoring to the health endpoint and alert on repeated failures.

## Ads and analytics

Development runs with ads and analytics disabled. Configure `NEXT_PUBLIC_ADSENSE_ENABLED=true` only after publisher approval and policy review. Do not send raw financial inputs to analytics.
