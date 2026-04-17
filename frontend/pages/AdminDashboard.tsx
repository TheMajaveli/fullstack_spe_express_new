import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Tag } from 'lucide-react';
import { Button } from '../components/DesignSystem';
import { Card, Skeleton } from '../components/UI';
import { KPIStatCard } from '../components/admin/KPIStatCard';
import { RecentActivityList } from '../components/admin/RecentActivityList';
import { useAdminDashboardData } from '../hooks/useAdminDashboardData';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const COLORS = ['#e11d48', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    kpis,
    ratingsTrend,
    categoryCoverage,
    topRatedMovies,
    recentActivity,
    isLoading,
  } = useAdminDashboardData();

  const handleAddMovie = () => {
    navigate('/admin/movies');
    // In a real implementation, you might trigger a modal or scroll to create form
  };

  const handleManageCategories = () => {
    navigate('/admin/categories');
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Header + Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic text-[var(--text-color)]">{t('admin.dashboard.title')}</h1>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm font-bold uppercase tracking-widest">{t('admin.dashboard.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="sm" className="gap-2" onClick={handleAddMovie}>
            <Plus size={16} /> {t('admin.dashboard.addMovie')}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleManageCategories}>
            <Tag size={16} /> {t('admin.dashboard.manageCategories')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </>
        ) : (
          <>
            <KPIStatCard
              label={t('admin.dashboard.kpiTotalMovies')}
              value={kpis.totalMovies}
              helperText={t('admin.dashboard.kpiMoviesHelper')}
              trend="neutral"
            />
            <KPIStatCard
              label={t('admin.dashboard.kpiTotalCategories')}
              value={kpis.totalCategories}
              helperText={t('admin.dashboard.kpiCategoriesHelper')}
              trend="neutral"
            />
            <KPIStatCard
              label={t('admin.dashboard.kpiTotalUsers')}
              value={kpis.totalUsers}
              helperText={t('admin.dashboard.kpiUsersHelper')}
              trend="neutral"
            />
            <KPIStatCard
              label={t('admin.dashboard.kpiTotalRatings')}
              value={kpis.totalRatings}
              helperText={t('admin.dashboard.kpiRatingsHelper')}
              trend="neutral"
            />
          </>
        )}
      </div>

      {/* Analytics Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Ratings Trend Chart */}
        <Card className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-color)]">{t('admin.dashboard.chartRatingsTrend')}</h3>
            <span className="text-[10px] text-zinc-600 dark:text-zinc-600 font-black uppercase">{t('admin.dashboard.chartLast7Days')}</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingsTrend}>
                <XAxis dataKey="day" tick={{ fill: '#71717a', fontSize: 10 }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'var(--text-color)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ratings"
                  stroke="#e11d48"
                  strokeWidth={2}
                  dot={{ fill: '#e11d48', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Coverage Chart */}
        <Card className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-color)]">{t('admin.dashboard.chartCategoryCoverage')}</h3>
            <span className="text-[10px] text-zinc-600 dark:text-zinc-600 font-black uppercase">{t('admin.dashboard.chartTop5')}</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryCoverage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryCoverage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'var(--text-color)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Rated Movies Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-[var(--border-color)]">
          <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-color)]">{t('admin.dashboard.topRatedTitle')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500 border-b border-[var(--border-color)] bg-zinc-100/50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 lg:px-6 py-4">{t('admin.dashboard.colTitle')}</th>
                <th className="px-4 lg:px-6 py-4">{t('admin.dashboard.colYear')}</th>
                <th className="px-4 lg:px-6 py-4">{t('admin.dashboard.colAvgRating')}</th>
                <th className="px-4 lg:px-6 py-4">{t('admin.dashboard.colRatingsCount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {topRatedMovies.length > 0 ? (
                topRatedMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 lg:px-6 py-4">
                      <span className="font-bold text-[var(--text-color)]">{movie.title}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-zinc-500 dark:text-zinc-500">{movie.year}</td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className="font-bold text-accent">⭐ {movie.ratingAvg.toFixed(1)}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-zinc-500 dark:text-zinc-500">{movie.ratingsCount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 lg:px-6 py-8 text-center text-zinc-500 dark:text-zinc-500">
                    {t('admin.dashboard.noMovies')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-color)]">{t('admin.dashboard.recentActivity')}</h3>
          <span className="text-[10px] text-zinc-600 dark:text-zinc-600 font-black uppercase">{t('admin.dashboard.recentLast5')}</span>
        </div>
        <RecentActivityList activities={recentActivity} />
      </Card>
    </div>
  );
};
