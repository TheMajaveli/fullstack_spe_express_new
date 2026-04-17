import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { UserRole } from '../types';
import { Navigate } from 'react-router-dom';
import { Search, Heart, Star, Clock } from 'lucide-react';
import { Card, Button, Input, Badge, Skeleton } from '../components/UI';
import { api } from '../services/api';

function roleLabelKey(role: string): string {
  const r = (role || '').toString().toUpperCase();
  if (r === 'ADMIN') return 'roles.ADMIN';
  if (r === 'USER' || r === 'MEMBER') return 'roles.USER';
  return `roles.${role}` as 'roles.ADMIN';
}

export const AdminUserBase: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (user?.role !== UserRole.ADMIN) return <Navigate to="/" />;

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.admin.getUsers(),
  });

  const filteredUsers = users.filter(
    (u: any) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">{t('admin.users.title')}</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{t('admin.users.subtitle')}</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-zinc-900/50">
          <div className="w-full sm:w-96">
            <Input
              placeholder={t('admin.users.searchPlaceholder')}
              icon={<Search size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
              aria-label={t('admin.users.searchAria')}
            />
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-4 lg:px-6 py-4">{t('admin.users.colUser')}</th>
                <th className="px-4 lg:px-6 py-4">{t('admin.users.colRole')}</th>
                <th className="px-4 lg:px-6 py-4">{t('admin.users.colActivity')}</th>
                <th className="px-4 lg:px-6 py-4">{t('admin.users.colJoined')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 lg:px-6 py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 lg:px-6 py-12 text-center text-zinc-500">
                    {t('admin.users.empty')}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u: any) => (
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
                      <Badge variant={String(u.role).toUpperCase() === 'ADMIN' ? 'accent' : 'outline'}>{t(roleLabelKey(u.role))}</Badge>
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
                    <td className="px-4 lg:px-6 py-4 text-zinc-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <p>{t('admin.users.empty')}</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {paginatedUsers.map((u: any) => (
                <div key={u.id} className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/30 space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold shrink-0">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base">{u.username}</h3>
                      <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                      <div className="mt-2">
                        <Badge variant={String(u.role).toUpperCase() === 'ADMIN' ? 'accent' : 'outline'} className="text-xs">
                          {t(roleLabelKey(u.role))}
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
                    <div className="text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-xs">
          <p>
            {t('admin.users.paginationSummary', {
              shown: paginatedUsers.length,
              total: filteredUsers.length,
              page: currentPage,
              pages: totalPages || 1,
            })}
          </p>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                {t('common.previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
