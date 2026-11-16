---
name: 'testing'
description: 'Jest, testes Angular, mocks e cobertura por arquivo.'
applyTo: 'src/**/*.ts, src/**/*.html, jest.config.ts, setup-jest.ts, sonar.properties'
---

# Testes e qualidade

- Use Jest 29 com `jest-preset-angular` e `setupZoneTestEnv()`. Mantenha specs junto às unidades. Não introduza Karma/Jasmine ou altere configuração para mascarar falhas.
- Instancie stores, query services e helpers diretamente quando não dependerem do contexto Angular. Use TestBed para templates, DI e lifecycle quando necessário. Para providers locais, use `TestBed.overrideComponent` quando apropriado. Não use `SharedModule` automaticamente.
- Reutilize factories e helpers de `src/test-helpers/` quando adequados: `createMocks.ts`, `mockSessionStorage`, `geral/createMockModal.ts`, `convenio/environment-test-setup.ts`. Prefira mocks tipados e dados sintéticos. `Partial<T>` é superficial; cuidado com objetos aninhados e contadores globais.
- Teste comportamento observável, contratos, argumentos de chamadas, eventos, estados e transições. Cubra sucesso, erro, cancelamento, vazio, limites, validação, paginação e concorrência conforme relevância. Evite testes que só repetem implementação ou verificam existência sem valor.
- Isole dependências externas e restaure mocks, timers, storage e alterações de ambiente. Não faça chamadas reais ao backend. Controle Promises/Observables e aguarde conclusão; evite sleeps arbitrários.
- Preserve testes existentes; altere expectativas apenas quando mudança funcional for autorizada ou a expectativa estiver comprovadamente incorreta.
- Execute `npm test -- --runTestsByPath <caminho.spec.ts>` para testes direcionados; execute `npm test` para a suíte completa quando viável. `bail: 1` pode interromper cedo; os thresholds globais podem falhar numa execução parcial.
- Exigência informada: mínimo 80% de cobertura por arquivo. Inspecione métricas individuais dos arquivos afetados, incluindo arquivos não carregados. Não confunda cobertura global ou percentual de linhas com a métrica efetiva do Sonar. Informe lacunas e confirme a regra do servidor quando possível.
- Não reduza thresholds, exclua arquivos, insira ignores de cobertura ou remova testes para obter aprovação. Não edite relatórios gerados manualmente. Registre resultados reais e verificações pendentes.

Consulte [fluxo de desenvolvimento](../../docs/context/development-workflow.md) para comandos e diferenças entre Jest e Sonar.
