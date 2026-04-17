import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { Button, Input, useToast } from './UI';
import { api } from '../services/api';
import { Movie } from '../types';
import { useStore } from '../store';
import { useInvalidateUserRecommendations } from '../hooks/useInvalidateUserRecommendations';

interface RatingModalProps {
  movie: Movie;
  onClose: () => void;
  onSuccess: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({ movie, onSuccess, onClose }) => {
  const { t } = useTranslation();
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const invalidateRecommendations = useInvalidateUserRecommendations();

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      toast(t('ratingModal.selectRating'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.user.addRating(movie.id, selectedRating * 2, note || undefined);
      useStore.getState().setAuth({ user: result.user });
      invalidateRecommendations();
      toast(t('ratingModal.saveSuccess'), 'success');
      onSuccess();
    } catch (error: any) {
      toast(error.message || t('ratingModal.saveError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      <p className="text-sm text-zinc-400 text-center uppercase tracking-widest font-bold">
        {t('ratingModal.question', { title: movie.title })}
      </p>

      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelectedRating(i)}
            className={`transition-all ${
              i <= selectedRating ? 'text-accent scale-110' : 'text-zinc-800 hover:text-zinc-600'
            }`}
            aria-label={t('ratingModal.ariaRate', { score: i * 2 })}
          >
            <Star size={48} fill={i <= selectedRating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>

      {selectedRating > 0 && (
        <div className="text-center">
          <p className="text-lg font-bold text-accent">{selectedRating * 2} / 10</p>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
          {t('ratingModal.commentLabel')}
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('ratingModal.commentPlaceholder')}
          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent transition-all min-h-[100px]"
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
          {t('ratingModal.cancel')}
        </Button>
        <Button onClick={handleSubmit} className="flex-1" isLoading={isSubmitting} disabled={selectedRating === 0}>
          {t('ratingModal.confirm')}
        </Button>
      </div>
    </div>
  );
};
