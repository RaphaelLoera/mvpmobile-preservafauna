# Contrato da API (v1)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | /auth/register | – | cria produtor |
| POST | /auth/login | – | devolve `{ token, user }` |
| GET | /species | – | catálogo de espécies |
| GET | /map/points | opcional | pontos de ocorrência/conflito (coordenadas aproximadas, exatas só para técnico/admin) |
| GET | /alerts?lat&lon&km=5 | – | conflitos dos últimos 30 dias dentro do raio |
| POST | /incidents | produtor+ | registra uma ocorrência (id UUID vindo do cliente) |
| POST | /sync | produtor+ | recebe a fila offline `{ incidents: [...] }` → `{ accepted: [ids], rejected: [{id,error}] }` |

Corpo de `POST /incidents`:
`{ id, predator, animal, quantity, impact, notes?, occurredAt, locality?, lat, lon }`
