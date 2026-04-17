import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  formatDayLabel,
  buildRecentActivity,
} from '../utils/adminDashboardUtils';

export const useAdminDashboardData = () => {
  const { t, i18n } = useTranslation();
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.admin.getStats(),
    refetchInterval: 10000,
  });

  const kpis = {
    totalMovies: stats?.totalMovies ?? 0,
    totalCategories: stats?.totalCategories ?? 0,
    totalUsers: stats?.totalUsers ?? 0,
    totalRatings: stats?.totalRatings ?? 0,
    watchlistItems: stats?.totalWatchlistItems ?? 0,
    platformAvgRating: stats?.averageRating ?? 0,
  };

  const ratingsTrend = useMemo(
    () =>
      stats?.userActivity?.map((d) => ({
        day: formatDayLabel(d.date, i18n.language),
        ratings: d.ratings ?? 0,
      })) ?? [],
    [stats?.userActivity, i18n.language]
  );

  const categoryCoverage = useMemo(
    () =>
      (stats?.categoryDistribution ?? []).slice(0, 5).map((c) => ({
        name: c.categoryName?.trim() || t('admin.uncategorized'),
        value: Number(c.movieCount ?? 0),
      })),
    [stats?.categoryDistribution, t]
  );

  const topRatedMovies =
    stats?.topRatedMovies?.map((m) => ({
      id: m.id,
      title: m.title,
      year: m.year,
      ratingAvg: m.ratingAvg ?? 0,
      ratingsCount: m.ratingsCount ?? 0,
    })) ?? [];

  const recentActivity = useMemo(
    () => buildRecentActivity(stats?.recentMovies, stats?.recentUsers, t),
    [stats?.recentMovies, stats?.recentUsers, t]
  );

  return {
    kpis,
    ratingsTrend,
    categoryCoverage,
    topRatedMovies,
    recentActivity,
    isLoading: isLoadingStats,
  };
};
