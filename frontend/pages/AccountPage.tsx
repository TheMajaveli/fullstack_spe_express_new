
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Clock, Settings, User as UserIcon, LogOut, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { api } from '../services/api';
import { FALLBACK_POSTER_URL, getPosterUrl } from '../utils/constants';
import { Card, Badge, Button, Skeleton } from '../components/UI';
import { HistoryList } from '../components/HistoryList';
import { Link, Navigate } from 'react-router-dom';

export const AccountPage: React.FC = () => {
  const { user, isAuthenticated, logout, accessToken } = useStore();
  const [isLoadingUser, setIsLoadingUser] = React.useState(false);

  // Try to load user if we have a token but no user data
  React.useEffect(() => {
    if (accessToken && !user && !isLoadingUser) {
      setIsLoadingUser(true);
      api.auth.me()
        .then((userData) => {
          useStore.getState().setAuth({ user: userData, isAuthenticated: true });
          setIsLoadingUser(false);
        })
        .catch(() => {
          setIsLoadingUser(false);
        });
    }
  }, [accessToken, user, isLoadingUser]);

  const { data: moviesData, isLoading } = useQuery({
    queryKey: ['watchlist-movies', user?.watchlist],
    queryFn: async () => {
      if (!user?.watchlist.length) return [];
      const movies = await Promise.all(user.watchlist.map(id => api.movies.get(id)));
      return movies.filter(Boolean);
    },
    enabled: !!user?.watchlist.length,
  });

  // Show loading state while checking auth
  if (isLoadingUser || (accessToken && !user)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="text-zinc-500">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

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
              <Badge variant="outline">Membre depuis 2024</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/account/password"><Button variant="outline" size="sm" className="gap-2"><Settings size={16} /> Changer Mot de Passe</Button></Link>
          <Button variant="ghost" size="sm" className="gap-2 text-red-500 hover:bg-red-500/10" onClick={logout}><LogOut size={16} /> Déconnexion</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-8">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <Heart size={20} className="text-accent" /> Votre Liste
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
                <p className="text-zinc-500 mb-4">Vous n'avez pas encore ajouté de films à votre liste.</p>
                <Link to="/"><Button variant="outline">Explorer le Catalogue</Button></Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {moviesData.map((movie: any) => (
                  <Link key={movie.id} to={`/movies/${movie.id}`} className="group relative aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                    <img src={getPosterUrl(movie.posterUrl)} alt={movie.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_POSTER_URL; }} />
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
                <Clock size={20} className="text-zinc-500" /> Historique de Visionnage
             </h2>
             {user?.history && user.history.length > 0 ? (
               <HistoryList historyIds={user.history} />
             ) : (
               <Card className="p-12 text-center bg-zinc-900/20 border-dashed border-zinc-800">
                 <p className="text-zinc-500 mb-4">Vous n'avez pas encore marqué de films comme vus.</p>
                 <Link to="/"><Button variant="outline">Explorer le Catalogue</Button></Link>
               </Card>
             )}
          </section>
        </div>

        <aside className="space-y-8">
           <Card className="p-6 bg-zinc-900/20 border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">Aperçu du Compte</h3>
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Total Notés</span>
                    <span className="text-sm font-bold">{Object.keys(user?.ratings || {}).length}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Note Moyenne</span>
                    <span className="text-sm font-bold">
                      {user?.ratings && Object.keys(user.ratings).length > 0
                        ? (Object.values(user.ratings).reduce((a, b) => a + b, 0) / Object.keys(user.ratings).length).toFixed(1)
                        : '0.0'}
                    </span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Films Vus</span>
                    <span className="text-sm font-bold">{user?.history?.length || 0}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Dans Ma Liste</span>
                    <span className="text-sm font-bold">{user?.watchlist?.length || 0}</span>
                 </div>
              </div>
              <div className="mt-8 pt-8 border-t border-zinc-800">
                 <Button variant="outline" className="w-full">Détails du Compte</Button>
              </div>
           </Card>
        </aside>
      </div>
    </div>
  );
};
