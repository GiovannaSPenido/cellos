-- ============================================================================
-- Cellos — esquema inicial
--
-- Cinco tabelas conforme a seção 8.4 do projeto técnico: usuarios, planos_saude,
-- leads, clientes, interacoes.
--
-- Nomes de tabelas e colunas em português (fiéis ao MER documentado); valores de
-- domínio em inglês, iguais aos tipos TypeScript — a tradução de nomes é feita
-- na camada de infraestrutura.
--
-- Regras de negócio aplicadas pelo próprio SGBD:
--   RNG01  e-mail e telefone únicos em leads
--   RNG02  interação sempre vinculada a um lead existente (FK NOT NULL)
--   RNG03  interação exige data, tipo e descrição
--   RNG05  um lead gera no máximo um cliente (lead_id UNIQUE) e o lead sobrevive
--   RNG06  cliente sempre vinculado a um plano e com início de vigência
--   RF05   os seis status do funil
-- ============================================================================

-- ---------------------------------------------------------------- utilitários
create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

-- ------------------------------------------------------------------- usuarios
-- Espelha auth.users do Supabase Auth, que atende o RNF01.
create table public.usuarios (
  id            uuid primary key references auth.users (id) on delete cascade,
  nome          text not null check (length(trim(nome)) > 0),
  email         text not null unique,
  perfil        text not null default 'SALES' check (perfil in ('ADMIN', 'SALES')),
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table public.usuarios is 'Atores Administrador e Vendedor/Gestor (seção 7.5).';

create trigger usuarios_set_atualizado_em
  before update on public.usuarios
  for each row execute function public.set_atualizado_em();

-- Cria a linha em public.usuarios quando alguém se registra no Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --------------------------------------------------------------- planos_saude
create table public.planos_saude (
  id               uuid primary key default gen_random_uuid(),
  codigo           text not null unique,
  nome             text not null,
  operadora        text not null,
  tier             text not null,
  tipo_cobertura   text not null,
  abrangencia      text not null,
  acomodacao       text not null,
  coparticipacao   boolean not null default false,
  reembolso        boolean not null default false,
  rede_credenciada text,
  carencia         text,
  preco_base       numeric(10, 2) not null check (preco_base >= 0),
  resumo           text,
  destaque         boolean not null default false,
  inclui           text[] not null default '{}',
  nao_inclui       text[] not null default '{}',
  ativo            boolean not null default true,
  criado_em        timestamptz not null default now()
);

comment on column public.planos_saude.codigo is 'Chave natural estável, usada para seed idempotente.';

-- ---------------------------------------------------------------------- leads
create table public.leads (
  id               uuid primary key default gen_random_uuid(),
  usuario_id       uuid not null references public.usuarios (id) on delete restrict,
  nome             text not null check (length(trim(nome)) > 0),
  empresa          text,
  cargo            text,
  email            text not null,
  telefone         text not null,
  tipo_pessoa      text not null check (tipo_pessoa in ('PF', 'PJ')),
  status           text not null default 'NEW'
                     check (status in ('NEW', 'IN_CONTACT', 'PROPOSAL_SENT',
                                       'NEGOTIATION', 'CONVERTED', 'LOST')),
  plano_interesse  text,
  vidas            integer not null default 1 check (vidas >= 1),
  valor_estimado   numeric(10, 2) check (valor_estimado >= 0),
  origem           text,
  proximo_contato  date,
  observacoes      text,
  quente           boolean not null default false,
  versao           integer not null default 0,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now(),

  -- RNG01: cadastro único por e-mail e por telefone
  constraint leads_email_unico unique (email),
  constraint leads_telefone_unico unique (telefone),

  -- PJ identifica-se pela empresa
  constraint leads_pj_exige_empresa
    check (tipo_pessoa <> 'PJ' or (empresa is not null and length(trim(empresa)) > 0))
);

comment on column public.leads.plano_interesse is
  'Texto livre (RF01). O plano efetivamente contratado fica em clientes.plano_id.';

create trigger leads_set_atualizado_em
  before update on public.leads
  for each row execute function public.set_atualizado_em();

create index leads_usuario_id_idx      on public.leads (usuario_id);
create index leads_status_idx          on public.leads (status);
create index leads_proximo_contato_idx on public.leads (proximo_contato)
  where proximo_contato is not null;

-- ------------------------------------------------------------------- clientes
-- Nasce da conversão de um lead (RNG05). O lead permanece, preservando o histórico.
create table public.clientes (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid not null unique references public.leads (id) on delete restrict,
  plano_id        uuid not null references public.planos_saude (id) on delete restrict,
  vidas           integer not null default 1 check (vidas >= 1),
  mensalidade     numeric(10, 2) not null check (mensalidade >= 0),
  inicio_vigencia date not null,
  renovacao       date,
  status          text not null default 'ACTIVE'
                    check (status in ('ACTIVE', 'RENEWAL_DUE', 'OVERDUE', 'CANCELLED')),
  cidade          text,
  responsavel     text,
  oportunidade    text,
  versao          integer not null default 0,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now(),

  constraint clientes_renovacao_apos_inicio
    check (renovacao is null or renovacao > inicio_vigencia)
);

comment on column public.clientes.lead_id is
  'UNIQUE: um lead gera no máximo um cliente — a relação 1 para 0..1 da seção 8.3.';
comment on column public.clientes.oportunidade is
  'Oportunidade comercial identificada (RNG07).';

create trigger clientes_set_atualizado_em
  before update on public.clientes
  for each row execute function public.set_atualizado_em();

create index clientes_plano_id_idx  on public.clientes (plano_id);
create index clientes_renovacao_idx on public.clientes (renovacao)
  where renovacao is not null;

-- ----------------------------------------------------------------- interacoes
create table public.interacoes (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.leads (id) on delete cascade,
  usuario_id uuid not null references public.usuarios (id) on delete restrict,
  data       timestamptz not null default now(),
  tipo       text not null
               check (tipo in ('CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'NOTE')),
  descricao  text not null check (length(trim(descricao)) > 0),
  criado_em  timestamptz not null default now()
);

comment on table public.interacoes is
  'RNG02: sempre vinculada a um lead. RNG03: data, tipo e descrição obrigatórios.';

create index interacoes_lead_id_idx on public.interacoes (lead_id);
create index interacoes_data_idx    on public.interacoes (data desc);

-- =================================================== Row Level Security (RNF01)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.usuarios
    where id = auth.uid() and perfil = 'ADMIN' and ativo
  );
$$;

alter table public.usuarios     enable row level security;
alter table public.planos_saude enable row level security;
alter table public.leads        enable row level security;
alter table public.clientes     enable row level security;
alter table public.interacoes   enable row level security;

-- usuarios: cada um lê e edita a própria linha; administrador vê todas.
create policy usuarios_select_proprio on public.usuarios
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy usuarios_update_proprio on public.usuarios
  for update to authenticated using (id = auth.uid() or public.is_admin());

-- planos_saude: catálogo público — o site institucional precisa ler (RF08).
create policy planos_select_publico on public.planos_saude
  for select to anon, authenticated using (ativo);
create policy planos_admin_total on public.planos_saude
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- leads: o vendedor responsável; administrador vê tudo.
create policy leads_select on public.leads
  for select to authenticated using (usuario_id = auth.uid() or public.is_admin());
create policy leads_insert on public.leads
  for insert to authenticated with check (usuario_id = auth.uid() or public.is_admin());
create policy leads_update on public.leads
  for update to authenticated
  using (usuario_id = auth.uid() or public.is_admin())
  with check (usuario_id = auth.uid() or public.is_admin());
create policy leads_delete on public.leads
  for delete to authenticated using (usuario_id = auth.uid() or public.is_admin());

-- clientes: acompanha a posse do lead de origem.
create policy clientes_all on public.clientes
  for all to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.leads l where l.id = lead_id and l.usuario_id = auth.uid()
    )
  )
  with check (
    public.is_admin() or exists (
      select 1 from public.leads l where l.id = lead_id and l.usuario_id = auth.uid()
    )
  );

-- interacoes: idem.
create policy interacoes_all on public.interacoes
  for all to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.leads l where l.id = lead_id and l.usuario_id = auth.uid()
    )
  )
  with check (
    public.is_admin() or exists (
      select 1 from public.leads l where l.id = lead_id and l.usuario_id = auth.uid()
    )
  );
