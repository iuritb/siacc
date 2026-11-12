import { CobRDoLoteSelecionado } from "./lote-agendamentos.model";

export interface LoteAgendamentosSelecaoLote {
  idLote: number;
  convenio: number;
}

export interface LoteAgendamentosSelecaoAgendamento {
  cobSelecionada: CobRDoLoteSelecionado;
  deveConsultarApi: boolean;
}
