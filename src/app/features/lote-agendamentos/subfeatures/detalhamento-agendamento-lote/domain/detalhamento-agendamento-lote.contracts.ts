import { CobRDoLoteSelecionado } from '../../../domain/lote-agendamentos.model';

export type DetalhamentoAgendamentoLoteContexto = {
  cobSelecionada: CobRDoLoteSelecionado;
  deveConsultarApi: boolean;
};
