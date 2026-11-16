---
name: 'architecture'
description: 'Organização por features, responsabilidades e dependências.'
applyTo: 'src/app/**/*.ts, src/app/**/*.html, src/app/**/*.scss'
---

# Arquitetura por features

- Para novas funcionalidades ou migrações autorizadas, organize código coeso em `src/app/features/<feature>/`. Use `application/query/`, `application/store/`, `domain/` e, quando útil, `presentation/` ou `subfeatures/`. Componentes de entrada e helpers podem ficar na raiz. Não crie pastas vazias.
- Componentes cuidam de interação, formulários e renderização; stores concentram estado e orquestração; query services/gateways adaptam serviços existentes e retornam contratos tipados; domain contém modelos, contratos, enums, constantes e mapeamentos relacionados à feature.
- Prefira fluxo componente → store → query/gateway → serviço existente. Permita interação direta com serviços de UI quando necessária; não transforme o fluxo em regra artificial para todo caso.
- Evite dependências de application/domain para componentes de apresentação. Prefira helpers puros e contratos explícitos; evite ciclos e dependência de detalhes internos de outras features. O domínio existente não é totalmente independente do Angular.
- Mantenha `shared/` para recursos efetivamente compartilhados e `services/` para integrações existentes. Não mova código só para satisfazer uma árvore ideal; examine consumidores antes de mover ou renomear.
- Use shell e subfeatures quando houver coordenação de etapas ou unidades autônomas. Preserve a direção dos eventos e o escopo dos providers. Não imponha DDD, CQRS ou Clean Architecture estrita.
- Em migrações de componentes grandes, inventarie responsabilidades e contratos, proteja comportamento com testes e extraia unidades coesas em passos pequenos. Não altere regras de negócio incidentalmente.

Referências reais: `debito-manual-pendente` (stores, gateway, modais), `autorizacoes-agendamentos` (estrutura compacta, resultados discriminados), `lote-agendamentos` (shell e subfeatures). Consulte [arquitetura detalhada](../../docs/context/architecture.md).
