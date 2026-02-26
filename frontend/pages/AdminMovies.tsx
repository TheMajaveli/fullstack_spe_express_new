
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { FALLBACK_POSTER_URL } from '../utils/constants';
import { Card, Button, Input, Badge, useToast, Skeleton } from '../components/UI';
import { MovieFormModal } from '../components/MovieFormModal';
import { Movie } from '../types';

export const AdminMovies: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-movies', searchTerm, currentPage],
    queryFn: () => api.movies.list({ search: searchTerm, page: currentPage, limit: 10 }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.movies.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      toast('Film supprimé avec succès', 'success');
    },
    onError: (error: any) =>{ 
      toast(error.message || 'Échec de suppression du film', 'error');
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce film ?')) {
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
    toast(selectedMovie ? 'Film mis à jour avec succès' : 'Film créé avec succès', 'success');
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Base de données Films</h1>
          <p className="text-sm md:text-base text-zinc-500">Ajouter, modifier ou supprimer des entrées du catalogue.</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={handleCreate}>
          <Plus size={18} /> <span className="hidden sm:inline">Ajouter un nouveau film</span><span className="sm:hidden">Ajouter film</span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        {/* Search and Filters */}
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-zinc-900/50">
          <div className="w-full sm:w-96">
             <Input 
                placeholder="Rechercher dans la base..." 
                icon={<Search size={16} />} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
             />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">Exporter CSV</Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">Filtres</Button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-4 lg:px-6 py-4">Titre</th>
                <th className="px-4 lg:px-6 py-4">Statut</th>
                <th className="px-4 lg:px-6 py-4">Sortie</th>
                <th className="px-4 lg:px-6 py-4">Note</th>
                <th className="px-4 lg:px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 lg:px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-4 lg:px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 lg:px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 lg:px-6 py-4"><Skeleton className="h-4 w-8" /></td>
                    <td className="px-4 lg:px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : data?.data.map((movie: Movie) => (
                <tr key={movie.id} className="hover:bg-zinc-900/40 transition-colors group">
                  <td className="px-4 lg:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 rounded bg-zinc-800 overflow-hidden shrink-0">
                        <img src={movie.posterUrl || FALLBACK_POSTER_URL} alt={movie.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_POSTER_URL; }} />
                      </div>
                      <div className="overflow-hidden min-w-0">
                        <p className="font-bold truncate">{movie.title}</p>
                        <p className="text-xs text-zinc-500 truncate">{movie.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <Badge variant="accent">Actif</Badge>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-zinc-400">{movie.year}</td>
                  <td className="px-4 lg:px-6 py-4 font-bold">{movie.rating.toFixed(1)}</td>
                  <td className="px-4 lg:px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(movie)}><Edit size={14} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(movie.id)}><Trash2 size={14} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
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
              <p>Aucun film trouvé</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {data?.data.map((movie: Movie) => (
                <div key={movie.id} className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/30 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-28 rounded bg-zinc-800 overflow-hidden shrink-0">
                      <img src={movie.posterUrl || FALLBACK_POSTER_URL} alt={movie.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_POSTER_URL; }} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h3 className="font-bold text-base truncate">{movie.title}</h3>
                        <p className="text-xs text-zinc-500">{movie.category}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="accent">Actif</Badge>
                        <span className="text-xs text-zinc-400">{movie.year}</span>
                        <span className="text-xs font-bold">⭐ {movie.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-zinc-800">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2" 
                      onClick={() => handleEdit(movie)}
                    >
                      <Edit size={14} /> Modifier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2 text-red-500 border-red-500/50 hover:bg-red-500/10" 
                      onClick={() => handleDelete(movie.id)}
                    >
                      <Trash2 size={14} /> Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-xs">
           <p className="text-center sm:text-left">
             Affichage de {data?.data.length || 0} sur {data?.total || 0} films • Page {currentPage} sur {data?.totalPages || 1}
           </p>
           <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 sm:flex-none" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Précédent
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 sm:flex-none" 
                disabled={currentPage === (data?.totalPages || 1)}
                onClick={() => setCurrentPage(p => Math.min(data?.totalPages || 1, p + 1))}
              >
                Suivant
              </Button>
           </div>
        </div>
      </Card>

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
