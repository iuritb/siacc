# SIACC Copilot Context v1.0

## Contexto e regras globais

- Este repositório é o `siacc-pixautomatico-frontend`: Angular 16.2, TypeScript 5.1, RxJS 7.8, Jest 29.7, Single SPA e SCSS. SIDSC Components 16.x é a biblioteca visual proprietária; Angular Material 16 e ng-bootstrap 15 complementam a interface.
- A arquitetura desejada é orientada a features em `src/app/features/`, coexistindo com `pages/`, `shared/` e `services/`. Evolua incrementalmente; não migre código alheio à tarefa.
- Preserve comportamento, contratos de API, navegação, permissões, validações, mensagens, filtros, paginação e integração com o host. Não invente regras de negócio nem APIs proprietárias. Consulte código, tipos e testes reais.
- Preserve Angular 16 e a configuração estrita de TypeScript/templates. Não introduza APIs de versões posteriores, novas dependências, atualizações ou alterações de lockfile sem aprovação explícita.
- Mantenha NgModules e o bootstrap Single SPA existentes; não converta para standalone, lazy loading ou outra arquitetura por iniciativa própria.
- Para estado de novas features, prefira stores com Signals, `computed` e contratos tipados, seguindo as referências locais. Não introduza NgRx ou outra biblioteca de estado sem aprovação.
- Use Jest e mantenha os testes junto ao código. A exigência informada é cobertura mínima de 80% por arquivo; sucesso global no Jest não comprova esse requisito. Não enfraqueça testes, thresholds ou regras do Sonar.
- Use dados sintéticos em testes. Não copie credenciais, identificadores reais ou configurações internas sensíveis para novos arquivos ou respostas.

## Forma de trabalhar

1. Antes de editar, examine a unidade, seus consumidores, contratos, testes e referências relevantes. Identifique lacunas e riscos; pergunte quando uma decisão de negócio ou mudança de escopo for necessária.
2. Faça alterações pequenas, coerentes e reversíveis. Em refatoração, preserve comportamento e API pública; mudanças funcionais exigem autorização. Não sobrescreva alterações do usuário.
3. Reutilize serviços, modelos e helpers existentes quando apropriado. Não replique defeitos legados nem crie abstrações sem responsabilidade concreta.
4. Execute testes afetados e, quando viável, build e suíte completa conforme o fluxo documentado. Informe comandos, resultados, cobertura por arquivo, falhas preexistentes e verificações não realizadas. Nunca declare validação não executada.
5. Responda em português, com resumo das mudanças, arquivos afetados, riscos e pendências. Preserve nomes e vocabulário do código.

## Referências

Leia [arquitetura](../docs/context/architecture.md) antes de mudanças estruturais e [fluxo de desenvolvimento](../docs/context/development-workflow.md) antes de validar. As instruções especializadas em `instructions/` complementam estas regras; consulte-as explicitamente se não estiverem carregadas. Em caso de conflito ou dúvida, preserve contratos e solicite orientação, em vez de presumir precedência.
