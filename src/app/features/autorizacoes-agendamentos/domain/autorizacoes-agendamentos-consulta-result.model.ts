import { CobrancasRecorrentesResponse } from '../../../shared/models/autorizacao-agendamento/cobr.model';
import { RecorrenciasResponse } from '../../../shared/models/autorizacao-agendamento/rec.model';
import { EnumOpcoesAutorizacaoAgendamento } from '../../../shared/models/autorizacao-agendamento/utils.enum';
import { LotesCobrResponse } from '../../lote-agendamentos/domain/lote-agendamentos.model';

export enum EnumTipoRetornoConsulta {
  SUCCESS = 'success',
  ERROR = 'error'
}

type ConsultaResultSuccessBase = {
  type: EnumTipoRetornoConsulta.SUCCESS;
  parametrosSemPaginacao: { titulo: string; valor: string }[];
};

export type ConsultaResultSuccessAutorizacao = ConsultaResultSuccessBase & {
  domain: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO;
  data: RecorrenciasResponse;
};

export type ConsultaResultSuccessAgendamento = ConsultaResultSuccessBase & {
  domain: EnumOpcoesAutorizacaoAgendamento.AGENDAMENTO;
  data: CobrancasRecorrentesResponse;
};

export type ConsultaResultSuccessLote = ConsultaResultSuccessBase & {
  domain: EnumOpcoesAutorizacaoAgendamento.LOTE;
  data: LotesCobrResponse;
};

export type ConsultaResultSuccess =
  | ConsultaResultSuccessAutorizacao
  | ConsultaResultSuccessAgendamento
  | ConsultaResultSuccessLote;

export type ConsultaResultError = {
  type: EnumTipoRetornoConsulta.ERROR;
  domain: EnumOpcoesAutorizacaoAgendamento | null;
  error: unknown;
};

export type ConsultaResult = ConsultaResultSuccess | ConsultaResultError;
