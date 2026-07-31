const supabase = require('../config/supabase');
const historyService = require('./historyService');
const { mapSupabaseError } = require('../utils/supabaseError');
const { tokenizeSearchTerms } = require('../utils/validators');
const { onlyDigits } = require('../utils/brazilDocs');

const TABLE = 'leads';

const LEAD_FIELDS = [
  'nome',
  'email',
  'telefone',
  'empresa',
  'origem',
  'observacoes',
  'cpf_cnpj',
];
const SEARCH_FIELDS = [
  'nome',
  'email',
  'empresa',
  'origem',
  'observacoes',
  'telefone',
  'cpf_cnpj',
];

/**
 * Busca parcial em texto + variante só com dígitos para telefone/CPF/CNPJ.
 * Aceita entrada com ou sem máscara (ex.: 12.345.678/0001-90, 12_345_678/0001-90).
 */
function buildSearchOrFilter(token) {
  const parts = SEARCH_FIELDS.map((field) => `${field}.ilike.%${token}%`);
  const digits = onlyDigits(token);

  if (digits.length >= 2) {
    parts.push(`telefone.ilike.%${digits}%`);
    parts.push(`cpf_cnpj.ilike.%${digits}%`);
  }

  return [...new Set(parts)].join(',');
}

function pickLeadSnapshot(lead) {
  if (!lead) return null;
  const snapshot = {};
  for (const field of LEAD_FIELDS) {
    snapshot[field] = lead[field] ?? null;
  }
  snapshot.deleted_at = lead.deleted_at ?? null;
  return snapshot;
}

async function safeRecordHistory(payload) {
  try {
    await historyService.recordHistory(payload);
  } catch (error) {
    console.error('[Histórico] Falha ao registrar auditoria (operação do lead mantida):', {
      action: payload.action,
      leadId: payload.leadId,
      message: error.message,
    });
  }
}

async function createLead(leadData, meta = {}) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ ...leadData, deleted_at: null }])
    .select()
    .single();

  if (error) {
    throw mapSupabaseError(error, 'Falha ao cadastrar lead no banco de dados', {
      missingRelationHint:
        'A tabela leads está incompleta no Supabase. Execute backend/schema.sql ou a migration backend/migrations/001_add_cpf_cnpj.sql (coluna cpf_cnpj).',
    });
  }

  await safeRecordHistory({
    leadId: data.id,
    action: 'criacao',
    oldValues: null,
    newValues: pickLeadSnapshot(data),
    usuario: meta.usuario || null,
    origem: meta.origem || 'api',
  });

  return data;
}

async function listLeads(search, { deleted = false } = {}) {
  let query = supabase
    .from(TABLE)
    .select('*')
    .order(deleted ? 'deleted_at' : 'created_at', { ascending: false });

  if (deleted) {
    query = query.not('deleted_at', 'is', null);
  } else {
    query = query.is('deleted_at', null);
  }

  const tokens = tokenizeSearchTerms(search);
  for (const token of tokens) {
    // Cada palavra precisa aparecer em algum campo (match parcial, não texto inteiro)
    query = query.or(buildSearchOrFilter(token));
  }

  const { data, error } = await query;

  if (error) {
    throw mapSupabaseError(error, 'Falha ao listar leads no banco de dados', {
      missingRelationHint:
        'A tabela leads está incompleta no Supabase. Execute backend/schema.sql ou a migration backend/migrations/001_add_cpf_cnpj.sql (coluna cpf_cnpj).',
    });
  }

  return data;
}

async function getLeadById(id, { includeDeleted = false } = {}) {
  let query = supabase.from(TABLE).select('*').eq('id', id);

  if (!includeDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw mapSupabaseError(error, 'Falha ao buscar lead no banco de dados', {
      missingRelationHint:
        'A tabela leads está incompleta no Supabase. Execute backend/schema.sql ou a migration backend/migrations/001_add_cpf_cnpj.sql (coluna cpf_cnpj).',
    });
  }

  return data;
}

async function updateLead(id, leadData, meta = {}) {
  const current = await getLeadById(id);

  if (!current) {
    const err = new Error('Lead não encontrado');
    err.status = 404;
    throw err;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(leadData)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) {
    throw mapSupabaseError(error, 'Falha ao atualizar lead no banco de dados', {
      missingRelationHint:
        'A tabela leads está incompleta no Supabase. Execute backend/schema.sql ou a migration backend/migrations/001_add_cpf_cnpj.sql (coluna cpf_cnpj).',
    });
  }

  await safeRecordHistory({
    leadId: data.id,
    action: 'edicao',
    oldValues: pickLeadSnapshot(current),
    newValues: pickLeadSnapshot(data),
    usuario: meta.usuario || null,
    origem: meta.origem || 'api',
  });

  return data;
}

async function softDeleteLead(id, meta = {}) {
  const current = await getLeadById(id);

  if (!current) {
    const err = new Error('Lead não encontrado');
    err.status = 404;
    throw err;
  }

  const deletedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from(TABLE)
    .update({ deleted_at: deletedAt })
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) {
    throw mapSupabaseError(error, 'Falha ao excluir lead no banco de dados', {
      missingRelationHint:
        'A tabela leads está incompleta no Supabase. Execute backend/schema.sql ou a migration backend/migrations/001_add_cpf_cnpj.sql (coluna cpf_cnpj).',
    });
  }

  await safeRecordHistory({
    leadId: data.id,
    action: 'exclusao',
    oldValues: pickLeadSnapshot(current),
    newValues: pickLeadSnapshot(data),
    usuario: meta.usuario || null,
    origem: meta.origem || 'api',
  });

  return data;
}

async function restoreLead(id, meta = {}) {
  const current = await getLeadById(id, { includeDeleted: true });

  if (!current) {
    const err = new Error('Lead não encontrado');
    err.status = 404;
    throw err;
  }

  if (!current.deleted_at) {
    const err = new Error('Lead não está na lixeira');
    err.status = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update({ deleted_at: null })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw mapSupabaseError(error, 'Falha ao restaurar lead no banco de dados', {
      missingRelationHint:
        'A tabela leads está incompleta no Supabase. Execute backend/schema.sql ou a migration backend/migrations/001_add_cpf_cnpj.sql (coluna cpf_cnpj).',
    });
  }

  await safeRecordHistory({
    leadId: data.id,
    action: 'restauracao',
    oldValues: pickLeadSnapshot(current),
    newValues: pickLeadSnapshot(data),
    usuario: meta.usuario || null,
    origem: meta.origem || 'api',
  });

  return data;
}

module.exports = {
  createLead,
  listLeads,
  getLeadById,
  updateLead,
  softDeleteLead,
  restoreLead,
};
