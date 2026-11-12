import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ClasseStatusDebitoManual, DebitoManualPendenteFormatado } from '../../domain/debito-manual-pendente.model';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalRetentarDebitoStore } from '../../application/store/modal-retentar-debito.store';
import { DscSnackbarService, DscSnackbarVariant } from 'sidsc-components/dsc-snackbar';
import { EnumSituacaoDebitoManual } from '../../domain/debito-manual.enum';
import { MAPA_CLASSE_STATUS_DEBITO_MANUAL } from '../../domain/debito-manual-pendente.constants';
import { FeedbackGenerico } from '../../../../shared/models/formatador-utils.model';
import { FeedbackGenericoComponent } from '../../../../shared/modal/feedback-generico/feedback-generico.component';

@Component({
  selector: 'app-modal-retentar-debito',
  templateUrl: './modal-retentar-debito.component.html',
  styleUrls: ['../style-util/modal-style.scss', '../style-util/status-cores.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ModalRetentarDebitoStore]
})
export class ModalRetentarDebitoComponent {
  @Input({ required: true }) inputDebitoFormatado!: DebitoManualPendenteFormatado;

  readonly isSending = this.store.isSending;
  readonly debito = this.store.debitoFormatado;
  readonly cobrancasParaRetentativa = this.store.cobrancasParaRetentativa;
  readonly cobrancaFoiAtualizada = this.store.cobrancaFoiAtualizada;
  readonly valorApuradoRetentativa = this.store.valorApuradoRetentativa;

  readonly EnumSituacaoDebitoManual = EnumSituacaoDebitoManual;

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly store: ModalRetentarDebitoStore,
    private readonly modalService: NgbModal,
    private readonly snackbarService: DscSnackbarService
  ) { }

  ngOnInit(): void {
    this.store.inicializar(this.inputDebitoFormatado);
  }

  public fecharModal(): void {
    this.store.cancelarRequisicaoAtual();
    let debitoNovo = null;
    if (this.cobrancaFoiAtualizada()) {
      debitoNovo = this.debito();
    }
    this.activeModal.close(debitoNovo);
  }

  public obterClasseStatusDebitoManual(situacao: EnumSituacaoDebitoManual): ClasseStatusDebitoManual {
    return MAPA_CLASSE_STATUS_DEBITO_MANUAL[situacao];
  }

  async onRetentar(): Promise<void> {
    const resultado = await this.store.retentarDebito(
      this.debito().convenioId,
      this.debito().periodo
    );

    if (resultado.ok) {
      this.fecharModal();
      this.abrirModalGenerico(resultado.feedback);
    } else if (resultado.isFeedback) {
      this.abrirModalGenerico(resultado.feedback);
    } else {
      this.openSnackbar(resultado.mensagem, 'warning');
    }
  }

  private abrirModalGenerico(feedback: FeedbackGenerico): void {
    const modalRef: NgbModalRef = this.modalService.open(FeedbackGenericoComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: true,
      centered: true
    });

    modalRef.componentInstance.feedback = feedback;
  }

  private openSnackbar(mensagem: string, variant: DscSnackbarVariant): void {
    this.snackbarService.add({
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      data: {
        variant: variant,
        message: mensagem
      }
    });
  }
}
