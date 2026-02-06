
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button, Input } from '../components/DesignSystem';
import { Lock, CheckCircle } from 'lucide-react';

const schema = z.object({
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: any) => {
    if (!token) {
      setError('root', { type: 'manual', message: 'Lien de réinitialisation invalide' });
      return;
    }

    try {
      await api.auth.resetPassword(token, data.password);
      setSuccess(true);
      setTimeout(() => navigate('/auth/login'), 3000);
    } catch (error: any) {
      setError('root', { 
        type: 'manual', 
        message: error.message || 'Le lien est invalide ou expiré' 
      });
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8 animate-fade-up text-center">
          <div className="w-16 h-16 mx-auto bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
            <CheckCircle className="text-green-500" size={32} />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black uppercase tracking-tighter">Mot de Passe Mis à Jour</h1>
            <p className="text-zinc-400">
              Votre mot de passe a été réinitialisé avec succès. Redirection...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-12 animate-fade-up">
        <div className="space-y-4 text-center">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic">Nouveau Mot de Passe</h1>
          <p className="text-zinc-500 text-sm font-medium">
            Créez un mot de passe sécurisé pour votre compte.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input 
            label="Nouveau Mot de Passe" 
            type="password" 
            placeholder="••••••••"
            icon={<Lock size={18} />}
            error={errors.password?.message as string}
            {...register('password')}
          />
          <Input 
            label="Confirmer le Mot de Passe" 
            type="password" 
            placeholder="••••••••"
            icon={<Lock size={18} />}
            error={errors.confirmPassword?.message as string}
            {...register('confirmPassword')}
          />

          {errors.root && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 font-medium">{errors.root.message}</p>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            Réinitialiser le Mot de Passe
          </Button>
        </form>

        <p className="text-center text-xs text-zinc-600">
          <Link to="/auth/login" className="hover:text-white transition-colors">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
};
