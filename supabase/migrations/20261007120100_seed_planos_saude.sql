-- ============================================================================
-- Catálogo de planos comercializados pela Cellos.
--
-- Dados de referência do negócio (não fixtures de teste), por isso vão como
-- migration e chegam à produção pelo `supabase db push`. Idempotente pela
-- chave natural `codigo`.
-- ============================================================================

insert into public.planos_saude (
  codigo, nome, operadora, tier, tipo_cobertura, abrangencia, acomodacao,
  coparticipacao, reembolso, rede_credenciada, carencia, preco_base, resumo,
  destaque, inclui, nao_inclui
) values
(
  'unimed-plus', 'Unimed Plus', 'Unimed', 'Entrada',
  'Ambulatorial', 'Regional (Minas Gerais)', 'Enfermaria',
  true, false,
  '+500 clínicas e laboratórios', '30 dias (consultas)',
  215.00,
  'Consultas, exames e urgências com a rede Unimed — solução enxuta e acessível.',
  false,
  array['Consultas em 20+ especialidades', 'Exames laboratoriais e de imagem',
        'Pronto atendimento 24h', 'Telemedicina ilimitada'],
  array['Internação hospitalar', 'Cirurgias eletivas', 'Parto / obstetrícia']
),
(
  'hapvida-premium', 'Hapvida Premium', 'Hapvida', 'Intermediário',
  'Ambulatorial + Hospitalar', 'Estadual', 'Enfermaria',
  false, false,
  '+20 hospitais e +600 prestadores', '180 dias (internação)',
  385.00,
  'Cobertura completa com a rede Hapvida — internação, cirurgias e tranquilidade total.',
  true,
  array['Tudo do Plus', 'Internação clínica e cirúrgica', 'Cirurgias eletivas',
        'UTI e pronto-socorro', 'Telemedicina ilimitada'],
  array['Quarto privativo', 'Parto / obstetrícia']
),
(
  'sulamerica-total', 'SulAmérica Total', 'SulAmérica', 'Avançado',
  'Ambulatorial + Hospitalar + Obstetrícia', 'Nacional', 'Apartamento',
  false, false,
  'Rede nacional · +80 hospitais de referência', '300 dias (parto)',
  625.00,
  'Proteção total com SulAmérica — apartamento, obstetrícia e alcance nacional.',
  false,
  array['Tudo do Premium', 'Quarto privativo (apartamento)',
        'Cobertura obstétrica completa', 'Abrangência nacional',
        'Cobertura em viagem internacional'],
  array['Reembolso fora da rede']
),
(
  'unimed-executivo', 'Unimed Executivo', 'Unimed', 'Premium',
  'Plano executivo com reembolso', 'Nacional', 'Apartamento',
  false, true,
  'Rede premium nacional + livre escolha', '300 dias (parto)',
  945.00,
  'Livre escolha de médicos, reembolso e rede premium com a solidez Unimed.',
  false,
  array['Tudo do Total', 'Reembolso de consultas e exames',
        'Livre escolha de hospitais', 'Concierge de saúde 24h',
        'Check-up executivo anual'],
  array[]::text[]
)
on conflict (codigo) do nothing;
