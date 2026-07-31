require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Credenciais do Supabase não configuradas. Verifique SUPABASE_URL e SUPABASE_KEY no arquivo .env'
  );
}

// O client espera a URL base do projeto (ex.: https://xxx.supabase.co),
// mesmo que o .env contenha o sufixo /rest/v1 usado pela API REST.
const normalizedUrl = supabaseUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '');

const supabase = createClient(normalizedUrl, supabaseKey);

module.exports = supabase;
