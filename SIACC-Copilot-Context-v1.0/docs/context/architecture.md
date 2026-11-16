# Arquitetura SIACC — referência v1.0

## Escopo e evidências

Base: estrutura do repositório, configurações dos lotes 1–3 e código/testes das três features do lote 4. A organização por features foi confirmada como direção desejada. As recomendações abaixo formalizam essa direção, não uma convenção oficial já aprovada pela equipe.

## Organização atual

```text
src/app/
  features/                  # evolução desejada
  pages/                     # telas legadas
  services/                  # integrações e serviços transversais
  shared/                    # componentes, modelos e utilitários compartilhados
  adapters/
  app.module.ts
  app-routing.module.ts
  app.component.ts
  interfaces.ts
```

Estrutura adaptável de feature:

```text
features/<feature>/
  application/
    query/                   # query services / gateways
    store/                   # estado e ações
  domain/                    # modelos, contratos, enums, constantes
  presentation/              # componentes internos, quando necessário
  subfeatures/               # unidades compostas, quando necessário
  <feature>.component.ts     # ou shell
  <feature>.component.html
  <feature>.component.scss   # quando necessário
  <feature>.component.spec.ts
  <feature>.helpers.ts       # quando necessário
```

Não é uma árvore obrigatória: a store principal de lote fica diretamente em `application/`; autorizações não possui pasta `presentation/`. Specs acompanham unidades. O fluxo preferencial é template → componente/shell → store → query/gateway → serviço de API existente. Domain fornece contratos e modelos; helpers apoiam transformações. Serviços de UI podem ser usados diretamente na apresentação. Não há evidência de fronteiras DDD/CQRS estritas.

## Referências reais (caminhos relativos a src/app/features)

| Referência | Uso |
| --- | --- |
| `debito-manual-pendente/application/store/debito-manual-pendente.store.ts` | Signals, filtros, paginação, consulta |
| `debito-manual-pendente/application/query/debito-manual-pendente-query.service.ts` | `DebitoManualPendenteGateway`, consulta e mutações |
| `debito-manual-pendente/domain/debito-manual-pendente-contracts.interface.ts` | Resultados discriminados e contrato de stores de modal |
| `debito-manual-pendente/presentation/` | Card e três modais, providers locais |
| `autorizacoes-agendamentos/application/store/autorizacoes-agendamentos.store.ts` | Store root e orquestração de consultas |
| `autorizacoes-agendamentos/domain/autorizacoes-agendamentos-consulta-result.model.ts` | Resultado discriminado por tipo e domínio |
| `autorizacoes-agendamentos/domain/autorizacoes-agendamentos-presentation-result.model.ts` | Resultado de apresentação: sucesso, modal ou snackbar |
| `autorizacoes-agendamentos/domain/autorizacoes-agendamentos-error-mapper.service.ts` | Mapeamento de erros; domínio atual usa Angular |
| `lote-agendamentos/lote-agendamentos-shell.component.ts` | Coordenação e providers das subfeatures |
| `lote-agendamentos/application/lote-agendamentos.store.ts` | Estado de navegação e seleção |
| `lote-agendamentos/subfeatures/` | Tabela, detalhe de lote e detalhe de agendamento |

### Estado e contratos

Exemplo didático (não é código copiado do projeto):

```typescript
@Injectable({ providedIn: null })
export class ExemploStore {
  private readonly _itens = signal<readonly string[]>([]);
  readonly itens = this._itens.asReadonly();
  readonly total = computed(() => this._itens().length);

  public definirItens(itens: readonly string[]): void {
    this._itens.set([...itens]);
  }
}
```

O componente fornece a store local em `providers` quando o ciclo de vida exige. No débito, gateway root e stores locais; em autorizações e lote, stores principais root; nas subfeatures de lote, stores e queries fornecidas pelo shell. Não uniformizar escopos sem verificar reset e compartilhamento.

O gateway de débito usa `DebitoManualPendenteGatewayResult<T>` com `ok: true`/`data` ou `ok: false`/`error`/`abort?`. Autorizações usa `ConsultaResult` com `EnumTipoRetornoConsulta` e domínio; o resultado de apresentação é outro contrato. Preserve diferenças. A autorização de débito retorna cobranças completas; retentativa/acerto retornam modificações parciais segundo os comentários do gateway.

### Integração e navegação

`angular.json` aponta para `src/main.single-spa.ts`, que recebe props do host, dispara evento condicional, atribui `environment.host`, publica em `singleSpaPropsSubject` (`ReplaySubject(1)`) e inicializa `AppModule`. Exporta bootstrap/mount/unmount. `src/main.ts` existe como entrada alternativa, mas não é a entrada configurada. `AppModule` declara componentes das features e legado. `AppRoutingModule` constrói rotas com contexto do host, prefixo, remapeamento e breadcrumbs. `assetUrl` usa public path do Webpack.

`SharedModule` reúne dependências visuais e exporta recursos de testes; não é importado pelo AppModule observado. Não assumir uso obrigatório. O shell de lote coordena lista, detalhe de lote e detalhe de agendamento, com providers locais das subfeatures; a store principal é root.

### Limites e evolução

Preservar contratos e comportamento é prioritário. Extrações de componentes grandes devem ser incrementais, com testes de caracterização quando necessário. Não generalizar `any`, casts, duplicações ou escopos observados como boas práticas. Não impor independência absoluta do framework ao domínio nem mover serviços globais sem necessidade. A direção de dependências descrita é uma recomendação, não uma restrição verificada por ferramenta estática.
