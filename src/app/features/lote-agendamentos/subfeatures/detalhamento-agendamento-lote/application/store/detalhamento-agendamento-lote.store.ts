import { Injectable, signal } from '@angular/core';
import { FormatadorFeedbackService } from '../../../../../../services/formatador-feedback/formatador-feedback.service';
import { ErroGenericoInterno } from '../../../../../../shared/errors/erro-generico-interno';
import { MensagemErro } from '../../../../../../shared/models/formatador-utils.model';
import { CobRDoLoteSelecionado } from '../../../../domain/lote-agendamentos.model';
import { MENSAGENS_DETALHAMENTO_AGENDAMENTO_LOTE } from '../../domain/detalhamento-agendamento-lote.constants';
import { DetalhamentoAgendamentoLoteContexto } from '../../domain/detalhamento-agendamento-lote.contracts';
import { DetalhamentoAgendamentoLoteData } from '../../domain/detalhamento-agendamento-lote.model';
import { DetalhamentoAgendamentoLoteQueryService } from '../query/detalhamento-agendamento-lote-query.service';

@Injectable({
  providedIn: null
})
export class DetalhamentoAgendamentoLoteStore {
  private controller: AbortController | null = null;

  private readonly _contextoAtual = signal<DetalhamentoAgendamentoLoteContexto | null>(null);
  readonly contextoAtual = this._contextoAtual.asReadonly();

  private readonly _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  private readonly _mensagemErro = signal<MensagemErro | null>(null);
  readonly mensagemErro = this._mensagemErro.asReadonly();

  private readonly _dadoDetalhado = signal<DetalhamentoAgendamentoLoteData | null>(null);
  readonly dadoDetalhado = this._dadoDetalhado.asReadonly();

  private readonly _carregadoComSucesso = signal<boolean>(false);
  readonly carregadoComSucesso = this._carregadoComSucesso.asReadonly();

  constructor(
    private detalhamentoAgendamentoLoteQueryService: DetalhamentoAgendamentoLoteQueryService,
    private formatadorFeedbackService: FormatadorFeedbackService
  ) { }

  public async inicializarContexto(
    cobSelecionada: CobRDoLoteSelecionado | null,
    deveConsultarApi: boolean
  ): Promise<void> {
    try {
      const contexto = this.validarContexto(cobSelecionada, deveConsultarApi);
      const contextoMudou = this.contextoMudou(contexto);

      if (contextoMudou) {
        this.prepararNovoContexto(contexto);
      }

      if (contextoMudou || !this._carregadoComSucesso()) {
        await this.carregarDetalhamento(contexto);
      }
    } catch (error: unknown) {
      this.aplicarEstadoErro(error);
    }
  }

  public async recarregar(): Promise<void> {
    const contexto = this._contextoAtual();
    if (!contexto) {
      return;
    }

    await this.carregarDetalhamento(contexto);
  }

  public cancelarConsultaAtual(): void {
    this.controller?.abort();
  }

  private async carregarDetalhamento(contexto: DetalhamentoAgendamentoLoteContexto): Promise<void> {
    try {
      this._mensagemErro.set(null);
      this._isLoading.set(true);
      this.controller?.abort();
      this.controller = new AbortController();

      const result = await this.detalhamentoAgendamentoLoteQueryService.carregarDetalhamento(contexto, this.controller);

      if (result.ok) {
        this._dadoDetalhado.set(result.data);
        this._carregadoComSucesso.set(true);
        return;
      }

      if (result.abort) {
        return;
      }

      this.aplicarEstadoErro(result.error);
    } catch (error: unknown) {
      this.aplicarEstadoErro(error);
    } finally {
      this._isLoading.set(false);
    }
  }

  private prepararNovoContexto(contexto: DetalhamentoAgendamentoLoteContexto): void {
    this._contextoAtual.set(contexto);
    this.limparDadosCarregados();
  }

  private limparDadosCarregados(): void {
    this._dadoDetalhado.set(null);
    this._carregadoComSucesso.set(false);
  }

  private aplicarEstadoErro(error: unknown): void {
    this.limparDadosCarregados();
    this._isLoading.set(false);
    this._mensagemErro.set(
      this.formatadorFeedbackService.formatarMensagemErro(
        error,
        MENSAGENS_DETALHAMENTO_AGENDAMENTO_LOTE.erroDetalhamento
      )
    );
  }

  private validarContexto(
    cobSelecionada: CobRDoLoteSelecionado | null,
    deveConsultarApi: boolean
  ): DetalhamentoAgendamentoLoteContexto {
    if (!cobSelecionada) {
      throw new ErroGenericoInterno(MENSAGENS_DETALHAMENTO_AGENDAMENTO_LOTE.idNaoInformado, []);
    }

    const txid = cobSelecionada.txid?.trim();
    if (!txid) {
      throw new ErroGenericoInterno(MENSAGENS_DETALHAMENTO_AGENDAMENTO_LOTE.idNaoInformado, []);
    }

    return {
      cobSelecionada: {
        ...cobSelecionada,
        txid
      },
      deveConsultarApi
    };
  }

  private contextoMudou(contexto: DetalhamentoAgendamentoLoteContexto): boolean {
    const contextoAtual = this._contextoAtual();
    return !contextoAtual
      || contextoAtual.cobSelecionada.txid !== contexto.cobSelecionada.txid
      || contextoAtual.deveConsultarApi !== contexto.deveConsultarApi;
  }
}
