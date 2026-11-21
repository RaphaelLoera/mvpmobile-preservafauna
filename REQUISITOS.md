# Preserva Fauna

## 1. Visão geral

O Preserva Fauna é uma PWA para produtores rurais e moradores da região serrana de Teresópolis/RJ. O sistema apoia a convivência segura com felinos e outros animais silvestres por meio de:

- catálogo de espécies;
- registro de avistamentos e conflitos;
- mapa de ocorrências;
- orientações de prevenção;
- funcionamento offline;
- sincronização com o Supabase quando houver conexão e autenticação.

## 2. Perfis de usuário

| Perfil | Permissões previstas |
| --- | --- |
| Visitante | Consultar conteúdos, usar o mapa e registrar dados localmente no aparelho. Não publica dados no servidor. |
| Produtor | Criar conta, publicar ocorrências, consultar mapa e alertas, configurar propriedade e preferências. |
| Técnico | Permissões de produtor e acesso futuro a informações técnicas com maior precisão geográfica. |
| Administrador | Administração futura de usuários, espécies, ocorrências e configurações do sistema. |

Atualmente, a interface principal implementa os fluxos de visitante e produtor. Os perfis técnico e administrador já estão previstos no banco, mas ainda não possuem painel próprio.

## 3. Requisitos funcionais

### RF01 - Acesso e cadastro

- O sistema deve permitir login por e-mail e senha.
- O sistema deve permitir cadastro com nome, e-mail, senha e confirmação de senha.
- O nome deve possuir entre 2 e 80 caracteres.
- O e-mail deve ser válido, receber normalização para minúsculas e não pode estar duplicado.
- A senha de cadastro deve possuir no mínimo 8 caracteres, uma letra minúscula e uma letra maiúscula.
- O sistema deve informar campos vazios, formato inválido, senha incompatível e credenciais inválidas junto ao campo correspondente.
- O sistema deve permitir continuar sem conta.
- O sistema deve permitir sair da conta e limpar a sessão local.

### RF02 - Catálogo de espécies

- O sistema deve listar as espécies cadastradas.
- Cada espécie deve exibir nome comum, nome científico, risco e habitat.
- O usuário deve poder abrir detalhes de habitat, alimentação e identificação.
- O catálogo deve possuir conteúdo de prevenção associado.
- O catálogo deve ser armazenado em cache local para consulta offline.

### RF03 - Registro de ocorrência

- O usuário deve poder registrar data, hora, localidade, animal observado, impacto, observações e foto.
- O sistema deve permitir usar a localização do dispositivo quando o usuário autorizar o GPS.
- O registro deve ser salvo imediatamente no histórico local.
- O registro deve aparecer em “Seus registros recentes”.
- O sistema deve apresentar os estados `Pendente`, `Aguardando login` ou `Publicado`.
- O sistema deve mostrar feedback de sucesso, erro e processamento.

### RF04 - Sincronização

- Registros feitos offline devem entrar em uma fila local.
- Usuários autenticados devem poder publicar a fila no Supabase.
- O sistema deve tentar sincronizar ao abrir a aplicação e quando a conexão voltar.
- O usuário deve poder iniciar a sincronização manualmente no perfil.
- O sistema deve informar conexão, quantidade de pendências e horário da última sincronização.
- A sincronização deve ser idempotente e não duplicar registros reenviados.

### RF05 - Mapa e alertas

- O sistema deve apresentar pontos de ocorrências, avistamentos, conflitos e áreas protegidas.
- O usuário deve poder alternar mapa de ruas e relevo.
- O sistema deve oferecer localização atual, camadas e visualização de calor.
- O sistema deve permitir marcar um ponto personalizado.
- A remoção de um ponto personalizado deve exigir confirmação e informar o resultado.
- O sistema deve exibir alertas de conflitos próximos à propriedade cadastrada.
- O usuário deve poder salvar blocos do mapa para consulta offline.

### RF06 - Perfil e preferências

- O usuário deve acessar o perfil pelo menu da logo da patinha.
- O menu deve exibir conta, e-mail, propriedade, conexão, pendências, idioma, tema, modo campo e notificações.
- O usuário deve poder selecionar a propriedade ou localidade de referência.
- O sistema deve permitir alternar português, inglês e espanhol.
- O sistema deve permitir alternar tema claro, escuro e sistema.
- O sistema deve permitir ativar ou desativar alertas locais.

### RF07 - Notificações e feedback

- O sistema deve exibir feedback organizado para sucesso, erro, cancelamento e processamento.
- Os alertas de autenticação devem aparecer no formulário, sem depender de mensagens nativas soltas do navegador.
- O sistema deve solicitar permissão antes de enviar notificações do navegador.
- O sistema deve limitar alertas de proximidade a, no máximo, uma notificação por dia.

## 4. Requisitos não funcionais

### RNF01 - Usabilidade

- A aplicação deve funcionar em celular, tablet e desktop.
- Os controles devem possuir rótulos, estados de carregamento e mensagens compreensíveis.
- O menu de perfil deve permanecer ancorado à logo e adaptar sua altura à viewport.
- O sistema deve respeitar `prefers-reduced-motion` nas animações.

### RNF02 - Disponibilidade offline

- O catálogo, perfil local, ocorrências e configurações essenciais devem continuar acessíveis sem rede.
- A fila local deve preservar registros até que sejam publicados ou tratados pelo usuário.

### RNF03 - Segurança

- Senhas devem ser armazenadas apenas como hash usando bcrypt.
- Rotas protegidas devem exigir JWT.
- Dados de entrada devem ser validados com Zod no servidor.
- A API deve usar Helmet, CORS configurável e limitação de requisições.
- Coordenadas devem ser aproximadas para usuários sem papel técnico ou administrativo.
- Segredos e URLs de banco devem permanecer em variáveis de ambiente.

### RNF04 - Privacidade

- A localização exata não deve ser exposta para usuários comuns quando a regra de privacidade exigir aproximação.
- Fotos e ocorrências devem ser tratadas como dados potencialmente sensíveis.
- O modo visitante deve manter seus registros apenas no aparelho até a autenticação.

### RNF05 - Desempenho

- A interface deve carregar dados de catálogo a partir do cache quando possível.
- O mapa deve usar cache de tiles e carregamento controlado de camadas.
- A API deve usar índices geográficos e temporais para consultas de ocorrências.

### RNF06 - Manutenibilidade

- O frontend deve ser tipado com TypeScript.
- A API deve manter separação entre rotas, controllers, models e middlewares.
- Alterações de banco devem ser documentadas no schema SQL e no modelo Prisma.
- Os builds de API e frontend devem passar antes da publicação.

## 5. Regras de negócio

### RN01 - Cadastro e autenticação

1. E-mails são comparados em minúsculas após normalização.
2. Um e-mail só pode possuir uma conta.
3. O cadastro exige senha com pelo menos 8 caracteres, uma minúscula e uma maiúscula.
4. A senha nunca deve ser retornada pela API.
5. Login inválido retorna erro genérico de credenciais para não revelar se o e-mail existe.
6. O usuário visitante não publica ocorrências no servidor.

### RN02 - Ocorrências

1. Cada ocorrência recebe um UUID no aparelho.
2. O mesmo UUID pode ser reenviado sem criar duplicidade.
3. Uma ocorrência publicada pertence ao usuário autenticado que a enviou.
4. A data e hora da ocorrência são preservadas como timestamp.
5. A coordenada deve ser um ponto geográfico válido.
6. Ocorrências salvas localmente permanecem no histórico mesmo depois de sair da fila de sincronização.

### RN03 - Privacidade geográfica

1. Usuários comuns recebem coordenadas aproximadas.
2. Técnicos e administradores podem receber precisão maior conforme autorização do sistema.
3. O sistema não deve expor a localização exata de propriedades rurais sem necessidade operacional.

### RN04 - Sincronização e status

1. `Pendente` significa que o item está na fila local e possui conta para publicação.
2. `Aguardando login` significa que o item foi salvo no aparelho de um visitante.
3. `Publicado` significa que a API aceitou o item.
4. Falhas de rede não devem apagar registros locais.
5. O usuário deve receber feedback quando a publicação for concluída ou falhar.

### RN05 - Notificações

1. Notificações locais dependem da permissão do navegador.
2. Um conflito próximo pode gerar no máximo um alerta por dia.
3. A desativação de alertas deve impedir novas notificações locais.

## 6. Tecnologias utilizadas

### Frontend

- React 18
- TypeScript
- Vite
- PWA via `vite-plugin-pwa`
- Dexie e IndexedDB para cache e fila offline
- Leaflet e React Leaflet para mapas
- CSS responsivo próprio
- Service Worker para cache e instalação como PWA

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- PostGIS para dados geográficos
- Supabase como banco PostgreSQL hospedado
- `pg` para acesso SQL
- Prisma para geração de cliente e execução de operações de schema
- Zod para validação de entrada
- bcryptjs para hash de senhas
- JSON Web Token para autenticação
- Helmet, CORS e express-rate-limit para proteção da API

### Persistência local

- IndexedDB por meio do Dexie
- `localStorage` para token, sessão visitante, perfil, preferências, pins locais e estado de notificações

## 7. API principal

| Método | Rota | Acesso | Finalidade |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Público | Criar usuário produtor |
| `POST` | `/auth/login` | Público | Autenticar usuário |
| `GET` | `/species` | Público | Listar espécies |
| `GET` | `/map/points` | Opcional | Listar pontos do mapa |
| `GET` | `/alerts` | Público | Consultar alertas por região |
| `POST` | `/incidents` | Autenticado | Criar ocorrência |
| `POST` | `/sync` | Autenticado | Publicar registros da fila local |
| `GET` | `/health` | Público | Verificar disponibilidade da API |

## 8. Estrutura de dados principal

- `users`: contas, papéis, hash da senha e data de criação.
- `species`: catálogo, risco, habitat, comportamento, alimentação e proteção.
- `incidents`: ocorrências, usuário responsável, data, impacto, foto e ponto PostGIS.
- `outbox` local: fila de registros ainda não publicados.
- `incidents` local: histórico persistente dos registros feitos no aparelho.

## 9. Imagens do protótipo

### Tela de login

![Tela de login](../prototipo/tela-login.png)

### Tela inicial

![Tela inicial](../prototipo/tela-inicio.png)

### Catálogo de espécies

![Catálogo de espécies](../prototipo/tela-especies.png)

### Tela inicial completa

![Tela inicial completa](../prototipo/tela-inicial-completa.png)

### Perfil e ajustes

![Perfil e ajustes](../prototipo/tela-perfil-ajustes.png)

### Mapa

![Mapa](../prototipo/tela-mapa.png)

### Registro de ocorrência

![Registro de ocorrência](../prototipo/tela-registro-ocorrencia.png)

## 10. Pendências conhecidas

- Recuperação de senha ainda não implementada.
- Painéis específicos para técnico e administrador ainda não implementados.
- Exclusão de conta de usuário ainda não implementada.
- Push remoto real ainda depende de um servidor de notificações.
- A configuração de SSL com certificado não confiável deve ser usada apenas localmente.
