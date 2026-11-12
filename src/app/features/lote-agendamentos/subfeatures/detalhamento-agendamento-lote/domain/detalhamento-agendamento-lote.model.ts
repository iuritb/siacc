import { CobrancaRecorrenteCompleta } from '../../../../../shared/models/autorizacao-agendamento/cobr.model';
import { DetalhamentoAgendamentoLoteFallback } from '../../../../../shared/models/autorizacao-agendamento/lote-cobr.model';

export type DetalhamentoAgendamentoLoteData =
  CobrancaRecorrenteCompleta
  | DetalhamentoAgendamentoLoteFallback;

export type DetalhamentoAgendamentoLoteQueryResult =
  | { ok: true; data: DetalhamentoAgendamentoLoteData }
  | { ok: false; abort: true; error: unknown }
  | { ok: false; abort?: false; error: unknown };
