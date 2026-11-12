import { Injectable, signal } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ParametroConsulta } from '../../../../../../shared/models/utils/query-params.model';
import { construirParametrosComPaginacao } from '../../../../../../shared/utils/query/query.utils';
import { parametroPrimarioHeaderLote, parametroSecundarioHeaderLote, formatarLotesParaHtml } from '../../tabela-lote.helpers';
import { MENSAGENS_TABELA_LOTE, PAGE_SIZE_OPTIONS_TABELA_LOTE, PAGINACAO_INICIAL_TABELA_LOTE } from '../../domain/tabela-lote.constants';
import { LotesCobrResponse, PaginacaoLoteCobr } from '../../../../domain/lote-agendamentos.model';
import { AtualizarDadosResult, LoteCobrHtml } from '../../domain/tabela-lote.model';
import { TabelaLoteQueryService } from '../query/tabela-lote-query.service';
import { FormatadorFeedbackService } from '../../../../../../services/formatador-feedback/formatador-feedback.service';
import { DadosPrimarioHeader } from '../../../../../../interfaces';

@Injectable({
  providedIn: null
})
export class TabelaLoteStore {
  private controller: AbortController | null = null;
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS_TABELA_LOTE;

  private readonly _paginacaoAtual = signal<PaginacaoLoteCobr>(PAGINACAO_INICIAL_TABELA_LOTE);
  readonly paginacaoAtual = this._paginacaoAtual.asReadonly();

  private readonly _paginacaoAnterior = signal<PaginacaoLoteCobr>(PAGINACAO_INICIAL_TABELA_LOTE);
  readonly paginacaoAnterior = this._paginacaoAnterior.asReadonly();

  private readonly _lotesFormatados = signal<LoteCobrHtml[]>([]);
  readonly lotesFormatados = this._lotesFormatados.asReadonly();

  private readonly _parametroPrimarioHeader = signal<DadosPrimarioHeader>({} as DadosPrimarioHeader);
  readonly parametroPrimarioHeader = this._parametroPrimarioHeader.asReadonly();

  private readonly _parametroSecundarioHeader = signal<Record<string, Record<string, string>>>({});
  readonly parametroSecundarioHeader = this._parametroSecundarioHeader.asReadonly();

  constructor(
    private tabelaLoteQueryService: TabelaLoteQueryService,
    private formatadorFeedbackService: FormatadorFeedbackService
  ) { }

  public sincronizarRetornoApi(retornoApi: LotesCobrResponse): void {
    if (retornoApi?.parametros?.paginacao && Array.isArray(retornoApi?.lotesCobr)) {
      this._paginacaoAtual.set(retornoApi.parametros.paginacao);
      this._lotesFormatados.set(formatarLotesParaHtml(retornoApi.lotesCobr));
      this._parametroPrimarioHeader.set(parametroPrimarioHeaderLote(retornoApi));
      this._parametroSecundarioHeader.set(parametroSecundarioHeaderLote(retornoApi));
    }
  }

  public atualizarPaginacao(event: PageEvent): void {
    this._paginacaoAnterior.set(this._paginacaoAtual());
    this._paginacaoAtual.update((current) => {
      return {
        ...current,
        paginaAtual: event.pageIndex,
        itensPorPagina: event.pageSize
      };
    });
  }

  public reverterPaginacao(): void {
    this._paginacaoAtual.set(this._paginacaoAnterior());
  }

  public obterParametrosComPaginacao(parametrosOriginais: ParametroConsulta[]): ParametroConsulta[] {
    return construirParametrosComPaginacao(parametrosOriginais, this._paginacaoAtual());
  }

  public iniciarNovaConsulta(): AbortController {
    this.controller?.abort();
    this.controller = new AbortController();
    return this.controller;
  }

  public cancelarConsultaAtual(): void {
    this.controller?.abort();
  }

  public aplicarResultadoConsulta(retornoApi: LotesCobrResponse): void {
    this._paginacaoAtual.set(retornoApi.parametros.paginacao);
    this._lotesFormatados.set(formatarLotesParaHtml(retornoApi.lotesCobr));
    this._parametroPrimarioHeader.set(parametroPrimarioHeaderLote(retornoApi));
    this._parametroSecundarioHeader.set(parametroSecundarioHeaderLote(retornoApi));
  }

  public async atualizarDados(parametrosOriginais: ParametroConsulta[]): Promise<AtualizarDadosResult> {
    const controller = this.iniciarNovaConsulta();
    const params = this.obterParametrosComPaginacao(parametrosOriginais);
    const result = await this.tabelaLoteQueryService.buscarLotes(params, controller);
    if (result.ok) {
      this.aplicarResultadoConsulta(result.data);
      return { ok: true };
    }
    this.reverterPaginacao();
    if (result.abort) {
      return { ok: false, abort: true };
    }
    const feedback = this.formatadorFeedbackService.formatarFeedbackErro(
      result.error,
      MENSAGENS_TABELA_LOTE.tituloFeedback,
      MENSAGENS_TABELA_LOTE.erroConsulta,
      null
    );
    return { ok: false, feedback };
  }
}
