import { Component, Input, Output, EventEmitter, signal, ChangeDetectionStrategy } from "@angular/core";
import { ClasseStatusDebitoManual, DebitoManualPendenteFormatado } from "../../domain/debito-manual-pendente.model";
import { MAPA_CLASSE_STATUS_DEBITO_MANUAL } from "../../domain/debito-manual-pendente.constants";
import { EnumSituacaoDebitoManual } from "../../domain/debito-manual.enum";

@Component({
  selector: "app-card-debito-pendente",
  templateUrl: "./card-debito-pendente.component.html",
  styleUrls: ["./card-debito-pendente.component.scss", '../style-util/status-cores.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardDebitoPendenteComponent {
  @Input({ required: true }) debitoFormatado!: DebitoManualPendenteFormatado;
  @Input({ required: true }) index!: number;
  @Output() acaoAutorizar: EventEmitter<DebitoManualPendenteFormatado> = new EventEmitter<DebitoManualPendenteFormatado>();
  @Output() acaoRetentar: EventEmitter<DebitoManualPendenteFormatado> = new EventEmitter<DebitoManualPendenteFormatado>();
  @Output() acaoAcertoManual: EventEmitter<DebitoManualPendenteFormatado> = new EventEmitter<DebitoManualPendenteFormatado>();
  detalhesExpandidos = signal<boolean>(false);

  public obterClasseStatusDebitoManual(situacao: EnumSituacaoDebitoManual): ClasseStatusDebitoManual {
    return MAPA_CLASSE_STATUS_DEBITO_MANUAL[situacao];
  }

  public onAutorizarDebito(): void {
    this.acaoAutorizar.emit(this.debitoFormatado);
  }

  public onRetentarDebito(): void {
    this.acaoRetentar.emit(this.debitoFormatado);
  }

  public onToggleDetalhes(): void {
    this.detalhesExpandidos.set(!this.detalhesExpandidos());
  }

  public onAcertoManual(): void {
    this.acaoAcertoManual.emit(this.debitoFormatado);
  }
}
