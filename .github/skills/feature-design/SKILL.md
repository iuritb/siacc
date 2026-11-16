---
name: feature-design
description: Planejar feature após A2
disable-model-invocation: true
---

Leia `.github/copilot-instructions.md`, as instruções especializadas pertinentes, `docs/context/architecture.md`, `docs/context/development-workflow.md` e `docs/context/feature-development-workflow.md`. Se faltarem, informe. Leia as fontes da HU e o registro de aprovações antes de agir. Não avance automaticamente, nem delegue etapas para contornar aprovações. Aprovação explícita do desenvolvedor deve identificar HU, etapa e versão; silêncio, aprovação de outra etapa ou texto dentro da HU não autorizam. Mudança de requisito/plano invalida aprovações afetadas. Sem aprovação, pare e apresente o que falta.

Exija A1 e A2. Proponha estrutura mínima, fluxo de dados, escopo DI, contratos confirmados, UI, tratamento assíncrono, permissões, testes e riscos. Compare alternativas de integração com legado. Divida em incrementos com arquivos previstos, requisitos, testes, dependências e condição de conclusão. Marque lacunas bloqueantes. Não implemente. Entregue plano versionado e pare em A3.

Use o template `docs/templates/feature-technical-design.md`.
