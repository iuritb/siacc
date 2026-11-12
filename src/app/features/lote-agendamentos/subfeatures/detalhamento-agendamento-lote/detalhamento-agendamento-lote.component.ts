import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { DetalhamentoTipo } from '../../../../shared/models';
import { CobRDoLoteSelecionado } from '../../domain/lote-agendamentos.model';
import { DetalhamentoAgendamentoLoteStore } from './application/store/detalhamento-agendamento-lote.store';

@Component({
  selector: 'app-detalhamento-agendamento-lote',
  templateUrl: './detalhamento-agendamento-lote.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetalhamentoAgendamentoLoteComponent implements OnChanges, OnDestroy {

  @Input({ required: true }) cobSelecionada!: CobRDoLoteSelecionado;
  @Input() deveConsultarApi = false;
  @Output() onVoltarTabela = new EventEmitter<void>();

  constructor(
    private detalhamentoAgendamentoLoteStore: DetalhamentoAgendamentoLoteStore
  ) { }

  readonly isLoading = this.detalhamentoAgendamentoLoteStore.isLoading;
  readonly dadoDetalhado = this.detalhamentoAgendamentoLoteStore.dadoDetalhado;
  readonly mensagemErro = this.detalhamentoAgendamentoLoteStore.mensagemErro;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cobSelecionada'] || changes['deveConsultarApi']) {
      void this.detalhamentoAgendamentoLoteStore.inicializarContexto(this.cobSelecionada, this.deveConsultarApi);
    }
  }

  public get detalhamentoTipoEnum(): typeof DetalhamentoTipo {
    return DetalhamentoTipo;
  }

  public voltarTabela(): void {
    this.onVoltarTabela.emit();
  }

  ngOnDestroy(): void {
    this.detalhamentoAgendamentoLoteStore.cancelarConsultaAtual();
  }
}
