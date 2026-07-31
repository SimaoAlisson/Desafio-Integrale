const supabase = require('../config/supabase');
const { mapSupabaseError } = require('../utils/supabaseError');
const { sanitizeSearchTerm } = require('../utils/validators');

const TABLE = 'lead_history';

async function recordHistory({
  leadId,
  action,
  oldValues = null,
  newValues = null,
  usuario = null,
  origem = 'api',
}) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([
      {
        lead_id: leadId,
        action,
        old_values: oldValues,
        new_values: newValues,
        usuario,
        origem,
      },
    ])
    .select()
    .single();

  if (error) {
    throw mapSupabaseError(error, 'Falha ao registrar histórico', {
      missingRelationHint:
        'A tabela lead_history está ausente ou incompleta no Supabase. Execute o script backend/schema.sql no SQL Editor.',
    });
  }

  return data;
}

async function listHistory({ leadId, action, search } = {}) {
  let query = supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (leadId) {
    query = query.eq('lead_id', leadId);
  }

  if (action) {
    query = query.eq('action', action);
  }

  const { data, error } = await query;

  if (error) {
    throw mapSupabaseError(error, 'Falha ao listar histórico', {
      missingRelationHint:
        'A tabela lead_history está ausente ou incompleta no Supabase. Execute o script backend/schema.sql no SQL Editor.',
    });
  }

  const term = sanitizeSearchTerm(search);
  if (!term) {
    return data;
  }

  const lowered = term.toLowerCase();
  return data.filter((entry) => {
    const haystack = [
      entry.action,
      entry.origem,
      entry.usuario,
      entry.lead_id,
      JSON.stringify(entry.old_values || {}),
      JSON.stringify(entry.new_values || {}),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(lowered);
  });
}

module.exports = {
  recordHistory,
  listHistory,
};
