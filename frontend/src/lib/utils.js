import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(value) {
  if (!value) return '—';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

/** Retorna a data local no formato YYYY-MM-DD */
export function toDateKey(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function onlyDigits(value) {
  return String(value ?? '').replace(/\D/g, '');
}

/**
 * Normaliza telefone para dígitos.
 * Remove DDI 55 quando o número restante fica com 10 ou 11 dígitos.
 */
export function normalizePhone(value) {
  let digits = onlyDigits(value);
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }
  return digits;
}

export function isValidPhone(value) {
  const digits = normalizePhone(value);
  return [8, 9, 10, 11].includes(digits.length);
}

export function formatPhone(value) {
  if (!value) return '—';

  const digits = normalizePhone(value);

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return digits || '—';
}

/** Máscara progressiva para o input de telefone (até 11 dígitos). */
export function formatPhoneInput(value) {
  const digits = normalizePhone(value).slice(0, 11);

  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Normaliza CPF/CNPJ para apenas dígitos.
 * Remove máscaras e separadores (`.`, `-`, `/`, `_`, espaços e demais não numéricos)
 * antes de validar, salvar ou exibir. Espelha `backend/src/utils/brazilDocs.js`.
 */
export function normalizeCpfCnpj(value) {
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

/** Aceita vazio (opcional) ou CPF/CNPJ válido. */
export function isValidCpfCnpj(value) {
  const digits = normalizeCpfCnpj(value);
  if (!digits) return true;
  if (digits.length === 11) return isValidCpf(digits);
  if (digits.length === 14) return isValidCnpj(digits);
  return false;
}

export function formatCpfCnpj(value) {
  if (!value) return '—';

  const digits = normalizeCpfCnpj(value);

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }

  return digits || '—';
}

/** Máscara progressiva para CPF (11) ou CNPJ (14). */
export function formatCpfCnpjInput(value) {
  const digits = normalizeCpfCnpj(value).slice(0, 14);

  if (!digits) return '';

  if (digits.length <= 11) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}
