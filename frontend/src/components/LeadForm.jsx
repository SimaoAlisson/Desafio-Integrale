import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import SuggestInput from './SuggestInput';
import ConfirmDialog from './ConfirmDialog';
import { uniqueFieldValues } from './FieldFilters';
import { createLead, getLeads, updateLead } from '../services/api';
import {
  formatCpfCnpj,
  formatCpfCnpjInput,
  formatPhone,
  formatPhoneInput,
  isValidCpfCnpj,
  isValidPhone,
  normalizeCpfCnpj,
  normalizePhone,
} from '../lib/utils';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM = {
  nome: '',
  email: '',
  telefone: '',
  empresa: '',
  origem: '',
  observacoes: '',
  cpf_cnpj: '',
};

function toFormValues(lead) {
  if (!lead) return INITIAL_FORM;

  return {
    nome: lead.nome || '',
    email: lead.email || '',
    telefone: lead.telefone ? formatPhone(lead.telefone) : '',
    empresa: lead.empresa || '',
    origem: lead.origem || '',
    observacoes: lead.observacoes || '',
    cpf_cnpj: lead.cpf_cnpj ? formatCpfCnpj(lead.cpf_cnpj) : '',
  };
}

function validate(form) {
  const errors = {};

  if (!form.nome.trim()) {
    errors.nome = 'Informe o nome do lead';
  }

  if (!form.email.trim()) {
    errors.email = 'Informe o email';
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'Informe um email válido';
  }

  if (!form.telefone.trim()) {
    errors.telefone = 'Informe o telefone';
  } else if (!isValidPhone(form.telefone)) {
    errors.telefone = 'Informe um telefone válido';
  }

  if (!form.origem.trim()) {
    errors.origem = 'Informe a origem do lead';
  }

  if (form.cpf_cnpj.trim() && !isValidCpfCnpj(form.cpf_cnpj)) {
    errors.cpf_cnpj = 'Informe um CPF ou CNPJ válido';
  }

  return errors;
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs text-danger" role="alert">
      {message}
    </p>
  );
}

function LeadForm({ lead = null, onSuccess }) {
  const isEditing = Boolean(lead?.id);
  const [form, setForm] = useState(() => toFormValues(lead));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [empresaOptions, setEmpresaOptions] = useState([]);
  const [origemOptions, setOrigemOptions] = useState([]);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const submitIntentRef = useRef('button');

  useEffect(() => {
    setForm(toFormValues(lead));
    setErrors({});
    setApiError('');
    setSuccessMessage('');
    setConfirmSaveOpen(false);
  }, [lead]);

  useEffect(() => {
    let cancelled = false;

    async function loadSuggestions() {
      try {
        const response = await getLeads();
        if (cancelled) return;
        const data = response.data || [];
        setEmpresaOptions(uniqueFieldValues(data, 'empresa'));
        setOrigemOptions(uniqueFieldValues(data, 'origem'));
      } catch {
        if (!cancelled) {
          setEmpresaOptions([]);
          setOrigemOptions([]);
        }
      }
    }

    loadSuggestions();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === 'telefone') {
      nextValue = formatPhoneInput(value);
    } else if (name === 'cpf_cnpj') {
      nextValue = formatCpfCnpjInput(value);
    }

    setForm((prev) => ({ ...prev, [name]: nextValue }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError('');
    setSuccessMessage('');
  }

  function handleObservacoesKeyDown(event) {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    submitIntentRef.current = 'enter';
    setConfirmSaveOpen(true);
  }

  function handleCancelConfirmSave() {
    if (submitting) return;
    setConfirmSaveOpen(false);
    submitIntentRef.current = 'button';
  }

  async function saveLead() {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setConfirmSaveOpen(false);
      return;
    }

    setSubmitting(true);
    setApiError('');
    setSuccessMessage('');

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      telefone: normalizePhone(form.telefone),
      empresa: form.empresa.trim() || null,
      origem: form.origem.trim(),
      observacoes: form.observacoes.trim() || null,
      cpf_cnpj: normalizeCpfCnpj(form.cpf_cnpj) || null,
    };

    try {
      const response = isEditing
        ? await updateLead(lead.id, payload)
        : await createLead(payload);

      if (!isEditing) {
        setForm(INITIAL_FORM);
      }

      setErrors({});
      setConfirmSaveOpen(false);
      setSuccessMessage(
        response.mensagem ||
          (isEditing ? 'Lead atualizado com sucesso' : 'Lead cadastrado com sucesso')
      );

      if (payload.empresa) {
        setEmpresaOptions((prev) =>
          prev.includes(payload.empresa)
            ? prev
            : [...prev, payload.empresa].sort((a, b) => a.localeCompare(b, 'pt-BR'))
        );
      }
      if (payload.origem) {
        setOrigemOptions((prev) =>
          prev.includes(payload.origem)
            ? prev
            : [...prev, payload.origem].sort((a, b) => a.localeCompare(b, 'pt-BR'))
        );
      }

      onSuccess?.(response.data);
    } catch (error) {
      const details = error.response?.data?.detalhes;
      const message =
        error.response?.data?.erro ||
        (isEditing
          ? 'Não foi possível atualizar o lead. Tente novamente.'
          : 'Não foi possível cadastrar o lead. Tente novamente.');

      if (Array.isArray(details) && details.length > 0) {
        setApiError(`${message}: ${details.join('; ')}`);
      } else if (typeof details === 'string' && details.trim()) {
        setApiError(details);
      } else {
        setApiError(message);
      }
      setConfirmSaveOpen(false);
    } finally {
      setSubmitting(false);
      submitIntentRef.current = 'button';
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (submitIntentRef.current === 'enter') {
      return;
    }

    saveLead();
  }

  function handleConfirmSave() {
    saveLead();
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {successMessage && (
          <div
            className="rounded-md border border-success-border bg-success-muted px-4 py-3 text-sm text-success"
            role="status"
          >
            {successMessage}
          </div>
        )}

        {apiError && (
          <div
            className="rounded-md border border-danger-border bg-danger-muted px-4 py-3 text-sm text-danger"
            role="alert"
          >
            {apiError}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Nome completo"
              className="mt-1.5"
              aria-invalid={Boolean(errors.nome)}
              aria-describedby={errors.nome ? 'erro-nome' : undefined}
            />
            <FieldError id="erro-nome" message={errors.nome} />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@empresa.com"
              className="mt-1.5"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'erro-email' : undefined}
            />
            <FieldError id="erro-email" message={errors.email} />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              placeholder="(11) 99999-8888"
              inputMode="tel"
              autoComplete="tel"
              className="mt-1.5"
              aria-invalid={Boolean(errors.telefone)}
              aria-describedby={errors.telefone ? 'erro-telefone' : undefined}
            />
            <FieldError id="erro-telefone" message={errors.telefone} />
          </div>

          <div>
            <SuggestInput
              id="empresa"
              name="empresa"
              label="Empresa"
              value={form.empresa}
              onChange={handleChange}
              options={empresaOptions}
              placeholder="Digite ou selecione uma empresa"
            />
          </div>

          <div>
            <SuggestInput
              id="origem"
              name="origem"
              label="Origem"
              required
              value={form.origem}
              onChange={handleChange}
              options={origemOptions}
              placeholder="Digite ou selecione uma origem"
              error={errors.origem}
              errorId="erro-origem"
            />
            <FieldError id="erro-origem" message={errors.origem} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
            <Input
              id="cpf_cnpj"
              name="cpf_cnpj"
              value={form.cpf_cnpj}
              onChange={handleChange}
              placeholder="Opcional — CPF ou CNPJ"
              inputMode="numeric"
              className="mt-1.5"
              aria-invalid={Boolean(errors.cpf_cnpj)}
              aria-describedby={errors.cpf_cnpj ? 'erro-cpf-cnpj' : undefined}
            />
            <FieldError id="erro-cpf-cnpj" message={errors.cpf_cnpj} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              onKeyDown={handleObservacoesKeyDown}
              placeholder="Contexto comercial, interesse, próximos passos... (Enter para salvar, Shift+Enter para nova linha)"
              className="mt-1.5 min-h-[96px]"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse items-stretch gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-end">
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting
              ? 'Salvando...'
              : isEditing
                ? 'Salvar alterações'
                : 'Cadastrar lead'}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmSaveOpen}
        title="Salvar lead?"
        description={
          isEditing
            ? 'Tem certeza que deseja salvar as alterações deste lead?'
            : 'Tem certeza que deseja salvar este lead?'
        }
        confirmLabel="Salvar"
        cancelLabel="Cancelar"
        confirming={submitting}
        tone="default"
        onConfirm={handleConfirmSave}
        onCancel={handleCancelConfirmSave}
      />
    </>
  );
}

export default LeadForm;
