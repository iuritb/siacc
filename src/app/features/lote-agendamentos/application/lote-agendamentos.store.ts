import { Injectable, computed, signal } from '@angular/core';
import { LoteAgendamentosSelecaoAgendamento, LoteAgendamentosSelecaoLote } from '../domain/lote-agendamentos-contracts';
import { EnumLoteAgendamentosEtapa } from '../domain/lote-agendamentos-flow.model';
import { CobRDoLoteSelecionado } from '../domain/lote-agendamentos.model';

@Injectable({
  providedIn: 'root'
})
export class LoteAgendamentosStore {
  private readonly _etapaAtual = signal<EnumLoteAgendamentosEtapa>(EnumLoteAgendamentosEtapa.LISTA_LOTES);
  readonly etapaAtual = this._etapaAtual.asReadonly();

  private readonly _loteSelecionado = signal<LoteAgendamentosSelecaoLote | null>(null);
  readonly loteSelecionado = this._loteSelecionado.asReadonly();

  private readonly _agendamentoSelecionado = signal<LoteAgendamentosSelecaoAgendamento | null>(null);
  readonly agendamentoSelecionado = this._agendamentoSelecionado.asReadonly();

  readonly exibirListaLotes = computed(() => this._etapaAtual() === EnumLoteAgendamentosEtapa.LISTA_LOTES);
  readonly exibirDetalheLote = computed(() => this._etapaAtual() === EnumLoteAgendamentosEtapa.DETALHE_LOTE);
  readonly exibirDetalheAgendamento = computed(() => this._etapaAtual() === EnumLoteAgendamentosEtapa.DETALHE_AGENDAMENTO_LOTE);

  public selecionarLote(lote: LoteAgendamentosSelecaoLote): void {
    this._loteSelecionado.set(lote);
    this._agendamentoSelecionado.set(null);
    this._etapaAtual.set(EnumLoteAgendamentosEtapa.DETALHE_LOTE);
  }

  public selecionarAgendamento(cobSelecionada: CobRDoLoteSelecionado, deveConsultarApi: boolean): void {
    this._agendamentoSelecionado.set({
      cobSelecionada,
      deveConsultarApi
    });
    this._etapaAtual.set(EnumLoteAgendamentosEtapa.DETALHE_AGENDAMENTO_LOTE);
  }

  public voltarParaListaLotes(): void {
    this._agendamentoSelecionado.set(null);
    this._loteSelecionado.set(null);
    this._etapaAtual.set(EnumLoteAgendamentosEtapa.LISTA_LOTES);
  }

  public voltarParaDetalheLote(): void {
    this._agendamentoSelecionado.set(null);
    this._etapaAtual.set(EnumLoteAgendamentosEtapa.DETALHE_LOTE);
  }
}
