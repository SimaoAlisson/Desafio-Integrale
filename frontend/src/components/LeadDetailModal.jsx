import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import LeadDetail from './LeadDetail';
import { Button } from './ui/button';

function LeadDetailModal({
  lead,
  open,
  onClose,
  onDelete,
  onRestore,
  deleting = false,
  restoring = false,
}) {
  const closeButtonRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
    };
  }, [open, onClose]);

  if (!open || !lead) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes de ${lead.nome}`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Fechar detalhes"
        onClick={onClose}
        tabIndex={-1}
      />

      <div
        ref={panelRef}
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Detalhes do lead</h2>
          <Button
            ref={closeButtonRef}
            type="button"
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <LeadDetail
            lead={lead}
            onDelete={onDelete}
            onRestore={onRestore}
            deleting={deleting}
            restoring={restoring}
          />
        </div>
      </div>
    </div>
  );
}

export default LeadDetailModal;
