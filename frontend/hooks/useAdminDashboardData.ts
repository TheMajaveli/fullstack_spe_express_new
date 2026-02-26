import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

// Mock data generators
const generateMockRatingsTrend = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    ratings: Math.floor(Math.random() * 20) + 5,
  }));
};

const generateMockCategoryCoverage = () => {
  const categories = ['Action', 'Drama', 'Sci-Fi', 'Thriller', 'Horror'];
  return categories.map(name => ({
    name,
    value: Math.floor(Math.random() * 15) + 3,
  }));
};

const generateMockRecentActivity = () => {
  const activities = [
    { type: 'movie' as const, message: 'Movie added: Interstellar' },
    { type: 'category' as const, message: 'Category created: Thriller' },
    { type: 'rating' as const, message: 'Rating submitted: 9/10 on The Dark Knight' },
    { type: 'user' as const, message: 'User joined: john@mail.com' },
    { type: 'movie' as const, message: 'Movie added: Inception' },
  ];
  
  return activities.map((activity, index) => ({
    id: `activity-${index}`,
    ...activity,
    timestamp: `${Math.floor(Math.random() * 24)}h ago`,
  }));
};

export const useAdminDashboardData = () => {
  // Fetch real stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.admin.getStats(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch movies for top rated
  const { data: moviesData } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: () => api.movies.list({ page: 1, sort: 'rating' }),
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });

  // Mock data (can be replaced with real API calls later)
  const ratingsTrend = generateMockRatingsTrend();
  const categoryCoverage = generateMockCategoryCoverage();
  const recentActivity = generateMockRecentActivity();

  // Compute KPIs from real data or use mocks
  const kpis = {
    totalMovies: stats?.totalMovies ?? 0,
    totalCategories: stats?.totalCategories ?? categories.length,
    totalUsers: stats?.totalUsers ?? 0, // Real from API
    totalRatings: stats?.totalRatings ?? 0,
    watchlistItems: stats?.totalWatchlistItems ?? 0, // Real from API
    platformAvgRating: stats?.averageRating ?? 0,
  };

  // Get top rated movies (from API or mock)
  const topRatedMovies = moviesData?.data
    ?.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5)
    .map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.year,
      ratingAvg: movie.rating || 0,
      ratingsCount: Math.floor(Math.random() * 50) + 10, // Mock for now
    })) || [];

  return {
    kpis,
    ratingsTrend,
    categoryCoverage,
    topRatedMovies,
    recentActivity,
    isLoading: isLoadingStats,
  };
};
