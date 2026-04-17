import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Sparkles, Play, Star } from 'lucide-react';
import { useStore } from '../store';
import { api, apiMovieContentLang } from '../services/api';
import type { Movie, RecommendationMoodKey } from '../types';
import { Modal, Skeleton } from './DesignSystem';
import { FALLBACK_POSTER_URL, formatMovieRating, getPosterUrl, youtubeEmbedUrl } from '../utils/constants';
import { cn } from '../lib/utils';

const MOOD_STORAGE_KEY = 'cinenoir-reco-mood';

const MOOD_KEYS: RecommendationMoodKey[] = [
  'neutral',
  'sad',
  'need_cheer',
  'motivation',
  'chill',
  'thrill',
];

function readStoredMood(): RecommendationMoodKey | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = sessionStorage.getItem(MOOD_STORAGE_KEY);
    if (v && (MOOD_KEYS as readonly string[]).includes(v)) return v as RecommendationMoodKey;
  } catch {
    /* ignore */
  }
  return null;
}

function moodI18nKey(m: RecommendationMoodKey): string {
  const map: Record<RecommendationMoodKey, string> = {
    neutral: 'catalog.moodNeutral',
    sad: 'catalog.moodSad',
    need_cheer: 'catalog.moodNeedCheer',
    motivation: 'catalog.moodMotivation',
    chill: 'catalog.moodChill',
    thrill: 'catalog.moodThrill',
  };
  return map[m];
}

const RECO_LIMIT = 10;

export const RecommendationRowSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const movieLang = apiMovieContentLang(i18n.language);
  const navigate = useNavigate();
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const [selectedMood, setSelectedMood] = useState<RecommendationMoodKey | null>(() => readStoredMood());
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null);

  const selectMood = useCallback((m: RecommendationMoodKey) => {
    setSelectedMood(m);
    try {
      sessionStorage.setItem(MOOD_STORAGE_KEY, m);
    } catch {
      /* ignore */
    }
  }, []);

  const {
    data: recoData,
    isLoading: recoLoading,
    isError: recoError,
    error: recoQueryError,
    refetch: refetchReco,
    isFetching,
  } = useQuery({
    queryKey: ['user-recommendations', selectedMood, movieLang, RECO_LIMIT],
    queryFn: () => api.user.recommendations(selectedMood!, movieLang, RECO_LIMIT),
    enabled: isAuthenticated && selectedMood != null,
    staleTime: 60 * 1000,
  });

  React.useEffect(() => {
    if (!recoError || !recoQueryError || !isAuthenticated) return;
    const msg = String((recoQueryError as Error)?.message || '').toLowerCase();
    if (msg.includes('unauthorized') || msg.includes('non autorisé')) {
      useStore.getState().logout();
    }
  }, [recoError, recoQueryError, isAuthenticated]);

  const trailerEmbed = trailerMovie ? youtubeEmbedUrl(trailerMovie.trailerUrl) : null;

  const recoMovies = (recoData?.movies ?? []).filter((m): m is Movie => Boolean(m?.id));

  if (!isAuthenticated) return null;

  return (
    <section
      className="border-b border-cinema-border bg-zinc-950/90 py-8"
      aria-label={t('catalog.aiForYou')}
    >
      <div className="max-w-[1400px] mx-auto px-6 space-y-5">
        <div className="space-y-3">
          <div className="min-w-0">
            <h2 className="text-lg font-black uppercase tracking-[0.2em] flex flex-wrap items-center gap-2 text-white">
              <Sparkles className="text-accent shrink-0" size={20} aria-hidden />
              {t('catalog.aiForYou')}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">
                {t('catalog.aiBadge')}
              </span>
            </h2>
            <h3 className="text-base md:text-lg font-bold text-zinc-100 mt-3 tracking-tight">
              {t('catalog.recoFeelingTitle')}
            </h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-2xl">{t('catalog.recoFeelingHint')}</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label={t('catalog.recoMoodLabel')}>
            {MOOD_KEYS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => selectMood(m)}
                className={cn(
                  'text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 rounded-md border transition-colors min-h-[44px] flex items-center',
                  selectedMood === m
                    ? 'border-accent bg-accent/15 text-accent ring-1 ring-accent/40'
                    : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                )}
                aria-pressed={selectedMood === m}
              >
                {t(moodI18nKey(m))}
              </button>
            ))}
          </div>
        </div>

        {selectedMood == null ? (
          <p className="text-sm text-zinc-600 py-4 border border-dashed border-zinc-800 rounded-lg px-4 text-center">
            {t('catalog.recoPromptEmpty')}
          </p>
        ) : recoLoading || isFetching ? (
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">{t('catalog.loadingRecommendations')}</p>
            <div className="flex gap-4 overflow-hidden">
              {[...Array(RECO_LIMIT)].map((_, i) => (
                <Skeleton key={i} className="h-[220px] w-[148px] shrink-0 rounded-lg" />
              ))}
            </div>
          </div>
        ) : recoError ? (
          <p className="text-sm text-zinc-500">
            {t('catalog.recoError')}{' '}
            <button
              type="button"
              onClick={() => void refetchReco()}
              className="underline text-accent font-semibold hover:opacity-90"
            >
              {t('catalog.recoRetry')}
            </button>
          </p>
        ) : recoMovies.length ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">{t('catalog.recoTenForYou')}</p>
              
            </div>
            <div
              className="flex gap-4 overflow-x-auto pb-3 pt-1 -mx-6 px-6 scroll-smooth snap-x snap-mandatory scrollbar-hide"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {recoMovies.map((movie) => {
                const embed = youtubeEmbedUrl(movie.trailerUrl);
                return (
                  <div
                    key={movie.id}
                    className="w-[148px] sm:w-[160px] shrink-0 snap-start flex flex-col gap-2"
                  >
                    <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 aspect-poster group/reco">
                      <button
                        type="button"
                        className="absolute inset-0 z-0"
                        onClick={() => navigate(`/movies/${movie.id}`)}
                        aria-label={movie.title}
                      >
                        <img
                          src={getPosterUrl(movie.posterUrl)}
                          alt=""
                          className="w-full h-full object-cover opacity-90 group-hover/reco:opacity-100 transition-opacity"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_POSTER_URL;
                          }}
                        />
                      </button>
                      <div className="absolute top-2 left-2 flex items-center gap-1 text-accent pointer-events-none">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs font-bold">{formatMovieRating(movie.rating)}</span>
                      </div>
                      {embed && (
                        <button
                          type="button"
                          className="absolute bottom-2 right-2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/75 border border-white/20 text-white hover:bg-accent hover:border-accent transition-colors"
                          aria-label={t('catalog.recoWatchTrailer')}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTrailerMovie(movie);
                          }}
                        >
                          <Play size={16} fill="currentColor" className="ml-0.5" />
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/movies/${movie.id}`)}
                      className="text-left text-[11px] font-bold text-zinc-300 hover:text-white line-clamp-2 uppercase tracking-tight leading-tight"
                    >
                      {movie.title}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-600">{t('catalog.noRecommendations')}</p>
        )}
      </div>

      <Modal
        isOpen={Boolean(trailerMovie && trailerEmbed)}
        onClose={() => setTrailerMovie(null)}
        title={trailerMovie ? `${t('catalog.recoTrailerTitle')} — ${trailerMovie.title}` : t('catalog.recoTrailerTitle')}
        contentClassName="max-w-4xl w-[95vw]"
      >
        {trailerEmbed && (
          <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-sm overflow-hidden border border-zinc-800 bg-black">
            <iframe
              title={trailerMovie?.title ?? 'trailer'}
              src={trailerEmbed}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </Modal>
    </section>
  );
};
