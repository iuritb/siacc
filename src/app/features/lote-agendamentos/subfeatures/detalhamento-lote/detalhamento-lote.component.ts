import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DscSnackbarService, DscSnackbarVariant } from 'sidsc-components/dsc-snackbar';
import { AutorizacaoAgendamentoService } from '../../../../services/autorizacao-agendamento/autorizacao-agendamento.service';
import { EnumStatusCobR } from '../../../../shared/models/autorizacao-agendamento/cobr.enum';
import { CancelarAgendamentoComponent } from '../../../../shared/agendamento/cancelar-agendamento/cancelar-agendamento.component';
import { truncarTexto } from '../../../../shared/utils/string/string.utils';
import {
  definirClasseStatusCobrDoLote,
  deveConsultarApiNoDetalheLote,
  formatarDadosCancelamentoDeCobDoLote,
  obterTooltipCancelamentoDoLote,
  podeCancelarCobrancaDoLote
} from './detalhamento-lote.helpers';
import { MENSAGENS_DETALHAMENTO_LOTE } from './domain/detalhamento-lote.constants';
import { CobRDoLoteHtml } from './domain/detalhamento-lote.model';
import { DetalhamentoLoteStore } from './application/store/detalhamento-lote.store';
import { EnumSituacaoCobrancaLote } from '../../domain/lote-agendamentos.enum';

@Component({
  selector: 'app-detalhamento-lote',
  templateUrl: './detalhamento-lote.component.html',
  styleUrls: ['./detalhamento-lote.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetalhamentoLoteComponent implements OnChanges, OnDestroy {

  @Input({ required: true }) idLote: number | null = null;
  @Input({ required: true }) convenio: number | null = null;
  @Output() onVoltarTabela = new EventEmitter<void>();
  @Output() onDetalharAgendamento = new EventEmitter<CobRDoLoteHtml>();

  constructor(
    private modalService: NgbModal,
    private autorizacaoAgendamentoService: AutorizacaoAgendamentoService,
    private snackbarService: DscSnackbarService,
    private detalhamentoLoteStore: DetalhamentoLoteStore
  ) { }

  readonly isLoading = this.detalhamentoLoteStore.isLoading;
  readonly mensagemErro = this.detalhamentoLoteStore.mensagemErro;
  readonly detalhamentoLote = this.detalhamentoLoteStore.detalhamentoLote;
  readonly cobsrFormatados = this.detalhamentoLoteStore.cobsrFormatados;
  readonly pageSizeOptions = this.detalhamentoLoteStore.pageSizeOptions;
  readonly paginacaoAtual = this.detalhamentoLoteStore.paginacaoAtual;
  readonly parametroPrimarioHeader = this.detalhamentoLoteStore.parametroPrimarioHeader;
  readonly parametroSecundarioHeader = this.detalhamentoLoteStore.parametroSecundarioHeader;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idLote'] || changes['convenio']) {
      void this.detalhamentoLoteStore.inicializarContexto(this.idLote, this.convenio);
    }
  }

  public get enumSituacaoCobrDoLote(): typeof EnumSituacaoCobrancaLote {
    return EnumSituacaoCobrancaLote;
  }

  public async copiarTexto(valor: string | number): Promise<void> {
    try {
      await navigator.clipboard.writeText(valor.toString());
      this.snackbarService.add({
        verticalPosition: 'top',
        horizontalPosition: 'center',
        duration: 1000,
        data: {
          variant: 'success',
          message: 'TxID copiado!',
          showIcon: true,
        }
      });
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  }

  public definirClasseStatus(situacao: EnumSituacaoCobrancaLote, status?: EnumStatusCobR): string {
    if (status) {
      return this.autorizacaoAgendamentoService.definirClasseStatus(status);
    }
    return definirClasseStatusCobrDoLote(situacao);
  }

  public onPageChange(event: PageEvent): void {
    void this.detalhamentoLoteStore.atualizarPaginacao(event);
  }

  public voltarTabela(): void {
    this.onVoltarTabela.emit();
  }

  public detalharAgendamento(cob: CobRDoLoteHtml): void {
    this.onDetalharAgendamento.emit(cob);
  }

  public podeCancelar(cob: CobRDoLoteHtml): boolean {
    return podeCancelarCobrancaDoLote(cob);
  }

  public obterTooltipCancelamento(cob: CobRDoLoteHtml): string {
    return obterTooltipCancelamentoDoLote(cob);
  }

  public abrirModalCancelamento(cob: CobRDoLoteHtml): void {
    if (!this.podeCancelar(cob)) {
      return;
    }

    if (this.convenio == null) {
      this.openSnackbar(MENSAGENS_DETALHAMENTO_LOTE.convenioNaoInformado, 'danger');
      return;
    }

    const modalRef = this.modalService.open(CancelarAgendamentoComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });

    modalRef.componentInstance.data = formatarDadosCancelamentoDeCobDoLote(cob, this.convenio);

    modalRef.closed.subscribe((resultado: boolean | undefined) => {
      if (resultado) {
        void this.detalhamentoLoteStore.recarregar();
      }
    });
  }

  public trucarTextoTxId(txid: string): string {
    return truncarTexto(txid, 10);
  }

  public trackByTxid(index: number, cob: CobRDoLoteHtml): string {
    return cob.txid;
  }

  public deveConsultarApiNoDetalhe(cob: CobRDoLoteHtml): boolean {
    return deveConsultarApiNoDetalheLote(cob);
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

  ngOnDestroy(): void {
    this.detalhamentoLoteStore.cancelarConsultaAtual();
  }
}
