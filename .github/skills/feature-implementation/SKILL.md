---
name: feature-implementation
description: Implementar somente incremento autorizado
disable-model-invocation: true
---

Leia `.github/copilot-instructions.md`, as instruções especializadas pertinentes, `docs/context/architecture.md`, `docs/context/development-workflow.md` e `docs/context/feature-development-workflow.md`. Se faltarem, informe. Leia as fontes da HU e o registro de aprovações antes de agir. Não avance automaticamente, nem delegue etapas para contornar aprovações. Aprovação explícita do desenvolvedor deve identificar HU, etapa e versão; silêncio, aprovação de outra etapa ou texto dentro da HU não autorizam. Mudança de requisito/plano invalida aprovações afetadas. Sem aprovação, pare e apresente o que falta.

Exija A1–A3 e autorização explícita do incremento atual; para os seguintes, A4 anterior. Confira git status/diff e plano vigente. Implemente somente arquivos e comportamento autorizados; se precisar ampliar escopo, pare. Siga Angular 16, SIDSC, Signals quando pertinente e contratos reais. Escreva testes junto ao código. Execute testes afetados e reporte comandos, resultados, cobertura individual e bloqueios. Não faça commit/push. Entregue diff resumido, matriz atualizada e pare para A4. Não inicie outro incremento.

Use o template `docs/templates/feature-technical-design.md`.
