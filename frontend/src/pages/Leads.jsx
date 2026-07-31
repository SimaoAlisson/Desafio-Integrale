import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutList, Table2, Loader2, AlertCircle, Inbox, Search, X, Plus } from 'lucide-react';
import AppShell from '../components/AppShell';
import LeadList from '../components/LeadList';
import LeadTable from '../components/LeadTable';
import LeadDetail from '../components/LeadDetail';
import LeadDetailModal from '../components/LeadDetailModal';
import FieldFilters, {
  applyFieldFilters,
  hasFieldFilters,
} from '../components/FieldFilters';
import ConfirmDialog from '../components/ConfirmDialog';
import CollapsibleFilters from '../components/CollapsibleFilters';
import Snackbar from '../components/Snackbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { deleteLead, getLeads } from '../services/api';
import { cn, toDateKey } from '../lib/utils';

const EMPTY_FILTERS = { nome: [], empresa: [], email: [], origem: [] };

function NewLeadFab() {
  return (
    <Button
      asChild
      size="icon"
      className="absolute right-3 bottom-3 z-10 h-12 w-12 rounded-full shadow-lg shadow-brand/25 sm:right-4 sm:bottom-4"
      aria-label="Novo lead"
    >
      <Link to="/cadastro">
        <Plus className="h-5 w-5" />
      </Link>
    </Button>
  );
}

function Leads() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [modalLead, setModalLead] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [fieldFilters, setFieldFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [sortKey, setSortKey] = useState('nome');
  const [sortDir, setSortDir] = useState('asc');
  const [deleting, setDeleting] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getLeads(search);
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
      setError('Não foi possível carregar os leads. Verifique se a API está em execução.');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  function showSnackbar(message, type = 'success') {
    setSnackbar({ open: true, message, type });
  }

  function handleDelete(lead) {
    setLeadToDelete(lead);
  }

  function handleCancelDelete() {
    if (deleting) return;
    setLeadToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!leadToDelete) return;

    setDeleting(true);
    try {
      await deleteLead(leadToDelete.id);
      setSelectedLead(null);
      setModalLead(null);
      setLeadToDelete(null);
      showSnackbar('Lead movido para a lixeira');
      await fetchLeads();
    } catch (err) {
      showSnackbar(
        err.response?.data?.erro || 'Não foi possível excluir o lead.',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDir(key === 'created_at' ? 'desc' : 'asc');
  }

  function handleViewModeChange(mode) {
    setViewMode(mode);
    setModalLead(null);
    if (mode === 'table') {
      setSelectedLead(null);
    }
  }

  function handleSelectLead(lead) {
    if (viewMode === 'table') {
      setModalLead(lead);
      return;
    }
    setSelectedLead(lead);
  }

  function clearDateFilter() {
    setDateFrom('');
    setDateTo('');
  }

  function handleFieldFilterChange(key, value) {
    setFieldFilters((prev) => ({ ...prev, [key]: value }));
  }

  const hasDateFilter = Boolean(dateFrom || dateTo);
  const fieldFiltersActive = hasFieldFilters(fieldFilters);

  const displayedLeads = useMemo(() => {
    let result = applyFieldFilters(leads, fieldFilters);

    if (hasDateFilter) {
      result = result.filter((lead) => {
        const key = toDateKey(lead.created_at);
        if (!key) return false;
        if (dateFrom && key < dateFrom) return false;
        if (dateTo && key > dateTo) return false;
        return true;
      });
    }

    if (viewMode !== 'table') return result;

    return [...result].sort((a, b) => {
      let comparison = 0;

      if (sortKey === 'created_at') {
        comparison = new Date(a.created_at || 0) - new Date(b.created_at || 0);
      } else {
        comparison = String(a[sortKey] || '').localeCompare(String(b[sortKey] || ''), 'pt-BR', {
          sensitivity: 'base',
        });
      }

      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [leads, fieldFilters, viewMode, sortKey, sortDir, dateFrom, dateTo, hasDateFilter]);

  const isTableView = viewMode === 'table';
  const hasActiveFilters = Boolean(search || hasDateFilter || fieldFiltersActive);

  return (
    <AppShell>
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
                aria-label="Buscar leads"
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
                  <Label htmlFor="date-from" className="text-xs text-muted">
                    Data de
                  </Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    max={dateTo || undefined}
                    onChange={(event) => setDateFrom(event.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="date-to" className="text-xs text-muted">
                    Data até
                  </Label>
                  <Input
                    id="date-to"
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
                  : `${displayedLeads.length} lead${displayedLeads.length === 1 ? '' : 's'}`}
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
                <p className="text-sm">Carregando leads...</p>
              </div>
            )}

            {!loading && error && (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                <AlertCircle className="h-6 w-6 text-danger" />
                <p className="text-sm text-muted">{error}</p>
                <Button type="button" size="sm" variant="secondary" onClick={fetchLeads}>
                  Tentar novamente
                </Button>
              </div>
            )}

            {!loading && !error && displayedLeads.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <Inbox className="h-6 w-6 text-muted" />
                <p className="text-sm font-medium text-foreground">Nenhum lead encontrado</p>
                <p className="text-sm text-muted">
                  {hasActiveFilters
                    ? 'Ajuste a busca ou o filtro de datas.'
                    : 'Comece cadastrando o primeiro lead da central.'}
                </p>
              </div>
            )}

            {!loading && !error && displayedLeads.length > 0 && viewMode === 'list' && (
              <div className="h-full min-h-0">
                <LeadList
                  leads={displayedLeads}
                  selectedId={selectedLead?.id}
                  onSelect={handleSelectLead}
                />
              </div>
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
                />
              </div>
            )}
          </div>
        </section>

        {!isTableView && (
          <section className="relative min-h-[280px] bg-surface pb-16 lg:min-h-0">
            <LeadDetail lead={selectedLead} onDelete={handleDelete} deleting={deleting} />
            <NewLeadFab />
          </section>
        )}

        {isTableView && <NewLeadFab />}
      </div>

      <LeadDetailModal
        lead={modalLead}
        open={Boolean(modalLead)}
        onClose={() => setModalLead(null)}
        onDelete={handleDelete}
        deleting={deleting}
      />

      <ConfirmDialog
        open={Boolean(leadToDelete)}
        title="Mover para a lixeira?"
        description={
          leadToDelete
            ? `O lead "${leadToDelete.nome}" será movido para a lixeira e poderá ser restaurado depois.`
            : ''
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        confirming={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
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

export default Leads;
