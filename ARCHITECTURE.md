# Architecture

## Runtime shape

```text
Browser
  ├─ Next.js pages and client-side calculator
  └─ optional FastAPI calls for integrations / future server workflows
       └─ product provider abstraction
       └─ PostgreSQL (reserved for curated catalog and future anonymous aggregates)
```

The calculator is intentionally client-first: salary, expenses, debt, and savings are not sent to the API for the normal user journey. The backend mirrors the calculation logic for a versioned API and future integrations.

## Frontend

- `frontend/app/page.tsx` contains the homepage experience and calculator orchestration.
- `frontend/lib/affordability.ts` contains the browser-side pure calculation functions.
- `frontend/components/` contains the icon, ad, and future UI component boundary.
- SEO pages are statically renderable under `/tools`, `/guides`, and legal routes.

## Backend

- `app/domain/affordability/engine.py` is framework-independent and independently testable.
- `app/schemas/` owns input/output validation and limits.
- `app/api/routes.py` exposes `/api/v1/health`, calculation, scenario, product, and category endpoints.
- `app/services/product_provider.py` defines the switchable product data source.
- `app/main.py` owns CORS, request IDs, security headers, body limits, and sanitized errors.

There is no authentication, Redis, Celery, or admin dashboard in the MVP. PostgreSQL is included in Compose so the product can add curated catalog storage without changing the deployment shape.
