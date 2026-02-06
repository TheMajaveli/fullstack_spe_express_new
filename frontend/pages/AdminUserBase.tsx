import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store';
import { UserRole } from '../types';
import { Navigate } from 'react-router-dom';
import { Search, User, Mail, Calendar, Heart, Star, Clock } from 'lucide-react';
import { Card, Button, Input, Badge, Skeleton } from '../components/UI';
import { api } from '../services/api';

export const AdminUserBase: React.FC = () => {
  const { user } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  if (user?.role !== UserRole.ADMIN) return <Navigate to="/" />;

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.admin.getUsers(),
  });

  const filteredUsers = users.filter((u: any) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">Base Utilisateurs</h1>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Gérer les utilisateurs de la plateforme</p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-zinc-900/50">
            <div className="w-full sm:w-96">
              <Input
                placeholder="Rechercher des utilisateurs..."
                icon={<Search size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-4 lg:px-6 py-4">Utilisateur</th>
                  <th className="px-4 lg:px-6 py-4">Rôle</th>
                  <th className="px-4 lg:px-6 py-4">Activité</th>
                  <th className="px-4 lg:px-6 py-4">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 lg:px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-4 lg:px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 lg:px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-4 lg:px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 lg:px-6 py-12 text-center text-zinc-500">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold truncate">{u.username}</p>
                            <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <Badge variant={u.role === 'ADMIN' ? 'accent' : 'outline'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-4 text-xs text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Heart size={12} /> {u.watchlistCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star size={12} /> {u.ratingsCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {u.historyCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-zinc-400 text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                <p>Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {filteredUsers.map((u: any) => (
                  <div key={u.id} className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/30 space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold shrink-0">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base">{u.username}</h3>
                        <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                        <div className="mt-2">
                          <Badge variant={u.role === 'ADMIN' ? 'accent' : 'outline'} className="text-xs">
                            {u.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Heart size={12} /> {u.watchlistCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={12} /> {u.ratingsCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} /> {u.historyCount}
                      </div>
                      <div className="text-zinc-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-zinc-800 text-zinc-500 text-xs text-center">
            Affichage de {filteredUsers.length} sur {users.length} utilisateurs
          </div>
          </Card>
    </div>
  );
};
