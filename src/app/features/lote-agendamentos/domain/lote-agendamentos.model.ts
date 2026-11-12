import { EnumStatusCobR, EnumTipoConta } from "../../../shared/models/autorizacao-agendamento/cobr.enum";
import { EnumPoliticaRetentativa } from "../../../shared/models/autorizacao-agendamento/rec.enum";
import { EnumSituacaoCobrancaLote, EnumStatusLoteCobr, EnumTipoLoteCobr } from "./lote-agendamentos.enum";

export type PaginacaoLoteCobr = {
  paginaAtual: number;
  totalPaginas: number;
  totalRegistros: number;
  itensPorPagina: number;
};

export type IntegracaoLoteCobr = {
  codigo: number;
  retorno?: {
    idRec?: string;
    txid?: string;
    detail?: string;
    status?: number;
    title?: string;
    type?: string;
    violacoes?: { razao?: string; propriedade?: string; valor?: string }[]
  };
  dataHora: string; //date-time
};

export type VinculoCobrLote = {
  objeto?: string;
  contrato?: string;
};

export type DevedorCobrLote = {
  cep?: string;
  cidade?: string;
  email?: string;
  logradouro?: string;
  uf?: string;
  cpf?: string;
  cnpj?: string;
  nome?: string;
};

export type CobRDoLote = {
  idRec?: string;
  txid: string;
  vinculo?: VinculoCobrLote;
  politicaRetentativa?: EnumPoliticaRetentativa;
  infoAdicional?: string;
  calendario?: { criacao?: string; dataDeVencimento?: string };
  valor?: { original: string };
  ajusteDiaUtil?: boolean;
  devedor?: DevedorCobrLote;
  recebedor: {
    conta: string;
    tipoConta: EnumTipoConta;
    agencia?: string;
  };
  status?: EnumStatusCobR;
  situacao: EnumSituacaoCobrancaLote;
  dataHoraSituacao: string; //date-time
  integracao: IntegracaoLoteCobr[];
  atualizacao?: { data: string; status: EnumStatusCobR }[]
};

export type ParametrosLoteCobr = {
  id?: number;
  dataInicio: string;
  dataFim: string;
  cnpj?: string;
  convenio?: string;
  nome?: string;
  tipo?: EnumTipoLoteCobr;
  situacao?: EnumStatusLoteCobr;
  paginacao: PaginacaoLoteCobr;
};

export type LoteCobr = {
  id: number;
  convenio: number;
  nome?: string;
  tipo: EnumTipoLoteCobr;
  situacao: EnumStatusLoteCobr;
  calendario: {
    criacao: string;
  }
  totalSolicitacoes: number;
};

export type LotesCobrResponse = {
  parametros: ParametrosLoteCobr;
  lotesCobr: LoteCobr[];
};

export type CobRDoLoteSelecionado = CobRDoLote & {
  documentoFormatado: string;
  nomeFormatado: string;
  contratoVinculoFormatado: string;
  statusFormatado: string;
  valorOriginalFormatado: string;
  dataVencimentoFormatada: string;
  dataHoraStatusFormatada: string;
  recebedorTipoContaFormatado: string;
  recebedorContaFormatada: string;
  recebedorAgenciaFormatada: string;
  ultimaIntegracao: IntegracaoLoteCobr | undefined;
};
