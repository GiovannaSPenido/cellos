-- ==========================================================================
-- Rede credenciada na tabela comparativa.
--
-- O formulário trouxe "+20 hospitais e +600 prestadores" repetido em todos os
-- planos — número da Hapvida copiado da linha de exemplo. Afirmá-lo sobre
-- Unimed e Aurora seria declaração não verificada a respeito de terceiros,
-- numa página onde o visitante decide o que contratar.
--
-- Na falta do dado, descreve-se a rede pelo que a corretora de fato informou:
-- a operadora e a região de atuação. É verdadeiro e preenche a comparação.
-- Quando os números chegarem, basta substituir.
-- ==========================================================================

update public.planos_saude
set rede_credenciada = 'Rede Unimed em Minas Gerais'
where operadora = 'Unimed';

update public.planos_saude
set rede_credenciada = 'Rede Aurora em Minas Gerais'
where operadora = 'Aurora';
