## Goal
Make concise, targeted edits to the SimplyManage codebase. Prefer minimal, incremental changes that follow the existing naming conventions and architecture.

## Big picture (what matters)
- Node.js + Express server-side rendered app using Handlebars (.hbs) templates under `src/views`.
- MySQL DB accessed via `src/db.js` -> use the exported `query(sql, params)` helper rather than raw connection handling.
- Sessions are persisted to the DB using `express-mysql-session` configured in `src/app.js`.
- Routes are grouped by responsibility in `src/routes/*`. Authentication middleware is added at mount points in `src/app.js` (requireAuth, requireStaff, requireAdmin).

## Naming and schema conventions (important)
- DB tables and columns use short prefixes: users (u_), items (it_), assets (a_), categories (cat_), loans (l_). See `src/sql/CREATE.sql` for schema.
- Session stores user info in `req.session.user` with prefixed fields: `u_id`, `u_fname`, `u_lname`, `u_email`, `u_role`.
- When writing SQL use the same prefixed column names and return shapes expected by views and routes (examples: `SELECT u_id, u_fname, u_lname, u_email, u_role FROM users`).

## How code is organized and where to make changes
- Server entry: `src/app.js` — middleware, helpers, route mounting and server start.
- Database helper: `src/db.js` (`query(sql, params)`) — use it for all DB access; it logs each query to debug using `console.debug`.
- Route responsibilities (a few key routes):
  - `src/routes/auth.js` — login/register/logout flows and session setup.
  - `src/routes/items.js` — public catalog and search; build category trees; returns item lists to `views/items.hbs` and `partials/itemCard.hbs`.
  - `src/routes/cart.js` — session-backed cart stored at `req.session.cart`.
  - `src/routes/loans.js` — user loan views; queries grouped loans into pending/current.
  - `src/routes/dashboard.js`, `admin.js` — staff/admin management endpoints (many are TODO placeholders).

## UI / Template conventions
- Handlebars partials are used heavily: `src/views/partials/navbar.hbs`, `itemCard.hbs`, `categoryTreeItem.hbs`.
- Helpers registered in `src/app.js`: `eq`, `or`, `gt`, `toString` — use these when creating or modifying templates.

## Developer workflows & run hints (discoverable)
- Environment variables are loaded from `../.env` (relative to `src/`) — see `src/config.js`. Required vars: DB_HOST, DB_USER, DB_PASS, DB_NAME, SESSION_SECRET, optional: PORT.
- There is no package manifest in this workspace view; to run locally you can (from project root where app.js sits):
  - Ensure `.env` is set up as above.
  - Run with node: `node src/app.js` (or `node app.js` if run from the directory containing app.js).
  - Quick DB health check endpoint: GET `/test-db` will return rows from the `users` table and will fail fast on DB misconfiguration.

## Code patterns to follow (do this, specifically for this repo)
- Use `await query(sql, params)` for DB interactions and follow the prefixed column naming convention.
- Prefer session-backed flows for state (e.g., cart stored in `req.session.cart`, user in `req.session.user`). Keep mutations through routes consistent with existing patterns (save then `req.session.save()` before redirect).
- Keep server-side rendering: most pages are rendered by route handlers returning `res.render(view, locals)` — avoid introducing a single page app unless required.

## What to watch for / quick checks
- DB schema is prefix-heavy — ensure SQL column aliases match what routes expect.
- Many admin/dashboard features are still TODO; changes should avoid breaking public flows.
- Passwords must be hashed with bcrypt (see `auth.js` and `profile.js`).

## Examples / snippets (use these as patterns)
- Query user by email and validate bcrypt:
  - `const rows = await query('SELECT u_id, u_fname, u_lname, u_email, u_password, u_role, u_active FROM users WHERE u_email = ?', [email])`
- Build category tree (follow `getAllDescendantIds` and `buildCategoryTree` in `src/routes/items.js`).

If anything here is unclear or you'd like me to add examples for tests or CI steps, tell me which area to expand. ✅
