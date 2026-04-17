import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { Button, Input, Card, useToast } from '../components/UI';
import { api } from '../services/api';
import { useStore } from '../store';
import { logger } from '../utils/logger';

type RegisterForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useStore((s) => s.setAuth);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const registerSchema = useMemo(
    () =>
      z
        .object({
          username: z.string().min(3, t('validation.usernameMin')),
          email: z.string().email(t('validation.emailRequired')),
          password: z
            .string()
            .min(8, t('validation.passwordMin8'))
            .regex(/[A-Z]/, t('validation.passwordUppercase'))
            .regex(/[0-9]/, t('validation.passwordDigit')),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t('validation.passwordMismatch'),
          path: ['confirmPassword'],
        }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const result = await api.auth.register(data.email, data.username, data.password);
      setAuth(result);
      logger.info('Registration successful', { userId: result.user.id });
      toast(t('register.toastSuccess'));
      navigate('/');
    } catch (err: any) {
      logger.error('Registration failed', { message: err?.message });
      toast(t('register.toastError'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 animate-in fade-in duration-500">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter">{t('register.title')}</h1>
        <p className="text-zinc-500">{t('register.subtitle')}</p>
      </div>

      <Card className="p-8 space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t('register.usernameLabel')}
            icon={<User size={18} />}
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            label={t('register.emailLabel')}
            type="email"
            icon={<Mail size={18} />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label={t('register.passwordLabel')}
            type="password"
            icon={<Lock size={18} />}
            passwordToggle
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label={t('register.confirmPasswordLabel')}
            type="password"
            icon={<ShieldCheck size={18} />}
            passwordToggle
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" className="w-full h-12 text-lg font-bold" isLoading={isLoading}>
            {t('register.submit')}
          </Button>
        </form>

        <p className="text-[10px] text-center text-zinc-600 uppercase tracking-widest font-semibold px-4">{t('register.legal')}</p>
      </Card>

      <p className="text-center mt-8 text-sm text-zinc-500">
        {t('register.hasAccount')}{' '}
        <Link to="/auth/login" className="text-white hover:text-accent font-semibold underline underline-offset-4">
          {t('register.signInLink')}
        </Link>
      </p>
    </div>
  );
};
