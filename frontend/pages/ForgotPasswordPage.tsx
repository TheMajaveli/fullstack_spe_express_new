
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button, Input } from '../components/DesignSystem';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Adresse email invalide'),
});

export const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: any) => {
    try {
      await api.auth.forgotPassword(data.email);
      setSubmitted(true);
    } catch (error) {
      // Show success anyway for security (don't reveal if email exists)
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8 animate-fade-up text-center">
          <div className="w-16 h-16 mx-auto bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
            <CheckCircle className="text-green-500" size={32} />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black uppercase tracking-tighter">Email Envoyé</h1>
            <p className="text-zinc-400 leading-relaxed">
              Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation de mot de passe dans quelques minutes.
            </p>
            <p className="text-sm text-zinc-500">
              Vérifiez également votre dossier spam.
            </p>
          </div>

          <Link to="/auth/login">
            <Button variant="outline" className="gap-2">
              <ArrowLeft size={16} /> Retour à la connexion
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-12 animate-fade-up">
        <div className="space-y-4 text-center">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic">Mot de Passe Oublié</h1>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Input 
            label="Adresse Email" 
            type="email" 
            placeholder="votre@email.com"
            icon={<Mail size={18} />}
            error={errors.email?.message as string}
            {...register('email')}
          />
          
          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            Envoyer le Lien de Réinitialisation
          </Button>
        </form>

        <div className="text-center space-y-3">
          <Link to="/auth/login" className="text-sm text-zinc-500 hover:text-white transition-colors inline-flex items-center gap-2">
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};
