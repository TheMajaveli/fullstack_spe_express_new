import React from 'react';
import { Badge } from '../UI';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface SystemStatusCardProps {
  label: string;
  status: 'running' | 'connected' | 'ok' | 'enabled' | 'error' | 'warning';
}

export const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ label, status }) => {
  const isHealthy = status === 'running' || status === 'connected' || status === 'ok' || status === 'enabled';
  
  const getStatusBadge = () => {
    if (isHealthy) {
      return <Badge variant="accent" className="gap-1.5"><CheckCircle2 size={12} /> {status === 'enabled' ? 'Activé' : status === 'connected' ? 'Connecté' : status === 'ok' ? 'OK' : 'En cours'}</Badge>;
    } else if (status === 'warning') {
      return <Badge variant="outline" className="gap-1.5 text-yellow-500 border-yellow-500/50"><AlertCircle size={12} /> Avertissement</Badge>;
    } else {
      return <Badge variant="outline" className="gap-1.5 text-red-500 border-red-500/50"><XCircle size={12} /> Erreur</Badge>;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800 rounded-sm">
      <span className="text-sm font-bold text-zinc-400">{label}</span>
      {getStatusBadge()}
    </div>
  );
};
