import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  Building2,
  MapPin,
  CalendarDays,
  StickyNote,
  UserRound,
  Pencil,
  Trash2,
  RotateCcw,
  IdCard,
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { formatCpfCnpj, formatDate, formatPhone } from '../lib/utils';

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 border-b border-border py-3 last:border-b-0">
      <div className="mt-0.5 text-muted">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-0.5 break-words text-sm text-foreground">{value || '—'}</p>
      </div>
    </div>
  );
}

function LeadDetail({ lead, onDelete, onRestore, deleting = false, restoring = false }) {
  if (!lead) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-muted">
          <UserRound className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Nenhum lead selecionado</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Selecione um lead na lista ao lado para visualizar os detalhes de contato e origem.
          </p>
        </div>
      </div>
    );
  }

  const isDeleted = Boolean(lead.deleted_at);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-border px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight break-words text-foreground sm:text-xl">
                {lead.nome}
              </h2>
              {isDeleted && (
                <Badge className="bg-danger-muted text-danger">Excluído</Badge>
              )}
            </div>
            <p className="mt-1 break-all text-sm text-muted">{lead.email}</p>
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            {lead.origem && (
              <span className="text-xs text-muted">{lead.origem}</span>
            )}
            {!isDeleted && (
              <>
                <Button asChild type="button" size="sm" variant="secondary" aria-label="Editar lead">
                  <Link to={`/editar/${lead.id}`}>
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Link>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-danger hover:bg-danger-muted"
                  onClick={() => onDelete?.(lead)}
                  disabled={deleting}
                  aria-label="Excluir lead"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </Button>
              </>
            )}
            {isDeleted && onRestore && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => onRestore(lead)}
                disabled={restoring}
                aria-label="Restaurar lead"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {restoring ? 'Restaurando...' : 'Restaurar'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-2 sm:px-5">
        <DetailRow icon={Mail} label="Email" value={lead.email} />
        <DetailRow icon={Phone} label="Telefone" value={formatPhone(lead.telefone)} />
        <DetailRow icon={IdCard} label="CPF/CNPJ" value={formatCpfCnpj(lead.cpf_cnpj)} />
        <DetailRow icon={Building2} label="Empresa" value={lead.empresa} />
        <DetailRow icon={MapPin} label="Origem" value={lead.origem} />
        <DetailRow icon={StickyNote} label="Observações" value={lead.observacoes} />
        <DetailRow icon={CalendarDays} label="Data de criação" value={formatDate(lead.created_at)} />
        {isDeleted && (
          <DetailRow
            icon={CalendarDays}
            label="Data de exclusão"
            value={formatDate(lead.deleted_at)}
          />
        )}
      </div>
    </div>
  );
}

export default LeadDetail;
