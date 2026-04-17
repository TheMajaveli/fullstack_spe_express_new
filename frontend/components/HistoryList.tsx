import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { Button, Skeleton } from './UI';
import { api, apiMovieContentLang } from '../services/api';
import { FALLBACK_POSTER_URL, getPosterUrl } from '../utils/constants';

interface HistoryListProps {
  historyIds: string[];
}

export const HistoryList: React.FC<HistoryListProps> = ({ historyIds }) => {
  const { i18n } = useTranslation();
  const movieLang = apiMovieContentLang(i18n.language);
  const { data: movies, isLoading } = useQuery({
    queryKey: ['history-movies', historyIds, movieLang],
    queryFn: async () => {
      if (!historyIds.length) return [];
      const movies = await Promise.all(historyIds.map((id) => api.movies.get(id, movieLang)));
      return movies.filter(Boolean);
    },
    enabled: historyIds.length > 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {movies.map((movie: any) => (
        <Link
          key={movie.id}
          to={`/movies/${movie.id}`}
          className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-colors group"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded bg-zinc-800 overflow-hidden shrink-0">
              <img src={getPosterUrl(movie.posterUrl)} alt={movie.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_POSTER_URL; }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate">{movie.title}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">{movie.year}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronRight size={16} />
          </Button>
        </Link>
      ))}
    </div>
  );
};
