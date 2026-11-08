-- ============================================================================
-- Pedidos da validação com o cliente em 08/11/2026.
--
-- 1. CNPJ no lead: o formulário do site passa a pedi-lo de quem cota para
--    empresa, para o corretor já abrir a negociação com o dado em mãos.
-- 2. Modalidade: a Cellos também comercializa planos odontológicos, que o
--    catálogo não sabia representar.
-- 3. Contratação: distingue o que é vendido a pessoa física, a empresa ou aos
--    dois, para o site mostrar a cada visitante só o que lhe cabe.
-- ============================================================================

alter table public.leads
  add column if not exists cnpj text;

comment on column public.leads.cnpj is
  'Somente dígitos, sem máscara. Preenchido apenas para lead do tipo PJ.';

-- Guarda o formato sem depender da interface: 14 dígitos, ou nada.
alter table public.leads
  drop constraint if exists leads_cnpj_formato;
alter table public.leads
  add constraint leads_cnpj_formato
  check (cnpj is null or cnpj ~ '^[0-9]{14}$');

-- Um CNPJ não pode repetir entre leads, pela mesma razão do e-mail (RNG01).
create unique index if not exists leads_cnpj_unico
  on public.leads (cnpj)
  where cnpj is not null;

alter table public.planos_saude
  add column if not exists modalidade text not null default 'MEDICAL',
  add column if not exists contratacao text not null default 'BOTH';

alter table public.planos_saude
  drop constraint if exists planos_modalidade_valida;
alter table public.planos_saude
  add constraint planos_modalidade_valida
  check (modalidade in ('MEDICAL', 'DENTAL'));

alter table public.planos_saude
  drop constraint if exists planos_contratacao_valida;
alter table public.planos_saude
  add constraint planos_contratacao_valida
  check (contratacao in ('INDIVIDUAL', 'CORPORATE', 'BOTH'));

comment on column public.planos_saude.modalidade is
  'MEDICAL = plano de saúde, DENTAL = plano odontológico.';
comment on column public.planos_saude.contratacao is
  'A quem o plano é vendido: pessoa física, empresa ou ambos.';

create index if not exists planos_modalidade_idx
  on public.planos_saude (modalidade) where ativo;
