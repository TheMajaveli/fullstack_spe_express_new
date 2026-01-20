
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreVertical, Edit, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { api } from '../services/api';
import { Card, Button, Input, Badge, useToast, Skeleton } from '../components/UI';
import { Movie } from '../types';

export const AdminMovies: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-movies', searchTerm],
    queryFn: () => api.movies.list({ search: searchTerm, page: 1 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.movies.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      toast('Movie deleted successfully');
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this movie?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Movie Database</h1>
          <p className="text-zinc-500">Add, edit, or remove catalog entries.</p>
        </div>
        <Button className="gap-2"><Plus size={18} /> Add New Movie</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/50">
          <div className="w-full md:w-96">
             <Input 
                placeholder="Search database..." 
                icon={<Search size={16} />} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
             />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Export CSV</Button>
            <Button variant="outline" size="sm">Filters</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Release</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-8" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : data?.data.map((movie: Movie) => (
                <tr key={movie.id} className="hover:bg-zinc-900/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 rounded bg-zinc-800 overflow-hidden shrink-0">
                        <img src={movie.posterUrl} className="w-full h-full object-cover" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold truncate">{movie.title}</p>
                        <p className="text-xs text-zinc-500 truncate">{movie.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="accent">Active</Badge>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{movie.year}</td>
                  <td className="px-6 py-4 font-bold">{movie.rating.toFixed(1)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit size={14} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(movie.id)}><Trash2 size={14} /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-zinc-500 text-xs">
           <p>Showing 1 to {data?.data.length} of {data?.total} entries</p>
           <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
           </div>
        </div>
      </Card>
    </div>
  );
};
