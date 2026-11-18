A1 — revisão da análise da STRY00144093 — proposta v0.2
Escopo desta resposta: somente análise de requisitos. Li todos os artefatos disponíveis da pasta da HU, incluindo a imagem, além do contexto e do template. Apliquei as skills user-story-analysis, figma-to-feature e mock-first-development. Não alterei arquivos e não avancei para A2.

As condições de trabalho — frontend apenas, backend inexistente, dados e consultas mockados, HU como fonte de requisitos e Figma como referência visual — estão registradas em scope-mock-first.md e também foram reiteradas por você. Elas definem o contexto desta análise, mas não aprovam A1. O registro em approvals.md ainda marca A1 v0.1 como pendente.

Fontes revisadas
user-story.md: cópia local minimizada da descrição vigente, identificada como atualizada em 23/10/2026 às 14:38:30. Não informa número de versão; o ServiceNow continua sendo a fonte oficial.
requirements-analysis.md: rascunho v0.1 explicitamente não aprovado; requer os ajustes indicados abaixo.
consolidado-dependencia.md: resumo de uma HU anterior, sem ID informado. Não substitui a HU original nem adiciona requisitos à atual.
scope-mock-first.md e START.md: escopo e orientações de processo.
approvals.md: aprovações pendentes.
figma-reference.png: referência visual, não fonte de regras.
requirements-analysis.md: template usado como referência para a análise.
Requisitos e rastreabilidade inicial
A HU atual pede um novo card para download de arquivos retorno consolidados CNAB 750 e 150. Determina também uma lista dos consolidados do dia selecionado antes do card. O histórico na própria HU registra que a referência explícita ao Relatório de Remessas foi removida em 21/10; portanto, não considero definida a localização da tela.

ID	Fonte	Requisito	Evidência futura no escopo mock-first	Status
CA01	Critério oficial da HU	Quando houver arquivos processados, disponibilizar para download CNAB 750 e CNAB 150 ao usuário Matriz.	Verificar apresentação e ação simulada de cada tipo com dados sintéticos. Não comprova geração, conteúdo válido nem integração real.	Pendente
CA02	Critério oficial da HU	O card apresenta Nome do arquivo, Tipo do arquivo, Situação, Data do processamento e Hora do processamento.	Verificar os cinco campos com fixtures determinísticas.	Pendente
REQ-01	Descrição vigente da HU	Antes do card, apresentar lista de consolidados referente ao dia selecionado, com Tipo de Remessa, Arquivo, Convênio, Sequencial e Data/hora situação. “Arquivo” é a coluna de download.	Verificar ordem, colunas e ação simulada de download.	Pendente
REQ-02	Descrição vigente da HU	O título do card é Retorno Consolidado.	Verificar o texto do título na apresentação.	Pendente
REQ-03	Descrição vigente e CA01	O ator nomeado é o usuário Matriz.	Verificar apenas comportamento de UI que venha a ser aprovado; a HU não descreve o mecanismo de autorização.	Pendente
DEP-01	consolidado-dependencia.md	Há uma HU anterior sobre geração diária/consolidação e arquivo CNAB.	Registrar como dependência externa; não atribuir sua lógica de geração ou regras ao frontend desta HU.	Não verificado
IDs REQ-* e DEP-* são auxiliares desta análise, não IDs oficiais da HU. A matriz segue o modelo definido no workflow em feature-development-workflow.md.

HU versus referência visual
Exigido pela HU: lista antes do card, os cinco campos da lista, os cinco campos do card, o título “Retorno Consolidado”, os tipos CNAB 750 e 150 e o ator Matriz.
Sugestão visual, não requisito confirmado: abas Remessas/Consolidados, seleção Interação/Automático, pesquisa por Convênio, área “Consultar relatório” e disposição visual detalhada.
Divergência/lacuna: a imagem mostra datas diferentes no filtro, na lista e no processamento do card. São dados demonstrativos; não estabelecem regra nem relação temporal. A imagem sugere um card com linhas para os dois tipos, mas a HU não esclarece a cardinalidade e a associação entre lista e card.
Os nomes, convênios, sequenciais, estados, datas e nomes de arquivos apresentados na imagem são exemplos; não devem ser tratados como dados reais ou regras.
Dúvidas prioritárias
Precisam de decisão antes de fechar escopo funcional e planejar a implementação:

Qual tela/rota deve receber a funcionalidade? A referência anterior ao Relatório de Remessas foi removida do histórico vigente.
O que seleciona o “dia selecionado”? Qual é a data inicial, o comportamento da consulta e a relação dessa data com Data/hora situação e Data/hora do processamento?
O card é único para a data selecionada, com uma linha por tipo disponível, ou deve haver outra relação entre lista, card e arquivos? A imagem sugere uma possibilidade, mas não define o requisito.
Como tratar a disponibilidade individual dos formatos: ambos devem sempre aparecer, ou cada um somente quando existir? Que estados são válidos e como afetam o download?
Como a simulação deve representar o download sem backend nem arquivo CNAB real? A HU pede download, mas os materiais não definem se a interação mock deve apenas simular a ação ou apresentar outro feedback. Não se deve produzir um arquivo fictício como CNAB válido.
“Usuário Matriz” identifica o público, mas qual comportamento é esperado para outros usuários e qual mecanismo existente deve ser respeitado? Não é possível inferir política de autorização a partir da HU ou da imagem.
Não bloqueiam a análise mock-first, mas precisam ser tratadas antes de alegar integração real: endpoints, DTOs, parâmetros, headers, nome/conteúdo do arquivo e tratamento de erros do backend. Conforme o escopo informado, não há contrato a presumir. Estados de carregamento, vazio e erro também precisam de decisão ou confirmação de padrão existente antes de serem especificados como comportamento desta HU.

Ajustes necessários ao rascunho v0.1 e dependência
A revisão v0.1 já identifica os requisitos principais, mas deve separar melhor o que é teste simulado do que depende de integração real. Para CA01, dados e consultas mockados permitem verificar a apresentação e a interação acordada, não download real nem conteúdo CNAB. A rota e a autorização seguem em aberto.

O resumo da HU anterior menciona divergência entre uma regra de inclusão de registros e um exemplo, além de geração batch e leiautes não anexados. Isso não deve ser promovido a regra da STRY00144093 nem resolvido pelo frontend. A cópia da HU anterior mencionada nesse resumo não está disponível na pasta, e não há outra HU relacionada para comparar.

Situação: A1 v0.2 apresentada para sua revisão; não aprovada. Para avançar, aguardo sua aprovação explícita identificando STRY00144093, etapa A1, versão v0.2 e escopo. Até lá, não iniciarei A2.
