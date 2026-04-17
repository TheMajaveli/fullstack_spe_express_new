import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { api } from '../services/api';
import { Button, Input } from '../components/DesignSystem';
import { Card } from '../components/UI';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';

export const UpdatePasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useStore();
  const [success, setSuccess] = useState(false);

  const schema = useMemo(
    () =>
      z
        .object({
          currentPassword: z.string().min(1, t('validation.currentPasswordRequired')),
          newPassword: z
            .string()
            .min(8, t('validation.passwordMin8'))
            .regex(/[A-Z]/, t('validation.passwordUppercase'))
            .regex(/[0-9]/, t('validation.passwordDigit')),
          confirmPassword: z.string(),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: t('validation.passwordMismatch'),
          path: ['confirmPassword'],
        }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
  });

  if (!isAuthenticated) return <Navigate to="/auth/login" />;

  const onSubmit = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      await api.auth.updatePassword(data.currentPassword, data.newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/account'), 2000);
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || t('updatePassword.rootError'),
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
          <h2 className="text-2xl font-black uppercase">{t('updatePassword.successTitle')}</h2>
          <p className="text-zinc-400">{t('updatePassword.successBody')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/account')} className="gap-2">
          <ArrowLeft size={16} /> {t('updatePassword.back')}
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter">{t('updatePassword.title')}</h1>
        <p className="text-zinc-500">{t('updatePassword.subtitle')}</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label={t('updatePassword.currentLabel')}
            type="password"
            placeholder="••••••••"
            icon={<Lock size={18} />}
            passwordToggle
            error={errors.currentPassword?.message as string}
            {...register('currentPassword')}
          />

          <div className="border-t border-zinc-800 pt-6 space-y-6">
            <Input
              label={t('updatePassword.newLabel')}
              type="password"
              placeholder="••••••••"
              icon={<Lock size={18} />}
              passwordToggle
              error={errors.newPassword?.message as string}
              {...register('newPassword')}
            />
            <Input
              label={t('updatePassword.confirmLabel')}
              type="password"
              placeholder="••••••••"
              icon={<Lock size={18} />}
              passwordToggle
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
              {t('updatePassword.cancel')}
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              {t('updatePassword.submit')}
            </Button>
          </div>
        </form>
      </Card>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">{t('updatePassword.securityTips')}</h3>
        <ul className="space-y-2 text-sm text-zinc-500">
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>{t('updatePassword.tip1')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>{t('updatePassword.tip2')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            <span>{t('updatePassword.tip3')}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
