import { formatDate } from '../lib/utils';
import { cn } from '../lib/utils';

function LeadList({ leads, selectedId, onSelect }) {
  return (
    <ul className="h-full space-y-2 overflow-y-auto overscroll-contain p-3">
      {leads.map((lead) => {
        const selected = lead.id === selectedId;

        return (
          <li key={lead.id}>
            <button
              type="button"
              onClick={() => onSelect(lead)}
              className={cn(
                'flex w-full flex-col gap-1 rounded-lg border px-3 py-3 text-left',
                selected
                  ? 'border-brand bg-brand-muted shadow-sm'
                  : 'border-border bg-surface hover:border-muted hover:bg-surface-2'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className={cn('break-words font-medium', selected && 'text-brand')}>
                    {lead.nome}
                  </span>
                  {lead.empresa && (
                    <span className="ml-1.5 text-sm font-normal break-words text-muted opacity-70">
                      · {lead.empresa}
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-[11px] text-muted sm:text-xs">
                  {formatDate(lead.created_at)}
                </span>
              </div>
              {lead.origem && (
                <p className="text-xs text-muted">{lead.origem}</p>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default LeadList;
