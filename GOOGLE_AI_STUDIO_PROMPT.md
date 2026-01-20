# Prompt for Google AI Studio - React Frontend for Movie Platform

Build a complete React frontend application for a movie platform that connects to an Express.js backend API. The application should be built with Next.js 16, TypeScript, and Tailwind CSS.

## Project Overview

This is a full-stack movie platform with:
- Public browsing of movies with advanced filtering
- User authentication (JWT with refresh tokens)
- Member space (favorites, watchlist, ratings, history)
- Admin back-office for managing movies and categories

## Backend API Base URL

The backend API runs at: `http://localhost:3000` (or use `NEXT_PUBLIC_API_URL` environment variable)

## API Endpoints

### Public Routes

#### Movies
- `GET /movies` - List movies with filters
  - Query params: `page`, `limit`, `category`, `minRating`, `search`, `sort`
  - Response: `{ data: Movie[], pagination: { total, page, limit, totalPages } }`
- `GET /movies/:id` - Get movie details
  - Response: `{ id, title, director, release_year, rating, category_id, category, images: [{ id, path, isPrimary }] }`

#### Categories
- `GET /categories` - List all categories
  - Response: `Category[]` where `Category = { id, name }`
- `GET /categories/:id` - Get category details
- `GET /categories/:id/movies` - Get movies by category

### Authentication Routes

- `POST /auth/register` - Register new user
  - Body: `{ email, password, first_name?, last_name? }`
  - Response: `{ accessToken, refreshToken, user: { id, email, first_name, last_name, role } }`
- `POST /auth/login` - Login
  - Body: `{ email, password }`
  - Response: `{ accessToken, refreshToken, user }`
- `POST /auth/refresh` - Refresh access token
  - Body: `{ refreshToken }`
  - Response: `{ accessToken }`
- `GET /auth/me` - Get current user profile (requires auth)
  - Headers: `Authorization: Bearer <accessToken>`
  - Response: `User`
- `PUT /auth/profile` - Update profile (requires auth)
  - Body: `{ first_name?, last_name? }`
- `POST /auth/logout` - Logout (requires auth)
  - Body: `{ refreshToken }`

### User Space Routes (All require authentication)

#### Favorites
- `GET /user/favorites` - Get user's favorites
  - Response: `Favorite[]` where `Favorite = { id, movie: Movie, favorited_at }`
- `POST /user/favorites/:movieId` - Add to favorites
- `DELETE /user/favorites/:movieId` - Remove from favorites

#### Watchlist
- `GET /user/watchlist` - Get user's watchlist
  - Response: `WatchlistItem[]` where `WatchlistItem = { id, movie: Movie, added_at }`
- `POST /user/watchlist/:movieId` - Add to watchlist
- `DELETE /user/watchlist/:movieId` - Remove from watchlist

#### Ratings
- `GET /user/ratings` - Get user's ratings
  - Response: `Rating[]` where `Rating = { id, rating (0-10), comment, created_at, updated_at, movie_id, movie: Movie }`
- `POST /user/ratings/:movieId` - Add/update rating
  - Body: `{ rating: number (0-10), comment?: string }`
- `PUT /user/ratings/:movieId` - Update rating
  - Body: `{ rating: number, comment?: string }`
- `DELETE /user/ratings/:movieId` - Delete rating

#### History
- `GET /user/history` - Get viewing history
  - Response: `HistoryItem[]` where `HistoryItem = { id, movie: Movie, viewed_at }`
- `POST /user/history/:movieId` - Record movie view (automatic on movie detail page)

### Admin Routes (Require admin role)

#### Movies
- `POST /movies` - Create movie (multipart/form-data)
  - Body: `{ title, director, release_year, rating, category_id, image?: File }`
- `PUT /movies/:id` - Update movie (multipart/form-data)
  - Body: `{ title?, director?, release_year?, rating?, category_id?, image?: File }`
- `DELETE /movies/:id` - Delete movie

#### Categories
- `POST /categories` - Create category
  - Body: `{ name }`
- `PUT /categories/:id` - Update category
  - Body: `{ name }`
- `DELETE /categories/:id` - Delete category

## Required Pages

### Public Pages

1. **Home Page (`/`)** - Movie catalog
   - Display movies in a grid (responsive: 1 col mobile, 2 tablet, 3 desktop, 4 large)
   - Filters sidebar/bar:
     - Category dropdown (from `/categories`)
     - Minimum rating slider (0-10)
     - Search input (title and director)
     - Sort dropdown: Title A-Z, Title Z-A, Year ↑, Year ↓, Rating ↑, Rating ↓
   - Pagination controls (Previous/Next with page info)
   - URL synchronization: filters should be reflected in URL query params
   - Movie cards showing: poster (first image or placeholder), title, year, rating, category
   - Clicking a movie card navigates to `/movies/[id]`

2. **Movie Detail Page (`/movies/[id]`)** - Single movie view
   - Display full movie information
   - Show all images/posters in a gallery
   - If user is logged in:
     - Button to add/remove from favorites
     - Button to add/remove from watchlist
     - Rating component (0-10 stars/slider with comment field)
     - Automatically record view in history (POST /user/history/:movieId)
   - Back button to return to catalog

### Authentication Pages

3. **Login Page (`/auth/login`)**
   - Email and password inputs
   - Form validation (email format, required fields)
   - Error handling and display
   - Link to register page
   - Redirect to home after successful login

4. **Register Page (`/auth/register`)**
   - Email, password, confirm password, first name, last name
   - Strong password validation:
     - Minimum 8 characters
     - At least one uppercase letter
     - At least one lowercase letter
     - At least one number
   - Real-time validation feedback
   - Error handling
   - Link to login page
   - Redirect to home after successful registration

### Authenticated User Pages

5. **Profile Page (`/profile`)**
   - Display user information (email, name)
   - Form to update first name and last name
   - Logout button

6. **My Favorites (`/my-favorites`)**
   - List of favorited movies
   - Remove from favorites button for each
   - Link to movie detail page

7. **My Watchlist (`/my-watchlist`)**
   - List of watchlist movies
   - Remove from watchlist button for each
   - Link to movie detail page

8. **My Ratings (`/my-ratings`)**
   - List of rated movies with rating and comment
   - Edit rating inline (modal or inline form)
   - Delete rating button
   - Link to movie detail page

9. **History (`/history`)**
   - Chronological list of viewed movies (most recent first)
   - Link to movie detail page

### Admin Pages

10. **Admin Movies List (`/admin/movies`)**
    - Table/list of all movies with actions (Edit, Delete)
    - "Create New Movie" button
    - Delete confirmation modal
    - Only accessible to admin users

11. **Create Movie (`/admin/movies/new`)**
    - Form with fields: title, director, release_year, rating, category_id (dropdown), image upload
    - Image preview
    - Form validation
    - Submit creates movie via POST /movies (multipart/form-data)

12. **Edit Movie (`/admin/movies/[id]/edit`)**
    - Pre-filled form with existing movie data
    - Image upload (optional, shows current image)
    - Update via PUT /movies/:id (multipart/form-data)

13. **Admin Categories (`/admin/categories`)**
    - List of categories with Edit/Delete actions
    - Create new category form
    - CRUD operations for categories

## Technical Requirements

### Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Axios for API calls
- js-cookie for token management

### Authentication Flow
1. Store `accessToken` and `refreshToken` in cookies
2. Include `Authorization: Bearer <accessToken>` header in authenticated requests
3. Implement automatic token refresh on 401 errors:
   - Intercept 401 responses
   - Call `/auth/refresh` with refreshToken
   - Update accessToken cookie
   - Retry original request
   - If refresh fails, redirect to login
4. Protect routes: redirect to login if not authenticated (for protected pages)
5. Check admin role for admin pages: redirect to home if not admin

### API Client Setup
- Create axios instance with base URL from `NEXT_PUBLIC_API_URL` or default to `http://localhost:3000`
- Request interceptor: add Authorization header from cookie
- Response interceptor: handle 401 and refresh token
- Separate API functions in `lib/` folder:
  - `lib/api.ts` - Axios instance
  - `lib/auth.ts` - Auth functions (login, register, logout, getMe, refresh)
  - `lib/movies.ts` - Movie functions (getMovies, getMovieById)
  - `lib/categories.ts` - Category functions
  - `lib/user.ts` - User space functions (favorites, watchlist, ratings, history)

### TypeScript Types
Define types in `types/index.ts`:
- `Movie`, `MovieImage`, `Category`
- `User`, `AuthResponse`, `LoginCredentials`, `RegisterData`
- `Pagination`, `PaginatedResponse<T>`
- `MovieFilters`
- `Rating`, `Favorite`, `WatchlistItem`, `HistoryItem`

### UI Components
Create reusable components in `components/ui/`:
- `Button` - Variants (primary, outline, danger), sizes, loading state
- `Input` - With label, error message, required indicator
- `Card` - For movie cards
- `Loading` - Spinner/loading indicator
- `Toast` - Notification system (success, error, info)
- `Modal` - For confirmations and forms

### Layout & Navigation
- `Navbar` component with:
  - Logo/brand name
  - Navigation links (Home, Login/Register or Profile, My Favorites, etc.)
  - User menu when logged in (Profile, Logout)
  - Admin links if user is admin
- Responsive design (mobile-friendly)

### State Management
- Use React hooks (useState, useEffect, useContext if needed)
- Consider context for auth state (user, isAuthenticated, isAdmin)
- Sync URL params with filter state on home page

### Error Handling
- Display user-friendly error messages
- Handle network errors gracefully
- Show loading states during API calls
- Toast notifications for success/error actions

### Image Handling
- Display movie images from backend (path from API)
- Handle missing images with placeholder
- Support image uploads in admin forms (multipart/form-data)

### Form Validation
- Client-side validation for better UX
- Server-side validation errors displayed to user
- Real-time feedback on password strength (register page)

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Grid layouts adapt to screen size
- Forms and modals work on mobile

## Design Guidelines

- Modern, clean UI
- Consistent spacing and typography
- Accessible (proper labels, ARIA attributes)
- Loading states for all async operations
- Smooth transitions and hover effects
- Color scheme: Use Tailwind's default colors or a custom palette
- Icons: Use emoji or simple text labels (or install an icon library if preferred)

## File Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with Navbar
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── movies/
│   │   └── [id]/page.tsx
│   ├── profile/page.tsx
│   ├── my-favorites/page.tsx
│   ├── my-watchlist/page.tsx
│   ├── my-ratings/page.tsx
│   ├── history/page.tsx
│   └── admin/
│       ├── movies/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/edit/page.tsx
│       └── categories/page.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Loading.tsx
│   │   ├── Toast.tsx
│   │   └── Modal.tsx
│   ├── MovieCard.tsx
│   ├── MovieFilters.tsx
│   ├── MovieActions.tsx        # Favorites, watchlist, rating on detail page
│   └── Navbar.tsx
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── movies.ts
│   ├── categories.ts
│   ├── user.ts
│   └── index.ts
└── types/
    └── index.ts
```

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Testing the Connection

1. Ensure backend is running on port 3000
2. Test public endpoints first (GET /movies, GET /categories)
3. Test authentication flow (register, login, refresh)
4. Test protected routes with authentication
5. Test admin routes with admin user

## Additional Features to Consider

- Debounce search input
- Optimistic UI updates (for favorites, watchlist)
- Image lazy loading
- Infinite scroll option (alternative to pagination)
- Dark mode toggle
- Remember filter preferences in localStorage

Build a production-ready, fully functional React frontend that seamlessly connects to the backend API and provides an excellent user experience.
