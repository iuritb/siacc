1. ## Antes de iniciar A2 — Consolidar e aprovar A1

Existe uma etapa intermediária importante: o Copilot ainda considera a análise A1 v0.2 pendente, e as suas respostas precisam ser incorporadas aos documentos da HU.

Agent: requirements-analyst

```
    # STRY00144093 — Consolidação da análise A1

    Considerando a análise A1 v0.2 e as respostas que forneci às seis questões levantadas, atualize a análise de requisitos da HU STRY00144093.

    ## Decisões confirmadas

    1. A funcionalidade deverá ficar na tela existente de Relatório de Remessas, utilizando um tab group para separar Remessas e Consolidados.
    2. A data inicial deverá ser a data do dia vigente.
    3. Após a consulta, deverá ser apresentada a tabela com os consolidados referentes à data consultada.
    4. Data/hora situação e data/hora do processamento são informações dos registros retornados pela fonte de dados, não valores calculados pelo componente.
    5. O card Retorno Consolidado deverá permanecer oculto até que o usuário clique em uma linha da tabela.
    6. O card deverá apresentar os detalhes do consolidado selecionado.
    7. A ação de download deverá estar disponível na coluna Arquivo da tabela de listagem.
    8. Nesta fase, devemos desenvolver exclusivamente o frontend, com dados e consultas mockadas, preparando a estrutura para futura integração com o backend.
    9. O comportamento de acesso do usuário Matriz deverá seguir o padrão existente no Relatório de Remessas.
    10. A HU é a fonte de verdade dos requisitos, complementada pelas decisões acima. O Figma é apenas uma referência visual.

    ## Tarefa

    - Atualize requirements-analysis.md, gerando uma nova revisão A1 v0.3.
    - Atualize scope-mock-first.md para refletir as decisões confirmadas.
    - Atualize a matriz de rastreabilidade.
    - Diferencie critérios oficiais da HU, decisões complementares e questões ainda pendentes.
    - Não transforme elementos exclusivos do Figma em requisitos obrigatórios.
    - Não invente respostas para questões que ainda não foram esclarecidas.
    - Preserve os critérios de aceite originais.

    Apresente a análise consolidada para minha aprovação.

    Não altere código-fonte e não inicie A2.

```

Após revisar o resultado, caso esteja correto, envie:

```
Aprovo a etapa A1, versão v0.3, da HU STRY00144093, considerando o escopo frontend mock-first e as decisões complementares registradas.

Registre a aprovação em approvals.md.

Aguarde o início da etapa A2.


```


2. ## Etapa A2 — Investigação técnica

Agent: feature-architect

Skill: feature-investigation

Este é o prompt mais importante para o seu momento atual. Precisamos descobrir como incorporar a nova funcionalidade à tela existente sem comprometer o funcionamento do Relatório de Remessas.

```
    # STRY00144093 — A2: Investigação técnica

    Execute exclusivamente a etapa A2 do workflow de desenvolvimento da HU STRY00144093, utilizando a skill feature-investigation.

    Considere a análise A1 aprovada e todos os documentos disponíveis em docs/work-items/STRY00144093/.

    ## Objetivo

    Investigar a implementação atual do Relatório de Remessas e identificar a melhor forma de incorporar a funcionalidade de consulta e download de consolidados CNAB, seguindo a arquitetura de features do SIACC.

    ## 1. Investigação da funcionalidade existente

    Identifique:

    - O componente efetivamente associado à rota do Relatório de Remessas.
    - Os componentes, serviços, modelos e dependências utilizados.
    - A estrutura atual do template e dos estilos.
    - O fluxo de consulta e apresentação dos resultados.
    - O mecanismo de controle de acesso, especialmente para o usuário Matriz.
    - Os mecanismos existentes de download de arquivos.
    - Os testes existentes.
    - As responsabilidades que precisam ser preservadas.

    Não presuma que componentes com nomes semelhantes correspondam à tela efetivamente utilizada.

    ## 2. Investigação dos componentes de interface

    Localize exemplos reais no projeto de:

    - Tab groups.
    - Seletores de data.
    - Formulários de consulta.
    - Tabelas com linhas selecionáveis.
    - Colunas contendo links ou ações de download.
    - Cards de detalhamento.
    - Indicadores de carregamento.
    - Mensagens de erro e ausência de resultados.

    Priorize os componentes SIDSC e identifique suas APIs reais, imports, propriedades e eventos.

    Não invente APIs da biblioteca proprietária.

    ## 3. Investigação arquitetural

    Analise as features de referência:

    - debito-manual-pendente
    - autorizacoes-agendamentos
    - lote-agendamentos

    Identifique padrões reutilizáveis para:

    - Componentes de apresentação.
    - Signal Stores.
    - Query Services ou Gateways.
    - Modelos e contratos internos.
    - Dados mockados.
    - Seleção de registros e exibição de detalhes.
    - Gerenciamento de estado.
    - Testes unitários.

    Avalie especialmente o padrão de seleção de registros e detalhamento existente em lote-agendamentos.

    ## 4. Integração com o Relatório de Remessas

    Investigue alternativas para introduzir um tab group com as abas Remessas e Consolidados.

    Identifique como preservar a funcionalidade existente, mantendo a nova feature isolada de suas responsabilidades.

    Avalie:

    - Impactos no componente atual.
    - Necessidade de um componente shell.
    - Reutilização da rota existente.
    - Escopo de injeção das stores.
    - Comportamento ao alternar entre abas.
    - Preservação dos filtros e estados existentes.
    - Controle de acesso.

    Não determine antecipadamente que uma refatoração completa da tela existente será necessária.

    ## 5. Desenvolvimento mock-first

    Identifique como estruturar consultas mockadas para:

    - Listar consolidados por data.
    - Selecionar um consolidado.
    - Apresentar seus detalhes.
    - Preparar a ação de download para integração futura.

    Não crie endpoints, DTOs oficiais, arquivos CNAB ou contratos fictícios de backend.

    ## Entrega

    Produza o diagnóstico técnico contendo:

    - Arquivos investigados e suas responsabilidades.
    - Componentes e padrões reutilizáveis.
    - Fluxo atual da funcionalidade.
    - Pontos de integração da nova feature.
    - Alternativas técnicas identificadas.
    - Riscos de regressão.
    - Dependências e questões ainda pendentes.
    - Recomendações fundamentadas no código existente.

    Registre o resultado em technical-investigation.md.

    Não implemente código-fonte, não refatore componentes e não avance para A3.

    Aguarde minha aprovação explícita do diagnóstico técnico.

```

O que espero dessa investigação
O Copilot deverá responder, principalmente, se a melhor alternativa é introduzir o tab group no componente existente ou criar um shell responsável por coordenar as duas funcionalidades.

Essa decisão não deve ser tomada sem investigar o repositório.

3. ## Etapa A3 — Planejamento arquitetural

Agent: feature-architect

Skills: feature-design e mock-first-development

Utilize este prompt somente depois de revisar e aprovar o diagnóstico da etapa A2.


```
    # STRY00144093 — A3: Planejamento arquitetural

    Considerando a aprovação da etapa A2, execute exclusivamente a etapa A3 do workflow de desenvolvimento.

    Utilize as skills feature-design e mock-first-development.

    Leia a análise de requisitos e o diagnóstico técnico aprovados.

    ## Objetivo

    Elaborar o planejamento completo da nova feature de consulta e download de consolidados CNAB, utilizando a arquitetura de features do SIACC.

    ## Comportamento funcional

    A funcionalidade deverá:

    - Integrar-se à tela existente de Relatório de Remessas por meio de um tab group.
    - Preservar integralmente o comportamento da aba Remessas.
    - Disponibilizar a nova funcionalidade na aba Consolidados.
    - Inicializar o campo de data com o dia vigente.
    - Permitir a consulta mockada dos consolidados referentes à data selecionada.
    - Apresentar inicialmente apenas a tabela de resultados.
    - Permitir selecionar um consolidado clicando em uma linha.
    - Exibir o card Retorno Consolidado somente após a seleção.
    - Preparar a ação de download na coluna Arquivo.

    ## Campos obrigatórios

    Tabela de listagem:

    - Tipo de Remessa.
    - Arquivo.
    - Convênio.
    - Sequencial.
    - Data/hora situação.

    Card Retorno Consolidado:

    - Nome.
    - Tipo.
    - Situação.
    - Data do processamento.
    - Hora do processamento.

    ## Planejamento arquitetural

    Defina e justifique:

    - Estrutura de diretórios e arquivos.
    - Componentes e suas responsabilidades.
    - Integração com o componente existente.
    - Modelos internos provisórios.
    - Signal Store e seu escopo.
    - Query Service ou Gateway.
    - Fonte de dados mockada.
    - Fluxo de consulta e seleção.
    - Fluxo de apresentação dos detalhes.
    - Ponto de extensão para o futuro download real.
    - Estratégia de controle de acesso.
    - Estratégia de testes.

    Utilize as conclusões da investigação técnica para fundamentar essas decisões.

    ## Gerenciamento de estado

    Planeje o gerenciamento dos estados necessários à interface, incluindo:

    - Data selecionada.
    - Resultado da consulta.
    - Consolidado selecionado.
    - Visibilidade do detalhamento.
    - Carregamento, erro e ausência de resultados, conforme padrões existentes ou decisões aprovadas.

    Apresente uma proposta para o comportamento da seleção ao realizar uma nova consulta e ao alternar entre abas.

    Não trate essas propostas como requisitos previamente aprovados.

    ## Restrições

    - Angular 16.
    - Componentes SIDSC.
    - Arquitetura de features.
    - Tipagem estrita.
    - Testes com Jest.
    - Meta mínima de 80% de cobertura por arquivo segundo SonarQube.
    - Nenhuma integração real com backend nesta fase.
    - Nenhuma alteração desnecessária nas funcionalidades existentes.

    ## Entrega

    Crie implementation-plan.md contendo:

    1. Arquitetura proposta.
    2. Árvore de arquivos planejada.
    3. Responsabilidades de cada arquivo.
    4. Fluxo de dados e estados.
    5. Decisões técnicas justificadas.
    6. Matriz de rastreabilidade.
    7. Estratégia de testes.
    8. Implementação dividida em incrementos pequenos e verificáveis.
    9. Riscos e pendências.
    10. Estratégia para futura integração com o backend.

    Não implemente código-fonte.

    Aguarde minha aprovação A3.

```

4. ## Arquitetura que espero avaliar em A3
Como referência preliminar, imagino algo próximo desta organização:

```
features/
└── retorno-consolidado/
    ├── application/
    │   ├── query/
    │   │   └── retorno-consolidado-query.service.ts
    │   └── retorno-consolidado.store.ts
    │
    ├── domain/
    │   ├── models/
    │   └── mocks/
    │
    ├── presentation/
    │   ├── tabela-consolidados/
    │   └── detalhes-consolidado/
    │
    ├── retorno-consolidado.component.ts
    ├── retorno-consolidado.component.html
    ├── retorno-consolidado.component.scss
    └── retorno-consolidado.component.spec.ts
```

Estrutura ilustrativa, não uma arquitetura aprovada. O diagnóstico técnico poderá indicar outra organização.A separação de responsabilidades seria aproximadamente:
Elemento	Responsabilidade
Componente existente ou shell	Coordenar as abas.
RetornoConsolidadoComponent	Coordenar a nova funcionalidade.
TabelaConsolidadosComponent	Apresentar resultados e emitir eventos.
DetalhesConsolidadoComponent	Apresentar os detalhes do registro selecionado.
Store	Gerenciar consulta, seleção e estados.
Query Service	Encapsular a fonte de dados.
Mocks	Fornecer registros sintéticos.

O Copilot deverá justificar a necessidade de cada componente, evitando fragmentação excessiva.



5. ## Etapa A4 — Implementação incremental

Agent: feature-developer

Skills: feature-implementation e mock-first-development

```
    # STRY00144093 — A4: Implementação incremental

    Considerando a aprovação do planejamento arquitetural A3, inicie a implementação da HU STRY00144093.

    Utilize as skills feature-implementation e mock-first-development.

    Leia todos os documentos aprovados da HU e siga rigorosamente o implementation-plan.md.

    Execute exclusivamente o primeiro incremento autorizado.

    ## Diretrizes

    - Respeite a arquitetura aprovada.
    - Preserve a funcionalidade existente do Relatório de Remessas.
    - Utilize componentes SIDSC conforme os exemplos investigados.
    - Mantenha os mocks separados dos componentes.
    - Não invente contratos de backend.
    - Não implemente funcionalidades não previstas.
    - Não realize refatorações fora do escopo.
    - Implemente os testes correspondentes ao incremento.
    - Não altere dependências ou configurações de infraestrutura.

    ## Ao finalizar

    Apresente:

    - Arquivos criados e modificados.
    - Requisitos atendidos.
    - Decisões técnicas adotadas.
    - Testes implementados.
    - Resultados dos comandos de validação executados.
    - Cobertura dos arquivos afetados, quando disponível.
    - Pendências e limitações.

    Aguarde minha aprovação antes de iniciar o próximo incremento.
```


Uma possível divisão dos incrementos, a ser validada pelo planejamento:
Incremento	Entrega
I01	Modelos internos e fonte de dados mockada.
I02	Query Service e Signal Store.
I03	Formulário de consulta por data.
I04	Tabela de consolidados e seleção de registros.
I05	Card de detalhamento condicional.
I06	Preparação da ação de download.
I07	Integração com o tab group e controle de acesso.
I08	Validação integrada e testes de regressão.

Os testes devem acompanhar cada incremento, não ficar concentrados no último.
Prompt para continuar entre incrementos

```
    Aprovo o incremento apresentado da HU STRY00144093.

    Registre a aprovação em approvals.md.

    Execute exclusivamente o próximo incremento definido no planejamento arquitetural aprovado.

    Preserve as decisões e implementações anteriores.

    Ao concluir, apresente as alterações, os testes, os resultados das validações e aguarde minha aprovação.

```

6. ## Etapa A5 — Revisão final

Agent: feature-reviewer

Skill: acceptance-validation

```
    # STRY00144093 — A5: Revisão final

    Considerando que todos os incrementos foram implementados e aprovados, execute a revisão final da HU STRY00144093.

    Utilize a skill acceptance-validation.

    Compare a implementação com a HU original, as decisões complementares, a análise de requisitos e o planejamento aprovado.

    ## Validação funcional

    Verifique:

    - Integração das abas Remessas e Consolidados.
    - Preservação da funcionalidade existente.
    - Data inicial correspondente ao dia vigente.
    - Consulta mockada por data.
    - Presença das cinco colunas obrigatórias.
    - Ausência do card antes da seleção de um registro.
    - Exibição do card após clicar em uma linha.
    - Correspondência entre o registro selecionado e os detalhes apresentados.
    - Presença dos cinco campos obrigatórios do card.
    - Preparação da ação de download na coluna Arquivo.
    - Comportamento de acesso conforme o Relatório de Remessas.

    ## Validação técnica

    Verifique:

    - Arquitetura de features.
    - Separação de responsabilidades.
    - Gerenciamento de estado.
    - Encapsulamento dos mocks.
    - Tipagem.
    - Utilização correta dos componentes SIDSC.
    - Testes unitários.
    - Cobertura dos arquivos afetados.
    - Possíveis regressões.
    - Preparação para integração futura.

    ## Entrega

    Atualize a matriz de rastreabilidade e produza validation-report.md.

    Classifique os requisitos como:

    - Atendido no escopo frontend.
    - Parcialmente atendido.
    - Não atendido.
    - Dependente de integração futura.

    Não considere o download real, a geração CNAB ou a integração com o backend como concluídos.

    Não corrija automaticamente os problemas encontrados.

    Aguarde minha aprovação final A5.
```


### DUVIDAS

- Se CNAB 750 e CNAB 150 sempre estarão disponíveis simultaneamente ? 
    * A confirmar 
- Quais situações de processamento são possíveis ? 
    * A confirmar 
- O comportamento do card ao realizar uma nova consulta ? 
    -> Ao realizar uma nova consulta o card de detalhes deve ser escondido ate uma nova linha da tabela ser consultada. 
- A persistência dos filtros e da seleção ao alternar entre abas ? 
    * confirmar  
- A necessidade dos filtros Interação, Automático e pesquisa por convênio ? 
    -> nao sao necessarios outros filtros, apenas o de data.  
- O comportamento visual da ação de download enquanto não existir backend ? 
    -> apenas mostre um toast notification avisando que o download sera feito assim que o backend for implementado. 
    
Não considero necessário interromper A2 por causa dessas questões. Algumas poderão ser resolvidas pela investigação dos padrões existentes; as demais deverão ser apresentadas como decisões pendentes em A3.

Minha recomendação para agora: execute os prompts da seção 3 para consolidar A1 e, em seguida, o prompt da seção 4 para realizar A2. Quando o Copilot produzir o diagnóstico técnico, envie-o para mim. Poderemos revisar juntos a investigação antes de autorizar o planejamento arquitetural, ajustando o prompt de A3 às descobertas reais do repositório.