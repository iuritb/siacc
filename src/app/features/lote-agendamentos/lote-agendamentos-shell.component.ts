import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ParametroConsulta } from '../../shared/models/utils/query-params.model';
import { LoteAgendamentosStore } from './application/lote-agendamentos.store';
import { deveConsultarApiNoDetalheLote } from './subfeatures/detalhamento-lote/detalhamento-lote.helpers';
import { ScrollService } from '../../services/scroll/scroll.service';
import { CobRDoLoteSelecionado, LotesCobrResponse } from './domain/lote-agendamentos.model';
import { TabelaLoteStore } from './subfeatures/tabela-lote/application/store/tabela-lote.store';
import { TabelaLoteQueryService } from './subfeatures/tabela-lote/application/query/tabela-lote-query.service';
import { DetalhamentoLoteStore } from './subfeatures/detalhamento-lote/application/store/detalhamento-lote.store';
import { DetalhamentoLoteQueryService } from './subfeatures/detalhamento-lote/application/query/detalhamento-lote-query.service';
import { DetalhamentoAgendamentoLoteStore } from './subfeatures/detalhamento-agendamento-lote/application/store/detalhamento-agendamento-lote.store';
import { DetalhamentoAgendamentoLoteQueryService } from './subfeatures/detalhamento-agendamento-lote/application/query/detalhamento-agendamento-lote-query.service';

@Component({
  selector: 'app-lote-agendamentos-shell',
  templateUrl: './lote-agendamentos-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TabelaLoteStore,
    TabelaLoteQueryService,
    DetalhamentoLoteStore,
    DetalhamentoLoteQueryService,
    DetalhamentoAgendamentoLoteStore,
    DetalhamentoAgendamentoLoteQueryService
  ]
})
export class LoteAgendamentosShellComponent {
  constructor(
    private loteAgendamentosStore: LoteAgendamentosStore,
    private scrollService: ScrollService
  ) { }

  @Input({ required: true }) retornoAPI: LotesCobrResponse = {} as LotesCobrResponse;
  @Input({ required: true }) parametrosOriginais: ParametroConsulta[] = [];
  @Output() onVoltarFiltro = new EventEmitter<void>();

  readonly exibirListaLotes = this.loteAgendamentosStore.exibirListaLotes;
  readonly exibirDetalheLote = this.loteAgendamentosStore.exibirDetalheLote;
  readonly exibirDetalheAgendamento = this.loteAgendamentosStore.exibirDetalheAgendamento;
  readonly loteSelecionado = this.loteAgendamentosStore.loteSelecionado;
  readonly agendamentoSelecionado = this.loteAgendamentosStore.agendamentoSelecionado;

  public selecionarLote(lote: { idLote: number; convenio: number }): void {
    this.loteAgendamentosStore.selecionarLote(lote);
    this.scrollService.scrollTop();
  }

  public detalharAgendamento(cobSelecionada: CobRDoLoteSelecionado): void {
    this.loteAgendamentosStore.selecionarAgendamento(cobSelecionada, deveConsultarApiNoDetalheLote(cobSelecionada));
    this.scrollService.scrollTop();
  }

  public voltarParaFiltro(): void {
    this.loteAgendamentosStore.voltarParaListaLotes();
    this.onVoltarFiltro.emit();
    this.scrollService.scrollTop();
  }

  public voltarParaListaLotes(): void {
    this.loteAgendamentosStore.voltarParaListaLotes();
    this.scrollService.scrollTop();
  }

  public voltarParaDetalheLote(): void {
    this.loteAgendamentosStore.voltarParaDetalheLote();
    this.scrollService.scrollTop();
  }
}
