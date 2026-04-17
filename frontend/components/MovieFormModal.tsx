import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Modal } from './DesignSystem';
import { Input, Button, useToast } from './UI';
import { api } from '../services/api';
import { Movie } from '../types';
import { getPosterUrl } from '../utils/constants';
import { Upload, X } from 'lucide-react';

type MovieFormData = {
  title: string;
  description: string;
  year: number;
  duration: string;
  director: string;
  category: string;
  trailerUrl?: string;
};

interface MovieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie?: Movie | null;
  onSuccess: () => void;
  categories: Array<{ id: string; name: string }>;
}

export const MovieFormModal: React.FC<MovieFormModalProps> = ({
  isOpen,
  onClose,
  movie,
  onSuccess,
  categories,
}) => {
  const { t } = useTranslation();
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const movieSchema = useMemo(
    () =>
      z.object({
        title: z.string().min(1, t('movieForm.titleRequired')),
        description: z.string().min(1, t('movieForm.descriptionRequired')),
        year: z
          .number()
          .min(1900, t('movieForm.yearMin'))
          .max(new Date().getFullYear() + 10, t('movieForm.yearMax')),
        duration: z.string().min(1, t('movieForm.durationRequired')),
        director: z.string().min(1, t('movieForm.directorRequired')),
        category: z.string().min(1, t('movieForm.categoryRequired')),
        trailerUrl: z
          .string()
          .optional()
          .refine((s) => !s?.trim() || /^https?:\/\//i.test(s.trim()), {
            message: t('movieForm.trailerUrlInvalid'),
          }),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: '',
      description: '',
      year: new Date().getFullYear(),
      duration: '',
      director: '',
      category: '',
      trailerUrl: '',
    },
  });

  useEffect(() => {
    if (movie) {
      setValue('title', movie.title);
      setValue('description', movie.description);
      setValue('year', movie.year);
      setValue('duration', movie.duration);
      setValue('director', movie.director);
      setValue('category', movie.category);
      setValue('trailerUrl', movie.trailerUrl?.trim() || '');
      setPosterPreview(getPosterUrl(movie.posterUrl));
    } else {
      reset();
      setValue('trailerUrl', '');
      setPosterFile(null);
      setPosterPreview('');
    }
  }, [movie, setValue, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: MovieFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        trailerUrl: data.trailerUrl?.trim() || '',
      };
      if (movie) {
        await api.movies.update(movie.id, payload, posterFile || undefined);
      } else {
        await api.movies.create(payload, posterFile || undefined);
      }
      onSuccess();
      onClose();
      reset();
      setPosterFile(null);
      setPosterPreview('');
      toast(movie ? t('movieForm.toastUpdated') : t('movieForm.toastCreated'), 'success');
    } catch (error: any) {
      toast(error.message || t('movieForm.toastSaveError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={movie ? t('movieForm.modalEditTitle') : t('movieForm.modalCreateTitle')}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{t('movieForm.posterLabel')}</label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {posterPreview && (
              <div className="relative w-24 h-36 rounded overflow-hidden border border-zinc-800 shrink-0">
                <img src={posterPreview} alt={t('movieForm.posterPreviewAlt')} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPosterFile(null);
                    setPosterPreview(movie ? getPosterUrl(movie.posterUrl) : '');
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-black"
                  aria-label={t('movieForm.removePosterAria')}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <div className="flex-1 w-full">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-800 rounded-lg cursor-pointer hover:border-zinc-700 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                  <Upload size={24} className="text-zinc-500 mb-2" />
                  <p className="text-xs text-zinc-500 font-medium text-center">
                    {posterFile ? posterFile.name : t('movieForm.uploadHint')}
                  </p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          </div>
        </div>

        <Input
          label={t('movieForm.titleLabel')}
          {...register('title')}
          error={errors.title?.message}
          placeholder={t('movieForm.titlePlaceholder')}
        />

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
            {t('movieForm.descriptionLabel')}
          </label>
          <textarea
            {...register('description')}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent transition-all min-h-[100px]"
            placeholder={t('movieForm.descriptionPlaceholder')}
          />
          {errors.description && (
            <p className="text-[10px] text-red-500 font-medium mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('movieForm.yearLabel')}
            type="number"
            {...register('year', { valueAsNumber: true })}
            error={errors.year?.message}
            placeholder="2024"
          />

          <Input
            label={t('movieForm.durationLabel')}
            {...register('duration')}
            error={errors.duration?.message}
            placeholder={t('movieForm.durationPlaceholder')}
          />
        </div>

        <Input
          label={t('movieForm.directorLabel')}
          {...register('director')}
          error={errors.director?.message}
          placeholder={t('movieForm.directorPlaceholder')}
        />

        <Input
          label={t('movieForm.trailerLabel')}
          {...register('trailerUrl')}
          error={errors.trailerUrl?.message}
          placeholder={t('movieForm.trailerPlaceholder')}
        />

        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
            {t('movieForm.categoryLabel')}
          </label>
          <select
            {...register('category')}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent transition-all"
          >
            <option value="">{t('movieForm.categoryPlaceholder')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-[10px] text-red-500 font-medium mt-1">{errors.category.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            {movie ? t('movieForm.submitUpdate') : t('movieForm.submitCreate')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
