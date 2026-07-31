import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import AppShell from '../components/AppShell';
import LeadForm from '../components/LeadForm';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { getLead } from '../services/api';
import { cn } from '../lib/utils';

function Cadastro() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const redirectTimer = useRef(null);

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState('');
  const [keepRegistering, setKeepRegistering] = useState(false);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isEditing) {
      setLead(null);
      setLoading(false);
      setError('');
      return undefined;
    }

    let cancelled = false;

    async function loadLead() {
      setLoading(true);
      setError('');

      try {
        const response = await getLead(id);
        if (!cancelled) {
          setLead(response.data);
        }
      } catch {
        if (!cancelled) {
          setError('Não foi possível carregar o lead para edição.');
          setLead(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLead();

    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  function handleSuccess() {
    if (!isEditing && keepRegistering) {
      return;
    }

    redirectTimer.current = setTimeout(() => {
      navigate('/');
    }, 900);
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {isEditing ? 'Editar lead' : 'Cadastrar novo lead'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isEditing
              ? 'Atualize os dados do contato comercial. Campos com * são obrigatórios.'
              : 'Preencha os dados do contato comercial. Campos com * são obrigatórios.'}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm">Carregando lead...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <AlertCircle className="h-6 w-6 text-danger" />
              <p className="text-sm text-muted">{error}</p>
              <Button type="button" size="sm" variant="secondary" onClick={() => navigate('/')}>
                Voltar para leads
              </Button>
            </div>
          )}

          {!loading && !error && (
            <>
              {!isEditing && (
                <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2/50 px-4 py-3">
                  <div className="min-w-0">
                    <Label htmlFor="keep-registering" className="text-sm text-foreground">
                      Cadastrar vários leads
                    </Label>
                    <p className="mt-0.5 text-xs text-muted">
                      Mantém esta tela aberta após cada cadastro.
                    </p>
                  </div>
                  <button
                    id="keep-registering"
                    type="button"
                    role="switch"
                    aria-checked={keepRegistering}
                    onClick={() => setKeepRegistering((prev) => !prev)}
                    className={cn(
                      'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                      keepRegistering ? 'bg-brand' : 'bg-border'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                        keepRegistering && 'translate-x-5'
                      )}
                    />
                  </button>
                </div>
              )}

              <LeadForm lead={isEditing ? lead : null} onSuccess={handleSuccess} />
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default Cadastro;
