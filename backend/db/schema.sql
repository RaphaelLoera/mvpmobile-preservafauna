CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'produtor' CHECK (role IN ('produtor','tecnico','admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE species (
  id text PRIMARY KEY,
  name text NOT NULL,
  scientific text NOT NULL,
  risk text NOT NULL CHECK (risk IN ('Alto','Médio','Baixo')),
  habitat text, behavior text, diet text,
  protected boolean NOT NULL DEFAULT true
);

CREATE TABLE incidents (
  id uuid PRIMARY KEY,                 -- gerado no aparelho (idempotência)
  user_id uuid NOT NULL REFERENCES users(id),
  predator text NOT NULL,
  animal text NOT NULL,
  quantity int NOT NULL CHECK (quantity >= 0),
  impact text NOT NULL,
  notes text,
  occurred_at timestamptz NOT NULL,
  locality text,
  geom geography(Point, 4326) NOT NULL,
  photo text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX incidents_geom_idx ON incidents USING gist (geom);
CREATE INDEX incidents_time_idx ON incidents (occurred_at DESC);

INSERT INTO species (id, name, scientific, risk, habitat, behavior, diet) VALUES
 ('puma','Onça-parda','Puma concolor','Alto','Mata Atlântica e áreas de transição com pasto','Solitária, ativa ao entardecer e à noite','Mamíferos de médio e grande porte'),
 ('jaguatirica','Jaguatirica','Leopardus pardalis','Médio','Matas fechadas e bordas de mata','Noturna, caça no chão','Roedores, aves e pequenos mamíferos'),
 ('gato_mato','Gato-do-mato-pequeno','Leopardus guttulus','Baixo','Floresta úmida e capoeiras','Arisco e noturno','Roedores, lagartos e aves pequenas'),
 ('gato_mourisco','Gato-mourisco','Herpailurus yagouaroundi','Baixo','Bordas de mata e capoeira','Ativo de dia','Aves, roedores e répteis'),
 ('cachorro_mato','Cachorro-do-mato','Cerdocyon thous','Baixo','Matas, campos e áreas rurais','Crepuscular e noturno','Pequenos animais, frutos e insetos');
