# Task 06: Connect PYT frontend pages to backend APIs

Follow `AGENTS.md` and `docs/codex/PYT_CONTEXT.md`.

Goal: replace PYT mock data with backend API calls after backend Tasks 01-05 compile successfully.

Inspect only these frontend files first:

- `pyt_front/app/(routes)/pyt/page.tsx`
- `pyt_front/app/(routes)/pyt/create/page.tsx`
- `pyt_front/app/(routes)/pyt/[pytId]/page.tsx`
- Existing frontend API helper files under `pyt_front/lib` if needed

Backend API target:

- `GET /api/pyt`
- `GET /api/pyt/create-data`
- `POST /api/pyt`
- `GET /api/pyt/{pytId}`
- `POST /api/pyt/{pytId}/teams/{teamSlotId}/join?userId={userId}`
- `POST /api/pyt/{pytId}/fillers`

Requirements:

1. Use `NEXT_PUBLIC_SERVER_URL` consistently.
2. Include `/api` in API paths.
3. Preserve existing UI layout as much as possible.
4. Remove only the mock data that is replaced by API responses.
5. Keep direct team join using temporary `userId` until JWT principal is implemented.
6. Add clear TODO comments where temporary auth is used.
7. Run `cd pyt_front && npm run lint`.
8. Summarize changed files and validation result.
