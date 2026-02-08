
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { api } from '../services/api';
import { Button, Input } from '../components/DesignSystem';
import { logger } from '../utils/logger';

const schema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useStore(s => s.setAuth);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: any) => {
    try {
      const res = await api.auth.login(data.email, data.password);
      setAuth(res);
      logger.info('Login successful', { userId: res.user.id });
      navigate('/');
    } catch (err: any) {
      logger.error('Login failed', { message: err?.message });
      throw err;
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-12 animate-fade-up">
        <div className="space-y-4 text-center">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic">Bon Retour</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Connectez-vous à votre espace cinématographique</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Input 
            label="Adresse Email" 
            type="email" 
            placeholder="j.godard@nouvellevague.com"
            error={errors.email?.message as string}
            {...register('email')}
          />
          <Input 
            label="Mot de Passe" 
            type="password" 
            placeholder="••••••••"
            error={errors.password?.message as string}
            {...register('password')}
          />
          <Link to="/auth/forgot-password" className="text-xs text-zinc-500 hover:text-white transition-colors text-right block">
            Mot de passe oublié ?
          </Link>
          
          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>Se Connecter</Button>
        </form>

        <div className="space-y-3 text-center">
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">
            Pas de compte ? <Link to="/auth/register" className="text-white hover:text-accent ml-1 transition-colors">Rejoignez le collectif</Link>
          </p>
          <Link to="/admin/login" className="text-xs text-zinc-700 hover:text-zinc-400 transition-colors block">
            Accès administrateur →
          </Link>
        </div>
      </div>
    </div>
  );
};
