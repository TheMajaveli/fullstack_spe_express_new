import React, { useState } from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Input as ShadcnInput } from '@/components/ui/input';
import { Skeleton as ShadcnSkeleton } from '@/components/ui/skeleton';
import { Card as ShadcnCard } from '@/components/ui/card';
import { Badge as ShadcnBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from './Toast';

// --- BUTTON (shadcn-based, backward-compatible with UI usage) ---
const variantMap = {
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  danger: 'destructive',
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  ...props
}) => (
  <ShadcnButton
    variant={variantMap[variant] as any}
    size={size === 'icon' ? 'icon' : size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
    className={cn(variant === 'primary' && 'bg-white text-black hover:bg-zinc-200', className)}
    disabled={isLoading || props.disabled}
    {...props}
  >
    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    {children}
  </ShadcnButton>
);

// --- INPUT (shadcn with label/error/icon, optional password toggle) ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  passwordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, passwordToggle, type: typeProp, className = '', ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const type = passwordToggle ? (visible ? 'text' : 'password') : typeProp;
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">{icon}</div>
          )}
          <ShadcnInput
            ref={ref}
            type={type}
            className={cn(
              'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-accent/50',
              icon && 'pl-10',
              passwordToggle && 'pr-10',
              error && 'border-red-500',
              className
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
        {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// --- BADGE (shadcn with accent variant) ---
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'accent';
  className?: string;
}> = ({ children, variant = 'default', className = '' }) => {
  if (variant === 'accent') {
    return (
      <span
        className={cn(
          'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest inline-flex items-center bg-accent/10 text-accent border border-accent/20',
          className
        )}
      >
        {children}
      </span>
    );
  }
  return (
    <ShadcnBadge
      variant={variant === 'outline' ? 'outline' : 'default'}
      className={cn('rounded-full text-[10px] font-bold uppercase tracking-widest', className)}
    >
      {children}
    </ShadcnBadge>
  );
};

// --- SKELETON (shadcn) ---
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <ShadcnSkeleton className={cn('bg-zinc-800', className)} />
);

// --- CARD (shadcn) ---
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <ShadcnCard
    className={cn('bg-zinc-900/50 border-zinc-800 rounded-xl overflow-hidden', className)}
  >
    {children}
  </ShadcnCard>
);

// --- TOAST ---
export { useToast };
