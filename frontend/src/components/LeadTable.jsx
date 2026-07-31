import { ArrowDown, ArrowDownAZ, ArrowUp, ArrowUpAZ } from 'lucide-react';
import { cn, formatCpfCnpj, formatDate, formatPhone } from '../lib/utils';

const DEFAULT_COLUMNS = [
  { key: 'nome', label: 'Nome', type: 'text' },
  { key: 'telefone', label: 'Telefone', type: 'phone' },
  { key: 'cpf_cnpj', label: 'CPF/CNPJ', type: 'cpf_cnpj', hideBelow: 'md' },
  { key: 'email', label: 'Email', type: 'text', hideBelow: 'md' },
  { key: 'origem', label: 'Origem', type: 'text', hideBelow: 'lg' },
  { key: 'created_at', label: 'Criado em', type: 'date', hideBelow: 'sm' },
];

const HIDE_BELOW_CLASS = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

function SortIcon({ active, sortDir, type }) {
  if (!active) return null;

  if (type === 'date') {
    return sortDir === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
  }

  return sortDir === 'asc' ? (
    <ArrowUpAZ className="h-3.5 w-3.5" />
  ) : (
    <ArrowDownAZ className="h-3.5 w-3.5" />
  );
}

function formatCellValue(column, raw) {
  if (column.type === 'date') return formatDate(raw);
  if (column.type === 'phone') return formatPhone(raw) || '—';
  if (column.type === 'cpf_cnpj') return formatCpfCnpj(raw) || '—';
  return raw || '—';
}

function LeadTable({
  leads,
  selectedId,
  onSelect,
  sortKey,
  sortDir,
  onSort,
  columns = DEFAULT_COLUMNS,
  renderActions,
}) {
  return (
    <div className="h-full overflow-auto overscroll-contain">
      <table className="w-full min-w-0 border-collapse text-center text-sm sm:min-w-[480px] md:min-w-[640px]">
        <thead className="sticky top-0 z-10 bg-surface-2 text-xs uppercase tracking-wide text-muted">
          <tr>
            {columns.map((column) => {
              const active = sortKey === column.key;
              const hideClass = column.hideBelow ? HIDE_BELOW_CLASS[column.hideBelow] : '';

              return (
                <th
                  key={column.key}
                  className={cn('px-2 py-2.5 font-medium sm:px-3 sm:py-3 md:px-4', hideClass)}
                  scope="col"
                >
                  <button
                    type="button"
                    onClick={() => onSort(column.key)}
                    className={cn(
                      'inline-flex max-w-full items-center justify-center gap-1 hover:text-foreground',
                      active && 'text-foreground'
                    )}
                    aria-sort={
                      active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
                    }
                  >
                    <span className="truncate">{column.label}</span>
                    <SortIcon active={active} sortDir={sortDir} type={column.type} />
                  </button>
                </th>
              );
            })}
            {renderActions && (
              <th className="px-2 py-2.5 font-medium sm:px-3 sm:py-3 md:px-4" scope="col">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const selected = lead.id === selectedId;

            return (
              <tr
                key={lead.id}
                tabIndex={0}
                role="button"
                aria-selected={selected}
                aria-label={`Selecionar lead ${lead.nome}`}
                onClick={() => onSelect(lead)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(lead);
                  }
                }}
                className={cn(
                  'cursor-pointer border-t border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40',
                  selected ? 'bg-brand-muted' : 'hover:bg-surface-2'
                )}
              >
                {columns.map((column) => {
                  const raw = lead[column.key];
                  const value = formatCellValue(column, raw);
                  const hideClass = column.hideBelow ? HIDE_BELOW_CLASS[column.hideBelow] : '';

                  return (
                    <td
                      key={column.key}
                      className={cn(
                        'px-2 py-2.5 sm:px-3 sm:py-3 md:px-4',
                        hideClass,
                        column.key === 'nome' && 'max-w-[140px] truncate font-medium sm:max-w-none',
                        (column.key === 'email' ||
                          column.type === 'date' ||
                          column.type === 'phone' ||
                          column.type === 'cpf_cnpj') &&
                          'text-muted',
                        (column.type === 'phone' || column.type === 'cpf_cnpj') &&
                          'whitespace-nowrap'
                      )}
                    >
                      {value}
                    </td>
                  );
                })}
                {renderActions && (
                  <td
                    className="px-2 py-2.5 sm:px-3 sm:py-3 md:px-4"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {renderActions(lead)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default LeadTable;
export { DEFAULT_COLUMNS };
