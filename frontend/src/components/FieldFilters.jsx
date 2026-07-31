import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const FILTER_FIELDS = [
  { key: 'nome', label: 'Nome' },
  { key: 'empresa', label: 'Empresa' },
  { key: 'email', label: 'Email' },
  { key: 'origem', label: 'Origem' },
];

const DROPDOWN_WIDTH = 280;

export function uniqueFieldValues(leads, key) {
  const values = new Set();

  for (const lead of leads) {
    const value = lead?.[key];
    if (typeof value === 'string' && value.trim()) {
      values.add(value.trim());
    }
  }

  return [...values].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function MultiSelectFilter({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState(null);
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const searchRef = useRef(null);
  const listId = useId();
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const filteredOptions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) => option.toLowerCase().includes(term));
  }, [options, query]);

  function updatePosition() {
    const trigger = rootRef.current?.querySelector('[data-filter-trigger]');
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const maxWidth = Math.max(8, window.innerWidth - 16);
    const width = Math.min(Math.max(rect.width, DROPDOWN_WIDTH), maxWidth);
    let left = rect.left;

    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8);
    }

    setCoords({
      top: rect.bottom + 4,
      left,
      width,
    });
  }

  useLayoutEffect(() => {
    if (!open) return undefined;

    updatePosition();

    function handleReposition() {
      updatePosition();
    }

    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      const target = event.target;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
      setQuery('');
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
    }
  }, [open]);

  function toggleValue(value) {
    if (selectedSet.has(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    onChange([...selected, value]);
  }

  function clearSelection(event) {
    event.stopPropagation();
    onChange([]);
  }

  const summary =
    selected.length === 0
      ? 'Todos'
      : selected.length === 1
        ? selected[0]
        : `${selected.length} selecionados`;

  const dropdown =
    open &&
    coords &&
    createPortal(
      <div
        ref={panelRef}
        id={listId}
        role="listbox"
        aria-multiselectable="true"
        style={{
          position: 'fixed',
          top: coords.top,
          left: coords.left,
          width: coords.width,
          zIndex: 80,
        }}
        className="overflow-hidden rounded-md border border-border bg-surface shadow-lg"
      >
        <div className="border-b border-border p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <Input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Buscar ${label.toLowerCase()}...`}
              className="h-8 pl-8 text-xs"
              aria-label={`Buscar em ${label}`}
            />
          </div>
        </div>

        <div className="max-h-56 overflow-y-auto p-1">
          {filteredOptions.length === 0 && (
            <p className="px-2 py-3 text-center text-xs text-muted">Nenhuma opção</p>
          )}

          {filteredOptions.map((option) => {
            const checked = selectedSet.has(option);

            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={checked}
                onClick={() => toggleValue(option)}
                className={cn(
                  'flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-2',
                  checked && 'bg-brand-muted text-brand'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                    checked
                      ? 'border-brand bg-brand text-white'
                      : 'border-border bg-surface'
                  )}
                >
                  {checked && <Check className="h-3 w-3" />}
                </span>
                <span className="min-w-0 break-words">{option}</span>
              </button>
            );
          })}
        </div>

        {selected.length > 0 && (
          <div className="border-t border-border p-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-full"
              onClick={() => onChange([])}
            >
              Limpar seleção
            </Button>
          </div>
        )}
      </div>,
      document.body
    );

  return (
    <div ref={rootRef} className="relative">
      <Label className="text-xs text-muted">{label}</Label>
      <button
        type="button"
        data-filter-trigger
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'mt-1 flex h-10 w-full items-center gap-2 rounded-md border border-border bg-surface px-3 text-left text-sm text-foreground',
          open && 'ring-2 ring-brand/30'
        )}
      >
        <span className="min-w-0 flex-1 truncate">{summary}</span>
        {selected.length > 0 && (
          <span
            role="button"
            tabIndex={0}
            aria-label={`Limpar filtro de ${label}`}
            className="rounded p-0.5 text-muted hover:bg-surface-2 hover:text-foreground"
            onClick={clearSelection}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                clearSelection(event);
              }
            }}
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
        <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
      </button>
      {dropdown}
    </div>
  );
}

function FieldFilters({ leads, filters, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {FILTER_FIELDS.map((field) => (
        <MultiSelectFilter
          key={field.key}
          label={field.label}
          options={uniqueFieldValues(leads, field.key)}
          selected={filters[field.key] || []}
          onChange={(values) => onChange(field.key, values)}
        />
      ))}
    </div>
  );
}

export function applyFieldFilters(leads, filters) {
  return leads.filter((lead) =>
    FILTER_FIELDS.every((field) => {
      const selected = filters[field.key] || [];
      if (selected.length === 0) return true;
      return selected.includes(lead[field.key] || '');
    })
  );
}

export function hasFieldFilters(filters) {
  return FILTER_FIELDS.some((field) => (filters[field.key] || []).length > 0);
}

export default FieldFilters;
