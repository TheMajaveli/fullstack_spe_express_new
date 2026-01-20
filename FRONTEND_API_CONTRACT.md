## Frontend API contract (as implemented in `frontend/services/api.ts`)

The current “premium” frontend does **not** call HTTP yet; it uses an in-memory/localStorage mock `api` object.
To connect a real backend, the backend must provide endpoints that match the shapes returned by these functions,
and the frontend `frontend/services/api.ts` must be swapped from mock to HTTP while keeping return shapes stable.

### Base URL / env

- No API base URL is currently used.
- Vite env pattern to introduce: `VITE_API_URL` (e.g. `http://localhost:4000`).

### Types expected by UI

`Movie` (frontend `frontend/types.ts`)
- `id: string`
- `title: string`
- `description: string`
- `year: number`
- `rating: number`
- `category: string`
- `posterUrl: string`
- `duration: string`
- `director: string`

`User`
- `id: string`
- `email: string`
- `username: string`
- `role: 'user' | 'admin'`
- `avatar?: string`
- `watchlist: string[]`
- `history: string[]`
- `ratings: Record<string, number>`

### Movies

#### List (catalog + admin list)

Frontend call: `api.movies.list(params)`

Query params (from `CatalogPage.tsx`):
- `q`: string (search)
- `category`: string (defaults to `All`)
- `rating`: number (min rating, defaults to `0`)
- `sort`: `newest | rating | title` (defaults to `newest`)
- `page`: number (defaults to `1`)

Expected response shape (no wrapper currently):
```json
{
  "data": [Movie],
  "total": 123,
  "totalPages": 21
}
```

#### Detail

Frontend call: `api.movies.get(id)`

Expected response shape:
- `Movie` object (or 404)

#### Admin create/update/delete

Frontend mock supports:
- `api.movies.create(moviePartial) -> Movie`
- `api.movies.update(id, moviePartial) -> Movie`
- `api.movies.delete(id) -> true`

### Auth

Frontend call sites:
- Login: `api.auth.login(email)` (currently only passes email; UI has password input too)
- Register: `api.auth.register(email, username)` (UI collects password + confirm)
- Me: `api.auth.me() -> User`

Expected auth response shape (used by Zustand `setAuth`):
```json
{
  "user": User,
  "accessToken": "string",
  "refreshToken": "string"
}
```

