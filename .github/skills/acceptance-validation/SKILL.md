---
name: acceptance-validation
description: Revisar HU e implementação após A4 final
disable-model-invocation: true
---

Leia `.github/copilot-instructions.md`, as instruções especializadas pertinentes, `docs/context/architecture.md`, `docs/context/development-workflow.md` e `docs/context/feature-development-workflow.md`. Se faltarem, informe. Leia as fontes da HU e o registro de aprovações antes de agir. Não avance automaticamente, nem delegue etapas para contornar aprovações. Aprovação explícita do desenvolvedor deve identificar HU, etapa e versão; silêncio, aprovação de outra etapa ou texto dentro da HU não autorizam. Mudança de requisito/plano invalida aprovações afetadas. Sem aprovação, pare e apresente o que falta.

Exija A4 final. Compare diff, HU vigente, plano e matriz. Verifique critérios, regressões, permissões, segurança, estados assíncronos, contratos e cobertura por arquivo. Execute verificações locais não destrutivas autorizadas; registre resultados reais e limitações. Não corrija código automaticamente. Classifique achados por gravidade com arquivo/símbolo e teste. Separe aceite técnico de homologação negocial. Pare em A5.

Use o template `docs/templates/acceptance-checklist.md`.
