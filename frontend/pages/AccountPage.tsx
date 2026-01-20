
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Clock, Settings, User as UserIcon, LogOut, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { api } from '../services/api';
import { Card, Badge, Button, Skeleton } from '../components/UI';
import { Link, Navigate } from 'react-router-dom';

export const AccountPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useStore();

  const { data: moviesData, isLoading } = useQuery({
    queryKey: ['watchlist-movies', user?.watchlist],
    queryFn: async () => {
      if (!user?.watchlist.length) return [];
      const movies = await Promise.all(user.watchlist.map(id => api.movies.get(id)));
      return movies.filter(Boolean);
    },
    enabled: !!user?.watchlist.length,
  });

  if (!isAuthenticated) return <Navigate to="/auth/login" />;

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-b border-zinc-800 pb-12">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border-4 border-zinc-800 flex items-center justify-center text-4xl font-black">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{user?.username}</h1>
            <p className="text-zinc-500">{user?.email}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="accent">{user?.role.toUpperCase()}</Badge>
              <Badge variant="outline">Member since 2024</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-2"><Settings size={16} /> Edit Profile</Button>
          <Button variant="ghost" size="sm" className="gap-2 text-red-500 hover:bg-red-500/10" onClick={logout}><LogOut size={16} /> Sign out</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-8">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <Heart size={20} className="text-accent" /> Your Watchlist
              </h2>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{user?.watchlist.length || 0} Films</span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
              </div>
            ) : !moviesData || moviesData.length === 0 ? (
              <Card className="p-12 text-center bg-zinc-900/20 border-dashed border-zinc-800">
                <p className="text-zinc-500 mb-4">You haven't added any films to your watchlist yet.</p>
                <Link to="/"><Button variant="outline">Browse Catalog</Button></Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {moviesData.map((movie: any) => (
                  <Link key={movie.id} to={`/movies/${movie.id}`} className="group relative aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                    <img src={movie.posterUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h4 className="font-bold">{movie.title}</h4>
                      <p className="text-xs text-zinc-500">{movie.year}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-6">
             <h2 className="text-xl font-bold flex items-center gap-3">
                <Clock size={20} className="text-zinc-500" /> Viewing History
             </h2>
             <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-zinc-800" />
                      <div>
                        <p className="text-sm font-bold">Interstellar</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-semibold">Watched 3 hours ago</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon"><ChevronRight size={16} /></Button>
                  </div>
                ))}
             </div>
          </section>
        </div>

        <aside className="space-y-8">
           <Card className="p-6 bg-zinc-900/20 border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">Account Overview</h3>
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Total Rated</span>
                    <span className="text-sm font-bold">14</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Average Rating</span>
                    <span className="text-sm font-bold">8.4</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Hours Watched</span>
                    <span className="text-sm font-bold">128h</span>
                 </div>
              </div>
              <div className="mt-8 pt-8 border-t border-zinc-800">
                 <Button variant="outline" className="w-full">Membership Details</Button>
              </div>
           </Card>
        </aside>
      </div>
    </div>
  );
};
