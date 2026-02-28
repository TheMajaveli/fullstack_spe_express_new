/** French day abbreviations for chart labels */
const DAY_LABELS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'] as const;

export interface ActivityItem {
  id: string;
  type: 'movie' | 'category' | 'rating' | 'user';
  message: string;
  timestamp: string;
}

/** Convert YYYY-MM-DD date string to French day abbreviation */
export function formatDayLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const dayIndex = date.getDay();
  return DAY_LABELS_FR[dayIndex] ?? dateStr;
}

/** Format ISO date to relative time (e.g. "2h", "1j", "3j") */
export function formatRelativeTime(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return '1j';
  if (diffDays < 7) return `${diffDays}j`;
  return `${Math.floor(diffDays / 7)} sem`;
}

interface RecentMovie {
  id: string;
  title: string;
  createdAt: string;
}

interface RecentUser {
  id: string;
  email: string;
  createdAt: string;
}

/** Merge recentMovies and recentUsers into activity list, sorted by date desc, limited to 5 */
export function buildRecentActivity(
  recentMovies: RecentMovie[] = [],
  recentUsers: RecentUser[] = []
): ActivityItem[] {
  const items: Array<{ createdAt: string; item: ActivityItem }> = [];

  recentMovies.forEach((m) => {
    items.push({
      createdAt: m.createdAt,
      item: {
        id: `movie-${m.id}`,
        type: 'movie',
        message: `Film ajouté : ${m.title || 'Sans titre'}`,
        timestamp: formatRelativeTime(m.createdAt),
      },
    });
  });

  recentUsers.forEach((u) => {
    items.push({
      createdAt: u.createdAt,
      item: {
        id: `user-${u.id}`,
        type: 'user',
        message: `Utilisateur inscrit : ${u.email || 'Sans email'}`,
        timestamp: formatRelativeTime(u.createdAt),
      },
    });
  });

  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((x) => x.item);
}
