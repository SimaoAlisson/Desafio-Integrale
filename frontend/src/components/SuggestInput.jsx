import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { cn } from '../lib/utils';

/**
 * Campo de texto com sugestões customizadas (tema claro/escuro + lista compacta).
 * Permite digitar livremente ou selecionar uma opção existente.
 */
function SuggestInput({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  placeholder,
  required = false,
  className,
  error,
  errorId,
  ...props
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();

  const filteredOptions = useMemo(() => {
    const term = String(value || '').trim().toLowerCase();
    if (!term) return options.slice(0, 8);

    return options
      .filter((option) => option.toLowerCase().includes(term))
      .slice(0, 8);
  }, [options, value]);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function emitChange(nextValue) {
    onChange?.({
      target: {
        name,
        value: nextValue,
      },
    });
  }

  function handleInputChange(event) {
    emitChange(event.target.value);
    setOpen(true);
  }

  function handleSelect(option) {
    emitChange(option);
    setOpen(false);
  }

  const showList = open && filteredOptions.length > 0;

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <Label htmlFor={id}>
        {label}
        {required ? ' *' : ''}
      </Label>

      <div className="relative mt-1.5">
        <Input
          id={id}
          name={name}
          value={value}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          autoComplete="off"
          className="pr-9"
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Abrir sugestões de ${label}`}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted hover:bg-surface-2 hover:text-foreground"
          onClick={() => setOpen((prev) => !prev)}
        >
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
          />
        </button>
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-40 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-lg"
        >
          {filteredOptions.map((option) => {
            const selected = option === value;

            return (
              <li key={option} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={cn(
                    'w-full truncate px-3 py-1.5 text-left text-sm text-foreground hover:bg-surface-2',
                    selected && 'bg-brand-muted text-brand'
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default SuggestInput;
