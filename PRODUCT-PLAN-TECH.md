# Everything App

**Document:** Technical brief  
**Status:** For review  
**Version:** 0.2  
**Date:** 27 August 2026  
**Companion:** [PRODUCT-PLAN.md](PRODUCT-PLAN.md)

---

## Stack

| Layer | Choice |
|-------|--------|
| Application | Next.js (App Router) |
| Database | MySQL |
| Data access | Prisma |
| Styling | Tailwind CSS |

---

## Save path

Grok bot brings jobs and leads. The app saves them. The dashboard lists them.

Each module has:

- a list view
- add by hand
- add via API (for Grok bot)

Job Finder and Lead Finder use the same pattern. Clients are later.

Tables are not defined in this brief. They will be decided next.
