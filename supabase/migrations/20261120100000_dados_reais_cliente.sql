-- ==========================================================================
-- Dados reais da corretora, recebidos no formulário preenchido pelo
-- cliente em novembro de 2026.
--
-- Substitui o catálogo de demonstração por cinco planos efetivamente
-- comercializados e cria a tabela de preço por faixa etária, que o
-- modelo anterior não tinha: o preço deixa de ser estimado por fator
-- sobre um preço base e passa a vir da tabela da operadora.
--
-- Idempotente pela chave natural `codigo`.
-- ==========================================================================

-- ------------------------------------------------- preços por faixa
create table if not exists public.precos_faixa (
  id        uuid primary key default gen_random_uuid(),
  plano_id  uuid not null references public.planos_saude (id) on delete cascade,
  faixa     text not null check (faixa in ('0-18', '19-23', '24-28', '29-33', '34-38', '39-43', '44-48', '49-53', '54-58', '59+')),
  valor     numeric(10, 2) not null check (valor >= 0),
  unique (plano_id, faixa)
);

comment on table public.precos_faixa is
  'Mensalidade por vida em cada uma das dez faixas etárias da ANS (RN 63/2003).';

create index if not exists precos_faixa_plano on public.precos_faixa (plano_id);

alter table public.precos_faixa enable row level security;

-- o site precisa ler para montar a cotação; escrita só para administrador
drop policy if exists precos_select_publico on public.precos_faixa;
create policy precos_select_publico on public.precos_faixa
  for select using (true);
drop policy if exists precos_admin_total on public.precos_faixa;
create policy precos_admin_total on public.precos_faixa
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------- catálogo de demonstração
-- os quatro planos fictícios saem; nenhum cliente foi contratado neles
delete from public.planos_saude where codigo in (
  'unimed-plus', 'hapvida-premium', 'sulamerica-total', 'unimed-executivo');

-- ------------------------------------------------- planos reais
insert into public.planos_saude (
  codigo, nome, operadora, tier, modalidade, contratacao, tipo_cobertura,
  abrangencia, acomodacao, coparticipacao, reembolso, rede_credenciada,
  carencia, preco_base, resumo, destaque, inclui, nao_inclui
) values
('adapt-300-estadual', 'ADAPT 300 ESTADUAL', 'Hapvida', 'Intermediário', 'MEDICAL', 'CORPORATE',
 'Ambulatorial + Hospitalar', 'Estadual', 'Enfermaria', true, false, '+20 hospitais e +600 prestadores',
 '180 dias (internação)', 161.60, 'Cobertura completa com a rede Hapvida — internação, cirurgias e tranquilidade total.', false,
 array['Internação clínica e cirúrgica', 'Cirurgias eletivas', 'UTI e pronto-socorro', 'Telemedicina ilimitada'],
 array['Quarto privativo', 'Parto / obstetrícia']),
('nosso-plano', 'NOSSO PLANO', 'Hapvida', 'Premium', 'MEDICAL', 'INDIVIDUAL',
 'Ambulatorial + Hospitalar + Obstetrícia', 'Regional', 'Enfermaria', true, false, '+20 hospitais e +600 prestadores',
 '180 dias (internação)', 295.96, 'Cobertura completa com a rede Hapvida — internação, cirurgias e tranquilidade total.', false,
 array['Internação clínica e cirúrgica', 'Cirurgias eletivas', 'UTI e pronto-socorro', 'Telemedicina ilimitada'],
 array['Quarto privativo']),
('unifacil-flex-50', 'UNIFÁCIL FLEX 50', 'Unimed', 'Intermediário', 'MEDICAL', 'CORPORATE',
 'Ambulatorial + Hospitalar + Obstetrícia', 'Regional', 'Enfermaria', true, false, null,
 '180 dias (internação)', 174.22, 'Cobertura completa com a rede Unimed — internação, cirurgias e tranquilidade total.', false,
 array['Internação clínica e cirúrgica', 'Cirurgias eletivas', 'UTI e pronto-socorro', 'Telemedicina ilimitada'],
 array['Quarto privativo']),
('unifacil', 'UNIFÁCIL', 'Unimed', 'Avançado', 'MEDICAL', 'INDIVIDUAL',
 'Ambulatorial + Hospitalar + Obstetrícia', 'Regional', 'Enfermaria', true, false, null,
 '180 dias (internação)', 241.51, 'Cobertura completa com a rede Unimed — internação, cirurgias e tranquilidade total.', false,
 array['Internação clínica e cirúrgica', 'Cirurgias eletivas', 'UTI e pronto-socorro', 'Telemedicina ilimitada'],
 array['Quarto privativo']),
('a-200', 'A 200', 'Aurora', 'Entrada', 'MEDICAL', 'CORPORATE',
 'Ambulatorial + Hospitalar + Obstetrícia', 'Regional', 'Enfermaria', true, false, null,
 '180 dias (internação)', 124.40, 'Cobertura completa com a rede Aurora — internação, cirurgias e tranquilidade total.', false,
 array['Internação clínica e cirúrgica', 'Cirurgias eletivas', 'UTI e pronto-socorro', 'Telemedicina ilimitada'],
 array['Quarto privativo'])
on conflict (codigo) do update set
  nome = excluded.nome,
  operadora = excluded.operadora,
  tier = excluded.tier,
  modalidade = excluded.modalidade,
  contratacao = excluded.contratacao,
  tipo_cobertura = excluded.tipo_cobertura,
  abrangencia = excluded.abrangencia,
  acomodacao = excluded.acomodacao,
  coparticipacao = excluded.coparticipacao,
  reembolso = excluded.reembolso,
  rede_credenciada = excluded.rede_credenciada,
  carencia = excluded.carencia,
  preco_base = excluded.preco_base,
  resumo = excluded.resumo,
  destaque = excluded.destaque,
  inclui = excluded.inclui,
  nao_inclui = excluded.nao_inclui;

-- ------------------------------------------- preços da operadora
insert into public.precos_faixa (plano_id, faixa, valor)
select p.id, v.faixa, v.valor from public.planos_saude p
join (values
  ('adapt-300-estadual', '0-18', 119.72),
  ('adapt-300-estadual', '19-23', 161.60),
  ('adapt-300-estadual', '24-28', 190.98),
  ('adapt-300-estadual', '29-33', 199.54),
  ('adapt-300-estadual', '34-38', 206.20),
  ('adapt-300-estadual', '39-43', 226.82),
  ('adapt-300-estadual', '44-48', 294.87),
  ('adapt-300-estadual', '49-53', 383.33),
  ('adapt-300-estadual', '54-58', 498.33),
  ('adapt-300-estadual', '59+', 718.24),
  ('nosso-plano', '0-18', 239.46),
  ('nosso-plano', '19-23', 295.96),
  ('nosso-plano', '24-28', 340.15),
  ('nosso-plano', '29-33', 381.19),
  ('nosso-plano', '34-38', 400.25),
  ('nosso-plano', '39-43', 452.28),
  ('nosso-plano', '44-48', 562.50),
  ('nosso-plano', '49-53', 761.46),
  ('nosso-plano', '54-58', 1027.97),
  ('nosso-plano', '59+', 1397.40),
  ('unifacil-flex-50', '0-18', 145.18),
  ('unifacil-flex-50', '19-23', 174.22),
  ('unifacil-flex-50', '24-28', 216.06),
  ('unifacil-flex-50', '29-33', 267.88),
  ('unifacil-flex-50', '34-38', 300.03),
  ('unifacil-flex-50', '39-43', 312.03),
  ('unifacil-flex-50', '44-48', 393.16),
  ('unifacil-flex-50', '49-53', 448.20),
  ('unifacil-flex-50', '54-58', 533.36),
  ('unifacil-flex-50', '59+', 869.38),
  ('unifacil', '0-18', 203.12),
  ('unifacil', '19-23', 241.51),
  ('unifacil', '24-28', 277.74),
  ('unifacil', '29-33', 319.40),
  ('unifacil', '34-38', 370.50),
  ('unifacil', '39-43', 429.78),
  ('unifacil', '44-48', 498.54),
  ('unifacil', '49-53', 583.29),
  ('unifacil', '54-58', 781.61),
  ('unifacil', '59+', 1218.53),
  ('a-200', '0-18', 103.67),
  ('a-200', '19-23', 124.40),
  ('a-200', '24-28', 154.25),
  ('a-200', '29-33', 178.94),
  ('a-200', '34-38', 200.40),
  ('a-200', '39-43', 226.46),
  ('a-200', '44-48', 280.81),
  ('a-200', '49-53', 320.13),
  ('a-200', '54-58', 403.35),
  ('a-200', '59+', 617.12)
) as v(codigo, faixa, valor) on v.codigo = p.codigo
on conflict (plano_id, faixa) do update set valor = excluded.valor;
