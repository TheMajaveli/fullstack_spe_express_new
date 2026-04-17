import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Sparkles, Loader2, Shuffle } from 'lucide-react';
import { useStore } from '../store';
import { api, apiMovieContentLang } from '../services/api';
import type { Movie, RecommendationMoodKey } from '../types';
import { FALLBACK_POSTER_URL, formatMovieRating, getPosterUrl } from '../utils/constants';
import { cn } from '../lib/utils';

/** Délai minimum avant d’afficher les résultats (effet « assistant en recherche »). */
const REVEAL_DELAY_MS = 3000;
/** Récupère un peu plus de titres pour permettre un mélange varié dans l’UI. */
const CHAT_POOL_LIMIT = 10;
const DISPLAY_COUNT = 5;

const MOOD_KEYS: RecommendationMoodKey[] = [
  'neutral',
  'sad',
  'need_cheer',
  'motivation',
  'chill',
  'thrill',
];

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

function pickRandomMovies(movies: Movie[], count: number): Movie[] {
  if (movies.length === 0) return [];
  const n = Math.min(count, movies.length);
  const order = movies.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.slice(0, n).map((i) => movies[i]);
}

/**
 * Bouton flottant + panneau type « chat » : humeur → 5 films (API /user/recommendations, IA si configurée).
 */
export const MoodRecoChatFab: React.FC = () => {
  const { t, i18n } = useTranslation();
  const movieLang = apiMovieContentLang(i18n.language);
  const navigate = useNavigate();
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const [open, setOpen] = useState(false);
  const [chatMood, setChatMood] = useState<RecommendationMoodKey | null>(null);
  const [canReveal, setCanReveal] = useState(false);
  const [pickedMovies, setPickedMovies] = useState<Movie[]>([]);
  const moodPickAtRef = useRef(0);

  const close = useCallback(() => {
    setOpen(false);
    setChatMood(null);
    setCanReveal(false);
    setPickedMovies([]);
  }, []);

  useEffect(() => {
    if (chatMood != null) moodPickAtRef.current = Date.now();
  }, [chatMood]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const {
    data: recoData,
    isLoading: recoLoading,
    isError: recoError,
    error: recoQueryError,
    refetch: refetchReco,
  } = useQuery({
    queryKey: ['user-recommendations', 'mood-chat', chatMood, movieLang, CHAT_POOL_LIMIT],
    queryFn: () => api.user.recommendations(chatMood!, movieLang, CHAT_POOL_LIMIT),
    enabled: open && isAuthenticated && chatMood != null,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!recoError || !recoQueryError || !isAuthenticated || !open) return;
    const msg = String((recoQueryError as Error)?.message || '').toLowerCase();
    if (msg.includes('unauthorized') || msg.includes('non autorisé')) {
      useStore.getState().logout();
      close();
    }
  }, [recoError, recoQueryError, isAuthenticated, open, close]);

  useEffect(() => {
    if (chatMood == null) {
      setCanReveal(false);
      return;
    }
    if (recoLoading) {
      setCanReveal(false);
      return;
    }
    if (recoError) {
      setCanReveal(true);
      return;
    }
    const elapsed = Date.now() - moodPickAtRef.current;
    const wait = Math.max(0, REVEAL_DELAY_MS - elapsed);
    const id = window.setTimeout(() => setCanReveal(true), wait);
    return () => window.clearTimeout(id);
  }, [chatMood, recoLoading, recoError, recoData]);

  const poolMovies = useMemo(
    () => (recoData?.movies ?? []).filter((m): m is Movie => Boolean(m?.id)),
    [recoData?.movies]
  );

  const poolFingerprint = poolMovies.map((m) => m.id).join('|');

  useEffect(() => {
    if (chatMood == null) {
      setPickedMovies([]);
      return;
    }
    if (recoLoading || recoError || !canReveal) {
      setPickedMovies([]);
      return;
    }
    if (poolMovies.length === 0) {
      setPickedMovies([]);
      return;
    }
    setPickedMovies(pickRandomMovies(poolMovies, DISPLAY_COUNT));
  }, [chatMood, recoLoading, recoError, canReveal, poolFingerprint, poolMovies]);

  const showSearchingState =
    chatMood != null && (recoLoading || (!recoError && !canReveal));

  const canShuffleVariety = poolMovies.length > DISPLAY_COUNT;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-xl transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
          open && 'ring-2 ring-white/60'
        )}
        aria-expanded={open}
        aria-controls="mood-reco-chat-panel"
        aria-label={open ? t('catalog.moodChatClose') : t('catalog.moodChatFabAria')}
      >
        {open ? <X size={24} aria-hidden /> : <MessageCircle size={26} aria-hidden />}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[2px]"
            aria-label={t('catalog.moodChatClose')}
            onClick={close}
          />
          <div
            id="mood-reco-chat-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mood-reco-chat-title"
            className="fixed inset-x-0 bottom-0 top-[20%] z-[95] flex flex-col rounded-t-2xl border border-zinc-800 bg-zinc-950 shadow-2xl md:inset-auto md:bottom-24 md:right-6 md:top-auto md:h-[min(72vh,560px)] md:w-[min(100vw-3rem,400px)] md:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="text-accent shrink-0" size={18} aria-hidden />
                <h2 id="mood-reco-chat-title" className="text-sm font-black uppercase tracking-widest text-white truncate">
                  {t('catalog.moodChatTitle')}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-md p-2 text-zinc-500 hover:bg-zinc-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={t('catalog.moodChatClose')}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">
              {/* Assistant */}
              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-200">
                  <p className="font-semibold text-zinc-100">{t('catalog.moodChatGreeting')}</p>
                  <p className="text-xs text-zinc-500 mt-1">{t('catalog.moodChatPickMood')}</p>
                </div>
              </div>

              {!isAuthenticated ? (
                <div className="flex justify-start">
                  <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-zinc-900 border border-amber-500/30 px-3 py-2 text-sm text-zinc-200">
                    <p>{t('catalog.moodChatLoginRequired')}</p>
                    <Link
                      to="/auth/login"
                      className="mt-2 inline-block text-xs font-bold uppercase tracking-wider text-accent hover:underline"
                      onClick={close}
                    >
                      {t('catalog.moodChatGoLogin')}
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 justify-end" role="group" aria-label={t('catalog.recoMoodLabel')}>
                    {MOOD_KEYS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setChatMood(m)}
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-full border transition-colors',
                          chatMood === m
                            ? 'border-accent bg-accent/20 text-accent'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                        )}
                        aria-pressed={chatMood === m}
                      >
                        {t(moodI18nKey(m))}
                      </button>
                    ))}
                  </div>

                  {chatMood != null && (
                    <>
                      <div className="flex justify-end">
                        <div className="max-w-[90%] rounded-2xl rounded-br-sm bg-accent/15 border border-accent/40 px-3 py-2 text-sm text-accent font-bold">
                          {t(moodI18nKey(chatMood))}
                        </div>
                      </div>

                      {showSearchingState && (
                        <div className="flex justify-start">
                          <div className="flex items-start gap-2 rounded-2xl rounded-bl-sm bg-zinc-900 border border-zinc-800 px-3 py-3 text-sm text-zinc-300 max-w-[95%]">
                            <Loader2 className="animate-spin text-accent shrink-0 mt-0.5" size={18} aria-hidden />
                            <span>{t('catalog.moodChatSearchingAssistant')}</span>
                          </div>
                        </div>
                      )}

                      {recoError && canReveal && !recoLoading && (
                        <div className="flex justify-start">
                          <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-red-950/40 border border-red-500/30 px-3 py-2 text-sm text-red-200">
                            <p>{t('catalog.recoError')}</p>
                            <button
                              type="button"
                              onClick={() => void refetchReco()}
                              className="mt-2 text-xs font-bold uppercase tracking-wider text-accent hover:underline"
                            >
                              {t('catalog.moodChatRetry')}
                            </button>
                          </div>
                        </div>
                      )}

                      {canReveal && !recoLoading && !recoError && pickedMovies.length > 0 && (
                        <div className="flex justify-start">
                          <div className="w-full max-w-full rounded-2xl rounded-bl-sm bg-zinc-900 border border-zinc-800 px-3 py-3 space-y-3">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="min-w-0 space-y-1">
                                <p className="text-sm font-bold text-zinc-100">{t('catalog.moodChatResultsTitle')}</p>
                                <span
                                  className={cn(
                                    'inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border',
                                    recoData?.source === 'openai'
                                      ? 'border-accent/50 bg-accent/15 text-accent'
                                      : 'border-zinc-600 text-zinc-400'
                                  )}
                                >
                                  {recoData?.source === 'openai'
                                    ? t('catalog.moodChatAiBadge')
                                    : t('catalog.moodChatRulesBadge')}
                                </span>
                              </div>
                              <button
                                type="button"
                                disabled={!canShuffleVariety}
                                title={!canShuffleVariety ? t('catalog.moodChatShuffleDisabledHint') : undefined}
                                onClick={() => setPickedMovies(pickRandomMovies(poolMovies, DISPLAY_COUNT))}
                                className={cn(
                                  'shrink-0 flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors',
                                  canShuffleVariety
                                    ? 'border-zinc-600 text-zinc-300 hover:border-accent hover:text-accent hover:bg-accent/10'
                                    : 'border-zinc-800 text-zinc-600 cursor-not-allowed opacity-60'
                                )}
                                aria-label={t('catalog.moodChatShuffleAria')}
                              >
                                <Shuffle size={14} aria-hidden />
                                {t('catalog.moodChatShuffle')}
                              </button>
                            </div>
                            {recoData?.insight && (
                              <p className="text-xs text-zinc-500 leading-relaxed">{recoData.insight}</p>
                            )}
                            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                              {pickedMovies.map((movie) => (
                                <button
                                  key={movie.id}
                                  type="button"
                                  onClick={() => {
                                    navigate(`/movies/${movie.id}`);
                                    close();
                                  }}
                                  className="shrink-0 w-[72px] text-left group"
                                >
                                  <div className="relative aspect-poster rounded-md overflow-hidden border border-zinc-800 bg-black mb-1">
                                    <img
                                      src={getPosterUrl(movie.posterUrl)}
                                      alt=""
                                      className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = FALLBACK_POSTER_URL;
                                      }}
                                    />
                                    <span className="absolute bottom-0.5 left-0.5 right-0.5 text-[9px] font-bold text-white bg-black/70 rounded px-0.5 truncate text-center">
                                      {formatMovieRating(movie.rating)}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-bold text-zinc-400 line-clamp-2 uppercase leading-tight group-hover:text-white">
                                    {movie.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {canReveal && !recoLoading && !recoError && pickedMovies.length === 0 && (
                        <div className="flex justify-start">
                          <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-400">
                            {t('catalog.noRecommendations')}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
