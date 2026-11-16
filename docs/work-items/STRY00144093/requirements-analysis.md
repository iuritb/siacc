# Análise inicial v0.1 — NÃO APROVADA

Leia [HU vigente](user-story.md) e [dependência](consolidado-dependencia.md). Esta análise é ponto de partida, não aprovação A1.

| ID | Fonte | Requisito | Evidência esperada | Status |
|---|---|---|---|---|
| CA01 | HU2 | Download CNAB 750 e 150 quando disponíveis para Matriz | Teste de cada formato com contrato real; integração a validar | Pendente |
| CA02 | HU2 | Cinco informações do card | Teste de renderização com dados confirmados | Pendente |
| UI01 | descrição vigente | Lista antes do card, referente ao dia selecionado, com cinco campos | Teste de ordem, campos e data conforme decisão | Pendente |
| UI02 | descrição vigente | Título Retorno Consolidado | Teste de renderização | Pendente |
| UI03 | descrição vigente | Download na coluna Arquivo | Teste de ação e arquivo conforme contrato | Pendente |
| AC01 | descrição vigente | Usuário Matriz | Testes de acesso conforme mecanismo existente | Pendente |
| RN01–RN08 | HU1 | Geração e disponibilização | Evidência backend; não atribuir cobertura ao frontend | Dependência não verificada |

## Perguntas

1. Onde a tela/card deve ficar? Relatório de Remessas existente ou outra rota? Confirmar com PO após investigação.
2. Qual data selecionada (movimento ou processamento), valor inicial, intervalo e seletor? Há fuso definido?
3. Qual relação entre lista e card: seleção de linha, resumo, múltiplos cards? Onde ficam ações de download de cada formato?
4. Quais endpoints, parâmetros, identificadores, DTOs, tipos/situações, nome do arquivo, formato da resposta, headers e erros? Backend pronto? Contrato acordado?
5. Como identificar Matriz e aplicar autorização? Não assumir ocultação visual como segurança suficiente.
6. Estados sem movimentação, carregamento, erro, arquivo indisponível, download simultâneo: quais padrões existentes e decisões negociais?
7. Confirmar divergências do exemplo da HU1 e obter leiautes se necessários ao escopo.

## Pistas técnicas (não verificadas no código atual)

Árvore anterior e app-routing.module.ts indicam `src/app/pages/relatorioremessa/` (rota `remessa`), `src/app/pages/relatorios-remessa/` e `src/app/services/gerenciador-relatorio-remessa/`. Investigar ambos os componentes e serviço, consumidores, permissões, downloads existentes e testes. Não escolher pasta ou criar rota antes de A2/A3. Referências arquiteturais: débito manual pendente, autorizações/agendamentos e lote de agendamentos.

## Cenários candidatos, não critérios adicionais

Consulta com data confirmada, lista vazia, erro de consulta, troca rápida de data, download de cada formato, falha de download, preservação de nome/conteúdo conforme contrato, acesso autorizado/não autorizado, regressão da tela existente. Validar quais são aplicáveis no plano. Se usar Blob/object URL conforme padrão existente, liberar URL; não fabricar conteúdo CNAB. Não testar contra produção.
