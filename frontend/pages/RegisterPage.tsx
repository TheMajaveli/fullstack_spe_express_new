
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { Button, Input, Card, useToast } from '../components/UI';
import { api } from '../services/api';
import { useStore } from '../store';
import { logger } from '../utils/logger';

const registerSchema = z.object({
  username: z.string().min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  email: z.string().email('Email valide requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useStore(s => s.setAuth);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const result = await api.auth.register(data.email, data.username, data.password);
      setAuth(result);
      logger.info('Registration successful', { userId: result.user.id });
      toast('Compte créé avec succès');
      navigate('/');
    } catch (err: any) {
      logger.error('Registration failed', { message: err?.message });
      toast('Échec de l\'inscription', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 animate-in fade-in duration-500">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Rejoignez CineNoir</h1>
        <p className="text-zinc-500">Commencez votre voyage cinématographique aujourd'hui.</p>
      </div>

      <Card className="p-8 space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nom d'utilisateur"
            icon={<User size={18} />}
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            label="Email"
            type="email"
            icon={<Mail size={18} />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Mot de passe"
            type="password"
            icon={<Lock size={18} />}
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirmer le mot de passe"
            type="password"
            icon={<ShieldCheck size={18} />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" className="w-full h-12 text-lg font-bold" isLoading={isLoading}>
            Créer un compte
          </Button>
        </form>

        <p className="text-[10px] text-center text-zinc-600 uppercase tracking-widest font-semibold px-4">
          En cliquant sur Créer un compte, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.
        </p>
      </Card>

      <p className="text-center mt-8 text-sm text-zinc-500">
        Vous avez déjà un compte ?{' '}
        <Link to="/auth/login" className="text-white hover:text-accent font-semibold underline underline-offset-4">Connectez-vous ici</Link>
      </p>
    </div>
  );
};
