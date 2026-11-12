import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CancelarGenerico, EnumTipoCancelamento } from '../../models/cancelar-generico.model';
import { SimuladorService } from '../../../services/simulador/simulador.service';
import { FeedbackGenerico } from '../../models/formatador-utils.model';
import { FeedbackGenericoComponent } from '../feedback-generico/feedback-generico.component';
import { ConvenioService } from '../../../services/convenio/convenio.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DscAlertVariant } from 'sidsc-components/dsc-alert';
import { FormatadorFeedbackService } from '../../../services/formatador-feedback/formatador-feedback.service';

@Component({
  selector: 'app-cancelar-generico',
  templateUrl: './cancelar-generico.component.html',
  styleUrls: ['./cancelar-generico.component.scss']
})
export class CancelarGenericoComponent {

  constructor(
    private modalService: NgbModal,
    protected activeModal: NgbActiveModal,
    private simuladorService: SimuladorService,
    private convenioService: ConvenioService,
    private formatadorFeedbackService: FormatadorFeedbackService,
    private fb: FormBuilder
  ) {
    this.formGroup = this.fb.group({
      justificativaCancelamento: [null, [Validators.required, Validators.maxLength(425)]]
    });
  }

  @ViewChild('modalConfirmarExcluirConvenio') modalConfirmarExcluirConvenio: TemplateRef<any> | any;

  @Input() parametros!: CancelarGenerico;
  @Output() sucessoCancelamento = new EventEmitter<DscAlertVariant>();

  private modalConfirmacaoRef: NgbModalRef | null = null;

  btnIsCancelando: boolean = false;
  idCancelamento: any = null;
  opcaoCancelar!: () => Promise<any>;
  formGroup: FormGroup;

  ngOnInit() {
    this.idCancelamento = this.parametros.numero;
    this.formGroup.markAllAsTouched();
  }

  async cancelar(): Promise<void> {

    if (this.modalConfirmacaoRef) {
      this.modalConfirmacaoRef.close();
      this.modalConfirmacaoRef = null;
    }

    this.btnIsCancelando = true;
    let feedbackGenerico: FeedbackGenerico;

    try {
      await this.opcaoCancelar();
      feedbackGenerico = {
        titulo: this.parametros.titulo,
        mensagem: this.parametros.sucesso,
        descricao: this.parametros.descricao + " " + this.idCancelamento,
        variant: 'success'
      };
    }
    catch (error: any) {
      feedbackGenerico = this.formatadorFeedbackService.formatarFeedbackErro(error, this.parametros.titulo, "Não foi possível concluir o cancelamento. Tente novamente mais tarde.", null);
    }
    finally {
      this.btnIsCancelando = false;
    }

    this.activeModal.close();
    this.sucessoCancelamento.emit(feedbackGenerico.variant);
    this.abrirModalGenerico(feedbackGenerico);

  }

  processarCancelamento() {

    const justificativaCancelamento: string = this.formGroup.get('justificativaCancelamento')?.value;
    const formData = new FormData();
    formData.append("justificativa", justificativaCancelamento);

    switch (this.parametros.tipo) {
      case EnumTipoCancelamento.SIMULACAO:
        this.opcaoCancelar = () => this.simuladorService.cancelarSimulacao(this.idCancelamento, formData);
        this.cancelar();
        break;
      case EnumTipoCancelamento.CONVENIO:
        this.opcaoCancelar = () => this.convenioService.excluirConvenio(this.idCancelamento, formData);
        this.confirmarCancelarConvenio();
        break;
    }

  }

  private confirmarCancelarConvenio() {
    this.activeModal.close();
    this.modalConfirmacaoRef = this.modalService.open(this.modalConfirmarExcluirConvenio, { size: 'lg', scrollable: false, windowClass: 'modal-large' });
  }

  private abrirModalGenerico(feedback: FeedbackGenerico) {
    const modalRef: NgbModalRef = this.modalService.open(FeedbackGenericoComponent, {
      size: 'md',
      centered: true
    });

    modalRef.componentInstance.feedback = feedback;

  }

}
