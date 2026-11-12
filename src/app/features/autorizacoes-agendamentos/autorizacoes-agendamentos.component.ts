import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DscSnackbarService } from 'sidsc-components/dsc-snackbar';
import { versao } from '../../../version/version';
import { RelatorioOpcao } from '../../shared/models/utils/filtro-dinamico.model';
import { FeedbackGenerico } from '../../shared/models/formatador-utils.model';
import { FeedbackGenericoComponent } from '../../shared/modal/feedback-generico/feedback-generico.component';
import { CobrancasRecorrentesResponse } from '../../shared/models/autorizacao-agendamento/cobr.model';
import { EnumOpcoesAutorizacaoAgendamento, EnumOpcoesDePagina } from '../../shared/models/autorizacao-agendamento/utils.enum';
import { AutorizacoesAgendamentosStore } from '../../features/autorizacoes-agendamentos/application/store/autorizacoes-agendamentos.store';

@Component({
  selector: 'app-autorizacoes-agendamentos',
  templateUrl: './autorizacoes-agendamentos.component.html',
  styleUrls: ['./autorizacoes-agendamentos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutorizacoesAgendamentosComponent implements OnDestroy {

  constructor(
    private modalService: NgbModal,
    private snackbarService: DscSnackbarService,
    private autorizacoesAgendamentosStore: AutorizacoesAgendamentosStore
  ) { }

  readonly versaoRelatorioAutorizacaoAgendamento = versao.autorizacaoAgendamento;
  readonly paginaParaMostrar = this.autorizacoesAgendamentosStore.paginaParaMostrar;
  readonly mostrarFiltro = this.autorizacoesAgendamentosStore.mostrarFiltro;
  readonly mostrarTabela = this.autorizacoesAgendamentosStore.mostrarTabela;
  readonly origemDosDadosDoAgendamento = this.autorizacoesAgendamentosStore.origemDosDadosDoAgendamento;
  readonly opcoesDeRelatorio = this.autorizacoesAgendamentosStore.opcoesDeRelatorio;
  readonly destinoSelecionado = this.autorizacoesAgendamentosStore.destinoSelecionado;
  readonly opcaoSelecionada = this.autorizacoesAgendamentosStore.opcaoSelecionada;
  readonly patchValue = this.autorizacoesAgendamentosStore.patchValue;
  readonly btnIsLoading = this.autorizacoesAgendamentosStore.btnIsLoading;
  readonly parametrosSemPaginacao = this.autorizacoesAgendamentosStore.parametrosSemPaginacao;
  readonly retornoAPIRec = this.autorizacoesAgendamentosStore.retornoAPIRec;
  readonly retornoAPICobR = this.autorizacoesAgendamentosStore.retornoAPICobR;
  readonly retornoAPILote = this.autorizacoesAgendamentosStore.retornoAPILote;

  public get controller(): AbortController | null {
    return this.autorizacoesAgendamentosStore.controller;
  }

  public set controller(controller: AbortController | null) {
    this.autorizacoesAgendamentosStore.controller = controller;
  }

  ngOnInit(): void {
    this.autorizacoesAgendamentosStore.iniciar();
  }

  public get enumOpcoesDePagina(): typeof EnumOpcoesDePagina {
    return EnumOpcoesDePagina;
  }

  public voltarParaDestino(destino: EnumOpcoesDePagina): void {
    this.autorizacoesAgendamentosStore.voltarParaDestino(destino);
  }

  public async onQueryParams(query: Record<string, string>): Promise<void> {
    const resultado = await this.autorizacoesAgendamentosStore.consultar(query);

    if (resultado.kind === 'modal-error') {
      this.abrirModalGenerico(resultado.feedback);
      return;
    }

    if (resultado.kind === 'snackbar-info') {
      this.abrirSnackbarInfo(resultado.message);
    }
  }

  public configuraDestino(opcao: RelatorioOpcao<EnumOpcoesAutorizacaoAgendamento>): void {
    this.autorizacoesAgendamentosStore.configurarDestino(opcao);
  }

  public onListarAgendamentos(response: CobrancasRecorrentesResponse): void {
    this.autorizacoesAgendamentosStore.onListarAgendamentos(response);
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

  private abrirSnackbarInfo(message: string): void {
    this.snackbarService.add({
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      data: {
        variant: 'info',
        message,
        showIcon: true
      }
    });
  }

  ngOnDestroy(): void {
    this.autorizacoesAgendamentosStore.destruir();
  }
}
