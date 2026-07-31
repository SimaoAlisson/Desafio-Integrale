-- Execute no SQL Editor do Supabase (Dashboard → SQL → New query → Run)
-- Observação de segurança: as políticas RLS abaixo são permissivas para o desafio
-- (API Node como ponto de entrada). Em produção, use a service role só no backend
-- e restrinja as políticas anon (ex.: using (false)) ou autenticação Supabase Auth.

-- Tabela base (idempotente caso o projeto ainda não tenha a tabela)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  telefone text not null,
  empresa text,
  origem text not null,
  observacoes text,
  cpf_cnpj text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Colunas extras (projetos que já tinham a tabela)
alter table leads add column if not exists observacoes text;
alter table leads add column if not exists deleted_at timestamptz;
alter table leads add column if not exists cpf_cnpj text;

-- Histórico de auditoria
create table if not exists lead_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid,
  action text not null check (
    action in ('criacao', 'edicao', 'exclusao', 'restauracao')
  ),
  old_values jsonb,
  new_values jsonb,
  usuario text,
  origem text not null default 'api',
  created_at timestamptz not null default now()
);

-- FK (aditiva; órfãos existentes recebem SET NULL se o lead for removido fisicamente)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'fk_lead_history_lead'
  ) then
    alter table lead_history
      add constraint fk_lead_history_lead
      foreign key (lead_id) references leads(id) on delete set null;
  end if;
end $$;

create index if not exists idx_leads_deleted_at on leads (deleted_at);
create index if not exists idx_leads_created_at on leads (created_at desc);
create index if not exists idx_leads_nome on leads (nome);
create index if not exists idx_leads_origem on leads (origem);

-- Unique parcial: um e-mail ativo não pode se repetir.
-- Se já existirem e-mails duplicados entre leads com deleted_at IS NULL,
-- resolva as duplicatas antes de executar este índice (senão o CREATE falha).
create unique index if not exists idx_leads_email_ativos
  on leads (lower(email))
  where deleted_at is null;

create index if not exists idx_lead_history_lead_id on lead_history (lead_id);
create index if not exists idx_lead_history_created_at on lead_history (created_at desc);

-- RLS leads
alter table leads enable row level security;

drop policy if exists "Permitir leitura de leads" on leads;
drop policy if exists "Permitir inserção de leads" on leads;
drop policy if exists "Permitir atualização de leads" on leads;
drop policy if exists "Permitir exclusão de leads" on leads;

create policy "Permitir leitura de leads"
on leads for select using (true);

create policy "Permitir inserção de leads"
on leads for insert with check (true);

create policy "Permitir atualização de leads"
on leads for update using (true) with check (true);

create policy "Permitir exclusão de leads"
on leads for delete using (true);

-- RLS histórico
alter table lead_history enable row level security;

drop policy if exists "Permitir leitura de histórico" on lead_history;
drop policy if exists "Permitir inserção de histórico" on lead_history;

create policy "Permitir leitura de histórico"
on lead_history for select using (true);

create policy "Permitir inserção de histórico"
on lead_history for insert with check (true);
