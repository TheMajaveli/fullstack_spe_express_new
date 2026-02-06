
import React from 'react';
import { Loader2, Check, Star } from 'lucide-react';

// --- BUTTON ---
export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}>(({ children, variant = 'primary', size = 'md', isLoading, className = '', ...props }, ref) => {
  const base = "inline-flex items-center justify-center rounded-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-accent/50 outline-none";
  const variants = {
    primary: "bg-white text-black hover:bg-zinc-200 shadow-xl",
    secondary: "bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800",
    outline: "border-2 border-zinc-800 text-zinc-400 hover:border-white hover:text-white bg-transparent",
    ghost: "hover:bg-zinc-900/50 text-zinc-500 hover:text-white",
    danger: "bg-accent text-white hover:bg-accent/90",
    link: "text-zinc-500 hover:text-white underline-offset-4 hover:underline px-0 h-auto",
  };
  const sizes = {
    xs: "h-7 px-2 text-[10px] uppercase tracking-tighter",
    sm: "h-9 px-4 text-xs uppercase tracking-widest",
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-10 text-base",
    icon: "h-11 w-11",
  };
  return (
    <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

// --- POSTER CARD ---
export const PosterCard: React.FC<{ 
  movie: any; 
  onAction?: () => void;
  className?: string;
}> = ({ movie, onAction, className = '' }) => (
  <div className={`group relative aspect-poster bg-cinema-card rounded-sm overflow-hidden border border-cinema-border transition-all duration-500 hover:border-accent/50 ${className}`}>
    <img 
      src={movie.posterUrl} 
      alt={movie.title} 
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
      loading="lazy"
    />
    {/* Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-accent">
            <Star size={14} fill="currentColor" />
            <span className="text-sm font-bold">{movie.rating.toFixed(1)}</span>
          </div>
          <span className="text-[10px] font-black uppercase text-zinc-500">{movie.year}</span>
        </div>
        <h3 className="font-bold text-sm leading-tight text-white line-clamp-2 uppercase tracking-tight">{movie.title}</h3>
        <div className="flex gap-1 pt-2">
           <Button variant="primary" size="xs" className="flex-1">Details</Button>
           <Button variant="secondary" size="xs" className="w-8 px-0"><Check size={12} /></Button>
        </div>
      </div>
    </div>
  </div>
);

// --- INPUT ---
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</label>}
      <input
        ref={ref}
        className={`w-full bg-transparent border-b-2 border-zinc-800 py-3 px-1 text-base transition-all focus:border-white focus:outline-none placeholder:text-zinc-700 ${error ? 'border-accent' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-[10px] font-bold text-accent uppercase tracking-wider">{error}</p>}
    </div>
  )
);

// --- SKELETON ---
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-zinc-900 rounded-sm ${className}`} />
);

// --- MODAL ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-cinema-card border border-cinema-border p-4 sm:p-6 md:p-8 shadow-2xl animate-fade-up my-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tighter">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl sm:text-2xl" aria-label="Fermer">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};
