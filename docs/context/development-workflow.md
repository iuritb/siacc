# Fluxo de desenvolvimento — SIACC Copilot Context v1.0

## Ambiente e fontes de verdade

`package.json`: Angular 16.2, CLI 16.2.14 (faixa declarada), TS ~5.1.3, RxJS ~7.8.0, Jest ^29.7.0, jest-preset-angular ^14.5.0, SIDSC ^16.1.0, single-spa-angular ^9.1.2. São versões/faixas declaradas, não versões efetivamente instaladas. README informa Node 18.16, npm 9.5.1, Maven 3.6.6 e Java 17.0.11; a necessidade de Maven/Java para tarefas exclusivamente frontend não foi confirmada. Preserve registry e configuração corporativa; não exponha credenciais nem altere dependências sem aprovação.

Priorize configurações executáveis (`package.json`, `angular.json`, tsconfigs, Jest, Sonar) sobre exemplos antigos do README. O README menciona Karma/ng test, mas a configuração Angular analisada não possui target `test`.

## Comandos (na raiz, com dependências instaladas)

| Objetivo | Comando |
| --- | --- |
| Servir | `npm start` |
| Build Angular | `npm run ng -- build` |
| Build produção Single SPA | `npm run build:single-spa:siacc-pixautomatico-frontend` |
| Teste direcionado | `npm test -- --runTestsByPath src/app/caminho/unidade.spec.ts` |
| Suíte completa | `npm test` |
| Watch | `npm run test:watch` |
| Cobertura | `npm run test:coverage` |
| Versão Jest | `npm run test:version` |

Substitua o caminho de exemplo por um arquivo existente. O script `npm run build` combina `ng build && ng test`; pode falhar no segundo passo por ausência de target. Não o corrija automaticamente: use build e Jest separadamente. Servidor usa porta 4200 e live reload desativado; integração com host pode ser necessária. Build usa custom-webpack, UMD, external `single-spa`, sem hashing e estilos globais SIDSC. Preserve budgets e configurações.

## Validação e cobertura

1. Inspecione diff, consumidores, contratos e testes; identifique falhas de baseline quando viável.
2. Execute specs afetadas. Uma execução parcial pode falhar nos thresholds globais; não confunda isso com falha de asserção. `bail: 1` interrompe cedo.
3. Execute build e suíte completa quando viável. Não instale/atualize dependências automaticamente para resolver bloqueios.
4. Inspecione cobertura individual no relatório textual ou LCOV; arquivos ausentes não têm cobertura comprovada. Para diagnóstico de um arquivo, pode-se usar `npm test -- --runTestsByPath <spec> --collectCoverageFrom=<arquivo.ts>` com caminhos reais. Isso não substitui a suíte completa nem a análise Sonar.
5. Informe comandos, status, métricas, falhas preexistentes, riscos e pendências. Não edite relatórios manualmente.

Jest gera `coverage/lcov.info` e `reports/sonarqubeTestReport.xml`. `sonar.properties` importa ambos. Thresholds globais do Jest: branches 50%, functions 70%, lines 40%, statements 40%. Exigência informada pelo usuário: 80% por arquivo segundo SonarQube. O Quality Gate e a métrica exata do servidor não foram disponibilizados. Não afirmar aprovação no Sonar apenas pelo Jest. Não alterar thresholds/exclusões para mascarar lacunas.

## Instalação e verificação do contexto Copilot

- Extraia o ZIP na raiz do repositório, preservando `.github/` e `docs/`. Se houver arquivos homônimos, compare e mescle antes de sobrescrever.
- Abra a raiz no VS Code e use uma sessão do Copilot Chat/Agent com acesso ao workspace. Os arquivos são de escopo do repositório; para uso pessoal, não os inclua em commits compartilhados sem decisão da equipe.
- Em versões que oferecem o comando `Chat: Open Customizations`, verifique a aba Instructions. Em versões anteriores, procure os comandos de instruções no Chat e confira as configurações de carregamento de arquivos. Inicie uma nova conversa e teste uma tarefa representativa sem editar código inicialmente.
- Peça ao Copilot para listar as instruções aplicáveis a uma store em `src/app/features/` e explicar como validaria sua alteração. Confira referências/diagnósticos quando disponíveis. Se necessário, anexe manualmente os arquivos pertinentes. A descoberta não garante obediência; revise diff e testes.
- Os documentos em `docs/context/` são referências para leitura explícita, não instruções automaticamente carregadas por si sós. As instruções são destinadas ao Chat/Agent, não ao autocomplete inline.

Referências oficiais de formato (consultadas em 2026-11-16):
- https://code.visualstudio.com/docs/agents/reference/custom-instructions-reference
- https://code.visualstudio.com/docs/agent-customization/custom-instructions

## Limitações da v1.0

Não foram executados build, Jest ou Sonar durante a elaboração. A versão do VS Code/Copilot e restrições corporativas específicas de dependências não foram confirmadas. As regras propostas são conservadoras e devem ser revisadas pela equipe antes de compartilhamento. Agents, skills e prompts de refatoração estão fora desta versão.
