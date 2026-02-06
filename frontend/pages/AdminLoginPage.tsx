
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { api } from '../services/api';
import { Button, Input } from '../components/DesignSystem';
import { Shield, Lock, Mail } from 'lucide-react';
import { UserRole } from '../types';

const schema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useStore(s => s.setAuth);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: any) => {
    try {
      const res = await api.auth.login(data.email, data.password);
      
      // Check if user has admin role
      if (res.user.role !== UserRole.ADMIN) {
        setError('root', { 
          type: 'manual', 
          message: 'Accès refusé. Cette page est réservée aux administrateurs.' 
        });
        return;
      }
      
      setAuth(res);
      navigate('/admin');
    } catch (error: any) {
      setError('root', { 
        type: 'manual', 
        message: error.message || 'Erreur de connexion' 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      <div className="w-full max-w-md space-y-8 animate-fade-up">
        {/* Admin Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-accent/10 border border-accent/30 rounded-lg">
            <Shield className="text-accent" size={24} />
            <span className="text-sm font-black uppercase tracking-widest text-accent">Espace Administrateur</span>
          </div>
        </div>

        <div className="space-y-4 text-center">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic">Accès Admin</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Panneau de contrôle CineNoir</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input 
              label="Adresse Email Administrateur" 
              type="email" 
              placeholder="admin@cinenoir.com"
              icon={<Mail size={18} />}
              error={errors.email?.message as string}
              {...register('email')}
            />
            <Input 
              label="Mot de Passe Sécurisé" 
              type="password" 
              placeholder="••••••••"
              icon={<Lock size={18} />}
              error={errors.password?.message as string}
              {...register('password')}
            />
            
            {errors.root && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400 font-medium">{errors.root.message}</p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
              <Shield size={18} /> Connexion Administrateur
            </Button>
          </form>
        </div>

        <div className="text-center space-y-3">
          <Link to="/auth/login" className="text-xs text-zinc-500 hover:text-white transition-colors block">
            ← Retour à la connexion utilisateur
          </Link>
          <p className="text-[10px] text-zinc-700 uppercase tracking-widest">
            Accès réservé au personnel autorisé uniquement
          </p>
        </div>
      </div>
    </div>
  );
};
