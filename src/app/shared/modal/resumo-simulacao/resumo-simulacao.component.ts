
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ResumoSimulacao } from '../../../interfaces';
import { DESCRICAO_INCLUIR_SIMULACAO, DESCRICAO_IR_PARA_CONTRATO, DESCRICAO_SOLICITAR_AUTORIZACAO } from '../../constants/simulador.constants';

@Component({
  selector: 'app-resumo-simulacao',
  templateUrl: './resumo-simulacao.component.html',
  styleUrls: ['./resumo-simulacao.component.scss']
})
export class ResumoSimulacaoComponent {

  @Input() dados!: ResumoSimulacao;

  readonly descricaoIncluirSimulacao: string = DESCRICAO_INCLUIR_SIMULACAO;
  readonly descricaoSolicitarAutorizacao: string = DESCRICAO_SOLICITAR_AUTORIZACAO;
  readonly descricaoIrParaContrato: string = DESCRICAO_IR_PARA_CONTRATO;

  constructor(public activeModal: NgbActiveModal) { }

  onConfirmarSimulacao() {
    this.activeModal.close(true);
  }

  onFecharResumo() {
    this.activeModal.close(false);
  }
}
