import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

/**
 * Card de filtros com botão de minimizar/expandir no canto.
 */
function CollapsibleFilters({ open, onToggle, children, className }) {
  return (
    <div
      className={cn(
        'relative rounded-lg border border-border bg-surface-2/40',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <p className="text-xs font-medium text-muted">Filtros</p>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={open ? 'Minimizar filtros' : 'Expandir filtros'}
          title={open ? 'Minimizar filtros' : 'Expandir filtros'}
        >
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {open && <div className="space-y-3 p-3">{children}</div>}
    </div>
  );
}

export default CollapsibleFilters;
