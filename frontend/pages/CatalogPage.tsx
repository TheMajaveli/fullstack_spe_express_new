
import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, Star, Play, Info } from 'lucide-react';
import { api } from '../services/api';
import { Button, Input, Skeleton, PosterCard } from '../components/DesignSystem';
import { CatalogParams } from '../types';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const params: CatalogParams = useMemo(() => ({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || 'All',
    minRating: Number(searchParams.get('rating')) || 0,
    sort: (searchParams.get('sort') as any) || 'newest',
    page: Number(searchParams.get('page')) || 1,
  }), [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['movies', params],
    queryFn: () => api.movies.list(params),
  });

  const updateParam = (key: string, value: string | number) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'All' || value === 0) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    if (key !== 'page') newParams.delete('page');
    setSearchParams(newParams);
  };

  const categories = ['All', 'Sci-Fi', 'Action', 'Drama', 'Crime', 'Horror', 'Romance'];

  return (
    <div className="space-y-0">
      {/* Featured Hero */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-0 animate-blur-in">
          <img 
            src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover scale-105"
            alt="Hero background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>
        
        <div className="relative h-full max-w-[1400px] mx-auto px-6 flex flex-col justify-center space-y-8">
          <div className="space-y-4 max-w-2xl animate-fade-up">
            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-accent">
              <span className="flex items-center gap-1"><Star size={12} fill="currentColor" /> Featured Today</span>
              <span className="h-px w-12 bg-accent opacity-50" />
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">Inception</h1>
            <p className="text-lg md:text-xl text-zinc-300 font-medium leading-relaxed">
              In a world where technology allows for entry into the human mind through dream-sharing, a professional thief is given a task to plant an idea into a CEO's subconscious.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/movies/1"><Button size="lg" className="gap-3 px-12"><Play fill="currentColor" size={20} /> Watch Now</Button></Link>
              <Link to="/movies/1"><Button variant="outline" size="lg" className="gap-3"><Info size={20} /> Details</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Control Bar */}
      <div className="sticky top-16 z-40 glass border-b border-cinema-border">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-8 shrink-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => updateParam('category', cat)}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative py-2 ${params.category === cat ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
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
                placeholder="Search catalog..." 
                className="bg-transparent border-none text-xs font-bold pl-6 focus:outline-none w-full placeholder:text-zinc-700"
                value={params.search}
                onChange={(e) => updateParam('q', e.target.value)}
              />
            </div>
            <select 
              value={params.sort} 
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-zinc-500 focus:outline-none cursor-pointer hover:text-white"
            >
              <option value="newest">Latest</option>
              <option value="rating">Top Rated</option>
              <option value="title">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <section className="max-w-[1400px] mx-auto px-6 py-12">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => <Skeleton key={i} className="aspect-poster" />)}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 opacity-50">
            <h3 className="text-xl font-black uppercase tracking-widest">No Films Found</h3>
            <Button variant="link" onClick={() => setSearchParams({})}>Reset all filters</Button>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {data?.data.map((movie) => (
                <Link key={movie.id} to={`/movies/${movie.id}`}>
                  <PosterCard movie={movie} />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-cinema-border pt-12">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">{data.total} Films Discovered</span>
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={params.page === 1}
                    onClick={() => updateParam('page', (params.page || 1) - 1)}
                  >
                    Prev
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={params.page === data.totalPages}
                    onClick={() => updateParam('page', (params.page || 1) + 1)}
                  >
                    Next
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
