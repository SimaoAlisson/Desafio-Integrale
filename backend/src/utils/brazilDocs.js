/**
 * Utilitários centralizados de telefone e CPF/CNPJ (normalização, formatação e validação).
 * Espelhado no frontend em `frontend/src/lib/utils.js` para manter a mesma regra.
 */

function onlyDigits(value) {
  return String(value ?? '').replace(/\D/g, '');
}

/**
 * Normaliza telefone para dígitos.
 * Remove DDI 55 quando o número restante fica com 10 ou 11 dígitos.
 */
function normalizePhone(value) {
  let digits = onlyDigits(value);
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }
  return digits;
}

function isValidPhone(value) {
  const digits = normalizePhone(value);
  return [8, 9, 10, 11].includes(digits.length);
}

function formatPhone(value) {
  if (value == null || value === '') return null;

  const digits = normalizePhone(value);

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return digits || null;
}

/**
 * Normaliza CPF/CNPJ para apenas dígitos.
 * Remove máscaras e separadores (`.`, `-`, `/`, `_`, espaços e demais não numéricos)
 * antes de validar, persistir ou buscar. Campo opcional: string vazia se não houver dígitos.
 */
function normalizeCpfCnpj(value) {
  if (value == null || value === '') return '';
  return onlyDigits(value);
}

function isValidCpf(digits) {
  if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(digits[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(digits[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === Number(digits[10]);
}

function isValidCnpj(digits) {
  if (!/^\d{14}$/.test(digits) || /^(\d)\1{13}$/.test(digits)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i += 1) sum += Number(digits[i]) * weights1[i];
  let rest = sum % 11;
  const dig1 = rest < 2 ? 0 : 11 - rest;
  if (dig1 !== Number(digits[12])) return false;

  sum = 0;
  for (let i = 0; i < 13; i += 1) sum += Number(digits[i]) * weights2[i];
  rest = sum % 11;
  const dig2 = rest < 2 ? 0 : 11 - rest;
  return dig2 === Number(digits[13]);
}

/** Aceita vazio (campo opcional) ou CPF/CNPJ válido. */
function isValidCpfCnpj(value) {
  const digits = normalizeCpfCnpj(value);
  if (!digits) return true;
  if (digits.length === 11) return isValidCpf(digits);
  if (digits.length === 14) return isValidCnpj(digits);
  return false;
}

function formatCpfCnpj(value) {
  if (value == null || value === '') return null;

  const digits = normalizeCpfCnpj(value);

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }

  return digits || null;
}

module.exports = {
  onlyDigits,
  normalizePhone,
  isValidPhone,
  formatPhone,
  normalizeCpfCnpj,
  isValidCpf,
  isValidCnpj,
  isValidCpfCnpj,
  formatCpfCnpj,
};
