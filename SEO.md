# SEO plan

The Next.js App Router provides server-rendered metadata and crawlable pages for the homepage, tools directory, tool detail pages, guides, and legal pages.

Implemented:

- canonical-friendly page URLs under `/tools/*`;
- title and description metadata per page;
- OpenGraph and Twitter defaults;
- `app/sitemap.ts` and `app/robots.ts`;
- semantic headings, links, FAQ content, and WebApplication JSON-LD on the homepage;
- mobile-first CSS and no large image dependency for the critical render.

Before launch, set `NEXT_PUBLIC_SITE_URL` to the real canonical domain and update the sitemap fallback in `app/robots.ts`. Add unique, human-reviewed guide pages before expanding the category set. Do not generate thousands of thin price or query pages.
