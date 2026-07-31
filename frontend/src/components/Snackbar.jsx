import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

function Snackbar({ message, type = 'success', open, onClose, duration = 3500 }) {
  useEffect(() => {
    if (!open || !message) return undefined;

    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [open, message, duration, onClose]);

  if (!open || !message) return null;

  const isError = type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          'pointer-events-auto flex max-w-md items-start gap-3 rounded-lg border px-4 py-3 shadow-lg',
          isError
            ? 'border-danger-border bg-danger-muted text-danger'
            : 'border-success-border bg-success-muted text-success'
        )}
      >
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="flex-1 text-sm">{message}</p>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0 text-current hover:bg-transparent"
          onClick={onClose}
          aria-label="Fechar notificação"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default Snackbar;
