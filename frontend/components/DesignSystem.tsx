import React, { useState } from 'react';
import { Loader2, Check, Star, Eye, EyeOff } from 'lucide-react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Input as ShadcnInput } from '@/components/ui/input';
import { Skeleton as ShadcnSkeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { FALLBACK_POSTER_URL, getPosterUrl } from '../utils/constants';

const variantMap = {
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  danger: 'destructive',
  link: 'link',
} as const;

const sizeMap = {
  xs: 'sm',
  sm: 'sm',
  md: 'default',
  lg: 'lg',
  icon: 'icon',
} as const;

// --- BUTTON (shadcn-based, backward-compatible API) ---
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
  }
>(({ children, variant = 'primary', size = 'md', isLoading, className = '', ...props }, ref) => (
  <ShadcnButton
    ref={ref}
    variant={variantMap[variant] as any}
    size={sizeMap[size] as any}
    className={cn(
      variant === 'primary' && 'bg-white text-black hover:bg-zinc-200 shadow-xl',
      variant === 'link' && 'px-0 h-auto',
      size === 'xs' && 'text-[10px] uppercase tracking-tighter',
      size === 'sm' && 'uppercase tracking-widest',
      className
    )}
    disabled={isLoading || props.disabled}
    {...props}
  >
    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    {children}
  </ShadcnButton>
));

// --- POSTER CARD (custom, uses Button above) ---
export const PosterCard: React.FC<{
  movie: any;
  onAction?: () => void;
  className?: string;
}> = ({ movie, onAction, className = '' }) => (
  <div
    className={cn(
      'group relative aspect-poster bg-cinema-card rounded-md overflow-hidden border border-cinema-border transition-all duration-500 hover:border-accent/50',
      className
    )}
  >
    <img
      src={getPosterUrl(movie.posterUrl)}
      alt={movie.title}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
      loading="lazy"
      onError={(e) => {
        (e.target as HTMLImageElement).src = FALLBACK_POSTER_URL;
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-accent">
            <Star size={14} fill="currentColor" />
            <span className="text-sm font-bold">{movie.rating.toFixed(1)}</span>
          </div>
          <span className="text-[10px] font-black uppercase text-zinc-500">{movie.year}</span>
        </div>
        <h3 className="font-bold text-sm leading-tight text-white line-clamp-2 uppercase tracking-tight">
          {movie.title}
        </h3>
        <div className="flex gap-1 pt-2">
          <Button variant="primary" size="xs" className="flex-1">
            Details
          </Button>
          <Button variant="secondary" size="xs" className="w-8 px-0">
            <Check size={12} />
          </Button>
        </div>
      </div>
    </div>
  </div>
);

// --- INPUT (shadcn-based with label/error, optional password toggle) ---
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; passwordToggle?: boolean }
>(({ label, error, passwordToggle, type: typeProp, className = '', ...props }, ref) => {
  const [visible, setVisible] = useState(false);
  const type = passwordToggle ? (visible ? 'text' : 'password') : typeProp;
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</label>
      )}
      <div className="relative">
        <ShadcnInput
          ref={ref}
          type={type}
          className={cn(
            'bg-transparent border-zinc-800 focus-visible:ring-accent/50',
            passwordToggle && 'pr-10',
            error && 'border-accent focus-visible:ring-accent'
          )}
          {...props}
        />
        {passwordToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            tabIndex={-1}
            aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[10px] font-bold text-accent uppercase tracking-wider">{error}</p>
      )}
    </div>
  );
});

// --- SKELETON (shadcn) ---
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <ShadcnSkeleton className={cn('bg-zinc-900', className)} />
);

// --- MODAL (shadcn Dialog, backward-compatible API) ---
export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-w-lg bg-cinema-card border-cinema-border max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter">
          {title}
        </DialogTitle>
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);
