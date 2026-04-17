import type { TFunction } from 'i18next';

const DAY_LABELS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'] as const;
const DAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export interface ActivityItem {
  id: string;
  type: 'movie' | 'category' | 'rating' | 'user';
  message: string;
  timestamp: string;
  /** Affiche (activité film) une jaquette si présente. */
  posterUrl?: string | null;
}

/** Convert YYYY-MM-DD date string to short weekday label by locale */
export function formatDayLabel(dateStr: string, lng: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const dayIndex = date.getDay();
  if (lng.startsWith('en')) {
    return DAY_LABELS_EN[dayIndex] ?? dateStr;
  }
  return DAY_LABELS_FR[dayIndex] ?? dateStr;
}

/** Format ISO date to short relative time using i18n */
export function formatRelativeTime(isoDate: string, t: TFunction): string {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return t('time.minutes', { count: Math.max(0, diffMins) });
  if (diffHours < 24) return t('time.hours', { count: diffHours });
  if (diffDays < 7) return t('time.days', { count: diffDays });
  return t('time.weeks', { count: Math.floor(diffDays / 7) });
}

interface RecentMovie {
  id: string;
  title: string;
  createdAt: string;
  posterUrl?: string | null;
}

interface RecentUser {
  id: string;
  email: string;
  createdAt: string;
}

/** Merge recentMovies and recentUsers into activity list, sorted by date desc, limited to 5 */
export function buildRecentActivity(
  recentMovies: RecentMovie[] = [],
  recentUsers: RecentUser[] = [],
  t: TFunction
): ActivityItem[] {
  const items: Array<{ createdAt: string; item: ActivityItem }> = [];

  recentMovies.forEach((m) => {
    items.push({
      createdAt: m.createdAt,
      item: {
        id: `movie-${m.id}`,
        type: 'movie',
        message: t('adminActivity.movieAdded', {
          title: m.title?.trim() || t('adminActivity.noTitle'),
        }),
        timestamp: formatRelativeTime(m.createdAt, t),
        posterUrl: m.posterUrl,
      },
    });
  });

  recentUsers.forEach((u) => {
    items.push({
      createdAt: u.createdAt,
      item: {
        id: `user-${u.id}`,
        type: 'user',
        message: t('adminActivity.userRegistered', {
          email: u.email?.trim() || t('adminActivity.noEmail'),
        }),
        timestamp: formatRelativeTime(u.createdAt, t),
      },
    });
  });

  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((x) => x.item);
}
