
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { api } from '../services/api';
import { Button, Input } from '../components/DesignSystem';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password too short'),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useStore(s => s.setAuth);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: any) => {
    const res = await api.auth.login(data.email, data.password);
    setAuth(res);
    navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-12 animate-fade-up">
        <div className="space-y-4 text-center">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic">Welcome Back</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Login to your cinematic workspace</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="j.godard@nouvellevague.com"
            error={errors.email?.message as string}
            {...register('email')}
          />
          <Input 
            label="Security Key" 
            type="password" 
            placeholder="••••••••"
            error={errors.password?.message as string}
            {...register('password')}
          />
          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>Authorize Entry</Button>
        </form>

        <p className="text-center text-xs font-bold text-zinc-600 uppercase tracking-widest">
          No account? <Link to="/auth/register" className="text-white hover:text-accent ml-1 transition-colors">Join the collective</Link>
        </p>
      </div>
    </div>
  );
};
