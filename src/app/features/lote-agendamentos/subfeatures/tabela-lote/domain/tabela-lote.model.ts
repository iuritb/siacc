import { FeedbackGenerico } from "../../../../../shared/models/formatador-utils.model";
import { CobRDoLoteSelecionado, LoteCobr, LotesCobrResponse } from "../../../domain/lote-agendamentos.model";

export type LoteCobrHtml = LoteCobr & {
  dataEnvioFormatada: string;
  situacaoFormatada: string;
};

export type CobRDoLoteHtml = CobRDoLoteSelecionado;

export type AtualizarDadosResult =
  | { ok: true }
  | { ok: false; abort: true }
  | { ok: false; abort?: false; feedback: FeedbackGenerico };

export type TabelaLoteQueryResult =
  | { ok: true; data: LotesCobrResponse }
  | { ok: false; abort: true; error: unknown }
  | { ok: false; abort?: false; error: unknown };
