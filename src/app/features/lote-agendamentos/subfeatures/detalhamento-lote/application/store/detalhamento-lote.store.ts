import { computed, Injectable, signal } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FormatadorFeedbackService } from '../../../../../../services/formatador-feedback/formatador-feedback.service';
import { ErroGenericoInterno } from '../../../../../../shared/errors/erro-generico-interno';
import { DetalhamentoLoteCobrResponse } from '../../../../../../shared/models/autorizacao-agendamento/lote-cobr.model';
import { MensagemErro } from '../../../../../../shared/models/formatador-utils.model';
import { ParametroConsulta } from '../../../../../../shared/models/utils/query-params.model';
import { construirParametrosComPaginacao } from '../../../../../../shared/utils/query/query.utils';
import { PaginacaoLoteCobr } from '../../../../domain/lote-agendamentos.model';
import { parametroPrimarioHeaderDetalhamentoLote, parametroSecundarioHeaderDetalhamentoLote, formatarCobsrDoLoteParaHtml } from '../../detalhamento-lote.helpers';
import {
  MENSAGENS_DETALHAMENTO_LOTE,
  PAGINACAO_INICIAL_DETALHAMENTO_LOTE,
  PAGE_SIZE_OPTIONS_DETALHAMENTO_LOTE
} from '../../domain/detalhamento-lote.constants';
import { DetalhamentoLoteContexto } from '../../domain/detalhamento-lote.contracts';
import { CobRDoLoteHtml } from '../../domain/detalhamento-lote.model';
import { DetalhamentoLoteQueryService } from '../query/detalhamento-lote-query.service';
import { DadosPrimarioHeader } from '../../../../../../interfaces';

@Injectable({
  providedIn: null
})
export class DetalhamentoLoteStore {
  private controller: AbortController | null = null;

  readonly pageSizeOptions = PAGE_SIZE_OPTIONS_DETALHAMENTO_LOTE;

  private readonly _contextoAtual = signal<DetalhamentoLoteContexto | null>(null);
  readonly contextoAtual = this._contextoAtual.asReadonly();

  private readonly _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  private readonly _mensagemErro = signal<MensagemErro | null>(null);
  readonly mensagemErro = this._mensagemErro.asReadonly();

  private readonly _detalhamentoLote = signal<DetalhamentoLoteCobrResponse | null>(null);
  readonly detalhamentoLote = this._detalhamentoLote.asReadonly();

  readonly parametroPrimarioHeader = computed<DadosPrimarioHeader>(() => {
    return parametroPrimarioHeaderDetalhamentoLote(this._detalhamentoLote());
  });

  readonly parametroSecundarioHeader = computed<Record<string, Record<string, string>>>(() => {
    return parametroSecundarioHeaderDetalhamentoLote(this._detalhamentoLote());
  });

  private readonly _cobsrFormatados = signal<CobRDoLoteHtml[]>([]);
  readonly cobsrFormatados = this._cobsrFormatados.asReadonly();

  private readonly _carregadoComSucesso = signal<boolean>(false);
  readonly carregadoComSucesso = this._carregadoComSucesso.asReadonly();

  private readonly _paginacaoAtual = signal<PaginacaoLoteCobr>(PAGINACAO_INICIAL_DETALHAMENTO_LOTE);
  readonly paginacaoAtual = this._paginacaoAtual.asReadonly();

  private readonly _paginacaoAnterior = signal<PaginacaoLoteCobr>(PAGINACAO_INICIAL_DETALHAMENTO_LOTE);
  readonly paginacaoAnterior = this._paginacaoAnterior.asReadonly();

  constructor(
    private detalhamentoLoteQueryService: DetalhamentoLoteQueryService,
    private formatadorFeedbackService: FormatadorFeedbackService
  ) { }

  public async inicializarContexto(idLote: number | null, convenio: number | null): Promise<void> {
    try {
      const contexto = this.validarIdentificadores(idLote, convenio);
      const contextoMudou = this.contextoMudou(contexto);

      if (contextoMudou) {
        this.prepararNovoContexto(contexto);
      }

      if (contextoMudou || !this._carregadoComSucesso()) {
        await this.buscarDetalhamento(contexto);
      }
    } catch (error: unknown) {
      this.aplicarEstadoErro(error, false);
    }
  }

  public async atualizarPaginacao(event: PageEvent): Promise<void> {
    this._paginacaoAnterior.set(this._paginacaoAtual());
    this._paginacaoAtual.update((current) => ({
      ...current,
      paginaAtual: event.pageIndex,
      itensPorPagina: event.pageSize
    }));

    const contexto = this._contextoAtual();
    if (!contexto) {
      this.reverterPaginacao();
      return;
    }

    await this.buscarDetalhamento(contexto);
  }

  public async recarregar(): Promise<void> {
    const contexto = this._contextoAtual();
    if (!contexto) {
      return;
    }
    await this.buscarDetalhamento(contexto);
  }

  public cancelarConsultaAtual(): void {
    this.controller?.abort();
  }

  private async buscarDetalhamento(contexto: DetalhamentoLoteContexto): Promise<void> {
    try {
      this._mensagemErro.set(null);
      this._isLoading.set(true);
      this.controller?.abort();
      this.controller = new AbortController();

      const params: ParametroConsulta[] = construirParametrosComPaginacao([], this._paginacaoAtual());
      const result = await this.detalhamentoLoteQueryService.buscarDetalhamento(
        contexto.idLote,
        contexto.convenio,
        params,
        this.controller
      );

      if (result.ok) {
        this._detalhamentoLote.set(result.data);
        this._cobsrFormatados.set(formatarCobsrDoLoteParaHtml(result.data.cobsr ?? []));
        this._paginacaoAtual.set(result.data.parametros?.paginacao ?? this._paginacaoAtual());
        this._carregadoComSucesso.set(true);
        return;
      }

      this.reverterPaginacao();
      if (result.abort) {
        return;
      }

      this.aplicarEstadoErro(result.error, false);
    } catch (error: unknown) {
      this.aplicarEstadoErro(error, true);
    } finally {
      this._isLoading.set(false);
    }
  }

  private prepararNovoContexto(contexto: DetalhamentoLoteContexto): void {
    this._contextoAtual.set(contexto);
    this._paginacaoAtual.set(PAGINACAO_INICIAL_DETALHAMENTO_LOTE);
    this._paginacaoAnterior.set(PAGINACAO_INICIAL_DETALHAMENTO_LOTE);
    this.limparDadosCarregados();
  }

  private limparDadosCarregados(): void {
    this._detalhamentoLote.set(null);
    this._cobsrFormatados.set([]);
    this._carregadoComSucesso.set(false);
  }

  private aplicarEstadoErro(error: unknown, deveReverterPaginacao: boolean): void {
    if (deveReverterPaginacao) {
      this.reverterPaginacao();
    }

    this.limparDadosCarregados();
    this._isLoading.set(false);
    this._mensagemErro.set(
      this.formatadorFeedbackService.formatarMensagemErro(error, MENSAGENS_DETALHAMENTO_LOTE.erroDetalhamento)
    );
  }

  private validarIdentificadores(
    idLote: number | null,
    convenio: number | null
  ): DetalhamentoLoteContexto {
    if (idLote == null) {
      throw new ErroGenericoInterno(MENSAGENS_DETALHAMENTO_LOTE.idLoteNaoInformado, []);
    }

    if (convenio == null) {
      throw new ErroGenericoInterno(MENSAGENS_DETALHAMENTO_LOTE.convenioNaoInformado, []);
    }

    return { idLote, convenio };
  }

  private contextoMudou(contexto: DetalhamentoLoteContexto): boolean {
    const contextoAtual = this._contextoAtual();
    return !contextoAtual
      || contextoAtual.idLote !== contexto.idLote
      || contextoAtual.convenio !== contexto.convenio;
  }

  private reverterPaginacao(): void {
    this._paginacaoAtual.set(this._paginacaoAnterior());
  }
}
