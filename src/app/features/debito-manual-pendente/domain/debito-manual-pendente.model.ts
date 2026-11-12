import { EnumSituacaoDebitoManual, EnumTipoDebitoManual } from "./debito-manual.enum";

export type ClasseStatusDebitoManual = "status-verde" | "status-amarelo" | "status-vermelho" | "status-cinza";

export type PaginacaoEditavelDebitoManual = {
  paginaAtual: number;
  itensPorPagina: number;
}

export type DebitoManualPendenteResponse = DebitoManualPendenteOriginal[];

export type DebitoManualPendenteOriginal = {
  cnpj: string;
  razaoSocial: string;
  unidadeVinculacao: string;
  convenioId: number;
  periodo: string;//2026-05
  valorApurado: number;
  cobrancas: CobrancaTarifa[];
  dataPrevista: string; //yyyy-mm-dd
}

export type CobrancaTarifa = {
  tipo: EnumTipoDebitoManual;
  repasseId: number;
  valor: number;
  situacao: EnumSituacaoDebitoManual;
  descricaoSituacao: string | null;
  dataSituacao: string; //local date time
}

export type CobrancaTarifaFormatada = CobrancaTarifa & {
  valorFormatado: string;
  situacaoFormatada: string;
  dataSituacaoFormatada: string;
  tipoFormatado: string;
}

export type DebitoManualPendenteFormatado = PermissoesAcaoDebitoManual & {
  cnpj: string;
  razaoSocial: string;
  unidadeVinculacao: string;
  convenioId: number;
  periodo: string;//2026-05
  descricaoMesReferencia: string;
  periodoFormatado: string;
  dataPrevistaFormatada: string;
  valorApurado: string;
  cobrancasFormatadas: CobrancaTarifaFormatada[];
}

export type PermissoesAcaoDebitoManual = {
  podeAutorizar: boolean;
  podeRetentar: boolean;
  podeAcertoManual: boolean;
}
