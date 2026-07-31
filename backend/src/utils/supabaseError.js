/**
 * Normaliza erros do PostgREST/Supabase para respostas HTTP previsíveis.
 * Mensagens detalhadas de setup ficam no log; o status 503 sinaliza indisponibilidade.
 */
function mapSupabaseError(error, fallbackMessage, { missingRelationHint } = {}) {
  const message = error?.message || fallbackMessage;
  const err = new Error(message);
  err.status = 500;
  err.code = error?.code;
  err.setupHint = null;

  if (error?.code === '42501' || /row-level security/i.test(message)) {
    err.status = 503;
    err.setupHint =
      'O Supabase bloqueou a operação por Row Level Security (RLS). ' +
      'Execute o script backend/schema.sql no SQL Editor.';
    err.message = err.setupHint;
  }

  // Postgres: "column X does not exist" | PostgREST PGRST204: "Could not find the 'X' column"
  const missingColumnOrRelation =
    error?.code === 'PGRST204' ||
    /column .* does not exist/i.test(message) ||
    /could not find the ['`].*['`] column/i.test(message) ||
    /relation .* does not exist/i.test(message);

  if (missingColumnOrRelation) {
    err.status = 503;
    err.setupHint =
      missingRelationHint ||
      'O schema no Supabase está incompleto. Execute backend/schema.sql no SQL Editor.';
    err.message = err.setupHint;
  }

  return err;
}

module.exports = {
  mapSupabaseError,
};
