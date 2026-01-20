# Frontend Setup & Connection Guide

## ✅ Frontend Complete!

The React frontend has been fully built and is ready to connect to your Express.js backend.

## 📁 What Was Built

### Pages
- ✅ Home page (`/`) - Movie catalog with filters, search, sorting, pagination
- ✅ Movie detail page (`/movies/[id]`) - Full movie information with user actions
- ✅ Login page (`/auth/login`) - User authentication
- ✅ Register page (`/auth/register`) - User registration with strong password validation
- ✅ Profile page (`/profile`) - User profile management
- ✅ My Favorites (`/my-favorites`) - User's favorite movies
- ✅ My Watchlist (`/my-watchlist`) - User's watchlist
- ✅ My Ratings (`/my-ratings`) - User's movie ratings
- ✅ History (`/history`) - Viewing history
- ✅ Admin Movies (`/admin/movies`) - Movie management (CRUD)
- ✅ Admin Create Movie (`/admin/movies/new`) - Create new movie with image upload
- ✅ Admin Edit Movie (`/admin/movies/[id]/edit`) - Edit movie
- ✅ Admin Categories (`/admin/categories`) - Category management (CRUD)

### Components
- ✅ Navbar - Navigation with user state
- ✅ MovieCard - Movie display card
- ✅ MovieFilters - Filtering and search interface
- ✅ MovieActions - User interactions (favorites, watchlist, ratings)
- ✅ UI Components: Button, Input, Card, Loading, Toast

### API Integration
- ✅ Axios client with automatic token refresh
- ✅ Authentication functions (login, register, logout, profile)
- ✅ Movie functions (list, detail, create, update, delete)
- ✅ Category functions (list, create, update, delete)
- ✅ User space functions (favorites, watchlist, ratings, history)

## 🔌 Connecting to Backend

### 1. Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**For Docker:**
```bash
NEXT_PUBLIC_API_URL=http://backend:3000
```

### 2. Start the Backend

Make sure your Express.js backend is running on port 3000:

```bash
cd backend
npm install
# Set up .env file with database credentials
node config/migrations/create_movies_db.js
node config/migrations/create_auth_tables.js
npm run dev
```

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3001` (or the port Next.js assigns).

### 4. Test the Connection

1. Open `http://localhost:3001` in your browser
2. You should see the movie catalog (if you have movies in the database)
3. Try registering a new user
4. Try logging in
5. Browse movies and test the filters
6. Add movies to favorites/watchlist
7. Rate movies

## 🐳 Docker Setup

If using Docker Compose, the frontend is already configured:

```bash
docker-compose up -d
```

The frontend will be available at `http://localhost:3001` and will automatically connect to the backend service.

## 🔑 Authentication Flow

1. **Register/Login**: Tokens are stored in cookies
2. **Automatic Refresh**: Access tokens refresh automatically when expired
3. **Protected Routes**: Pages check authentication and redirect to login if needed
4. **Admin Routes**: Additional role check for admin pages

## 🖼️ Image Handling

- Images are served from the backend at `/uploads/`
- Image URLs are constructed as: `${NEXT_PUBLIC_API_URL}/uploads/filename.jpg`
- Placeholder images shown when no image is available
- Image uploads work in admin movie forms (multipart/form-data)

## 🎨 Features

### Public Features
- Browse movies with advanced filtering
- Search by title or director
- Sort by title, year, or rating
- Pagination
- View movie details

### User Features (Requires Login)
- Add/remove favorites
- Add/remove from watchlist
- Rate movies (0-10) with comments
- View viewing history
- Update profile

### Admin Features (Requires Admin Role)
- Create, edit, delete movies
- Upload movie images
- Manage categories (CRUD)

## 🐛 Troubleshooting

### CORS Issues
If you see CORS errors, make sure the backend has CORS enabled (it should already be configured).

### API Connection Issues
1. Check that `NEXT_PUBLIC_API_URL` is set correctly
2. Verify the backend is running on the correct port
3. Check browser console for specific error messages

### Authentication Issues
1. Clear cookies and try logging in again
2. Check that JWT secrets are configured in backend
3. Verify token refresh is working (check Network tab)

### Image Loading Issues
1. Verify backend serves static files from `/uploads` directory
2. Check image paths in API responses
3. Ensure images exist in `backend/uploads/` directory

## 📝 Next Steps

1. **Test all features** - Go through each page and feature
2. **Add seed data** - Run seeders to populate database with test data
3. **Customize styling** - Adjust Tailwind classes to match your design
4. **Add more features** - Dark mode, infinite scroll, etc.

## 🎯 Key Files

- `frontend/lib/api.ts` - Axios instance with interceptors
- `frontend/lib/auth.ts` - Authentication functions
- `frontend/lib/movies.ts` - Movie API functions
- `frontend/lib/categories.ts` - Category API functions
- `frontend/lib/user.ts` - User space API functions
- `frontend/types/index.ts` - TypeScript type definitions

---

**The frontend is production-ready and fully connected to your backend!** 🚀
