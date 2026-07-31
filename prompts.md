1° Prompt, IA: Cursor
Criei as pastas e os arquivos necessários para o desenvolvimento do sistema, as dependências estão instaladas e o arquivo .env configurado com:

SUPABASE_URL
SUPABASE_KEY

Não altere meu .env.

Preciso que você desenvolva apenas o backend seguindo boas práticas de organização.

Tecnologias obrigatórias:
- Node.js
- Express.js
- Supabase como banco PostgreSQL
- JavaScript (não usar TypeScript)

Objetivo:
Criar uma API REST para gerenciamento de Leads.

Funcionalidades necessárias:

1) Criar Lead

Endpoint:
POST /api/leads

Receber JSON:

{
  nome,
  email,
  telefone,
  empresa,
  origem,
  observacoes
}

Regras:
- nome obrigatório
- email obrigatório e validar formato
- telefone obrigatório e validar formato permitido 8, 9, 10 e 11 caracteres
- origem obrigatória

Retornar:
- 201 Created quando cadastrar com sucesso
- 400 Bad Request para dados inválidos
- 500 Internal Server Error para erros inesperados

2) Listar Leads

Endpoint:
GET /api/leads

Requisitos:
- Buscar todos os leads cadastrados
- Ordenar do mais recente para o mais antigo

Adicionar filtro:

GET /api/leads?search=valor

O filtro deve pesquisar por:
- nome
- origem

Utilizar filtro no banco através do Supabase, não no frontend.

Responsabilidades:

supabase.js:
- Criar conexão usando @supabase/supabase-js
- Ler credenciais através do .env

services:
- Responsável pela comunicação com Supabase
- Não colocar regra de negócio no controller

controllers:
- Receber requisição
- Validar dados
- Retornar respostas HTTP

routes:
- Definir endpoints

middlewares:
- Tratamento centralizado de erros

---

Requisitos adicionais:

- Usar async/await
- Usar try/catch
- Não deixar credenciais expostas
- Criar mensagens de erro claras
- Código limpo e fácil de explicar em entrevista

Também adicione ao:
- README.md explicando como executar o backend
- comentários apenas onde agregarem valor

Antes de criar os arquivos, analise a estrutura existente e mantenha o padrão atual do projeto.

Após gerar o código, explique:
1. Como a requisição percorre a aplicação
2. Como o Supabase está sendo acessado
3. Quais decisões técnicas foram tomadas
4. Quais pontos eu preciso saber explicar em uma entrevista técnica

2° Prompt, IA: Cursor:
Agora que o backend já está pronto e possui uma API REST de Leads.

Preciso criar o frontend consumindo essa API.

Objetivo:
Criar uma interface moderna e profissional para cadastro e acompanhamento de leads.

A ideia visual é uma central comercial inspirada em ferramentas de atendimento como WhatsApp/CRM, mas sem visual exagerado que resulte em distrações

A aplicação deve ser um sistema corporativo, focado em oferecer o cadastro e a busca desses leads de forma intuitiva dinamica e prática .

Tecnologias:
- React
- Vite
- JavaScript
- CSS moderno
- Axios para comunicação HTTP

Não usar bibliotecas pesadas de UI, utilize shadcn/ui + Tailwind CSS


Funcionalidades obrigatórias:

1. Tela principal - Gestão de Leads

Criar uma tela dividida em duas áreas:

Lado esquerdo:
- Lista de leads cadastrados
- Campo de busca por nome, origem ou email
- Nome do lead
- Empresa (caso tenha)
- Origem do lead
- Data de criação
- Destaque visual do lead selecionado
- Moldura separando cada lead

Também adicionar toggle, que alterna para visualização em tabela, permitir ordenação por ordem alfabética tanto no nome, email e origem

A data deve poder ser ordenada, como padrão do mais recente para o mais antigo e ao clicar do mais antigo para o mais recente

Lado direito:
- Detalhes do lead selecionado
- Nome
- Email
- Telefone
- Empresa
- Origem
- Observações
- Data de criação

Caso nenhum lead esteja selecionado:
mostrar uma mensagem amigável orientando selecionar um lead.

2. Cadastro de novo lead

Criar formulário para adicionar novos leads.

Campos:

- Nome
- Email
- Telefone
- Empresa
- Origem
- Observações

O formulário deve:

- Validar campos obrigatórios
- Validar email
- Mostrar mensagens de erro amigáveis
- Exibir feedback de sucesso após cadastro
- Atualizar a lista automaticamente após salvar

O cadastro pode ser realizado através da aba de Cadastro ou de um botão fluturante com o texto "+" que ficará no canto inferior direito do card da direita

3. Integração com API

utilizar uma camada separada para chamadas HTTP:

Exemplo:

src/services/api.js (isso já está criado, basta utilizar a estrutura atual)


Usar:

GET:
http://localhost:3000/api/leads

Com filtro:

http://localhost:3000/api/leads?search=valor


POST:

http://localhost:3000/api/leads


Não colocar chamadas axios diretamente nos componentes.


Requisitos de UX:

- Interface responsiva
- Layout semelhante a um CRM moderno
- Design limpo e profissional
- Boa hierarquia visual
- Tema claro e escuro com botão para alternar, utilizando por padrão o tema do navegador do usuário
- Estados:
  - carregando leads
  - erro ao buscar dados
  - lista vazia
  - cadastro realizado


Criar uma identidade visual profissional:

Referência:
- sistemas SaaS
- CRM
- atendimento comercial

Evitar:
- excesso de animações
- muitos componentes desnecessários

Antes de gerar o código:
Analise a estrutura atual do projeto.

Depois atualize o README.md:

1. Como o frontend está organizado
2. Como ele conversa com a API

3° Prompt, IA: Cursor
Antes de escrever qualquer código, analise todo o projeto para entender a arquitetura existente, os padrões utilizados e como as funcionalidades atuais foram implementadas.

Seu objetivo é implementar as funcionalidades abaixo mantendo o mesmo padrão do projeto, evitando duplicação de código e preservando a organização da aplicação.

FUNCIONALIDADE 1 - EXCLUSÃO LÓGICA (LIXEIRA)

Atualmente os leads podem apenas ser criados.

Implemente um sistema completo de exclusão lógica (Soft Delete).

Requisitos:

- Não excluir registros fisicamente do banco.
- Adicionar um campo apropriado (deletedAt, deleted, status ou equivalente).
- Leads excluídos não devem aparecer na listagem principal.
- Criar um botão "Lixeira".
- A lixeira deve listar apenas os leads excluídos.
- Deve ser possível:
  - Restaurar um lead.
- Registrar data da exclusão.
- Manter compatibilidade com a API existente.

FUNCIONALIDADE 2 - EDIÇÃO DE LEADS

Implementar edição completa.

Ao clicar em "Editar":

- Abrir o mesmo formulário utilizado na criação.
- Carregar todos os dados do lead.
- Permitir alteração de todos os campos.
- Validar os dados exatamente como no cadastro.
- Atualizar via API.

FUNCIONALIDADE 3 - HISTÓRICO (AUDITORIA)

Criar um sistema de histórico.

Toda alteração deve gerar um registro.

Registrar:

- criação
- edição
- exclusão
- restauração

Cada registro deve conter:

- tipo da ação
- data/hora
- ID do lead
- valores antigos
- novos valores
- usuário (caso exista autenticação)
- origem da ação

O histórico deve ser facilmente consultável.

FRONTEND

Adicionar:

botão de histórico no canto superior direito, ao lado do botão da lixeira e do botão de alternar tema
botão da lixeira no canto superior direito, ao lado do botão de alternar tema
botão Editar no canto superior direito da aba que mostra os detalhes do lead
botão Excluir no canto superior direito da aba que mostra os detalhes do lead
confirmação antes de excluir
botão Restaurar na lixeira
barra de busca e filtros de data dentro da lixeira
indicador visual de registros excluídos
feedback visual (Snackbar)
loading states
tratamento de erros

Manter o design atual.

Não criar componentes desnecessários.

BACKEND

Atualizar:

- Models
- DTOs
- Controllers
- Services
- Repositories
- Rotas

Garantir:

- validações
- tratamento de erros
- respostas HTTP corretas
- tipagem consistente
- código limpo

4° Prompt, IA: Cursor

SEGURANÇA

Após terminar as implementações, faça uma auditoria completa do projeto.

Analise:

API

- validação de entrada
- sanitização
- tratamento de exceções
- status HTTP corretos
- exposição de erros internos
- proteção contra SQL Injection
- proteção contra NoSQL Injection (se aplicável)
- CORS
- variáveis de ambiente
- uso de .env
- logs
- organização das rotas

Banco

- integridade dos dados
- índices
- relacionamentos
- migrations
- consistência

Frontend

- tratamento de erros
- validação
- organização
- componentes reutilizáveis
- gerenciamento de estado
- acessibilidade
- responsividade

Código

Avalie:

- Clean Code
- SOLID
- DRY
- KISS
- legibilidade
- tipagem
- separação de responsabilidades
- organização das pastas

DESAFIO TÉCNICO

Compare toda a implementação com o desafio descrito em:

https://github.com/Integrale-Gestao-Empresarial/processo-seletivo-analista-ti

Verifique se o projeto atende aos requisitos propostos.

Identifique:

- itens atendidos
- itens parcialmente atendidos
- itens não atendidos
- melhorias recomendadas

MELHORIAS

Caso encontre oportunidades de melhoria que aumentem a qualidade do projeto sem fugir do escopo do desafio, implemente-as.

Exemplos:

- melhor tratamento de erros
- melhorias de UX
- refatorações simples
- organização do código
- componentes reutilizáveis
- performance
- documentação

IMPORTANTE

- Não quebrar funcionalidades existentes.
- Não alterar a arquitetura sem necessidade.
- Manter consistência com o restante do projeto.
- Gerar código limpo e bem comentado apenas quando necessário.
- Ao finalizar, apresentar um relatório contendo:

1. O que foi implementado.
2. Arquivos modificados.
3. Melhorias realizadas.
4. Problemas encontrados.
5. Vulnerabilidades identificadas.
6. Como foram corrigidas.
7. O nível geral de qualidade do projeto (0 a 10).
8. O nível de aderência ao desafio técnico (0 a 10).
9. O que ainda poderia ser melhorado antes da entrega.

5° Prompt, IA: Cursor. Utilizei o chat GPT para me ajudar a criar esse prompt, enviei a estrutura da tabela e solicitei um prompt para inserir dezenas de dados ficticios para testar o sistema.

Quero que você crie uma massa de dados fictícios para testar completamente o sistema de gestão de leads.

IMPORTANTE:

* Os dados devem ser 100% fictícios.
* Não utilize dados reais de pessoas.
* Não altere a estrutura atual do banco.
* Não altere as regras de negócio existentes.
* Não altere o frontend para acomodar os dados.
* Não altere o `.env`.
* A massa deve ser compatível com o schema atual do Supabase.
* Antes de inserir os dados, analise o schema e os campos reais existentes no projeto.
* Não invente colunas que não existem.

1. QUANTIDADE

Crie pelo menos **100 leads fictícios**.

Distribua os dados de maneira variada para permitir testes reais de:

* listagem;
* pesquisa;
* filtros;
* paginação futura;
* ordenação;
* visualização de detalhes;
* edição;
* exclusão/lixeira;
* histórico;
* diferentes tamanhos de nomes;
* diferentes empresas;
* diferentes cargos;
* diferentes cidades/estados;
* diferentes datas;
* diferentes status, caso o sistema possua status.

2. DADOS REALISTAS

Os dados devem parecer uma base real, mas serem claramente fictícios.

Utilize nomes brasileiros fictícios variados, por exemplo:

* nomes simples;
* nomes compostos;
* sobrenomes diferentes;
* nomes maiores.

Não repita os mesmos dados desnecessariamente.

Para empresas, utilize nomes fictícios variados.

Para e-mails, utilize domínios reservados para exemplos/testes quando possível, como:

`example.com`

Evite utilizar e-mails de pessoas reais.

Para telefones, utilize números claramente fictícios e compatíveis com o formato esperado pelo sistema.

3. VARIAÇÃO DOS DADOS

Crie uma distribuição variada.

Por exemplo:

* aproximadamente 20% com dados mais completos;
* aproximadamente 20% com dados mínimos;
* aproximadamente 20% com nomes maiores;
* aproximadamente 20% com diferentes empresas/cargos;
* aproximadamente 20% com combinações variadas.

Caso existam campos opcionais no schema, não preencha todos os campos em todos os registros.

Isso permitirá testar como o frontend se comporta com informações ausentes.

4. DATAS

Distribua as datas dos leads ao longo de diferentes períodos.

Inclua registros:

* recentes;
* de algumas semanas atrás;
* de meses atrás;
* com datas próximas entre si.

Isso deve ajudar a testar a ordenação e visualização temporal.

Utilize datas válidas e compatíveis com o banco.

5. HISTÓRICO

Caso exista uma tabela de histórico/auditoria relacionada aos leads, crie também registros fictícios de histórico.

Não crie histórico aleatório desconectado dos leads.

Cada registro de histórico deve:

* apontar para um lead existente;
* utilizar uma ação válida aceita pelo sistema;
* possuir timestamps coerentes;
* representar eventos plausíveis.

Crie diferentes tipos de ações disponíveis no sistema, como criação, edição, exclusão/restauração etc., mas SOMENTE se essas ações realmente existirem no código/schema.

6. TESTAR CASOS DE BORDA

Além dos dados normais, inclua alguns casos planejados para testar o frontend:

* nome relativamente longo;
* empresa relativamente longa;
* cargo relativamente longo;
* texto com acentos;
* caracteres como `ã`, `ç`, `é`, `õ`;
* campos opcionais vazios, quando permitidos;
* registros próximos no horário;
* registros com informações parcialmente preenchidas.

Não utilize dados maliciosos.

7. E-MAILS DUPLICADOS

ATENÇÃO:

O projeto possui uma regra de unicidade para e-mails ativos.

Portanto:

* NÃO insira e-mails duplicados entre leads ativos;
* se quiser testar a regra de duplicidade, crie separadamente um cenário/documentação de teste que tente inserir um e-mail já existente;
* não deixe a massa inicial quebrar a constraint.

8. STATUS / LIXEIRA

Caso o sistema possua soft delete, status ou campo equivalente:

Crie uma quantidade de registros em diferentes estados, respeitando exatamente os valores aceitos pelo schema.

Inclua, por exemplo:

* leads ativos;
* leads excluídos/inativos;

somente se esses estados realmente existirem no projeto.

A maioria deve permanecer ativa para que a tela inicial fique populada.

9. COMO IMPLEMENTAR

Antes de gerar os dados:

1. Leia o schema atual.
2. Leia `supabase-setup.sql`.
3. Leia os services/controllers relacionados aos leads.
4. Identifique todos os campos obrigatórios.
5. Identifique constraints.
6. Identifique valores permitidos.
7. Identifique relacionamento com histórico.
8. Identifique o formato esperado pelo Supabase.

Depois disso, crie um arquivo específico para popular o banco.

Preferencialmente:

`backend/seed.sql`

ou, caso a estrutura atual do projeto torne mais adequado:

`backend/scripts/seed.js`

Escolha a abordagem mais coerente com o projeto atual.

10. SEGURANÇA

O seed deve ser claramente identificado como dados de desenvolvimento/teste.

Não deve:

* conter secrets;
* conter API keys;
* conter credenciais;
* alterar configurações de produção;
* apagar dados automaticamente;
* executar DELETE/TRUNCATE destrutivo por padrão.

IMPORTANTE:

Não faça um script que apague toda a base antes de inserir os dados.

Se precisar permitir limpeza da massa posteriormente, crie uma operação separada e explicitamente identificada.

11. IDEMPOTÊNCIA

Sempre que possível, faça o seed de forma idempotente.

Ou seja, executar o script duas vezes não deve gerar uma quantidade infinita de duplicatas ou quebrar constraints.

Se a implementação idempotente não for adequada ao projeto atual, explique no README/arquivo do seed como utilizá-lo corretamente.

12. TESTES MANUAIS

Depois de inserir os dados, faça uma revisão para verificar se conseguimos testar:

Tela inicial

* listagem populada;
* cards/estatísticas, caso existam;
* diferentes informações visíveis.

Busca

Teste termos:

* nome;
* empresa;
* e-mail;
* parte do nome;
* termo inexistente;
* termo com acentos.

Modal

Abra leads diferentes e verifique:

* dados completos;
* dados parcialmente preenchidos;
* textos longos.

Edição

Edite pelo menos um registro.

Exclusão

Teste a lixeira/exclusão e restauração, caso exista.

Histórico

Verifique se as ações aparecem corretamente.

Tabela

Verifique:

* muitas linhas;
* textos longos;
* navegação;
* ações;
* responsividade.

Tema

Verifique a massa de dados nos temas claro e escuro.

13. DOCUMENTAÇÃO

Atualize o `README.md` adicionando uma seção:

Dados de teste

Explique:

* que o projeto possui uma massa de dados fictícios;
* onde está o seed;
* como executar;
* quantos registros são criados;
* que os dados são destinados exclusivamente a desenvolvimento/testes.

Exemplo conceitual:

```bash
# exemplo — utilize o comando real do projeto
npm run seed
```

Não invente um comando.

Se for necessário criar um novo script no `package.json`, faça isso de forma coerente com os scripts existentes.

14. RELATÓRIO FINAL

Ao terminar:

* informe quantos leads foram criados;
* informe quantos registros de histórico foram criados;
* informe quais estados/status foram utilizados;
* informe qual arquivo foi criado;
* informe como executar o seed;
* informe se foram encontrados problemas com constraints;
* informe quais testes foram realizados.

IMPORTANTE:

Não considere o trabalho concluído apenas porque o arquivo foi criado.

Execute o seed no ambiente de desenvolvimento disponível, valide que os dados foram inseridos corretamente e verifique se o sistema continua funcionando com essa massa de dados.

Não altere dados reais existentes.

---

## Nota sobre ajustes incrementais

Além dos prompts principais acima, ao longo do desenvolvimento também houve pedidos pontuais de refinamento (layout mobile, busca/formatação de telefone, CPF/CNPJ opcional, confirmação ao salvar com Enter nas observações, etc.). Esses ajustes complementares não substituem os prompts centrais documentados neste arquivo — ver também a seção “Uso de IA e prompts” no `README.md`.
