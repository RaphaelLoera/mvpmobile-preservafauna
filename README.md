# Preserva Fauna

PWA para produtores rurais e moradores da região serrana de Teresópolis/RJ,
voltada à convivência segura com felinos e outros animais silvestres.

## Dados dos Integrantes da Equipe

| Integrantes
|---|---|
| Raphael Loera 
| VALDELY DA COSTA FRANCISCO JUNIOR


## Situação-Problema Escolhida

Produtores rurais e moradores da região serrana podem ter dificuldade para
identificar animais silvestres, registrar avistamentos e conflitos, acessar
orientações de prevenção e compartilhar informações de forma segura.

Além disso, a conectividade pode ser limitada em áreas rurais. O Preserva
Fauna foi pensado para permitir o registro local de ocorrências mesmo sem
internet e sincronizar os dados quando houver conexão e autenticação.

## Descrição do MVP

O MVP oferece:

- autenticação de produtores por e-mail e senha;
- uso como visitante, sem necessidade de criar conta;
- catálogo de espécies com informações de identificação, habitat e prevenção;
- registro de ocorrências com animal, impacto, data, localidade, coordenadas,
  observações e foto;
- histórico local e fila de sincronização offline;
- mapa de ocorrências, conflitos, avistamentos e áreas protegidas;
- alertas de conflitos próximos à propriedade ou localidade de referência;
- perfil com propriedade, idioma, tema, modo campo e notificações;
- suporte a português, inglês e espanhol;
- interface responsiva para celular, tablet e desktop;
- funcionamento como PWA, com cache de conteúdos essenciais.

O frontend está em [`frontend/`](./frontend) e a API está em
[`backend/`](./backend). A documentação do contrato da API está em
[`docs/api.md`](./docs/api.md).

### Como Executar o MVP Localmente

### Pré-requisitos

- Node.js 20 ou superior;
- npm;
- uma instância PostgreSQL, preferencialmente um projeto Supabase;
- Git, caso o projeto seja obtido por clone.

### 1. Configurar o backend

```bash
cd backend
npm install
cp .env.example .env
```

Edite o arquivo `backend/.env` e informe a conexão do PostgreSQL, o segredo
JWT e a origem permitida do frontend. Nunca compartilhe ou versione esse
arquivo.

Depois, gere o cliente Prisma e atualize o banco:

```bash
npm run prisma:generate
npm run prisma:push
```

### 2. Iniciar a API

Em um terminal:

```bash
cd backend
npm run dev
```

A API ficará disponível em `http://localhost:3333`. O endpoint
`http://localhost:3333/health` pode ser usado para verificar se ela está ativa.

### 3. Iniciar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente
`http://localhost:5175` ou `http://localhost:5173`.

Durante o desenvolvimento, o Vite encaminha as requisições `/api` para o
backend em `http://localhost:3333`. O prefixo `/api` é mantido no frontend,
mesmo com a organização das pastas em `backend/` e `frontend/`.

### Instalação como PWA

O frontend possui manifesto, ícones e Service Worker. Em desenvolvimento, o
Service Worker também é habilitado pelo Vite para permitir a validação da
instalação em `localhost`.

Para instalar em um celular, publique o frontend em HTTPS. Acesso por
`localhost` é considerado seguro pelo navegador, mas um endereço HTTP da rede
local, como `http://192.168.x.x:5173`, normalmente não permite a instalação.

### Builds de produção

```bash
cd backend
npm run build
npm start
```

Em outro terminal:

```bash
cd frontend
npm run build
npm run preview
```

## Rotas Principais da Aplicação

As rotas abaixo são relativas à API em desenvolvimento
(`http://localhost:3333`). No frontend, elas são acessadas com o prefixo
`/api`.

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `GET` | `/health` | Não | Verifica se a API está disponível. |
| `POST` | `/auth/register` | Não | Cria uma conta de produtor. |
| `POST` | `/auth/login` | Não | Autentica e retorna token e usuário. |
| `GET` | `/species` | Não | Lista o catálogo de espécies. |
| `GET` | `/map/points` | Opcional | Lista pontos de ocorrências e conflitos com privacidade geográfica. |
| `GET` | `/alerts?lat&lon&km=5` | Não | Lista conflitos recentes dentro do raio informado. |
| `POST` | `/incidents` | Produtor | Registra uma ocorrência. |
| `POST` | `/sync` | Produtor | Publica a fila local de ocorrências sem duplicá-las. |

O corpo esperado para `POST /incidents` é:

```json
{
  "id": "uuid-gerado-no-dispositivo",
  "predator": "onça-parda",
  "animal": "galinha",
  "quantity": 1,
  "impact": "predação",
  "notes": "Observação opcional",
  "occurredAt": "2026-11-16T18:30:00.000Z",
  "locality": "Teresópolis",
  "lat": -22.4165,
  "lon": -42.9754
}
```

Para detalhes dos contratos, consulte [`docs/api.md`](./docs/api.md).

## Informações Adicionais Relevantes

- Senhas são armazenadas como hash com bcrypt.
- Rotas protegidas utilizam JWT.
- Dados de entrada são validados no backend com Zod.
- A API utiliza Helmet, CORS configurável e limitação de requisições.
- Coordenadas podem ser aproximadas conforme o perfil do usuário.
- Registros de visitantes permanecem no dispositivo até que o usuário faça
  login e autorize a sincronização.
- O catálogo, o mapa e os registros locais possuem estratégias de cache e uso
  offline.
- Os segredos e as URLs de banco devem permanecer somente em variáveis de
  ambiente.

## Estado do Projeto

MVP em evolução incremental, com foco em:

- experiência do usuário no registro e consulta de ocorrências e espécies;
- funcionamento offline e sincronização segura dos registros;
- privacidade das coordenadas e robustez da API;
- padronização de requisitos, rotas e documentação;
- evolução futura dos painéis técnico e administrativo.

Os perfis técnico e administrador já estão previstos no banco de dados, mas
ainda não possuem painéis próprios na interface.
