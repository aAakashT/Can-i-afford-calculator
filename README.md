# Can I Afford This?

An anonymous, explainable affordability calculator for India (INR). The MVP combines a fast Next.js frontend with a small FastAPI service and keeps calculation inputs in the browser by default.

## Run locally

```bash
cp .env.example .env
docker compose up --build
```

Open `http://localhost:3000`. For frontend-only iteration:

```bash
cd frontend
npm install
npm run dev
```

For the API:

```bash
cd backend
python -m venv .venv
./.venv/bin/pip install -r requirements.txt
uvicorn app.main:app --reload
```

## What is included

- Mobile-first Next.js/TypeScript UI with system-friendly light styling, accessible forms, and responsive result cards.
- Browser-side INR calculation with cash, EMI, part-payment, 0% interest, risk profiles, maximum safe price, wait-to-afford, scenario comparison, and privacy-safe sharing.
- Independently testable Python affordability engine and versioned FastAPI endpoints.
- Product-provider abstraction with an empty production-safe manual provider. The visible catalogue is marked illustrative until curated or affiliate data is configured.
- SEO routes, metadata, sitemap, robots, legal templates, AdSlot component, Docker Compose, Nginx reverse proxy, and CI.

## Important

Results are estimates, not professional financial advice. Verify actual loan terms, fees, taxes, insurance, maintenance, and product prices before committing. Do not commit secrets; `.env` is ignored by default.

See [ARCHITECTURE.md](ARCHITECTURE.md), [CALCULATION_METHODOLOGY.md](CALCULATION_METHODOLOGY.md), and [DEPLOYMENT.md](DEPLOYMENT.md) for more detail.
