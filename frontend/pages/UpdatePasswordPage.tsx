
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../store';
import { api } from '../services/api';
import { Button, Input } from '../components/DesignSystem';
import { Card } from '../components/UI';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';

const schema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const UpdatePasswordPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useStore();
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(schema)
  });

  if (!isAuthenticated) return <Navigate to="/auth/login" />;

  const onSubmit = async (data: any) => {
    try {
      await api.auth.updatePassword(data.currentPassword, data.newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/account'), 2000);
    } catch (error: any) {
      setError('root', { 
        type: 'manual', 
        message: error.message || 'Échec de mise à jour du mot de passe' 
      });
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <Card className="p-12 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
            <CheckCircle className="text-green-500" size={32} />
          </div>
          <h2 className="text-2xl font-black uppercase">Mot de Passe Mis à Jour</h2>
          <p className="text-zinc-400">Votre mot de passe a été changé avec succès.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/account')} className="gap-2">
          <ArrowLeft size={16} /> Retour
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Changer le Mot de Passe</h1>
        <p className="text-zinc-500">Mettez à jour votre mot de passe pour sécuriser votre compte.</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input 
            label="Mot de Passe Actuel" 
            type="password" 
            placeholder="••••••••"
            icon={<Lock size={18} />}
            error={errors.currentPassword?.message as string}
            {...register('currentPassword')}
          />
          
          <div className="border-t border-zinc-800 pt-6 space-y-6">
            <Input 
              label="Nouveau Mot de Passe" 
              type="password" 
              placeholder="••••••••"
              icon={<Lock size={18} />}
              error={errors.newPassword?.message as string}
              {...register('newPassword')}
            />
            <Input 
              label="Confirmer le Nouveau Mot de Passe" 
              type="password" 
              placeholder="••••••••"
              icon={<Lock size={18} />}
              error={errors.confirmPassword?.message as string}
              {...register('confirmPassword')}
            />
          </div>

          {errors.root && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 font-medium">{errors.root.message}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/account')} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              Mettre à Jour le Mot de Passe
            </Button>
          </div>
        </form>
      </Card>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">Conseils de Sécurité</h3>
        <ul className="space-y-2 text-sm text-zinc-500">
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>Utilisez au moins 8 caractères avec des majuscules et des chiffres</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>Évitez d'utiliser des informations personnelles évidentes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>N'utilisez pas le même mot de passe sur plusieurs sites</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
