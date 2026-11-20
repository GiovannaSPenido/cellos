-- ==========================================================================
-- Catálogo reduzido a quatro planos.
--
-- O formulário pedia quatro e voltou com cinco. Sai o NOSSO PLANO, e não
-- outro, porque é o único cuja tabela de preços infringe a RN 63/2003: a
-- variação acumulada da sétima à décima faixa chega a 148,4%, acima dos
-- 134,9% acumulados da primeira à sétima.
--
-- O plano é desativado, não apagado: os preços seguem gravados e basta
-- reverter esta linha se a corretora corrigir os valores.
-- ==========================================================================

update public.planos_saude
set ativo = false
where codigo = 'nosso-plano';
