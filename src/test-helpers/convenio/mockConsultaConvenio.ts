// src/testing/mocks/convenios.data.mock.ts
import { EnumTexto, TipoSituacaoConvenio } from '../../app/interfaces';
import {
  ConsultaSimplificadaDTO,
  ConvenioFormatadoTabela,
  ConvenioSituacao,
  EnumStatusConvenio,
  TipoSituacao,
} from '../../app/shared/models/convenio/convenio.model';

/**
 * Helpers para criar estruturas do domínio (builders)
 */

export function criarSituacao(
  tipoEnum: EnumStatusConvenio,
  nome: string,
  ts: string,
  tipoId: number = TipoSituacaoConvenio.ATIVO
): ConvenioSituacao {
  return {
    tipoSituacao: {
      id: tipoId,
      nomeSituacao: nome,
      enum: tipoEnum,
    },
    tsSituacao: ts,
  } as ConvenioSituacao;
}

export function criarConvenioEntrada(params: {
  id: number;
  unidade_relacionamento: number;
  cnpj: string;
  apelido?: string;
  situacoes: ConvenioSituacao[];
}) {
  return {
    id: params.id,
    unidade_relacionamento: params.unidade_relacionamento,
    cnpj: params.cnpj,
    apelido: params.apelido ?? 'Sem apelido',
    convenioSituacao: params.situacoes,
  };
}

/**
 * Mocks prontos para importar nos testes
 */

// 1) Dois convênios, com situações distintas (útil para a maioria dos testes)
export const consultaComDoisConveniosDTO: ConsultaSimplificadaDTO = {
  convenios: [
    criarConvenioEntrada({
      id: 1,
      unidade_relacionamento: 12,
      cnpj: '11222333000181',
      apelido: 'Convenio A',
      situacoes: [
        criarSituacao(EnumStatusConvenio.ATIVO, 'ATIVO', '2024-01-10T00:00:00'),
        criarSituacao(EnumStatusConvenio.CANCELADO, 'CANCELADO', '2023-12-01T00:00:00', 13),
      ],
    }),
    criarConvenioEntrada({
      id: 2,
      unidade_relacionamento: 345,
      cnpj: '00987654000111',
      apelido: 'Convenio B',
      situacoes: [
        criarSituacao(EnumStatusConvenio.CANCELADO, 'CANCELADO', '2024-01-05T00:00:00', 13),
        criarSituacao(EnumStatusConvenio.ATIVO, 'ATIVO', '2023-11-20T00:00:00'),
      ],
    }),
  ],
} as unknown as ConsultaSimplificadaDTO;

// 2) DTO com data inválida para testar robustez de parsing
export const consultaComDataInvalidaDTO: ConsultaSimplificadaDTO = {
  convenios: [
    criarConvenioEntrada({
      id: 3,
      unidade_relacionamento: 1,
      cnpj: '12345678000199',
      apelido: 'Convenio Inválido',
      situacoes: [
        criarSituacao(EnumStatusConvenio.ATIVO, 'ATIVO', 'data-ruim'), // inválida
      ],
    }),
  ],
} as unknown as ConsultaSimplificadaDTO;

// 3) DTO vazio (nenhum convênio)
export const consultaVaziaDTO: ConsultaSimplificadaDTO = {
  convenios: [],
} as unknown as ConsultaSimplificadaDTO;

// 4) Muitos convênios (30) para testar paginação/dadosPaginados/pageSizeOptions
export const consultaComTrintaConveniosDTO: ConsultaSimplificadaDTO = {
  convenios: Array.from({ length: 30 }).map((_, i) =>
    criarConvenioEntrada({
      id: i + 1,
      unidade_relacionamento: (i % 50) + 1,
      cnpj: String(10000000000000 + i), // 14 dígitos
      apelido: `Convenio ${i + 1}`,
      situacoes: [
        // alterna ATIVO e INATIVO; datas progressivas
        criarSituacao(
          i % 2 === 0 ? EnumStatusConvenio.ATIVO : EnumStatusConvenio.CANCELADO,
          i % 2 === 0 ? 'ATIVO' : 'INATIVO',
          `2024-01-${String((i % 28) + 1).padStart(2, '0')}T00:00:00`,
          i % 2 === 0 ? TipoSituacaoConvenio.ATIVO : (999 as any)
        ),
      ],
    })
  ),
} as unknown as ConsultaSimplificadaDTO;

// 5) Poucos convênios (3) — útil para testar pageSizeOptions com total pequeno (→ [1, 3] pela sua regra atual)
export const consultaComTresConveniosDTO: ConsultaSimplificadaDTO = {
  convenios: [
    criarConvenioEntrada({
      id: 10,
      unidade_relacionamento: 1,
      cnpj: '11111111000111',
      apelido: 'Tres A',
      situacoes: [criarSituacao(EnumStatusConvenio.ATIVO, 'ATIVO', '2024-01-01T00:00:00')],
    }),
    criarConvenioEntrada({
      id: 11,
      unidade_relacionamento: 2,
      cnpj: '22222222000122',
      apelido: 'Tres B',
      situacoes: [criarSituacao(EnumStatusConvenio.ATIVO, 'ATIVO', '2024-01-02T00:00:00')],
    }),
    criarConvenioEntrada({
      id: 12,
      unidade_relacionamento: 3,
      cnpj: '33333333000133',
      apelido: 'Tres C',
      situacoes: [criarSituacao(EnumStatusConvenio.ATIVO, 'ATIVO', '2024-01-03T00:00:00')],
    }),
  ],
} as unknown as ConsultaSimplificadaDTO;

/**
 * Caso você queira também um mock no formato já "processado" (ConvenioFormatadoTabela),
 * segue um exemplo com dois registros. Útil quando você quer testar filtros sem passar por ngOnChanges.
 */

export const conveniosFormatadosBase: ConvenioFormatadoTabela[] = [
  {
    id: 1,
    unidade: '0012',
    cnpjFormatado: '11.222.333/0001-81',
    apelido: 'Convenio A',
    situacao: 'ATIVO',
    enumSituacao: EnumStatusConvenio.ATIVO,
    dataInclusao: '10/01/2024',
  },
  {
    id: 2,
    unidade: '0345',
    cnpjFormatado: '00.987.654/0001-11',
    apelido: 'Convenio B',
    situacao: 'INATIVO',
    enumSituacao: EnumStatusConvenio.CANCELADO,
    dataInclusao: '05/01/2024',
  },
];

/**
 * Valores utilitários
 */

export const TEXTO_NAO_INFORMADO = EnumTexto.NAO_INFORMADO;

// MOCK CARD CONSULTA

// ---------- Builders (fábricas) estritamente tipados ----------
export function buildTipoSituacao(partial?: Partial<TipoSituacao>): TipoSituacao {
  return {
    id: 1,
    enum: 11,
    nomeSituacao: 'Ativo',
    descricaoSituacao: 'Ativo',
    flagSituacaoAtiva: 'S',
    dataInicioVigenciaTipoSituacao: '2024-01-01',
    dataFimVigenciaTipoSituacao: null,
    ...partial
  };
}

export function buildConsultaSimplificadaDTO(partial?: Partial<ConsultaSimplificadaDTO>): ConsultaSimplificadaDTO {
  // convenios vazio evita depender de TipoSituacaoConvenio/TipoServico/etc.
  return {
    cnpj: '12345678000199',
    convenios: [],
    ...partial
  };
}
