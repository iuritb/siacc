**Os campos das duas tabelas foram extraídos exclusivamente do texto da HU**, presente no arquivo `download consolidado.md`.

Utilizei a imagem do Figma apenas para os exemplos de dados mockados e para a representação visual da tabela.

### **Origem dos campos**

| Campo                     | Texto da HU | Figma |
| ------------------------- | ----------- | ----- |
| **Lista de consolidados** |             |       |
| Tipo de Remessa           | ✓           | ✓     |
| Arquivo                   | ✓           | ✓     |
| Convênio                  | ✓           | ✓     |
| Sequencial                | ✓           | ✓     |
| Data/hora situação        | ✓           | ✓     |
| **Retorno Consolidado**   |             |       |
| Nome                      | ✓           | ✓     |
| Tipo                      | ✓           | ✓     |
| Situação                  | ✓           | ✓     |
| Data do processamento     | ✓           | ✓     |
| Hora do processamento     | ✓           | ✓     |

### **Trechos originais da HU**

**Lista de consolidados — linhas 97 a 107:**

> Antes do CARD acima deve ter a lista de consolidados do dia selecionado, o qual deve conter:
>
> Tipo de Remessa;
>
> Arquivo ( onde faz o download);
>
> Convênio;
>
> Sequencial;
>
> Data/hora situação

**Card Retorno Consolidado — linhas 85 a 95:**

> No CARD deve ter:
>
> Nome
>
> Tipo
>
> Situação
>
> Data do processamento
>
> Hora do processamento

Portanto, mesmo que você não tivesse me enviado a imagem do Figma, a relação de campos seria exatamente a mesma.

**Nenhuma coluna foi acrescentada por interpretação do protótipo.** Os valores mockados, o formato dos links de download e o modelo TypeScript sugerido são referências de implementação, não exigências expressas da HU.