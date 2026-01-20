
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { Button, Input, Card, useToast } from '../components/UI';
import { api } from '../services/api';
import { useStore } from '../store';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain one uppercase letter')
    .regex(/[0-9]/, 'Must contain one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
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
      toast('Account created successfully');
      navigate('/');
    } catch (err) {
      toast('Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 animate-in fade-in duration-500">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Join CineNoir</h1>
        <p className="text-zinc-500">Start your curated cinematic journey today.</p>
      </div>

      <Card className="p-8 space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Username"
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
            label="Password"
            type="password"
            icon={<Lock size={18} />}
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm Password"
            type="password"
            icon={<ShieldCheck size={18} />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" className="w-full h-12 text-lg font-bold" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <p className="text-[10px] text-center text-zinc-600 uppercase tracking-widest font-semibold px-4">
          By clicking Create Account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </Card>

      <p className="text-center mt-8 text-sm text-zinc-500">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-white hover:text-accent font-semibold underline underline-offset-4">Log in here</Link>
      </p>
    </div>
  );
};
