import { DetalhamentoLoteCobrResponse } from '../../../../../shared/models/autorizacao-agendamento/lote-cobr.model';
import { CobRDoLoteSelecionado } from '../../../domain/lote-agendamentos.model';

export type CobRDoLoteHtml = CobRDoLoteSelecionado;

export type DetalhamentoLoteQueryResult =
  | { ok: true; data: DetalhamentoLoteCobrResponse }
  | { ok: false; abort: true; error: unknown }
  | { ok: false; abort?: false; error: unknown };
