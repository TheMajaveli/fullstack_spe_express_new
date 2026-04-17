
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Play, Edit, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { FALLBACK_POSTER_URL, formatMovieRating, getPosterUrl, youtubeEmbedUrl } from '../utils/constants';
import { Card, Button, Input, Badge, useToast, Skeleton } from '../components/UI';
import { Modal } from '../components/DesignSystem';
import { MovieFormModal } from '../components/MovieFormModal';
import { Movie } from '../types';

type AdminMovieSort = 'newest' | 'oldest' | 'rating_desc' | 'rating_asc' | 'title';

export const AdminMovies: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<AdminMovieSort>('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const sortOptions = useMemo(
    () =>
      [
        { value: 'newest' as const, labelKey: 'admin.movies.sortNewest' },
        { value: 'oldest' as const, labelKey: 'admin.movies.sortOldest' },
        { value: 'rating_desc' as const, labelKey: 'admin.movies.sortRatingDesc' },
        { value: 'rating_asc' as const, labelKey: 'admin.movies.sortRatingAsc' },
        { value: 'title' as const, labelKey: 'admin.movies.sortTitle' },
      ] as const,
    []
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sort]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-movies', searchTerm, sort, currentPage],
    queryFn: () =>
      api.movies.list({
        search: searchTerm.trim() || undefined,
        page: currentPage,
        limit: 10,
        sort,
      }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.movies.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      toast(t('admin.movies.toastDeleted'), 'success');
    },
    onError: (error: any) => {
      toast(error.message || t('admin.movies.toastDeleteError'), 'error');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm(t('admin.movies.deleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedMovie(null);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
  };

  const trailerEmbed = trailerMovie ? youtubeEmbedUrl(trailerMovie.trailerUrl) : null;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('admin.movies.title')}</h1>
          <p className="text-sm md:text-base text-zinc-500">{t('admin.movies.subtitle')}</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={handleCreate}>
          <Plus size={18} />{' '}
          <span className="hidden sm:inline">{t('admin.movies.addMovie')}</span>
          <span className="sm:hidden">{t('admin.movies.addMovieShort')}</span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col gap-4 bg-zinc-900/50">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            <div className="w-full lg:max-w-md">
              <Input
                placeholder={t('admin.movies.searchPlaceholder')}
                icon={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
                aria-label={t('admin.movies.searchAria')}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap sm:mr-1">
                {t('admin.movies.sortBy')}
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as AdminMovieSort)}
                className="h-9 rounded-md border border-zinc-800 bg-zinc-950 text-sm text-zinc-200 px-3 min-w-[200px] focus:outline-none focus:ring-1 focus:ring-accent"
                aria-label={t('admin.movies.sortListAria')}
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(o.labelKey)}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" className="h-9" type="button" disabled title={t('admin.movies.comingSoon')}>
                {t('admin.movies.exportCsv')}
              </Button>
            </div>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-4 lg:px-6 py-4">{t('admin.movies.colTitle')}</th>
                <th className="px-4 lg:px-6 py-4">{t('admin.movies.colStatus')}</th>
                <th className="px-4 lg:px-6 py-4">{t('admin.movies.colRelease')}</th>
                <th className="px-4 lg:px-6 py-4">{t('admin.movies.colRating')}</th>
                <th className="px-4 lg:px-6 py-4 text-right">{t('admin.movies.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 lg:px-6 py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <Skeleton className="h-4 w-8" />
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : (
                data?.data.map((movie: Movie) => {
                  const hasTrailer = Boolean(youtubeEmbedUrl(movie.trailerUrl));
                  return (
                    <tr key={movie.id} className="hover:bg-zinc-900/40 transition-colors group">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 rounded bg-zinc-800 overflow-hidden shrink-0">
                            <img
                              src={getPosterUrl(movie.posterUrl)}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = FALLBACK_POSTER_URL;
                              }}
                            />
                          </div>
                          <div className="overflow-hidden min-w-0">
                            <p className="font-bold truncate">{movie.title}</p>
                            <p className="text-xs text-zinc-500 truncate">{movie.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <Badge variant="accent">{t('admin.movies.statusActive')}</Badge>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-zinc-400">{movie.year}</td>
                      <td className="px-4 lg:px-6 py-4 font-bold">{formatMovieRating(movie.rating)}</td>
                      <td className="px-4 lg:px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(movie)}
                            aria-label={t('admin.movies.editAria')}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                            onClick={() => handleDelete(movie.id)}
                            aria-label={t('admin.movies.deleteAria')}
                          >
                            <Trash2 size={14} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-accent disabled:opacity-30"
                            disabled={!hasTrailer}
                            onClick={() => {
                              if (!hasTrailer) return;
                              setTrailerMovie(movie);
                            }}
                            aria-label={t('admin.movies.trailerAria')}
                            title={hasTrailer ? t('admin.movies.trailerTitle') : t('admin.movies.noTrailerTitle')}
                          >
                            <Play size={14} className="fill-current" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border border-zinc-800 rounded-lg space-y-3">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <p>{t('admin.movies.noMovies')}</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {data?.data.map((movie: Movie) => {
                const hasTrailer = Boolean(youtubeEmbedUrl(movie.trailerUrl));
                return (
                  <div key={movie.id} className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/30 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-28 rounded bg-zinc-800 overflow-hidden shrink-0">
                        <img
                          src={getPosterUrl(movie.posterUrl)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_POSTER_URL;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <h3 className="font-bold text-base truncate">{movie.title}</h3>
                          <p className="text-xs text-zinc-500">{movie.category}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="accent">{t('admin.movies.statusActive')}</Badge>
                          <span className="text-xs text-zinc-400">{movie.year}</span>
                          <span className="text-xs font-bold">⭐ {formatMovieRating(movie.rating)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
                      <Button type="button" variant="outline" size="sm" className="flex-1 min-w-[100px] gap-2" onClick={() => handleEdit(movie)}>
                        <Edit size={14} /> {t('admin.movies.edit')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-[100px] gap-2 text-red-500 border-red-500/50 hover:bg-red-500/10"
                        onClick={() => handleDelete(movie.id)}
                      >
                        <Trash2 size={14} /> {t('admin.movies.delete')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-[100px] gap-2 text-accent border-accent/40"
                        disabled={!hasTrailer}
                        onClick={() => {
                          if (!hasTrailer) return;
                          setTrailerMovie(movie);
                        }}
                      >
                        <Play size={14} className="fill-current" /> {t('admin.movies.trailerTitle')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-xs">
          <p className="text-center sm:text-left">
            {t('admin.movies.paginationSummary', {
              shown: data?.data.length || 0,
              total: data?.total || 0,
              page: currentPage,
              pages: data?.totalPages || 1,
            })}
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              {t('common.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              disabled={currentPage === (data?.totalPages || 1)}
              onClick={() => setCurrentPage((p) => Math.min(data?.totalPages || 1, p + 1))}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={Boolean(trailerMovie && trailerEmbed)}
        onClose={() => setTrailerMovie(null)}
        title={trailerMovie ? t('admin.movies.modalTrailerTitle', { title: trailerMovie.title }) : t('admin.movies.trailerTitle')}
        contentClassName="max-w-4xl w-[95vw]"
      >
        {trailerEmbed && (
          <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-sm overflow-hidden border border-zinc-800 bg-black">
            <iframe
              title={trailerMovie?.title ?? t('admin.movies.iframeTrailerTitle')}
              src={trailerEmbed}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </Modal>

      <MovieFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMovie(null);
        }}
        movie={selectedMovie}
        onSuccess={handleModalSuccess}
        categories={categories}
      />
    </div>
  );
};
