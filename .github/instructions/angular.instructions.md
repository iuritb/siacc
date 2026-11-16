---
name: 'angular'
description: 'Componentes Angular 16, injeção, módulos e integração Single SPA.'
applyTo: 'src/**/*.ts, src/**/*.html, angular.json, extra-webpack.config.js'
---

# Angular 16 e microfrontend

- Prefira `ChangeDetectionStrategy.OnPush` em componentes novos de features; preserve comportamento de detecção de mudanças em componentes existentes e valide integrações com SIDSC.
- Use `@Input()` (com `required: true` quando aplicável), `@Output()` e `EventEmitter<T>`. Não use signal inputs, `output()`, `@if`, `@for` ou outras APIs posteriores ao Angular 16. Use `*ngIf`, `*ngFor` e `ngSwitch` quando necessário.
- Prefira injeção pelo construtor, dependências `private readonly` quando não reatribuídas e Reactive Forms para formulários complexos. Preserve validações, estados disabled e eventos.
- Declare componentes não standalone no NgModule apropriado; hoje `AppModule` centraliza inclusive as features. Evite declarações/imports duplicados. Não presuma que `SharedModule` esteja importado no módulo raiz.
- Respeite escopo dos providers e ciclo de vida. Limpe subscriptions, efeitos e requisições conforme o proprietário do recurso; use APIs disponíveis na versão instalada.
- Preserve `src/main.single-spa.ts` como entry point configurado, lifecycles `bootstrap`, `mount`, `unmount`, seletor `app-root-main`, publicação de props e `environment.host`. Preserve a condição e o payload do evento `@caixa/application`.
- Em `app-routing.module.ts`, preserve `BASE_ROUTES`, provider dinâmico `ROUTES`, prefixo `host.basehref`, remapeamento `host.caminho`, parâmetro `route`, contexto e breadcrumbs `data.urls`. Não substitua por roteamento estático.
- Use `assetUrl` quando a localização dinâmica dos assets for necessária; não introduza caminhos absolutos `/assets` que dependam do host. Preserve UMD, externalização de `single-spa` e `outputHashing: none`.
- Não altere bootstrap, routing, configuração de build ou providers globais fora do escopo autorizado. Consulte o fluxo de desenvolvimento para validação.
