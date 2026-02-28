import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Search, Star, Play, Info, ChevronLeft, ChevronRight, ListOrdered, Infinity } from 'lucide-react';
import { api } from '../services/api';
import { Button, Skeleton, PosterCard } from '../components/DesignSystem';
import { CatalogParams } from '../types';
import { FALLBACK_POSTER_URL, getPosterUrl } from '../utils/constants';
import { useTranslation } from 'react-i18next';

const FALLBACK_CATEGORIES = ['Tous', 'Science-Fiction', 'Action', 'Drame', 'Policier', 'Horreur', 'Romance'];

export const CatalogPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const infiniteSentinelRef = useRef<HTMLDivElement>(null);

  const params: CatalogParams = useMemo(() => {
    const limitRaw = searchParams.get('limit');
    const limitNum = limitRaw !== null && limitRaw !== '' ? parseInt(limitRaw, 10) : NaN;
    const limit = Number.isFinite(limitNum) && limitNum >= 1 && limitNum <= 50 ? limitNum : 12;
    return {
      search: searchParams.get('q') || '',
      category: searchParams.get('category') || 'Tous',
      minRating: Number(searchParams.get('rating')) || 0,
      sort: (searchParams.get('sort') as any) || 'newest',
      page: Math.max(1, Number(searchParams.get('page')) || 1),
      limit,
    };
  }, [searchParams]);

  const viewMode = searchParams.get('view') === 'infinite' ? 'infinite' : 'pagination';

  // When URL has no "limit", set default so dropdown and API stay in sync
  useEffect(() => {
    if (!searchParams.has('limit')) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('limit', '12');
        return next;
      });
    }
  }, [searchParams, setSearchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['movies', params.search, params.category, params.sort, params.page, params.limit],
    queryFn: () => api.movies.list({ ...params, limit: params.limit }),
    enabled: viewMode === 'pagination',
  });

  const infiniteQuery = useInfiniteQuery({
    queryKey: ['movies', 'infinite', params.search, params.category, params.sort, params.limit],
    queryFn: async ({ pageParam }) => {
      const result = await api.movies.list({
        ...params,
        page: pageParam as number,
        limit: params.limit,
      });
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.totalPages) return undefined;
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.totalPages ? nextPage : undefined;
    },
    enabled: viewMode === 'infinite',
  });

  const infiniteAllMovies = useMemo(() => {
    if (viewMode !== 'infinite' || !infiniteQuery.data?.pages) return [];
    return infiniteQuery.data.pages.flatMap((p) => p.data ?? []);
  }, [viewMode, infiniteQuery.data?.pages]);

  const hasMore = infiniteQuery.hasNextPage;
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (viewMode !== 'infinite' || !hasMore || infiniteQuery.isFetchingNextPage) return;
      if (!node) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) infiniteQuery.fetchNextPage();
        },
        { rootMargin: '200px', threshold: 0.1 }
      );
      observer.observe(node);
      infiniteSentinelRef.current = node;
      return () => observer.disconnect();
    },
    [viewMode, hasMore, infiniteQuery.isFetchingNextPage, infiniteQuery.fetchNextPage]
  );

  const isInfiniteLoading = viewMode === 'infinite' && (infiniteQuery.isLoading || infiniteQuery.isFetchingNextPage);
  const displayMovies = viewMode === 'infinite' ? infiniteAllMovies : data?.data ?? [];
  const totalCount = viewMode === 'infinite' ? (infiniteQuery.data?.pages?.[0]?.total ?? 0) : (data?.total ?? 0);
  const totalPages = viewMode === 'infinite' ? (infiniteQuery.data?.pages?.[0]?.totalPages ?? 0) : (data?.totalPages ?? 0);
  const isEmpty = viewMode === 'infinite' ? infiniteAllMovies.length === 0 && !infiniteQuery.isLoading : (data?.data?.length ?? 0) === 0;
  const showPagination = viewMode === 'pagination' && data && data.totalPages > 1;
  const toggleViewMode = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (viewMode === 'infinite') {
        next.delete('view');
        next.set('page', '1');
      } else {
        next.set('view', 'infinite');
        next.delete('page');
      }
      return next;
    });
  };

  const { data: categoriesList } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
    staleTime: 5 * 60 * 1000,
  });
  const categories = useMemo(() => {
    if (categoriesList?.length) {
      return ['Tous', ...categoriesList.map((c) => c.name)];
    }
    return FALLBACK_CATEGORIES;
  }, [categoriesList]);

  const { data: featuredData } = useQuery({
    queryKey: ['movies', 'featured'],
    queryFn: () => api.movies.list({ page: 1, sort: 'rating', limit: 5 }),
  });
  const featuredMovies = featuredData?.data || [];
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = React.useState(0);

  // Auto-advance carousel every 4 seconds (left to right)
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const intervalMs = 4000;
    const t = setInterval(() => {
      setCurrentFeaturedIndex((prev) => (prev + 1) % featuredMovies.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [featuredMovies.length]);

  const updateParam = (key: string, value: string | number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === undefined || value === null || value === '' || value === 'Tous' || value === 0) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
      if (key !== 'page') next.delete('page');
      return next;
    });
  };

  return (
    <div className="space-y-0" role="main" aria-label="Catalogue de films">
      {/* Featured carousel: 5 movies, auto-advance every 4s, left to right */}
      <section className="relative h-[85vh] w-full overflow-hidden" aria-label="Film en vedette">
        <div
          className="flex h-full transition-transform duration-700 ease-out"
          style={{
            width: featuredMovies.length ? `${featuredMovies.length * 100}vw` : '100vw',
            transform: `translateX(-${featuredMovies.length ? currentFeaturedIndex * 100 : 0}vw)`,
          }}
        >
          {(featuredMovies.length ? featuredMovies : [null]).map((movie, index) => (
            <div
              key={movie?.id ?? index}
              className="relative flex-shrink-0 h-full w-screen min-w-[100vw]"
            >
              <div className="absolute inset-0">
                <img
                  src={getPosterUrl(movie?.posterUrl)}
                  className="w-full h-full object-cover scale-105"
                  alt={movie ? `${movie.title} arrière-plan` : 'Arrière-plan héros'}
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_POSTER_URL; }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>
              <div className="relative h-full max-w-[1400px] mx-auto px-6 flex flex-col justify-center space-y-8">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-accent">
                    <span className="flex items-center gap-1"><Star size={12} fill="currentColor" /> {t('catalog.featuredToday')}</span>
                    <span className="h-px w-12 bg-accent opacity-50" />
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
                    {movie?.title ?? t('catalog.discoverFilms')}
                  </h1>
                  <p className="text-lg md:text-xl text-zinc-300 font-medium leading-relaxed line-clamp-3">
                    {movie?.description ?? t('catalog.exploreCatalog')}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    {movie ? (
                      <>
                        <Link to={`/movies/${movie.id}`}><Button size="lg" className="gap-3 px-12"><Play fill="currentColor" size={20} /> {t('catalog.watch')}</Button></Link>
                        <Link to={`/movies/${movie.id}`}><Button variant="outline" size="lg" className="gap-3"><Info size={20} /> {t('catalog.details')}</Button></Link>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => document.getElementById('catalog-control')?.scrollIntoView({ behavior: 'smooth' })}
                        className="inline-flex items-center justify-center gap-3 px-12 h-12 rounded-md bg-accent text-white font-bold text-sm hover:opacity-90 transition-opacity"
                      >
                        {t('catalog.browseCatalog')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel indicators and prev/next */}
        {featuredMovies.length > 1 && (
          <div className="absolute bottom-8 left-6 flex items-center gap-3 z-10">
            <button
              onClick={() => setCurrentFeaturedIndex((i) => (i === 0 ? featuredMovies.length - 1 : i - 1))}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-all"
              aria-label={t('catalog.previousFilm')}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {featuredMovies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeaturedIndex(index)}
                  className={`h-1 rounded-full transition-all ${
                    index === currentFeaturedIndex ? 'w-8 bg-accent' : 'w-1 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={t('catalog.goToFilm', { index: index + 1 })}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentFeaturedIndex((i) => (i === featuredMovies.length - 1 ? 0 : i + 1))}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-all"
              aria-label={t('catalog.nextFilm')}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </section>

      {/* Catalog Control Bar */}
      <div id="catalog-control" className="sticky top-16 z-40 glass border-b border-cinema-border" role="search" aria-label="Filtrer le catalogue">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-8 shrink-0">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => updateParam('category', cat)}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative py-2 ${params.category === cat ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                aria-pressed={params.category === cat}
                aria-label={t('catalog.filterBy', { category: cat })}
              >
                {cat}
                {params.category === cat && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-6 shrink-0 ml-8">
            <div className="relative w-64 group">
              <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" />
              <input
                type="search"
                placeholder={t('catalog.searchPlaceholder')}
                className="bg-transparent border-none text-xs font-bold pl-6 focus:outline-none w-full placeholder:text-zinc-700"
                value={params.search}
                onChange={(e) => updateParam('q', e.target.value)}
                aria-label="Rechercher dans le catalogue"
              />
            </div>
            <select
              value={params.sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-zinc-500 focus:outline-none cursor-pointer hover:text-white"
              aria-label={t('catalog.sortBy')}
            >
              <option value="newest">{t('catalog.newest')}</option>
              <option value="rating">{t('catalog.topRated')}</option>
              <option value="title">{t('catalog.titleAz')}</option>
            </select>
            <select
              value={String(params.limit)}
              onChange={(e) => {
                const val = e.target.value;
                updateParam('limit', val);
              }}
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-zinc-500 focus:outline-none cursor-pointer hover:text-white"
              aria-label={t('catalog.perPage')}
            >
              <option value="6">6 / page</option>
              <option value="12">12 / page</option>
              <option value="24">24 / page</option>
              <option value="50">50 / page</option>
            </select>
            <button
              type="button"
              onClick={toggleViewMode}
              className={`flex items-center gap-2 px-3 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-cinema-black ${viewMode === 'infinite' ? 'text-accent bg-accent/10' : 'text-zinc-500 hover:text-white'}`}
              aria-pressed={viewMode === 'infinite'}
              aria-label={viewMode === 'infinite' ? t('catalog.switchToPagination') : t('catalog.switchToInfinite')}
              title={viewMode === 'infinite' ? t('catalog.pagination') : t('catalog.scrollInfinite')}
            >
              {viewMode === 'infinite' ? <ListOrdered size={14} /> : <Infinity size={14} />}
              {viewMode === 'infinite' ? t('catalog.pagination') : t('catalog.scrollInfinite')}
            </button>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <section className="max-w-[1400px] mx-auto px-6 py-12" aria-label={t('catalog.gridSection')}>
        {(isLoading || (viewMode === 'infinite' && infiniteQuery.isLoading)) ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => <Skeleton key={i} className="aspect-poster" />)}
          </div>
        ) : isEmpty ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 opacity-50">
            <h3 className="text-xl font-black uppercase tracking-widest">{t('catalog.noMovies')}</h3>
            <Button variant="link" onClick={() => setSearchParams({})}>{t('catalog.resetFilters')}</Button>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-300" key={viewMode === 'pagination' ? params.page : 'infinite'}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6" data-testid="movie-grid">
              {displayMovies.map((movie, index) => (
                <Link 
                  key={`${movie.id}-${viewMode === 'infinite' ? index : movie.id}`} 
                  to={`/movies/${movie.id}`}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'backwards'
                  }}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cinema-black rounded-lg"
                >
                  <PosterCard movie={movie} />
                </Link>
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            {viewMode === 'infinite' && (
              <>
                <div ref={loadMoreRef} className="h-4" aria-hidden="true" />
                {isInfiniteLoading && (
                  <div className="flex justify-center py-8" role="status" aria-live="polite">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 w-full">
                      {[...Array(Math.min(6, params.limit || 6))].map((_, i) => (
                        <Skeleton key={`inf-skel-${i}`} className="aspect-poster" />
                      ))}
                    </div>
                  </div>
                )}
                {viewMode === 'infinite' && !hasMore && displayMovies.length > 0 && (
                  <p className="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-600 py-6">
                    {totalCount} {t('catalog.filmsDiscovered')}
                  </p>
                )}
              </>
            )}

            {/* Pagination */}
            {showPagination && (
              <div className="flex items-center justify-between border-t border-cinema-border pt-12">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">{data!.total} {t('catalog.filmsDiscovered')}</span>
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={params.page === 1}
                    onClick={() => updateParam('page', (params.page || 1) - 1)}
                    aria-label={t('catalog.previousPage')}
                  >
                    {t('catalog.previous')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={params.page === totalPages}
                    onClick={() => updateParam('page', (params.page || 1) + 1)}
                    aria-label={t('catalog.nextPage')}
                  >
                    {t('catalog.next')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
