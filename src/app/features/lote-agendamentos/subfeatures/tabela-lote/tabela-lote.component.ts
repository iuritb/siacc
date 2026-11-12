import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { DscSnackbarService, DscSnackbarVariant } from 'sidsc-components/dsc-snackbar';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FeedbackGenericoComponent } from '../../../../shared/modal/feedback-generico/feedback-generico.component';
import { FeedbackGenerico } from '../../../../shared/models/formatador-utils.model';
import { ParametroConsulta } from '../../../../shared/models/utils/query-params.model';
import { TabelaLoteStore } from './application/store/tabela-lote.store';
import { MENSAGENS_TABELA_LOTE } from './domain/tabela-lote.constants';
import { LoteCobrHtml } from './domain/tabela-lote.model';
import { LotesCobrResponse } from '../../domain/lote-agendamentos.model';

@Component({
  selector: 'app-tabela-lote',
  templateUrl: './tabela-lote.component.html',
  styleUrls: ['./tabela-lote.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabelaLoteComponent implements OnDestroy {

  constructor(
    private tabelaLoteStore: TabelaLoteStore,
    private snackbarService: DscSnackbarService,
    private modalService: NgbModal
  ) { }

  @Input({ required: true }) retornoAPI!: LotesCobrResponse;
  @Input({ required: true }) parametrosOriginais: ParametroConsulta[] = [];
  @Output() onVoltarFiltro = new EventEmitter<void>();
  @Output() onSelecionarLote = new EventEmitter<{ idLote: number; convenio: number }>();


  readonly pageSizeOptions = this.tabelaLoteStore.pageSizeOptions;
  readonly paginacaoAtual = this.tabelaLoteStore.paginacaoAtual;
  readonly lotesFormatados = this.tabelaLoteStore.lotesFormatados;
  readonly parametroPrimarioHeader = this.tabelaLoteStore.parametroPrimarioHeader;
  readonly parametroSecundarioHeader = this.tabelaLoteStore.parametroSecundarioHeader;


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['retornoAPI']) {
      this.tabelaLoteStore.sincronizarRetornoApi(this.retornoAPI);
    }
  }

  ngOnDestroy(): void {
    this.tabelaLoteStore.cancelarConsultaAtual();
  }


  trackByLote(index: number, lote: LoteCobrHtml) {
    return lote.id;
  }

  public onPageChange(event: PageEvent): void {
    this.tabelaLoteStore.atualizarPaginacao(event);

    this.atualizarDados();
  }

  public voltarFiltro(): void {
    this.onVoltarFiltro.emit();
  }

  public listarAgendamentosDoLote(lote: LoteCobrHtml): void {
    if (!this.validarLoteParaDetalhamento(lote)) {
      return;
    }

    this.onSelecionarLote.emit({
      idLote: lote.id,
      convenio: lote.convenio
    });
  }

  private validarLoteParaDetalhamento(lote: LoteCobrHtml): boolean {
    if (lote.id == null || lote.id === undefined) {
      this.openSnackbar(MENSAGENS_TABELA_LOTE.erroListarAgendamentosIdInexistente, 'danger');
      return false;
    }
    if (lote.convenio == null || lote.convenio === undefined) {
      this.openSnackbar(MENSAGENS_TABELA_LOTE.erroListarAgendamentosConvenioInexistente, 'danger');
      return false;
    }
    return true;
  }

  private async atualizarDados(): Promise<void> {
    this.openSnackbar(MENSAGENS_TABELA_LOTE.atualizandoDados, 'info', () => {
      this.tabelaLoteStore.cancelarConsultaAtual();
    });
    const result = await this.tabelaLoteStore.atualizarDados(this.parametrosOriginais);
    this.snackbarService.snackBar.dismiss();
    if (result.ok) {
      this.openSnackbar(MENSAGENS_TABELA_LOTE.dadosAtualizadosComSucesso, 'success');
    } else if (result.abort) {
      this.openSnackbar(MENSAGENS_TABELA_LOTE.buscaAbortada, 'danger');
    } else if (result.feedback) {
      this.abrirModalGenerico(result.feedback);
    }
  }

  private openSnackbar(mensagem: string, variant: DscSnackbarVariant, acaoBotao?: () => void): void {
    this.snackbarService.add({
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      data: {
        variant: variant,
        message: mensagem,
        ...(acaoBotao ? {
          button: {
            actionFunction: () => {
              if (acaoBotao) {
                acaoBotao();
              }
            },
            label: 'Cancelar'
          }
        } : {})
      }
    });
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
}
