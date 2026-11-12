import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DebitoManualPendenteFormatado, ClasseStatusDebitoManual } from '../../domain/debito-manual-pendente.model';
import { EnumSituacaoDebitoManual } from '../../domain/debito-manual.enum';
import { MAPA_CLASSE_STATUS_DEBITO_MANUAL } from '../../domain/debito-manual-pendente.constants';
import { FeedbackGenerico } from '../../../../shared/models/formatador-utils.model';
import { FeedbackGenericoComponent } from '../../../../shared/modal/feedback-generico/feedback-generico.component';
import { DscSnackbarService, DscSnackbarVariant } from 'sidsc-components/dsc-snackbar';
import { ModalAutorizarDebitoStore } from '../../application/store/modal-autorizar-debito.store';

@Component({
  selector: 'app-modal-autorizar-debito',
  templateUrl: './modal-autorizar-debito.component.html',
  styleUrls: ['../style-util/modal-style.scss', '../style-util/status-cores.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ModalAutorizarDebitoStore]
})
export class ModalAutorizarDebitoComponent implements OnInit {
  @Input({ required: true }) inputDebitoFormatado!: DebitoManualPendenteFormatado;

  readonly isSending = this.store.isSending;
  readonly debito = this.store.debitoFormatado;
  readonly cobrancasParaAutorizar = this.store.cobrancasParaAutorizar;
  readonly cobrancaFoiAtualizada = this.store.cobrancaFoiAtualizada;

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly store: ModalAutorizarDebitoStore,
    private readonly modalService: NgbModal,
    private readonly snackbarService: DscSnackbarService,
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

  public async onAutorizar(): Promise<void> {
    const resultado = await this.store.autorizarDebito(
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
