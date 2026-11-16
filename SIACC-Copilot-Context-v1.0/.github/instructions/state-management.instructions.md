---
name: 'state-management'
description: 'Signals, stores, query services, gateways e concorrência.'
applyTo: 'src/app/features/**/*.ts, src/app/pages/**/*.ts, src/app/services/**/*.ts'
---

# Estado e operações assíncronas

- Em features novas, prefira classes injetáveis com `signal<T>()` privado, exposição `asReadonly()` e `computed()` para estado derivado. Use métodos públicos para ações e `set`/`update` internamente. Evite expor WritableSignal ou mutar arrays/objetos em lugar; `asReadonly()` não garante imutabilidade profunda.
- Modele ausência de dados com `T | null` ou outro estado explícito. Não use `null as any`. Evite duplicar estado derivável; mantenha efeitos para efeitos colaterais, não para sincronização desnecessária.
- Preserve escopo DI: store de débito e stores dos modais são locais; autorizações e store principal de lote são root; stores/queries das subfeatures de lote são fornecidas pelo shell. Escolha novos escopos conforme vida útil e isolamento; não converta todos para root.
- Separe estado de consulta, envio, erro, resultado, filtros e paginação quando necessário. Preserve transições, reset, dados anteriores e estados vazios conforme comportamento real.
- Query services/gateways delegam a serviços existentes, encapsulam operações e retornam contratos explícitos. Preserve `DebitoManualPendenteGatewayResult<T>` (`ok`, `data`, `error`, `abort`) e `ConsultaResult` discriminado por `type` e `domain` onde usados. Não imponha um contrato global nem separação rígida de comandos/consultas.
- Use `async/await` e `AbortController` onde os serviços já aceitam esse contrato. Não converta Observables em Promises indiscriminadamente. Preserve operadores RxJS, tratamento de erro e semântica de cancelamento existentes.
- Ao iniciar nova consulta, cancele a anterior quando aplicável; mantenha identidade da operação e impeça respostas antigas (inclusive `finally`) de alterar estado da nova. Não confunda cancelamento com erro funcional. Use `ehAbortError` quando compatível com o contrato existente.
- Evite envios duplicados; libere loading/sending no término da operação correspondente, inclusive em falhas. Cancele recursos no encerramento do proprietário; não encerre recursos compartilhados sem verificar consumidores.
- Preserve semântica de respostas parciais e completas. No gateway de débito, autorização retorna lista completa; retentativa e acerto retornam somente cobranças modificadas, conforme comentários do contrato. Não substitua toda a coleção por uma resposta parcial.
- Teste transições, concorrência, cancelamento, reset e erros relevantes. Não introduza bibliotecas de estado.
