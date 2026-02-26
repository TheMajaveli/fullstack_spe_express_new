import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { api } from '../services/api';
import { Card, Button, Input, useToast, Skeleton } from '../components/UI';
import { Modal } from '../components/DesignSystem';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Le nom de la catégorie est requis'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Category {
  id: string;
  name: string;
  createdAt: string;
  movieCount?: number;
}

export const AdminCategories: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
  });

  // Pagination
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => api.categories.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast('Catégorie créée avec succès', 'success');
      setIsModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast(error.message || 'Échec de création de la catégorie', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.categories.update(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast('Catégorie mise à jour avec succès', 'success');
      setIsModalOpen(false);
      setEditingCategory(null);
      reset();
    },
    onError: (error: any) => {
      toast(error.message || 'Échec de mise à jour de la catégorie', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.categories.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast('Catégorie supprimée avec succès', 'success');
    },
    onError: (error: any) => {
      toast(error.message || 'Échec de suppression de la catégorie', 'error');
    },
  });

  const handleCreate = () => {
    setEditingCategory(null);
    reset();
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setValue('name', category.name);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Cela peut affecter les films utilisant cette catégorie.')) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, name: data.name });
    } else {
      createMutation.mutate(data.name);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Catégories</h1>
          <p className="text-sm md:text-base text-zinc-500">Gérer les catégories de films.</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={handleCreate}>
          <Plus size={18} /> <span className="hidden sm:inline">Ajouter une catégorie</span><span className="sm:hidden">Ajouter</span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-4 lg:px-6 py-4">Nom</th>
                <th className="px-4 lg:px-6 py-4">Films</th>
                <th className="px-4 lg:px-6 py-4">Créée le</th>
                <th className="px-4 lg:px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 lg:px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-right">
                      <Skeleton className="h-8 w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 lg:px-6 py-12 text-center text-zinc-500">
                    Aucune catégorie trouvée. Créez votre première catégorie.
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category: Category) => (
                  <tr key={category.id} className="hover:bg-zinc-900/40 transition-colors group">
                    <td className="px-4 lg:px-6 py-4">
                      <p className="font-bold">{category.name}</p>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-zinc-400">
                      <span className="text-sm">{category.movieCount || 0} film{(category.movieCount || 0) > 1 ? 's' : ''}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-zinc-400 text-xs">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(category)}
                          aria-label="Modifier la catégorie"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                          onClick={() => handleDelete(category.id)}
                          aria-label="Supprimer la catégorie"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
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
                <div key={i} className="p-4 border border-zinc-800 rounded-lg space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <p>Aucune catégorie trouvée.</p>
              <p className="text-sm mt-2">Créez votre première catégorie pour commencer.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {paginatedCategories.map((category: Category) => (
                <div key={category.id} className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/30 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base">{category.name}</h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        {category.movieCount || 0} film{(category.movieCount || 0) > 1 ? 's' : ''} • Créée le {new Date(category.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-zinc-800">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2" 
                      onClick={() => handleEdit(category)}
                    >
                      <Edit size={14} /> Modifier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2 text-red-500 border-red-500/50 hover:bg-red-500/10" 
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 size={14} /> Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {!isLoading && categories.length > itemsPerPage && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Précédent
          </Button>
          <span className="text-sm text-zinc-400 px-4">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Category Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          reset();
        }}
        title={editingCategory ? 'Modifier la catégorie' : 'Créer une catégorie'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Nom de la catégorie"
            {...register('name')}
            error={errors.name?.message}
            placeholder="ex: Science-Fiction, Action, Drame"
            autoFocus
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingCategory(null);
                reset();
              }}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {editingCategory ? 'Mettre à jour' : 'Créer'} la catégorie
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
