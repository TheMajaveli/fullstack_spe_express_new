import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useInvalidateUserRecommendations } from '../hooks/useInvalidateUserRecommendations';
import { Play, Plus, Check, Star, User } from 'lucide-react';
import { api, apiMovieContentLang } from '../services/api';
import { Button, Skeleton, Modal } from '../components/DesignSystem';
import { RatingModal } from '../components/RatingModal';
import { useToast } from '../components/UI';
import { useStore } from '../store';
import { FALLBACK_POSTER_URL, formatMovieRating, getPosterUrl, youtubeEmbedUrl } from '../utils/constants';

export const MovieDetailPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const movieLang = apiMovieContentLang(i18n.language);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useStore();
  const [isRateModalOpen, setRateModalOpen] = useState(false);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const toast = useToast();
  const invalidateRecommendations = useInvalidateUserRecommendations();

  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', id, movieLang],
    queryFn: () => api.movies.get(id!, movieLang),
    enabled: !!id,
  });

  const isInWatchlist = user?.watchlist.includes(id || '');
  const isWatched = user?.history?.includes(id || '') ?? false;
  const myRating = id ? user?.ratings?.[id] : undefined;
  const myNote = id ? user?.ratingNotes?.[id] : undefined;

  const toggleWatchlist = async () => {
    if (!isAuthenticated) return navigate('/auth/login');
    if (!id) return;
    
    try {
      if (isInWatchlist) {
        const result = await api.user.removeWatchlist(id);
        updateUser({ watchlist: result.watchlist });
      } else {
        const result = await api.user.addWatchlist(id);
        updateUser({ watchlist: result.watchlist });
      }
      // Refresh user profile to get updated data
      const updatedUser = await api.auth.me();
      useStore.getState().setAuth({ user: updatedUser });
      invalidateRecommendations();
      toast(isInWatchlist ? t('movieDetail.toastRemovedFromList') : t('movieDetail.toastAddedToList'), 'success');
    } catch (error: any) {
      toast(error.message || t('movieDetail.toastWatchlistError'), 'error');
    }
  };

  const handleMarkAsWatched = async () => {
    if (!isAuthenticated) return navigate('/auth/login');
    if (!id) return;
    if (isWatched) return;
    
    try {
      await api.user.addHistory(id);
      // Refresh user profile
      const updatedUser = await api.auth.me();
      useStore.getState().setAuth({ user: updatedUser });
      invalidateRecommendations();
      toast(t('movieDetail.toastMarkedWatched'), 'success');
    } catch (error: any) {
      toast(error.message || t('movieDetail.toastMarkWatchedError'), 'error');
    }
  };

  if (isLoading) return <div className="p-20"><Skeleton className="h-[70vh] w-full" /></div>;
  if (!movie) return <div className="p-20 text-center">{t('movieDetail.filmNotFound')}</div>;

  const trailerEmbed = youtubeEmbedUrl(movie.trailerUrl);
  const ratingNum = Number(movie.rating);
  const ratingForStars = Number.isFinite(ratingNum) ? ratingNum : 0;

  return (
    <div className="animate-in fade-in duration-700">
      {/* Cinematic Hero */}
      <div className="relative h-[70vh] w-full">
        <div className="absolute inset-0">
          <img src={getPosterUrl(movie.posterUrl)} alt="" className="w-full h-full object-cover blur-2xl opacity-20 scale-110" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_POSTER_URL; }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-cinema-black to-cinema-black" />
        </div>

        <div className="relative h-full max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center gap-12 pt-20">
          <div className="w-64 md:w-80 shrink-0 poster-shadow rounded-sm overflow-hidden border border-cinema-border animate-fade-up">
            <img src={getPosterUrl(movie.posterUrl)} alt={movie.title} className="w-full aspect-poster object-cover" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_POSTER_URL; }} />
          </div>

          <div className="flex-1 space-y-8 animate-fade-up">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-accent/20 text-accent px-3 py-1 rounded-sm">{movie.category}</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{movie.year}</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{movie.duration}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-tight italic">{movie.title}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} size={18} fill={i < Math.floor(ratingForStars / 2) ? "#e11d48" : "none"} className={i < Math.floor(ratingForStars / 2) ? "text-accent" : "text-zinc-800"} />
                 ))}
                 <span className="ml-2 text-sm font-black text-zinc-400">{formatMovieRating(movie.rating)} / 10</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              {trailerEmbed && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="gap-3 px-8 uppercase text-xs tracking-widest border-accent/40 text-accent hover:bg-accent/10"
                  onClick={() => setTrailerModalOpen(true)}
                >
                  <Play size={18} className="fill-current" />
                  {t('movieDetail.watchTrailer')}
                </Button>
              )}
              <Button
                size="lg"
                className="gap-3 px-10 uppercase text-xs tracking-widest"
                onClick={handleMarkAsWatched}
                disabled={isWatched}
                aria-disabled={isWatched}
              >
                {isWatched ? <Check size={18} /> : <Play fill="currentColor" size={18} />}{' '}
                {isWatched ? t('movieDetail.watched') : t('movieDetail.markWatched')}
              </Button>
              <Button 
                variant={isInWatchlist ? "secondary" : "outline"} 
                size="lg" 
                className="gap-3"
                onClick={toggleWatchlist}
              >
                {isInWatchlist ? <Check size={20} /> : <Plus size={20} />}
                {isInWatchlist ? t('movieDetail.inWatchlist') : t('movieDetail.addToWatchlist')}
              </Button>
              <Button variant="outline" size="icon" onClick={() => setRateModalOpen(true)}><Star size={20} /></Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Content */}
      <section className="max-w-[1400px] mx-auto px-6 py-20 grid lg:grid-cols-3 gap-20">
        <div className="lg:col-span-2 space-y-16">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 flex items-center gap-4">
              <span className="h-px w-8 bg-zinc-800" /> {t('movieDetail.synopsis')}
            </h3>
            <p className="text-xl md:text-2xl font-light leading-relaxed text-zinc-300">
              {movie.description}
            </p>
            {trailerEmbed ? (
              <p className="pt-2">
                <button
                  type="button"
                  onClick={() => setTrailerModalOpen(true)}
                  className="text-sm font-bold uppercase tracking-widest text-accent hover:underline"
                >
                  {t('movieDetail.openTrailer')}
                </button>
              </p>
            ) : (
              <p className="pt-2 text-sm text-zinc-600">{t('movieDetail.noTrailer')}</p>
            )}
          </div>

          <div className="space-y-8">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 flex items-center gap-4">
              <span className="h-px w-8 bg-zinc-800" /> {t('movieDetail.director')}
            </h3>
            <div className="flex items-center gap-6 group cursor-pointer">
              <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                 <User size={32} className="text-zinc-700" />
              </div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight">{movie.director}</h4>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{t('movieDetail.directorSubtitle')}</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-12">
          <div className="space-y-4 p-6 bg-zinc-950/50 border border-zinc-900 rounded-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
              {t('movieDetail.castHeading')}
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{t('movieDetail.castNotInDataset')}</p>
          </div>

          <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-sm space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
              {t('movieDetail.reviewsHeading')}
            </h3>
            {myRating != null ? (
              <div className="space-y-2">
                <p className="text-sm font-bold text-zinc-200">
                  {t('movieDetail.yourRatingTitle')} <span className="text-accent">{myRating} / 10</span>
                </p>
                {myNote ? (
                  <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{myNote}</p>
                ) : (
                  <p className="text-sm text-zinc-600 leading-relaxed">{t('movieDetail.yourCommentEmpty')}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 leading-relaxed">{t('movieDetail.rateThisFilmHint')}</p>
            )}
          </div>
        </aside>
      </section>

      <Modal
        isOpen={Boolean(trailerModalOpen && trailerEmbed)}
        onClose={() => setTrailerModalOpen(false)}
        title={`${t('catalog.recoTrailerTitle')} — ${movie.title}`}
        contentClassName="max-w-4xl w-[95vw]"
      >
        {trailerEmbed && (
          <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-sm overflow-hidden border border-zinc-800 bg-black">
            <iframe
              title={movie.title}
              src={trailerEmbed}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </Modal>

      <Modal isOpen={isRateModalOpen} onClose={() => setRateModalOpen(false)} title={t('movieDetail.rateModalTitle')}>
        <RatingModal 
          movie={movie}
          onClose={() => setRateModalOpen(false)}
          onSuccess={() => {
            setRateModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};
