import React from 'react';
import { Film, Tag, Star, User, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'movie' | 'category' | 'rating' | 'user';
  message: string;
  timestamp: string;
}

interface RecentActivityListProps {
  activities: ActivityItem[];
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'movie':
      return <Film size={14} className="text-accent" />;
    case 'category':
      return <Tag size={14} className="text-blue-500" />;
    case 'rating':
      return <Star size={14} className="text-yellow-500" />;
    case 'user':
      return <User size={14} className="text-emerald-500" />;
  }
};

export const RecentActivityList: React.FC<RecentActivityListProps> = ({ activities }) => {
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 p-3 bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-300 dark:border-zinc-800 rounded-sm hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors">
          <div className="mt-0.5 shrink-0">
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-300">{activity.message}</p>
            <div className="flex items-center gap-2 text-[10px] text-zinc-600 dark:text-zinc-600 font-black uppercase tracking-widest">
              <Clock size={10} />
              {activity.timestamp}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
