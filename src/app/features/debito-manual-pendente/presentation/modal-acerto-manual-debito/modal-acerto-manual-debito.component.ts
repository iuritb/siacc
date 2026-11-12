import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ClasseStatusDebitoManual, DebitoManualPendenteFormatado } from '../../domain/debito-manual-pendente.model';
import { EnumSituacaoDebitoManual } from '../../domain/debito-manual.enum';
import { MAPA_CLASSE_STATUS_DEBITO_MANUAL } from '../../domain/debito-manual-pendente.constants';
import { ModalAcertoManualDebitoStore } from '../../application/store/modal-acerto-manual-debito.store';
import { FeedbackGenerico } from '../../../../shared/models/formatador-utils.model';
import { FeedbackGenericoComponent } from '../../../../shared/modal/feedback-generico/feedback-generico.component';
import { DscSnackbarService, DscSnackbarVariant } from 'sidsc-components/dsc-snackbar';

@Component({
  selector: 'app-modal-acerto-manual-debito',
  templateUrl: './modal-acerto-manual-debito.component.html',
  styleUrls: ['../style-util/modal-style.scss', '../style-util/status-cores.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ModalAcertoManualDebitoStore]
})
export class ModalAcertoManualDebitoComponent implements OnInit {
  @Input({ required: true }) inputDebitoFormatado!: DebitoManualPendenteFormatado;

  readonly observacaoControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(255)]
  });

  readonly isSending = this.store.isSending;
  readonly debito = this.store.debitoFormatado;
  readonly cobrancasParaAcertoManual = this.store.cobrancasParaAcertoManual;
  readonly cobrancaFoiAtualizada = this.store.cobrancaFoiAtualizada;
  readonly EnumSituacaoDebitoManual = EnumSituacaoDebitoManual;
  readonly valorApuradoAcerto = this.store.valorApuradoAcerto;

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly store: ModalAcertoManualDebitoStore,
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

  async onConfirmarAcertoManual(): Promise<void> {
    if (this.observacaoControl.invalid) {
      this.observacaoControl.markAsTouched();
      return;
    }

    const resultado = await this.store.acertoManual(
      this.debito().convenioId,
      this.debito().periodo,
      this.observacaoControl.value
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
