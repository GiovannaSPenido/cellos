-- ==========================================================================
-- Plano em destaque no site.
--
-- A corretora indicou a linha da Unimed como a mais procurada. O destaque é
-- exclusivo: a etiqueta "Mais escolhido" perde o sentido se aparecer em mais
-- de um plano, por isso a instrução zera os demais na mesma operação.
--
-- Entre os dois planos Unimed escolheu-se o UNIFÁCIL, de contratação
-- individual, por ser o que a maioria dos visitantes do site busca; o
-- UNIFÁCIL FLEX 50 atende empresas.
-- ==========================================================================

update public.planos_saude
set destaque = (codigo = 'unifacil');
