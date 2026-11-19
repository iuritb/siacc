De acordo com a HU **STRY00144093 — Tela de consulta e Download de arquivo consolidado CNAB no HUB**, devem existir duas tabelas distintas.

## **1. Lista de consolidados do dia selecionado**

Deve ser apresentada antes do card Retorno Consolidado.

| Coluna             | Exemplo de dado mockado     |
| ------------------ | --------------------------- |
| Tipo de Remessa    | AUTORIZAÇÃO                 |
| Arquivo            | AUT_CONSOL_20260930_001.REM |
| Convênio           | 123456                      |
| Sequencial         | 7000101                     |
| Data/hora situação | 30/09/2026 16:20            |

O campo **Arquivo** deverá permitir o download.&#x20;

download consolidado.md



## **2. Card Retorno Consolidado**

Esta é a tabela específica para download dos arquivos de retorno consolidados.

| Coluna                | Exemplo de dado mockado      |
| --------------------- | ---------------------------- |
| Nome                  | RET_CONSOL_20260930_750.CNAB |
| Tipo                  | CNAB 750                     |
| Situação              | DISPONÍVEL                   |
| Data do processamento | 01/10/2026                   |
| Hora do processamento | 00:10                        |

Deverá disponibilizar arquivos nos formatos CNAB 750 e CNAB 150.&#x20;

download consolidado.md



### **Exemplo visual da tabela**

**Retorno Consolidado**

| Nome                         | Tipo     | Situação   | Data do processamento | Hora do processamento |
| ---------------------------- | -------- | ---------- | --------------------- | --------------------- |
| RET_CONSOL_20260930_750.CNAB | CNAB 750 | DISPONÍVEL | 01/10/2026            | 00:10                 |
| RET_CONSOL_20260930_150.CNAB | CNAB 150 | DISPONÍVEL | 01/10/2026            | 00:11                 |

## **3. Modelo TypeScript sugerido**

Para a implementação mockada da tabela de Retorno Consolidado:

```
export interface RetornoConsolidado {
  nome: string;
  tipo: 'CNAB 750' | 'CNAB 150';
  situacao: string;
  dataProcessamento: string;
  horaProcessamento: string;
}
```

**Observações:**

- A HU determina que a funcionalidade seja disponibilizada ao usuário Matriz.
- A HU não especifica os possíveis valores de situação.
- Não existe exigência de uma coluna adicional de ações.
- Os nomes dos arquivos e os valores apresentados são exemplos mockados baseados no Figma.
- O modelo TypeScript é uma sugestão de contrato interno do frontend, não um contrato definitivo do backend.