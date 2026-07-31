import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  AlertCircle,
  Inbox,
  Search,
  X,
  RotateCcw,
  LayoutList,
  Table2,
} from 'lucide-react';
import AppShell from '../components/AppShell';
import LeadDetail from '../components/LeadDetail';
import LeadDetailModal from '../components/LeadDetailModal';
import LeadTable from '../components/LeadTable';
import FieldFilters, {
  applyFieldFilters,
  hasFieldFilters,
} from '../components/FieldFilters';
import CollapsibleFilters from '../components/CollapsibleFilters';
import Snackbar from '../components/Snackbar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { getTrashLeads, restoreLead } from '../services/api';
import { cn, formatDate, toDateKey } from '../lib/utils';

const EMPTY_FILTERS = { nome: [], empresa: [], email: [], origem: [] };

const TRASH_COLUMNS = [
  { key: 'nome', label: 'Nome', type: 'text' },
  { key: 'telefone', label: 'Telefone', type: 'phone' },
  { key: 'cpf_cnpj', label: 'CPF/CNPJ', type: 'cpf_cnpj', hideBelow: 'md' },
  { key: 'email', label: 'Email', type: 'text', hideBelow: 'md' },
  { key: 'origem', label: 'Origem', type: 'text', hideBelow: 'lg' },
  { key: 'deleted_at', label: 'Excluído em', type: 'date', hideBelow: 'sm' },
];

function Lixeira() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [modalLead, setModalLead] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [fieldFilters, setFieldFilters] = useState(EMPTY_FILTERS);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [sortKey, setSortKey] = useState('deleted_at');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getTrashLeads(search);
      const data = response.data || [];
      setLeads(data);

      setSelectedLead((current) => {
        if (!current) return null;
        return data.find((lead) => lead.id === current.id) || null;
      });
      setModalLead((current) => {
        if (!current) return null;
        return data.find((lead) => lead.id === current.id) || null;
      });
    } catch {
      setError('Não foi possível carregar a lixeira. Verifique se a API está em execução.');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  function showSnackbar(message, type = 'success') {
    setSnackbar({ open: true, message, type });
  }

  async function handleRestore(lead) {
    setBusyId(lead.id);
    try {
      await restoreLead(lead.id);
      showSnackbar(`Lead "${lead.nome}" restaurado`);
      setSelectedLead(null);
      setModalLead(null);
      await fetchTrash();
    } catch (err) {
      showSnackbar(
        err.response?.data?.erro || 'Não foi possível restaurar o lead.',
        'error'
      );
    } finally {
      setBusyId(null);
    }
  }

  function clearDateFilter() {
    setDateFrom('');
    setDateTo('');
  }

  function handleFieldFilterChange(key, value) {
    setFieldFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleSelectLead(lead) {
    if (viewMode === 'table') {
      setModalLead(lead);
      return;
    }
    setSelectedLead(lead);
  }

  function handleViewModeChange(mode) {
    setViewMode(mode);
    setSelectedLead(null);
    setModalLead(null);
  }

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir(key === 'deleted_at' ? 'desc' : 'asc');
  }

  const hasDateFilter = Boolean(dateFrom || dateTo);
  const fieldFiltersActive = hasFieldFilters(fieldFilters);

  const displayedLeads = useMemo(() => {
    let result = applyFieldFilters(leads, fieldFilters);

    if (hasDateFilter) {
      result = result.filter((lead) => {
        const key = toDateKey(lead.deleted_at || lead.created_at);
        if (!key) return false;
        if (dateFrom && key < dateFrom) return false;
        if (dateTo && key > dateTo) return false;
        return true;
      });
    }

    if (viewMode !== 'table') return result;

    return [...result].sort((a, b) => {
      const left = a[sortKey] ?? '';
      const right = b[sortKey] ?? '';

      let comparison = 0;
      if (sortKey === 'deleted_at' || sortKey === 'created_at') {
        comparison = new Date(left).getTime() - new Date(right).getTime();
      } else {
        comparison = String(left).localeCompare(String(right), 'pt-BR', {
          sensitivity: 'base',
        });
      }

      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [
    leads,
    fieldFilters,
    dateFrom,
    dateTo,
    hasDateFilter,
    viewMode,
    sortKey,
    sortDir,
  ]);

  const isTableView = viewMode === 'table';
  const hasActiveFilters = Boolean(search || hasDateFilter || fieldFiltersActive);

  return (
    <AppShell>
      <div className="mb-4 shrink-0">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Lixeira</h1>
        <p className="mt-1 text-sm text-muted">
          Leads excluídos logicamente. É possível restaurá-los a qualquer momento.
        </p>
      </div>

      <div
        className={cn(
          'relative grid min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-surface shadow-sm',
          !isTableView && 'lg:grid-cols-[minmax(min(100%,340px),520px)_1fr]'
        )}
      >
        <section
          className={cn(
            'flex min-h-[360px] flex-col overflow-hidden lg:min-h-0',
            !isTableView && 'border-b border-border lg:border-b-0 lg:border-r'
          )}
        >
          <div className="space-y-3 border-b border-border p-3 sm:p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Buscar por nome, email, telefone, CPF/CNPJ..."
                className="pl-9"
                aria-label="Buscar na lixeira"
              />
            </div>

            <CollapsibleFilters
              open={filtersOpen}
              onToggle={() => setFiltersOpen((prev) => !prev)}
            >
              <FieldFilters
                leads={leads}
                filters={fieldFilters}
                onChange={handleFieldFilterChange}
              />

              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <div>
                  <Label htmlFor="trash-date-from" className="text-xs text-muted">
                    Exclusão de
                  </Label>
                  <Input
                    id="trash-date-from"
                    type="date"
                    value={dateFrom}
                    max={dateTo || undefined}
                    onChange={(event) => setDateFrom(event.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="trash-date-to" className="text-xs text-muted">
                    Exclusão até
                  </Label>
                  <Input
                    id="trash-date-to"
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
            </CollapsibleFilters>

            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted">
                {loading
                  ? 'Carregando...'
                  : `${displayedLeads.length} lead${displayedLeads.length === 1 ? '' : 's'} na lixeira`}
              </p>

              <div className="inline-flex rounded-md border border-border p-0.5">
                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  className={cn('h-8 gap-1.5', viewMode === 'list' && 'bg-surface-2')}
                  onClick={() => handleViewModeChange('list')}
                  aria-pressed={viewMode === 'list'}
                >
                  <LayoutList className="h-3.5 w-3.5" />
                  Lista
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  className={cn('h-8 gap-1.5', viewMode === 'table' && 'bg-surface-2')}
                  onClick={() => handleViewModeChange('table')}
                  aria-pressed={viewMode === 'table'}
                >
                  <Table2 className="h-3.5 w-3.5" />
                  Tabela
                </Button>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            {loading && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-sm">Carregando lixeira...</p>
              </div>
            )}

            {!loading && error && (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                <AlertCircle className="h-6 w-6 text-danger" />
                <p className="text-sm text-muted">{error}</p>
                <Button type="button" size="sm" variant="secondary" onClick={fetchTrash}>
                  Tentar novamente
                </Button>
              </div>
            )}

            {!loading && !error && displayedLeads.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <Inbox className="h-6 w-6 text-muted" />
                <p className="text-sm font-medium text-foreground">Lixeira vazia</p>
                <p className="text-sm text-muted">
                  {hasActiveFilters
                    ? 'Ajuste a busca ou os filtros.'
                    : 'Nenhum lead excluído no momento.'}
                </p>
              </div>
            )}

            {!loading && !error && displayedLeads.length > 0 && viewMode === 'list' && (
              <ul className="h-full space-y-2 overflow-y-auto overscroll-contain p-3">
                {displayedLeads.map((lead) => {
                  const selected = lead.id === selectedLead?.id;
                  const busy = busyId === lead.id;

                  return (
                    <li key={lead.id}>
                      <div
                        className={cn(
                          'rounded-lg border px-3 py-3',
                          selected
                            ? 'border-brand bg-brand-muted shadow-sm'
                            : 'border-border bg-surface hover:border-muted hover:bg-surface-2'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedLead(lead)}
                          className="flex w-full flex-col gap-1 text-left"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className={cn('font-medium', selected && 'text-brand')}>
                                {lead.nome}
                              </span>
                              {lead.empresa && (
                                <span className="ml-1.5 text-sm font-normal text-muted opacity-70">
                                  · {lead.empresa}
                                </span>
                              )}
                            </div>
                            <Badge className="bg-danger-muted text-danger">Excluído</Badge>
                          </div>
                          <p className="text-xs text-muted">
                            Excluído em {formatDate(lead.deleted_at)}
                          </p>
                          {lead.origem && (
                            <p className="text-xs text-muted">{lead.origem}</p>
                          )}
                        </button>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => handleRestore(lead)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Restaurar
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {!loading && !error && displayedLeads.length > 0 && viewMode === 'table' && (
              <div className="h-full min-h-0">
                <LeadTable
                  leads={displayedLeads}
                  selectedId={modalLead?.id}
                  onSelect={handleSelectLead}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  columns={TRASH_COLUMNS}
                  renderActions={(lead) => (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={busyId === lead.id}
                      onClick={() => handleRestore(lead)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restaurar
                    </Button>
                  )}
                />
              </div>
            )}
          </div>
        </section>

        {!isTableView && (
          <section className="min-h-[320px] bg-surface lg:min-h-0">
            <LeadDetail
              lead={selectedLead}
              onRestore={handleRestore}
              restoring={busyId === selectedLead?.id}
            />
          </section>
        )}
      </div>

      <LeadDetailModal
        lead={modalLead}
        open={Boolean(modalLead)}
        onClose={() => setModalLead(null)}
        onRestore={handleRestore}
        restoring={busyId === modalLead?.id}
      />

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </AppShell>
  );
}

export default Lixeira;
