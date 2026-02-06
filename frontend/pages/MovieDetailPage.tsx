
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// Added missing User icon import from lucide-react
import { Play, Plus, Check, Star, Clock, Calendar, ArrowLeft, Share2, MessageCircle, User } from 'lucide-react';
import { api } from '../services/api';
import { Button, Skeleton, Modal } from '../components/DesignSystem';
import { RatingModal } from '../components/RatingModal';
import { useToast } from '../components/UI';
import { useStore } from '../store';

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useStore();
  const [isRateModalOpen, setRateModalOpen] = useState(false);
  const toast = useToast();

  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => api.movies.get(id!),
    enabled: !!id,
  });

  const isInWatchlist = user?.watchlist.includes(id || '');

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
      toast(isInWatchlist ? 'Retiré de la liste' : 'Ajouté à la liste', 'success');
    } catch (error: any) {
      toast(error.message || 'Échec de mise à jour de la liste', 'error');
    }
  };

  const handleMarkAsWatched = async () => {
    if (!isAuthenticated) return navigate('/auth/login');
    if (!id) return;
    
    try {
      await api.user.addHistory(id);
      // Refresh user profile
      const updatedUser = await api.auth.me();
      useStore.getState().setAuth({ user: updatedUser });
      toast('Marqué comme vu', 'success');
    } catch (error: any) {
      toast(error.message || 'Échec de marquage comme vu', 'error');
    }
  };

  if (isLoading) return <div className="p-20"><Skeleton className="h-[70vh] w-full" /></div>;
  if (!movie) return <div className="p-20 text-center">Film introuvable</div>;

  return (
    <div className="animate-in fade-in duration-700">
      {/* Cinematic Hero */}
      <div className="relative h-[70vh] w-full">
        <div className="absolute inset-0">
          <img src={movie.posterUrl} className="w-full h-full object-cover blur-2xl opacity-20 scale-110" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-cinema-black to-cinema-black" />
        </div>

        <div className="relative h-full max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center gap-12 pt-20">
          <div className="w-64 md:w-80 shrink-0 poster-shadow rounded-sm overflow-hidden border border-cinema-border animate-fade-up">
            <img src={movie.posterUrl} alt={movie.title} className="w-full aspect-poster object-cover" />
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
                   <Star key={i} size={18} fill={i < Math.floor(movie.rating/2) ? "#e11d48" : "none"} className={i < Math.floor(movie.rating/2) ? "text-accent" : "text-zinc-800"} />
                 ))}
                 <span className="ml-2 text-sm font-black text-zinc-400">{movie.rating.toFixed(1)} / 10</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Button size="lg" className="gap-3 px-10 uppercase text-xs tracking-widest" onClick={handleMarkAsWatched}>
                <Play fill="currentColor" size={18} /> Marquer comme vu
              </Button>
              <Button 
                variant={isInWatchlist ? "secondary" : "outline"} 
                size="lg" 
                className="gap-3"
                onClick={toggleWatchlist}
              >
                {isInWatchlist ? <Check size={20} /> : <Plus size={20} />}
                {isInWatchlist ? 'Dans ma liste' : 'Ajouter à ma liste'}
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
              <span className="h-px w-8 bg-zinc-800" /> Synopsis
            </h3>
            <p className="text-xl md:text-2xl font-light leading-relaxed text-zinc-300">
              {movie.description}
            </p>
          </div>

          <div className="space-y-8">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 flex items-center gap-4">
              <span className="h-px w-8 bg-zinc-800" /> Réalisateur
            </h3>
            <div className="flex items-center gap-6 group cursor-pointer">
              <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                 <User size={32} className="text-zinc-700" />
              </div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight">{movie.director}</h4>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Réalisateur & Scénariste</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-12">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Distribution</h3>
            <div className="space-y-4">
               {['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'].map(actor => (
                 <div key={actor} className="flex justify-between items-center py-3 border-b border-zinc-900 group cursor-pointer">
                    <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">{actor}</span>
                    <span className="text-[10px] font-black uppercase text-zinc-700">Acteur</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="p-8 bg-zinc-950/50 border border-zinc-900 rounded-sm space-y-6">
            <div className="flex items-center gap-3">
              <MessageCircle size={18} className="text-accent" />
              <h3 className="text-xs font-black uppercase tracking-widest">Critique Récente</h3>
            </div>
            <p className="text-sm text-zinc-500 italic leading-relaxed">
              "Une œuvre cinématographique qui repousse les limites de la narration grand public. Une vision artistique pure."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800" />
              <span className="text-xs font-bold text-zinc-400">CinemaCritique</span>
            </div>
          </div>
        </aside>
      </section>

      <Modal isOpen={isRateModalOpen} onClose={() => setRateModalOpen(false)} title="Noter ce film">
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
