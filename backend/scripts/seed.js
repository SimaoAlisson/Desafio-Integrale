/**
 * Seed de desenvolvimento — dados 100% fictícios.
 *
 * Uso:
 *   npm run seed           → insere massa (idempotente)
 *   npm run seed:cleanup   → remove apenas registros deste seed
 *
 * Não altera schema, .env nem dados que não sejam do seed
 * (identificados pelo domínio @seed.example.com).
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { createClient } = require('@supabase/supabase-js');

const SEED_DOMAIN = 'seed.example.com';
const SEED_MARK = '[SEED]';
const TOTAL_LEADS = 120;
const TRASH_COUNT = 20;
const BATCH_SIZE = 40;

const ORIGENS = [
  'Site',
  'Indicação',
  'Evento',
  'Redes Sociais',
  'LinkedIn',
  'WhatsApp',
  'Prospecção',
  'Parceiro',
  'Outbound',
  'Feira Comercial',
];

const EMPRESAS = [
  'Aurora Logística Fictícia Ltda',
  'NorteSul Comércio Demo',
  'Horizonte Digital Exemplo SA',
  'Campos Verdes Agronegócio Fake',
  'Atlas Soluções Empresariais (Teste)',
  'Brisa Tecnologia Example',
  'Ponto Certo Distribuidora Demo',
  'Vértice Consultoria Fictícia',
  'Lagoa Azul Indústria Example',
  'Serra Alta Serviços Demo ME',
  'Céu Aberto Marketing Fictício',
  'Riacho Doce Alimentos Teste',
  'Maresia Importação Example',
  'Pedra Branca Engenharia Demo',
  'Flor de Lis Cosméticos Fictícia',
  null,
];

const FIRST_NAMES = [
  'Ana',
  'Bruno',
  'Carla',
  'Diego',
  'Eduarda',
  'Fábio',
  'Gabriela',
  'Henrique',
  'Isabela',
  'João',
  'Karen',
  'Lucas',
  'Marina',
  'Nicolas',
  'Olívia',
  'Paulo',
  'Queila',
  'Rafael',
  'Sabrina',
  'Thiago',
  'Úrsula',
  'Vitor',
  'Wendy',
  'Xavier',
  'Yasmin',
  'Zeca',
  'Bárbara',
  'César',
  'Débora',
  'Érica',
  'Fernanda',
  'Gustavo',
  'Heloísa',
  'Ítalo',
  'Jéssica',
  'Kaique',
  'Lívia',
  'Márcio',
  'Natália',
  'Otávio',
];

const MIDDLE_NAMES = [
  'Clara',
  'Miguel',
  'Beatriz',
  'André',
  'Sofia',
  'Pedro',
  'Luísa',
  'Antônio',
  'Helena',
  'José',
  null,
  null,
  null,
];

const LAST_NAMES = [
  'Silva',
  'Santos',
  'Oliveira',
  'Souza',
  'Rodrigues',
  'Ferreira',
  'Almeida',
  'Pereira',
  'Lima',
  'Gomes',
  'Costa',
  'Ribeiro',
  'Martins',
  'Carvalho',
  'Rocha',
  'Nunes',
  'Mendes',
  'Barros',
  'Cardoso',
  'Teixeira',
  'Azevedo',
  'Cavalcanti',
  'Gonçalves',
  'Araújo',
  'Moraes',
];

const OBS_TEMPLATES = [
  'Cliente interessado em proposta comercial fictícia para Q3.',
  'Retornar contato na próxima semana — menção a orçamento.',
  'Pediu demonstração do produto exemplo.',
  'Indicação interna do time comercial (dados de teste).',
  'Preferência por contato via e-mail. Observação: urgência média.',
  'Mencionou necessidade de integração com ERP fictício.',
  'Participou do evento teste em São Paulo (cidade fictícia no contexto).',
  'Solicitou material sobre planos empresariais.',
  'Aguardando retorno após reunião de descoberta.',
  'Comentário com acentos: ação, organização, solução e expansão.',
  null,
  null,
  null,
];

function createSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Credenciais do Supabase não configuradas. Verifique SUPABASE_URL e SUPABASE_KEY no .env'
    );
  }

  const normalizedUrl = supabaseUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/$/, '');
  return createClient(normalizedUrl, supabaseKey);
}

/** UUID determinístico válido (v4-like) para idempotência. */
function seedLeadId(index) {
  const hex = String(index).padStart(12, '0');
  return `a0000000-0000-4000-8000-${hex}`;
}

function seedEmail(index) {
  return `lead${String(index).padStart(3, '0')}@${SEED_DOMAIN}`;
}

function buildName(index) {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const middle = MIDDLE_NAMES[index % MIDDLE_NAMES.length];
  const last = LAST_NAMES[index % LAST_NAMES.length];
  const last2 = LAST_NAMES[(index * 3) % LAST_NAMES.length];

  const group = index % 5;

  if (group === 0) {
    // ~20% nomes longos / compostos
    return `${first} ${middle || 'Maria'} ${last} ${last2}`.slice(0, 120);
  }
  if (group === 1) {
    // ~20% nomes simples
    return `${first} ${last}`;
  }
  if (group === 2 && middle) {
    return `${first} ${middle} ${last}`;
  }
  if (group === 3) {
    return `${first} ${last} ${last2}`;
  }
  return `${first} ${last}`;
}

function buildPhone(index) {
  const areaCodes = ['11', '21', '31', '41', '51', '61', '71', '81', '85', '92'];
  const ddd = areaCodes[index % areaCodes.length];
  const mode = index % 4;

  if (mode === 0) {
    // 11 dígitos (celular)
    return `${ddd}9${String(10000000 + (index % 89999999)).slice(0, 8)}`;
  }
  if (mode === 1) {
    // 10 dígitos (fix)
    return `${ddd}${String(30000000 + (index % 69999999)).slice(0, 8)}`;
  }
  if (mode === 2) {
    // 9 dígitos (cenário de borda aceito pela API)
    return `9${String(10000000 + index).slice(0, 8)}`;
  }
  // 8 dígitos
  return String(30000000 + (index % 69999999)).slice(0, 8);
}

function cpfCheckDigits(base9) {
  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(base9[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  const d1 = rest;

  const base10 = `${base9}${d1}`;
  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(base10[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return `${d1}${rest}`;
}

function cnpjCheckDigits(base12) {
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i += 1) sum += Number(base12[i]) * weights1[i];
  let rest = sum % 11;
  const d1 = rest < 2 ? 0 : 11 - rest;

  const base13 = `${base12}${d1}`;
  sum = 0;
  for (let i = 0; i < 13; i += 1) sum += Number(base13[i]) * weights2[i];
  rest = sum % 11;
  const d2 = rest < 2 ? 0 : 11 - rest;
  return `${d1}${d2}`;
}

/** ~1/3 CPF, ~1/3 CNPJ, ~1/3 sem documento (opcional). */
function buildCpfCnpj(index) {
  const group = index % 3;
  if (group === 0) return null;

  if (group === 1) {
    const base9 = String(100000000 + (index * 7919) % 899999999).slice(0, 9);
    return `${base9}${cpfCheckDigits(base9)}`;
  }

  const base12 = `0001${String(10000000 + (index * 104729) % 89999999).slice(0, 8)}`;
  return `${base12}${cnpjCheckDigits(base12)}`;
}

function buildEmpresa(index) {
  const group = index % 5;
  // ~20% mínimos / sem empresa; ~20% empresas longas
  if (group === 1) return null;
  if (group === 0) {
    return `Companhia Fictícia de Soluções Integradas e Serviços Especializados ${index}`.slice(
      0,
      120
    );
  }
  return EMPRESAS[index % EMPRESAS.length];
}

function buildObservacoes(index) {
  const group = index % 5;
  if (group === 1) return null; // dados mínimos
  if (group === 0) {
    return (
      `${SEED_MARK} Observação longa de teste nº ${index}. ` +
      'Inclui acentos (ação, coração, informações) e contexto comercial fictício. ' +
      'Palavras-chave para busca: orçamento, demonstração, integração, proposta. ' +
      'Cidade fictícia citada apenas no texto: Belo Horizonte / Campinas.'
    ).slice(0, 2000);
  }
  if (group === 3) {
    // contexto de “cargo” só no texto livre (não existe coluna cargo)
    return `${SEED_MARK} Contato fictício — perfil sugerido: analista comercial / coordenação.`;
  }
  return OBS_TEMPLATES[index % OBS_TEMPLATES.length];
}

function daysAgo(days, hour = 10, minute = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hour, minute, indexSafeSeconds(days), 0);
  return date.toISOString();
}

function indexSafeSeconds(n) {
  return n % 60;
}

function snapshot(lead) {
  return {
    nome: lead.nome,
    email: lead.email,
    telefone: lead.telefone,
    cpf_cnpj: lead.cpf_cnpj ?? null,
    empresa: lead.empresa,
    origem: lead.origem,
    observacoes: lead.observacoes,
    deleted_at: lead.deleted_at ?? null,
  };
}

function buildLeads() {
  const leads = [];

  for (let i = 1; i <= TOTAL_LEADS; i += 1) {
    const inTrash = i > TOTAL_LEADS - TRASH_COUNT;
    // Datas variadas: recentes, semanas, meses; alguns bem próximos
    let createdDays;
    if (i <= 15) createdDays = i % 3; // recentes / próximos
    else if (i <= 40) createdDays = 7 + (i % 14);
    else if (i <= 80) createdDays = 30 + (i % 60);
    else createdDays = 90 + (i % 120);

    const createdAt = daysAgo(createdDays, 8 + (i % 10), (i * 7) % 60);
    const deletedAt = inTrash
      ? daysAgo(Math.max(0, createdDays - 1), 15, (i * 3) % 60)
      : null;

    const nome = buildName(i);
    const email = seedEmail(i);
    const telefone = buildPhone(i);
    const cpf_cnpj = buildCpfCnpj(i);
    const empresa = buildEmpresa(i);
    const origem = ORIGENS[i % ORIGENS.length];
    const observacoes = buildObservacoes(i);

    leads.push({
      id: seedLeadId(i),
      nome,
      email,
      telefone,
      cpf_cnpj,
      empresa,
      origem,
      observacoes,
      created_at: createdAt,
      deleted_at: deletedAt,
    });
  }

  return leads;
}

function buildHistory(leads) {
  const history = [];

  for (const lead of leads) {
    const created = new Date(lead.created_at);
    const criacaoAt = new Date(created.getTime() + 1000).toISOString();

    history.push({
      lead_id: lead.id,
      action: 'criacao',
      old_values: null,
      new_values: snapshot({ ...lead, deleted_at: null }),
      usuario: 'seed-bot',
      origem: 'api',
      created_at: criacaoAt,
    });

    // ~25% com edição fictícia
    const index = Number(lead.id.slice(-12));
    if (index % 4 === 0) {
      const oldValues = snapshot({ ...lead, deleted_at: null });
      const newValues = {
        ...oldValues,
        origem: ORIGENS[(index + 1) % ORIGENS.length],
        observacoes:
          lead.observacoes ||
          `${SEED_MARK} Observação atualizada após follow-up fictício.`,
      };

      history.push({
        lead_id: lead.id,
        action: 'edicao',
        old_values: oldValues,
        new_values: newValues,
        usuario: 'seed-bot',
        origem: 'frontend',
        created_at: new Date(created.getTime() + 86_400_000).toISOString(),
      });

      // Mantém o lead alinhado ao "último estado" da edição (exceto soft delete)
      lead.origem = newValues.origem;
      lead.observacoes = newValues.observacoes;
    }

    if (lead.deleted_at) {
      history.push({
        lead_id: lead.id,
        action: 'exclusao',
        old_values: snapshot({ ...lead, deleted_at: null }),
        new_values: snapshot(lead),
        usuario: 'seed-bot',
        origem: 'frontend',
        created_at: lead.deleted_at,
      });
    }

    // Alguns ativos com ciclo exclusão + restauração no histórico
    if (!lead.deleted_at && index % 15 === 0) {
      const tempDeleted = new Date(created.getTime() + 2 * 86_400_000).toISOString();
      const restoredAt = new Date(created.getTime() + 3 * 86_400_000).toISOString();
      const before = snapshot({ ...lead, deleted_at: null });
      const mid = snapshot({ ...lead, deleted_at: tempDeleted });

      history.push({
        lead_id: lead.id,
        action: 'exclusao',
        old_values: before,
        new_values: mid,
        usuario: 'seed-bot',
        origem: 'frontend',
        created_at: tempDeleted,
      });

      history.push({
        lead_id: lead.id,
        action: 'restauracao',
        old_values: mid,
        new_values: before,
        usuario: 'seed-bot',
        origem: 'api',
        created_at: restoredAt,
      });
    }
  }

  return history;
}

async function insertBatches(supabase, table, rows) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) {
      throw new Error(`Falha ao inserir em ${table} (lote ${i / BATCH_SIZE + 1}): ${error.message}`);
    }
  }
}

async function countSeedLeads(supabase) {
  const { count, error } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .like('email', `%@${SEED_DOMAIN}`);

  if (error) throw new Error(`Falha ao contar leads do seed: ${error.message}`);
  return count || 0;
}

async function seed() {
  const supabase = createSupabase();
  const existing = await countSeedLeads(supabase);

  if (existing > 0) {
    console.log(
      `${SEED_MARK} Seed já aplicado (${existing} lead(s) com @${SEED_DOMAIN}). Nenhuma inserção.`
    );
    console.log('Para recriar, execute: npm run seed:cleanup && npm run seed');
    return;
  }

  const leads = buildLeads();
  const history = buildHistory(leads);

  console.log(`${SEED_MARK} Inserindo ${leads.length} leads fictícios...`);
  await insertBatches(supabase, 'leads', leads);

  console.log(`${SEED_MARK} Inserindo ${history.length} registros de histórico...`);
  await insertBatches(supabase, 'lead_history', history);

  const active = leads.filter((l) => !l.deleted_at).length;
  const trash = leads.filter((l) => l.deleted_at).length;

  console.log(`${SEED_MARK} Concluído.`);
  console.log(`  Leads: ${leads.length} (ativos: ${active}, lixeira: ${trash})`);
  console.log(`  Histórico: ${history.length}`);
  console.log(`  Domínio marcador: @${SEED_DOMAIN}`);
}

async function cleanup() {
  const supabase = createSupabase();
  const existing = await countSeedLeads(supabase);

  if (existing === 0) {
    console.log(`${SEED_MARK} Nenhum lead de seed encontrado. Nada a limpar.`);
    return;
  }

  const { data: seedLeads, error: listError } = await supabase
    .from('leads')
    .select('id')
    .like('email', `%@${SEED_DOMAIN}`);

  if (listError) throw new Error(`Falha ao listar leads do seed: ${listError.message}`);

  const ids = (seedLeads || []).map((row) => row.id);

  if (ids.length > 0) {
    const { error: historyError } = await supabase
      .from('lead_history')
      .delete()
      .in('lead_id', ids);

    if (historyError) {
      throw new Error(`Falha ao limpar histórico do seed: ${historyError.message}`);
    }

    const { error: leadsError } = await supabase.from('leads').delete().in('id', ids);
    if (leadsError) {
      throw new Error(`Falha ao limpar leads do seed: ${leadsError.message}`);
    }
  }

  console.log(
    `${SEED_MARK} Removidos ${ids.length} lead(s) de teste e o histórico associado.`
  );
}

async function main() {
  const mode = process.argv[2] || 'seed';

  if (mode === 'cleanup') {
    await cleanup();
    return;
  }

  if (mode !== 'seed') {
    console.error(`Modo desconhecido: ${mode}. Use "seed" ou "cleanup".`);
    process.exit(1);
  }

  await seed();
}

main().catch((error) => {
  console.error(`${SEED_MARK} Erro:`, error.message);
  process.exit(1);
});
