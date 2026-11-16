Reuni os três pacotes que desenvolvemos em um único ZIP, pronto para ser extraído na raiz do repositório SIACC. Você não precisa mais instalar os pacotes separadamente.
SIACC Copilot — Pacote Completo v1.0
ZIP · 35 arquivos · 97 KB Integridade e ausência de conflitos verificadas


Baixar pacote completo 
1. O que está incluído
Pacote	Arquivos	Finalidade
Copilot Context v1.0	9	Contexto técnico e arquitetural do SIACC
Feature Development Kit v1.0	21	Desenvolvimento supervisionado de HUs
Mock-First Extension v1.0	5	Desenvolvimento com mocks e referências do Figma
Total	35	

Todos os arquivos originais foram preservados integralmente.
2. Estrutura completa
.github/
├── copilot-instructions.md
│
├── instructions/
│   ├── angular.instructions.md
│   ├── architecture.instructions.md
│   ├── state-management.instructions.md
│   ├── testing.instructions.md
│   ├── typescript.instructions.md
│   ├── ui.instructions.md
│   ├── feature-development.instructions.md
│   └── mock-first-development.instructions.md
│
├── agents/
│   ├── requirements-analyst.agent.md
│   ├── feature-architect.agent.md
│   ├── feature-developer.agent.md
│   └── feature-reviewer.agent.md
│
└── skills/
    ├── user-story-analysis/SKILL.md
    ├── feature-investigation/SKILL.md
    ├── feature-design/SKILL.md
    ├── feature-implementation/SKILL.md
    ├── acceptance-validation/SKILL.md
    ├── figma-to-feature/SKILL.md
    └── mock-first-development/SKILL.md

docs/
├── context/
│   ├── architecture.md
│   ├── development-workflow.md
│   ├── feature-development-workflow.md
│   └── feature-development-install.md
│
├── templates/
│   ├── requirements-analysis.md
│   ├── technical-investigation.md
│   ├── feature-technical-design.md
│   └── acceptance-checklist.md
│
└── work-items/
    └── STRY00144093/
        ├── START.md
        ├── user-story.md
        ├── consolidado-dependencia.md
        ├── requirements-analysis.md
        ├── approvals.md
        ├── scope-mock-first.md
        └── figma-reference.png


3. Como instalar
1. Baixe o pacote completo.
2. Extraia o conteúdo diretamente na raiz do repositório.
3. Se já instalou algum dos pacotes anteriores, compare os arquivos antes de sobrescrevê-los.
4. Abra a raiz do SIACC no VS Code.
5. Abra uma nova conversa no GitHub Copilot Chat.
O resultado deverá ser semelhante a isto:
siacc-pixautomatico-frontend


.github
← Pacote Copilot

.vscode


docs
← Pacote Copilot

src


angular.json


jest.config.ts


package.json


tsconfig.json


Não é necessário executar npm install, modificar o angular.json ou instalar bibliotecas adicionais.
4. Entendendo como utilizar cada recurso
Você não precisa mencionar todos os 35 arquivos sempre que conversar com o Copilot.

Instructions — Regras do projeto

Orientam o Copilot sobre Angular, arquitetura, testes, TypeScript e outras convenções. São aplicadas conforme o contexto e os padrões de arquivos configurados.




Agents — Especialistas

Você seleciona o agente conforme a etapa do desenvolvimento: analista, arquiteto, desenvolvedor ou revisor.




Skills — Procedimentos

Contêm os passos que o Copilot deverá seguir para executar determinada tarefa. Podem ser invocadas pelo nome ou referenciadas diretamente.




Docs — Conhecimento e memória do desenvolvimento

Armazenam documentação arquitetural, templates, requisitos das HUs, decisões e aprovações.



5. Como desenvolver sua HU atual
Vamos utilizar a STRY00144093 — Tela de consulta e download de arquivo consolidado CNAB no HUB.

Todo o contexto necessário já está organizado na pasta:

docs/work-items/STRY00144093/

Inclusive a imagem do Figma e a definição de que o desenvolvimento atual será exclusivamente frontend com mocks.
Etapa 0 — Verificar a instalação
No Copilot Chat, envie:
Identifique as customizações do GitHub Copilot disponíveis neste repositório.

Liste as instruções, agents, skills e documentos de contexto encontrados.

Resuma a arquitetura desejada do SIACC, as restrições técnicas e o workflow de desenvolvimento de HUs.

Não altere nenhum arquivo.




Verifique se o Copilot reconheceu os quatro agents, as sete skills e as instruções do projeto. Essa resposta é uma verificação inicial, não uma garantia de que todas as instruções serão aplicadas em todas as sessões.
Etapa 1 — Análise de requisitos
Comece aqui
Selecione o agent requirements-analyst no seletor de agentes do Copilot Chat, caso esteja disponível.
Execute exclusivamente a etapa 1 do desenvolvimento da HU STRY00144093.

Leia todos os arquivos disponíveis em docs/work-items/STRY00144093/.

Utilize as skills user-story-analysis, figma-to-feature e mock-first-development.

Considere que:
- O desenvolvimento atual é exclusivamente frontend.
- O backend ainda não foi desenvolvido.
- Os dados e consultas serão mockados.
- A HU é a fonte de verdade dos requisitos.
- O Figma é apenas uma referência visual.
Revise a análise de requisitos, identifique dúvidas e apresente a matriz de rastreabilidade.

Não altere o código-fonte.

Aguarde minha aprovação explícita antes de avançar.




Resultado esperado: uma análise dos requisitos, das lacunas da HU e das diferenças entre a descrição negocial e o Figma.

Revise a resposta, esclareça as dúvidas e somente então aprove a etapa A1.
Etapa 2 — Investigação técnica
Selecione o agent feature-architect.
Aprovo a etapa A1 da HU STRY00144093.

Execute exclusivamente a etapa 2 utilizando a skill feature-investigation.

Investigue o código existente relacionado ao Relatório de Remessas, aos componentes SIDSC, às tabelas, aos filtros, ao controle de acesso e aos mecanismos de download.

Identifique os componentes e serviços que podem ser reutilizados e os impactos da nova funcionalidade.

Não implemente código-fonte.

Apresente o diagnóstico técnico e aguarde minha aprovação A2.




Resultado esperado: o Copilot localizará no repositório os arquivos reais que deverão ser utilizados, reutilizados ou modificados.
Etapa 3 — Planejamento arquitetural
Permaneça com o agent feature-architect.
Aprovo a etapa A2 da HU STRY00144093.

Execute exclusivamente a etapa 3 utilizando as skills feature-design e mock-first-development.

Elabore o planejamento técnico da funcionalidade de Retorno Consolidado, considerando a análise de requisitos e a investigação aprovadas.

Defina os componentes, modelos internos, gerenciamento de estado, fonte de dados mockada, integração com a interface existente e estratégia de testes.

Divida a implementação em incrementos pequenos e verificáveis.

Não implemente código-fonte.

Apresente o plano e aguarde minha aprovação A3.




Resultado esperado: um plano detalhado contendo a estrutura de arquivos, as responsabilidades de cada componente e a ordem de implementação.

É nesta etapa que você deverá avaliar se a arquitetura proposta está adequada.
Etapa 4 — Implementação incremental
Selecione o agent feature-developer.
Aprovo a etapa A3 da HU STRY00144093.

Utilize as skills feature-implementation e mock-first-development.

Execute exclusivamente o primeiro incremento do planejamento aprovado.

Respeite as instruções técnicas e arquiteturais do SIACC.

Implemente os testes correspondentes e apresente os arquivos criados ou modificados, os resultados dos testes e as pendências.

Não avance para o próximo incremento sem minha autorização explícita.




Resultado esperado: código funcional correspondente apenas ao incremento autorizado.

Após revisar o código, você poderá autorizar o próximo incremento:
Aprovo o incremento implementado.

Registre a aprovação e execute exclusivamente o próximo incremento do planejamento da HU STRY00144093.

Ao finalizar, apresente as alterações, os testes e aguarde minha aprovação.




Repita esse processo até concluir todos os incrementos.
Etapa 5 — Revisão final
Selecione o agent feature-reviewer.
Todos os incrementos da HU STRY00144093 foram implementados e aprovados.

Execute a etapa de revisão final utilizando a skill acceptance-validation.

Compare a implementação com a HU original, a matriz de rastreabilidade, o escopo mock-first e o planejamento aprovado.

Verifique arquitetura, qualidade do código, critérios de aceite, testes, cobertura e possíveis regressões.

Diferencie requisitos efetivamente atendidos daqueles que dependem da futura integração com o backend.

Não corrija automaticamente os problemas encontrados.

Apresente o relatório final para minha aprovação A5.




Resultado esperado: um relatório indicando o que foi atendido, quais problemas foram encontrados e o que continuará pendente até a implementação do backend.

6. Resumo do workflow
Esta é a sequência que você deverá seguir durante o desenvolvimento.
1. Requirements Analyst
   
   /user-story-analysis
   Entender a HU → Aprovação A1
2. Feature Architect
   
   /feature-investigation
   Investigar o código → Aprovação A2
3. Feature Architect
   
   /feature-design
   Planejar a solução → Aprovação A3
4. Feature Developer
   
   /feature-implementation
   Implementar um incremento → Aprovação A4Repetir para cada incremento aprovado.
5. Feature Reviewer
   
   /acceptance-validation
   Validar a implementação → Aprovação A5

Se os comandos iniciados por / não estiverem disponíveis na sua versão do Copilot, referencie diretamente o arquivo SKILL.md correspondente. Os prompts anteriores também podem ser utilizados sem os comandos.
7. Checklist de acompanhamento
Você pode utilizar este checklist para acompanhar o processo.
STRY00144093

0/11



[ ] Extrair o pacote na raiz do SIACC
[ ] Verificar o carregamento das customizações
[ ] Analisar os requisitos da HU
[ ] Aprovar análise de requisitos — A1
[ ] Investigar o código existente
[ ] Aprovar diagnóstico técnico — A2
[ ] Elaborar planejamento arquitetural
[ ] Aprovar planejamento — A3
[ ] Implementar e aprovar todos os incrementos — A4
[ ] Executar revisão final
[ ] Aprovar entrega frontend — A5
O registro oficial das aprovações do desenvolvimento assistido deve permanecer no arquivo approvals.md da HU.
8. Como utilizar o pacote em futuras HUs
Os agents, instructions e skills são reutilizáveis. Você não precisará criar novos agentes para cada história.

Para uma nova HU, crie uma pasta com seu identificador:
docs/work-items/
└── STRYXXXXXXXX/
    ├── user-story.md
    ├── requirements-analysis.md
    ├── technical-investigation.md
    ├── implementation-plan.md
    ├── validation-report.md
    └── approvals.md


Coloque a descrição da HU em user-story.md e, quando houver, adicione as imagens do Figma. Os demais documentos poderão ser preenchidos ao longo do workflow, utilizando os templates disponíveis.

O Copilot deverá seguir as mesmas cinco etapas, independentemente da funcionalidade que estiver sendo desenvolvida.
9. Cuidados importantes
- Não habilite a aprovação automática irrestrita de ferramentas do Copilot.
- Não autorize todas as etapas de uma vez.
- Não compartilhe documentos negociais em commits sem autorização.
- Não considere os mocks como uma integração real com o backend.
- Preserve as funcionalidades existentes e evite refatorações fora do escopo.
Validação do pacote: conferi os três ZIPs originais, reuni os 35 arquivos sem modificar seu conteúdo e verifiquei a integridade do novo ZIP. Não houve colisões de caminhos. Ainda não foi possível validar o funcionamento na sua versão instalada do Copilot, e nenhum build ou teste do SIACC foi executado.

O arquivo START.md contém o fluxo original de inicialização. Para a HU atual, prefira o prompt da etapa 1 apresentado nesta resposta, pois ele incorpora as definições posteriores sobre mocks e Figma.

Para começar agora: baixe o pacote, extraia na raiz do SIACC, abra o Copilot Chat e execute a etapa 0. Depois, inicie a análise de requisitos com o agent requirements-analyst.