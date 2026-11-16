# HU anterior — Geração do consolidado diário

Fonte: `consolidado.md`, sem ID informado. Regras extraídas, IDs auxiliares.

- RN01: geração diária de arquivo CNAB para clientes que trabalham com arquivo, contendo REC, COBR, incluídos, aceitos, rejeitados ou cancelados e agendamentos concluídos; leiautes REC/SOLICREC e COBR mencionados mas não anexados.
- RN02: exclusivamente dados efetivamente atualizados na data de referência.
- RN03: último status vigente de cada ocorrência no fim do dia, sem histórico de transições.
- RN04: incluir registros incluídos no dia mesmo sem mudança posterior de status.
- RN05: disponibilização no batch/madrugada seguinte, preferencialmente a partir de 00:01 (não é SLA rígido confirmado).
- RN06: data de movimento do dia anterior; exemplo atualização dia 17, batch dia 18, movimento dia 17.
- RN07: sem movimentação, não gerar arquivo.
- RN08: consolidar todas as remessas enviadas no dia; autorizações e cobranças do cliente conforme última situação.

## Divergências preservadas

Exemplo original: dia 30/09, 50 agendamentos criados, 25 permanecem criados e 25 rejeitados; 100 autorizações aprovadas, 50 permanecem aprovadas e 50 canceladas. Exemplo indica madrugada de 31/09 (data inexistente) e lista apenas 25 rejeitados, 50 aprovados e 50 cancelados. RN04 contradiz a omissão dos 25 criados. Solicitar esclarecimento; não alterar geração nem inferir leiaute.

## Fronteira técnica

Geração/batch é dependência presumivelmente backend, a confirmar. Frontend não deve reproduzir consolidação, calcular status final ou gerar CNAB a partir de dados de tela sem requisito e contrato explícitos. Não presumir que a HU anterior esteja implementada.
