import { db } from "../database/connection";

export interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalMovies: number;
  totalCategories: number;
  totalRatings: number;
  totalWatchlistItems: number;
  totalHistoryItems: number;
  averageRating: number;
  recentUsers: Array<{ id: string; username: string; email: string; role: string; createdAt: string }>;
  recentMovies: Array<{ id: string; title: string; year: number; ratingAvg: number; createdAt: string }>;
  topRatedMovies: Array<{ id: string; title: string; ratingAvg: number; year: number; ratingsCount: number }>;
  categoryDistribution: Array<{ categoryName: string; movieCount: number }>;
  userActivity: Array<{ date: string; registrations: number; ratings: number; watchlistAdds: number }>;
}

export async function getAdminStats(): Promise<AdminStats> {
  // Total counts
  const [userRows] = await db.execute("SELECT COUNT(*) as count, SUM(CASE WHEN role = 'ADMIN' THEN 1 ELSE 0 END) as admins FROM users");
  const [movieRows] = await db.execute("SELECT COUNT(*) as count FROM movies");
  const [categoryRows] = await db.execute("SELECT COUNT(*) as count FROM categories");
  const [ratingRows] = await db.execute("SELECT COUNT(*) as count, AVG(ratingNumber) as avg FROM ratings");
  const [watchlistRows] = await db.execute("SELECT COUNT(*) as count FROM watchlist");
  const [historyRows] = await db.execute("SELECT COUNT(*) as count FROM history");

  const totalUsers = (userRows as any[])[0]?.count || 0;
  const totalAdmins = (userRows as any[])[0]?.admins || 0;
  const totalMovies = (movieRows as any[])[0]?.count || 0;
  const totalCategories = (categoryRows as any[])[0]?.count || 0;
  const totalRatings = (ratingRows as any[])[0]?.count || 0;
  const totalWatchlistItems = (watchlistRows as any[])[0]?.count || 0;
  const totalHistoryItems = (historyRows as any[])[0]?.count || 0;
  const averageRating = parseFloat((ratingRows as any[])[0]?.avg || 0);

  // Recent users (last 5)
  const [recentUserRows] = await db.execute(
    "SELECT id, username, email, role, createdAt FROM users ORDER BY createdAt DESC LIMIT 5"
  );

  // Recent movies (last 5)
  const [recentMovieRows] = await db.execute(
    "SELECT id, title, year, ratingAvg, createdAt FROM movies ORDER BY createdAt DESC LIMIT 5"
  );

  // Top rated movies (top 5) with ratings count
  const [topRatedRows] = await db.execute(`
    SELECT m.id, m.title, m.ratingAvg, m.year, COUNT(r.movieId) as ratingsCount
    FROM movies m
    LEFT JOIN ratings r ON m.id = r.movieId
    WHERE m.ratingAvg > 0
    GROUP BY m.id, m.title, m.ratingAvg, m.year
    ORDER BY m.ratingAvg DESC
    LIMIT 5
  `);

  // Category distribution
  const [categoryDistRows] = await db.execute(`
    SELECT c.name as categoryName, COUNT(mc.movieId) as movieCount
    FROM categories c
    LEFT JOIN movie_categories mc ON c.id = mc.categoryId
    GROUP BY c.id, c.name
    ORDER BY movieCount DESC
  `);

  // User activity (last 7 days)
  const [activityRows] = await db.execute(`
    SELECT 
      DATE(createdAt) as date,
      COUNT(*) as registrations
    FROM users
    WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DATE(createdAt)
    ORDER BY date ASC
  `);

  const [ratingActivityRows] = await db.execute(`
    SELECT 
      DATE(createdAt) as date,
      COUNT(*) as ratings
    FROM ratings
    WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DATE(createdAt)
    ORDER BY date ASC
  `);

  const [watchlistActivityRows] = await db.execute(`
    SELECT 
      DATE(createdAt) as date,
      COUNT(*) as watchlistAdds
    FROM watchlist
    WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DATE(createdAt)
    ORDER BY date ASC
  `);

  // Merge activity data
  const activityMap = new Map<string, { registrations: number; ratings: number; watchlistAdds: number }>();
  
  (activityRows as any[]).forEach((row: any) => {
    const date = new Date(row.date).toISOString().split('T')[0];
    activityMap.set(date, { registrations: row.registrations || 0, ratings: 0, watchlistAdds: 0 });
  });

  (ratingActivityRows as any[]).forEach((row: any) => {
    const date = new Date(row.date).toISOString().split('T')[0];
    const existing = activityMap.get(date) || { registrations: 0, ratings: 0, watchlistAdds: 0 };
    activityMap.set(date, { ...existing, ratings: row.ratings || 0 });
  });

  (watchlistActivityRows as any[]).forEach((row: any) => {
    const date = new Date(row.date).toISOString().split('T')[0];
    const existing = activityMap.get(date) || { registrations: 0, ratings: 0, watchlistAdds: 0 };
    activityMap.set(date, { ...existing, watchlistAdds: row.watchlistAdds || 0 });
  });

  // Fill all 7 days (chart expects one entry per day)
  const last7Days: Array<{ date: string; registrations: number; ratings: number; watchlistAdds: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const existing = activityMap.get(dateStr) || { registrations: 0, ratings: 0, watchlistAdds: 0 };
    last7Days.push({
      date: dateStr,
      registrations: existing.registrations,
      ratings: existing.ratings,
      watchlistAdds: existing.watchlistAdds,
    });
  }
  const userActivity = last7Days;

  return {
    totalUsers: Number(totalUsers),
    totalAdmins: Number(totalAdmins),
    totalMovies: Number(totalMovies),
    totalCategories: Number(totalCategories),
    totalRatings: Number(totalRatings),
    totalWatchlistItems: Number(totalWatchlistItems),
    totalHistoryItems: Number(totalHistoryItems),
    averageRating: Number(averageRating.toFixed(1)),
    recentUsers: (recentUserRows as any[]).map((u: any) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    })),
    recentMovies: (recentMovieRows as any[]).map((m: any) => ({
      id: m.id,
      title: m.title,
      year: m.year,
      ratingAvg: parseFloat(m.ratingAvg || 0),
      createdAt: m.createdAt,
    })),
    topRatedMovies: (topRatedRows as any[]).map((m: any) => ({
      id: m.id,
      title: m.title,
      ratingAvg: parseFloat(m.ratingAvg || 0),
      year: m.year,
      ratingsCount: Number(m.ratingsCount || 0),
    })),
    categoryDistribution: (categoryDistRows as any[]).map((c: any) => ({
      categoryName: c.categoryName || 'Uncategorized',
      movieCount: Number(c.movieCount || 0),
    })),
    userActivity,
  };
}

export async function getAllUsers() {
  const [rows] = await db.execute(`
    SELECT 
      u.id,
      u.username,
      u.email,
      u.role,
      u.createdAt,
      COUNT(DISTINCT w.movieId) as watchlistCount,
      COUNT(DISTINCT r.movieId) as ratingsCount,
      COUNT(DISTINCT h.movieId) as historyCount
    FROM users u
    LEFT JOIN watchlist w ON u.id = w.userId
    LEFT JOIN ratings r ON u.id = r.userId
    LEFT JOIN history h ON u.id = h.userId
    GROUP BY u.id, u.username, u.email, u.role, u.createdAt
    ORDER BY u.createdAt DESC
  `);

  return (rows as any[]).map((u: any) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    watchlistCount: Number(u.watchlistCount || 0),
    ratingsCount: Number(u.ratingsCount || 0),
    historyCount: Number(u.historyCount || 0),
  }));
}

export async function getAnalytics() {
  // Movies by year
  const [moviesByYearRows] = await db.execute(`
    SELECT year, COUNT(*) as count
    FROM movies
    GROUP BY year
    ORDER BY year DESC
    LIMIT 10
  `);

  // Ratings distribution
  const [ratingsDistRows] = await db.execute(`
    SELECT ratingNumber, COUNT(*) as count
    FROM ratings
    GROUP BY ratingNumber
    ORDER BY ratingNumber DESC
  `);

  // Most watched movies
  const [mostWatchedRows] = await db.execute(`
    SELECT m.id, m.title, COUNT(h.movieId) as watchCount
    FROM movies m
    LEFT JOIN history h ON m.id = h.movieId
    GROUP BY m.id, m.title
    ORDER BY watchCount DESC
    LIMIT 10
  `);

  // Most rated movies
  const [mostRatedRows] = await db.execute(`
    SELECT m.id, m.title, COUNT(r.movieId) as ratingCount, AVG(r.ratingNumber) as avgRating
    FROM movies m
    LEFT JOIN ratings r ON m.id = r.movieId
    GROUP BY m.id, m.title
    HAVING ratingCount > 0
    ORDER BY ratingCount DESC
    LIMIT 10
  `);

  return {
    moviesByYear: (moviesByYearRows as any[]).map((r: any) => ({
      year: r.year,
      count: Number(r.count),
    })),
    ratingsDistribution: (ratingsDistRows as any[]).map((r: any) => ({
      rating: Number(r.ratingNumber),
      count: Number(r.count),
    })),
    mostWatched: (mostWatchedRows as any[]).map((m: any) => ({
      id: m.id,
      title: m.title,
      watchCount: Number(m.watchCount || 0),
    })),
    mostRated: (mostRatedRows as any[]).map((m: any) => ({
      id: m.id,
      title: m.title,
      ratingCount: Number(m.ratingCount || 0),
      avgRating: parseFloat(m.avgRating || 0),
    })),
  };
}
