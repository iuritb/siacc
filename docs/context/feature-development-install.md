# SIACC Feature Development Kit v1.0

Extraia na raiz do repositório com SIACC Copilot Context v1.0 instalado. Este ZIP é complementar; não substitui seus nove arquivos. Compare conflitos antes de extrair. Abra raiz no VS Code, verifique customizações e selecione agente/skill. Comece em `docs/work-items/STRY00144093/START.md`.

Skills são pontos de entrada manuais; não há handoffs automáticos. Agentes de análise/arquitetura/revisão usam read/search; o desenvolvedor usa ferramentas disponíveis da sessão, condicionado à aprovação. Reviewer sem terminal solicita evidências ao usuário ou execução separada. Restrições textuais não são sandbox de segurança: revise permissões de ferramentas e diffs, não habilite autoaprovação. Se sua versão não descobrir agentes/skills, use chat com arquivos anexados e mesmas regras. Não incluímos prompt files legados: documentação atual informa que são exclusivos do Local harness em descontinuação. Skills substituem esse papel. Não há dependência de ServiceNow/Figma conectado.

Uso pessoal: mantenha documentos de HU fora de commits compartilhados até autorização da equipe; use exclusão local Git se apropriado, sem modificar .gitignore compartilhado. Não inclua dados reais em fixtures. Cópias minimizadas não substituem a fonte oficial. Não foram executados build, testes ou validação em VS Code.

Referências oficiais: https://code.visualstudio.com/docs/agent-customization/agent-skills ; https://code.visualstudio.com/docs/agents/reference/custom-agent-file-reference ; https://code.visualstudio.com/docs/agent-customization/migrate-customizations
