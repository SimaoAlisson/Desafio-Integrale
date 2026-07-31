const {
  normalizePhone,
  isValidPhone,
  normalizeCpfCnpj,
  isValidCpfCnpj,
} = require('./brazilDocs');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const FIELD_LIMITS = {
  nome: 120,
  email: 254,
  origem: 80,
  empresa: 120,
  observacoes: 2000,
};

const HISTORY_ACTIONS = new Set(['criacao', 'edicao', 'exclusao', 'restauracao']);

function isValidUuid(value) {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

function validateLeadPayload(body) {
  const errors = [];
  const { nome, email, telefone, origem, empresa, observacoes, cpf_cnpj } = body || {};

  if (!nome || typeof nome !== 'string' || !nome.trim()) {
    errors.push('O campo "nome" é obrigatório');
  } else if (nome.trim().length > FIELD_LIMITS.nome) {
    errors.push(`O campo "nome" deve ter no máximo ${FIELD_LIMITS.nome} caracteres`);
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('O campo "email" é obrigatório');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('O campo "email" possui formato inválido');
  } else if (email.trim().length > FIELD_LIMITS.email) {
    errors.push(`O campo "email" deve ter no máximo ${FIELD_LIMITS.email} caracteres`);
  }

  if (!telefone || typeof telefone !== 'string' || !telefone.trim()) {
    errors.push('O campo "telefone" é obrigatório');
  } else if (!isValidPhone(telefone)) {
    errors.push('O campo "telefone" deve ser um telefone válido');
  }

  if (!origem || typeof origem !== 'string' || !origem.trim()) {
    errors.push('O campo "origem" é obrigatório');
  } else if (origem.trim().length > FIELD_LIMITS.origem) {
    errors.push(`O campo "origem" deve ter no máximo ${FIELD_LIMITS.origem} caracteres`);
  }

  if (empresa != null && typeof empresa === 'string' && empresa.trim().length > FIELD_LIMITS.empresa) {
    errors.push(`O campo "empresa" deve ter no máximo ${FIELD_LIMITS.empresa} caracteres`);
  }

  if (
    observacoes != null &&
    typeof observacoes === 'string' &&
    observacoes.trim().length > FIELD_LIMITS.observacoes
  ) {
    errors.push(
      `O campo "observacoes" deve ter no máximo ${FIELD_LIMITS.observacoes} caracteres`
    );
  }

  if (cpf_cnpj != null && typeof cpf_cnpj === 'string' && cpf_cnpj.trim()) {
    if (!isValidCpfCnpj(cpf_cnpj)) {
      errors.push('O campo "cpf_cnpj" deve ser um CPF ou CNPJ válido');
    }
  } else if (cpf_cnpj != null && typeof cpf_cnpj !== 'string') {
    errors.push('O campo "cpf_cnpj" deve ser um texto');
  }

  return errors;
}

function sanitizeLeadBody(body) {
  const { nome, email, telefone, empresa, origem, observacoes, cpf_cnpj } = body;
  const cpfDigits = normalizeCpfCnpj(cpf_cnpj);

  return {
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    telefone: normalizePhone(telefone),
    empresa: empresa?.trim() || null,
    origem: origem.trim(),
    observacoes: observacoes?.trim() || null,
    cpf_cnpj: cpfDigits || null,
  };
}

/**
 * Sanitiza termo de busca para PostgREST (.or / ilike).
 * Remove caracteres de formatação comuns em telefone/CPF/CNPJ
 * (`.`, `-`, `/`, `_`, parênteses, vírgula, `%`) para não quebrar o filtro
 * nem impedir o match — a busca numérica complementar usa só dígitos.
 */
function sanitizeSearchTerm(search, maxLength = 50) {
  if (!search || typeof search !== 'string' || !search.trim()) return '';
  return search.trim().slice(0, maxLength).replace(/[,.()%/_\\-]/g, '');
}

/** Quebra a busca em palavras (mín. 2 caracteres) para match parcial. */
function tokenizeSearchTerms(search, maxLength = 50) {
  const cleaned = sanitizeSearchTerm(search, maxLength);
  if (!cleaned) return [];

  const tokens = cleaned
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  // Se o usuário digitou algo curto demais após o split, mantém o termo inteiro
  if (tokens.length === 0 && cleaned.length >= 1) {
    return [cleaned];
  }

  return [...new Set(tokens)];
}

function isAllowedHistoryAction(action) {
  return typeof action === 'string' && HISTORY_ACTIONS.has(action);
}

module.exports = {
  FIELD_LIMITS,
  isValidUuid,
  validateLeadPayload,
  sanitizeLeadBody,
  sanitizeSearchTerm,
  tokenizeSearchTerms,
  isAllowedHistoryAction,
};
