import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, AlertCircle, Inbox, Search, X, ArrowRight } from 'lucide-react';
import AppShell from '../components/AppShell';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { getHistory } from '../services/api';
import { cn, formatCpfCnpj, formatDate, formatPhone, toDateKey } from '../lib/utils';

const ACTION_LABELS = {
  criacao: 'Criação',
  edicao: 'Edição',
  exclusao: 'Exclusão',
  restauracao: 'Restauração',
};

const ACTION_STYLES = {
  criacao: 'bg-success-muted text-success',
  edicao: 'bg-brand-muted text-brand',
  exclusao: 'bg-danger-muted text-danger',
  restauracao: 'bg-surface text-foreground border border-border',
};

const ORIGIN_LABELS = {
  frontend: 'Interface',
  api: 'API',
};

const FIELD_LABELS = {
  nome: 'Nome',
  email: 'Email',
  telefone: 'Telefone',
  cpf_cnpj: 'CPF/CNPJ',
  empresa: 'Empresa',
  origem: 'Origem',
  observacoes: 'Observações',
};

const DISPLAY_FIELDS = Object.keys(FIELD_LABELS);

const ACTION_OPTIONS = [
  { value: '', label: 'Todas as ações' },
  { value: 'criacao', label: 'Criação' },
  { value: 'edicao', label: 'Edição' },
  { value: 'exclusao', label: 'Exclusão' },
  { value: 'restauracao', label: 'Restauração' },
];

function formatFieldValue(key, value) {
  if (value == null || value === '') return '—';
  if (key === 'telefone') return formatPhone(value);
  if (key === 'cpf_cnpj') return formatCpfCnpj(value);
  return String(value);
}

function getLeadName(entry) {
  return (
    entry.new_values?.nome ||
    entry.old_values?.nome ||
    'Lead sem nome'
  );
}

function getChangedFields(oldValues, newValues) {
  const oldData = oldValues || {};
  const newData = newValues || {};

  return DISPLAY_FIELDS.filter((key) => {
    const before = oldData[key] ?? null;
    const after = newData[key] ?? null;
    return String(before ?? '') !== String(after ?? '');
  });
}

function ValuesList({ values }) {
  if (!values) {
    return <p className="text-sm text-muted">Sem detalhes</p>;
  }

  return (
    <dl className="grid gap-2 sm:grid-cols-2">
      {DISPLAY_FIELDS.map((key) => {
        const value = values[key];
        if (value == null || value === '') return null;

        return (
          <div key={key} className="min-w-0">
            <dt className="text-xs text-muted">{FIELD_LABELS[key]}</dt>
            <dd className="mt-0.5 break-words text-sm text-foreground">
              {formatFieldValue(key, value)}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function ChangesList({ oldValues, newValues }) {
  const changed = getChangedFields(oldValues, newValues);

  if (changed.length === 0) {
    return <p className="text-sm text-muted">Nenhuma alteração nos dados do lead.</p>;
  }

  return (
    <ul className="space-y-2">
      {changed.map((key) => (
        <li
          key={key}
          className="rounded-md border border-border bg-surface px-3 py-2"
        >
          <p className="text-xs font-medium text-muted">{FIELD_LABELS[key]}</p>
          <div className="mt-1 flex flex-wrap items-start gap-2 text-sm">
            <span className="break-words text-muted line-through">
              {formatFieldValue(key, oldValues?.[key])}
            </span>
            <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
            <span className="break-words font-medium text-foreground">
              {formatFieldValue(key, newValues?.[key])}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function HistoryDetails({ entry }) {
  if (entry.action === 'edicao') {
    return (
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
          O que mudou
        </p>
        <ChangesList oldValues={entry.old_values} newValues={entry.new_values} />
      </div>
    );
  }

  if (entry.action === 'exclusao') {
    return (
      <div>
        <p className="mb-2 text-sm text-muted">Lead movido para a lixeira.</p>
        <ValuesList values={entry.old_values || entry.new_values} />
      </div>
    );
  }

  if (entry.action === 'restauracao') {
    return (
      <div>
        <p className="mb-2 text-sm text-muted">Lead restaurado para a listagem principal.</p>
        <ValuesList values={entry.new_values || entry.old_values} />
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
        Dados cadastrados
      </p>
      <ValuesList values={entry.new_values} />
    </div>
  );
}

function Historico() {
  const [entries, setEntries] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getHistory({
        action: action || undefined,
        search,
      });
      setEntries(response.data || []);
    } catch {
      setError('Não foi possível carregar o histórico. Verifique se a API está em execução.');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [action, search]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  function clearDateFilter() {
    setDateFrom('');
    setDateTo('');
  }

  const hasDateFilter = Boolean(dateFrom || dateTo);

  const displayedEntries = useMemo(() => {
    if (!hasDateFilter) return entries;

    return entries.filter((entry) => {
      const key = toDateKey(entry.created_at);
      if (!key) return false;
      if (dateFrom && key < dateFrom) return false;
      if (dateTo && key > dateTo) return false;
      return true;
    });
  }, [entries, dateFrom, dateTo, hasDateFilter]);

  const hasActiveFilters = Boolean(search || action || hasDateFilter);

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Histórico</h1>
        <p className="mt-1 text-sm text-muted">
          Acompanhe as ações realizadas nos leads de forma simples.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="space-y-3 border-b border-border p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Buscar por nome, email, origem..."
                className="pl-9"
                aria-label="Buscar no histórico"
              />
            </div>

            <div>
              <Label htmlFor="history-action" className="sr-only">
                Filtrar por ação
              </Label>
              <select
                id="history-action"
                value={action}
                onChange={(event) => setAction(event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
              >
                {ACTION_OPTIONS.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div>
              <Label htmlFor="history-date-from" className="text-xs text-muted">
                Data de
              </Label>
              <Input
                id="history-date-from"
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(event) => setDateFrom(event.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="history-date-to" className="text-xs text-muted">
                Data até
              </Label>
              <Input
                id="history-date-to"
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(event) => setDateTo(event.target.value)}
                className="mt-1"
              />
            </div>
            {hasDateFilter && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-10"
                onClick={clearDateFilter}
              >
                <X className="h-4 w-4" />
                Limpar datas
              </Button>
            )}
          </div>

          <p className="text-xs text-muted">
            {loading
              ? 'Carregando...'
              : `${displayedEntries.length} registro${displayedEntries.length === 1 ? '' : 's'}`}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-2 text-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm">Carregando histórico...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 px-6 text-center">
              <AlertCircle className="h-6 w-6 text-danger" />
              <p className="text-sm text-muted">{error}</p>
              <Button type="button" size="sm" variant="secondary" onClick={fetchHistory}>
                Tentar novamente
              </Button>
            </div>
          )}

          {!loading && !error && displayedEntries.length === 0 && (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-2 px-6 text-center">
              <Inbox className="h-6 w-6 text-muted" />
              <p className="text-sm font-medium text-foreground">Nenhum registro encontrado</p>
              <p className="text-sm text-muted">
                {hasActiveFilters
                  ? 'Ajuste os filtros para ver mais resultados.'
                  : 'As ações sobre leads aparecerão aqui automaticamente.'}
              </p>
            </div>
          )}

          {!loading && !error && displayedEntries.length > 0 && (
            <ul className="space-y-3">
              {displayedEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg border border-border bg-surface-2/40 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          className={cn(
                            ACTION_STYLES[entry.action] || 'bg-brand-muted text-brand'
                          )}
                        >
                          {ACTION_LABELS[entry.action] || entry.action}
                        </Badge>
                        <span className="text-xs text-muted">
                          {formatDate(entry.created_at)}
                        </span>
                      </div>
                      <h2 className="truncate text-base font-semibold text-foreground">
                        {getLeadName(entry)}
                      </h2>
                    </div>

                    <p className="text-xs text-muted">
                      Via {ORIGIN_LABELS[entry.origem] || entry.origem || 'sistema'}
                      {entry.usuario ? ` · ${entry.usuario}` : ''}
                    </p>
                  </div>

                  <div className="mt-3 border-t border-border pt-3">
                    <HistoryDetails entry={entry} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default Historico;
