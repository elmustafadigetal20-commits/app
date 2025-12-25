# API functions for Vercel (Supabase-backed)

Endpoints:
- GET /api/commits         -> list commits (latest first)
- POST /api/commits        -> create commit (body: { message, author?, date?, url? })
- GET /api/commits/:id     -> get commit by id
- DELETE /api/commits/:id  -> delete commit by id (use with care)

Env required on Vercel (Settings → Environment Variables):
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

Notes:
- Do NOT expose SUPABASE_SERVICE_ROLE_KEY to the client.
- For local dev use `vercel dev` (Vercel CLI) which serves /api locally.
