import { Loader, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const CONFIG = {
  pending:   { icon: Clock,        label: 'Queued',     cls: 'badge--pending'   },
  queued:    { icon: Clock,        label: 'Queued',     cls: 'badge--pending'   },
  analyzing: { icon: Loader,       label: 'Analyzing',  cls: 'badge--analyzing' },
  done:      { icon: CheckCircle,  label: 'Tagged',     cls: 'badge--done'      },
  error:     { icon: AlertCircle,  label: 'Error',      cls: 'badge--error'     },
};

export function StatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`status-badge ${cfg.cls}`}>
      <Icon size={11} className={status === 'analyzing' ? 'spin' : ''} />
      {cfg.label}
    </span>
  );
}
