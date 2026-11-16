---
name: 'ui'
description: 'SIDSC, Angular Material, templates, formulários e SCSS.'
applyTo: 'src/**/*.html, src/**/*.scss, src/app/**/*.component.ts'
---

# Interface visual

- Priorize SIDSC Components quando houver componente apropriado já disponível. Consulte templates existentes, imports e declarações de tipos da versão instalada antes de usar inputs, outputs, métodos ou seletores. Não invente APIs da biblioteca proprietária.
- Angular Material e ng-bootstrap são complementares; preserve a tecnologia do fluxo existente. Não substitua componentes nem adicione bibliotecas por preferência estética.
- Preserve aparência, textos, feedback, validação, navegação, foco, acessibilidade e estados loading/disabled/erro/vazio. Use controles semânticos, rótulos e eventos de teclado quando aplicável.
- Use sintaxe de templates compatível com Angular 16. Consuma Signals chamando-os no template; evite cálculos pesados e efeitos colaterais em expressões. Extraia transformações reutilizáveis para helpers ou computed quando apropriado.
- Preserve Reactive Forms e contratos de formulários, filtros e paginação. Mantenha `pt-BR`, formato `DD/MM/YYYY`, `MomentDateAdapter` e configuração global de paginação existentes; não altere formato de payload por causa da exibição.
- Use SCSS e estilos locais; reutilize padrões existentes. Evite seletores globais, `::ng-deep` ou `!important` novos sem necessidade demonstrada. Preserve estilos globais SIDSC e compatibilidade com o host.
- Consulte `debito-manual-pendente/presentation/` para cards/modais e `lote-agendamentos/subfeatures/` para tabelas/detalhes. Valide templates com build e testes; não presuma que compilação isolada de TS valida a UI.
