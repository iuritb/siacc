---
name: 'typescript'
description: 'Tipagem estrita, contratos e estilo TypeScript.'
applyTo: 'src/**/*.ts, **/*.spec.ts'
---

# TypeScript 5.1

- Respeite `strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch` e verificações estritas de templates/DI. Não desabilite opções para contornar erros.
- Use tipos explícitos nos contratos públicos, genéricos quando úteis e unions discriminadas para resultados. Use `unknown` em erros e faça narrowing antes de acessar propriedades. Prefira tipos existentes a duplicações.
- Evite `any`, casts duplos, `@ts-ignore`, non-null assertions sem garantia e objetos incompletos convertidos em tipos. Quando uma exceção de interoperabilidade for inevitável, restrinja-a à fronteira e explique a garantia.
- Preserve nomes de campos de DTOs, enums, valores nulos e semântica de serialização. Não renomeie contratos de backend para adequar estilo.
- Prefira funções puras para transformações, parâmetros tipados, retornos explícitos em operações públicas e `readonly` quando adequado. Evite estado global mutável e dependências circulares.
- Siga `.editorconfig`: UTF-8, dois espaços, aspas simples em TS, newline final. Preserve nomenclatura em português e nomes técnicos já usados. Não reformate arquivos inteiros sem necessidade.
- Use recursos compatíveis com TypeScript 5.1 e target ES2022. Não introduza ferramentas de lint ou formatação sem aprovação.
