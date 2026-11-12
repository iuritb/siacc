import { computed, Injectable, signal } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MENSAGENS_TABELA_DEBITO_MANUAL_PENDENTE, PAGE_SIZE_OPTIONS_TABELA_DEBITO_MANUAL_PENDENTE, PAGINACAO_INICIAL_TABELA_DEBITO_MANUAL_PENDENTE } from '../../domain/debito-manual-pendente.constants';
import { DebitoManualPendenteFormatado, PaginacaoEditavelDebitoManual } from '../../domain/debito-manual-pendente.model';
import { FormatadorFeedbackService } from '../../../../services/formatador-feedback/formatador-feedback.service';
import { MensagemErro } from '../../../../shared/models/formatador-utils.model';
import { formatarDebitoManualPendente, matchDebito, prepararQueryParams } from '../../debito-manual-pendente.helpers';
import { EnumModoConsultaDebitoManualPendente } from '../../domain/debito-manual.enum';
import { DebitoManualPendenteGateway } from '../query/debito-manual-pendente-query.service';

@Injectable({
  providedIn: null
})
export class DebitoManualPendenteStore {

  constructor(
    private readonly formatadorFeedbackService: FormatadorFeedbackService,
    private readonly debitoManualPendenteGateway: DebitoManualPendenteGateway
  ) { }

  private controller: AbortController | null = null;

  readonly pageSizeOptions = PAGE_SIZE_OPTIONS_TABELA_DEBITO_MANUAL_PENDENTE;

  private readonly _paginacaoAtual = signal<PaginacaoEditavelDebitoManual>({
    paginaAtual: PAGINACAO_INICIAL_TABELA_DEBITO_MANUAL_PENDENTE.paginaAtual,
    itensPorPagina: PAGINACAO_INICIAL_TABELA_DEBITO_MANUAL_PENDENTE.itensPorPagina
  });
  readonly paginacaoAtual = this._paginacaoAtual.asReadonly();

  private readonly _mensagemErro = signal<MensagemErro | null>(null);
  readonly mensagemErro = this._mensagemErro.asReadonly();

  private readonly _debitosPendentesFormatados = signal<DebitoManualPendenteFormatado[]>([]);

  private readonly _termoFiltro = signal<string>('');
  readonly termoFiltro = this._termoFiltro.asReadonly();

  readonly debitosFiltrados = computed(() => {
    const debitos = this._debitosPendentesFormatados();
    const termo = this._termoFiltro();

    if (!termo) {
      return debitos;
    }

    return debitos.filter((debito) => matchDebito(debito, termo));
  });

  readonly totalItensFiltrados = computed(() => this.debitosFiltrados().length);

  readonly debitosFiltradosPaginados = computed(() => {
    const debitos = this.debitosFiltrados();
    const paginacao = this._paginacaoAtual();

    const inicio = paginacao.paginaAtual * paginacao.itensPorPagina;
    const fim = inicio + paginacao.itensPorPagina;

    return debitos.slice(inicio, fim);
  });

  private readonly _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  private readonly _podeMostrarTabela = signal<boolean>(false);
  readonly podeMostrarTabela = this._podeMostrarTabela.asReadonly();

  private readonly _possuiCacheDebitosPendentes = signal<boolean>(false);

  public setTermoFiltro(termo: string): void {
    this._termoFiltro.set(termo);
    this.redefinirPaginaAtual();
  }

  public async orquestrarModoDeConsulta(modoConsulta: EnumModoConsultaDebitoManualPendente, filtros?: Record<string, string>): Promise<void> {
    try {

      const temFiltros = !!filtros;
      this._podeMostrarTabela.set(modoConsulta === EnumModoConsultaDebitoManualPendente.PENDENTES || temFiltros);
      const deveCarregar = this.deveCarregarDebitos(modoConsulta, temFiltros);
      if (!deveCarregar) return;

      const parametros = prepararQueryParams(filtros);

      await this.carregarDebitos(modoConsulta, parametros);

      this.posProcessamento(modoConsulta);

    } catch (error: unknown) {
      this.aplicarEstadoErro(error);
    }
  }

  public atualizarPaginacao(event: PageEvent): void {
    this._paginacaoAtual.update((current) => ({
      ...current,
      paginaAtual: event.pageIndex,
      itensPorPagina: event.pageSize
    }));
  }

  private deveCarregarDebitos(modo: EnumModoConsultaDebitoManualPendente, possuiFiltros: boolean): boolean {
    switch (modo) {
      case EnumModoConsultaDebitoManualPendente.PENDENTES:
        return !this._possuiCacheDebitosPendentes();

      case EnumModoConsultaDebitoManualPendente.SUCESSO:
        return possuiFiltros;

      default:
        return false;
    }
  }

  private posProcessamento(modo: EnumModoConsultaDebitoManualPendente): void {
    if (modo === EnumModoConsultaDebitoManualPendente.SUCESSO) {
      this._possuiCacheDebitosPendentes.set(false);
    }
  }

  private async carregarDebitos(modoConsulta: EnumModoConsultaDebitoManualPendente, params: { titulo: string; valor: string }[]): Promise<void> {
    const controller = new AbortController();
    try {
      this.controller?.abort();
      this.controller = controller;
      this._mensagemErro.set(null);
      this._isLoading.set(true);


      const result = await this.debitoManualPendenteGateway.buscarDebitosManuaisPendentes(this.controller, params);
      if (this.controller !== controller) return;
      if (result.ok) {
        this._debitosPendentesFormatados.set(formatarDebitoManualPendente(result.data));
        this.ajustarPaginaAtualSeNecessario();
        if (modoConsulta === EnumModoConsultaDebitoManualPendente.PENDENTES) {
          this._possuiCacheDebitosPendentes.set(true);
        }
        return;
      }

      this.aplicarEstadoErro(result.error);
    } catch (error: unknown) {
      this.aplicarEstadoErro(error);
    } finally {
      if (this.controller === controller) {
        this._isLoading.set(false);
      }
    }
  }

  public atualizarDebitoManualPendente(debitoAtualizado: DebitoManualPendenteFormatado): void {
    this._debitosPendentesFormatados.update((debitos) =>
      debitos.map((debito) =>
        this.saoMesmosDebitos(debito, debitoAtualizado)
          ? debitoAtualizado
          : debito
      )
    );
    this.ajustarPaginaAtualSeNecessario();
  }

  private saoMesmosDebitos(debito1: DebitoManualPendenteFormatado, debito2: DebitoManualPendenteFormatado): boolean {
    return (
      debito1.convenioId === debito2.convenioId &&
      debito1.periodo === debito2.periodo &&
      debito1.cnpj === debito2.cnpj
    );
  }

  private aplicarEstadoErro(error: unknown): void {
    this._debitosPendentesFormatados.set([]);
    this.redefinirPaginaAtual();
    this._mensagemErro.set(
      this.formatadorFeedbackService.formatarMensagemErro(
        error,
        MENSAGENS_TABELA_DEBITO_MANUAL_PENDENTE.erroCarregarDebitos
      )
    );
  }

  private redefinirPaginaAtual(): void {
    this._paginacaoAtual.update((current) => (
      current.paginaAtual === 0
        ? current
        : {
          ...current,
          paginaAtual: 0
        }
    ));
  }

  private ajustarPaginaAtualSeNecessario(): void {
    const totalItensFiltrados = this.totalItensFiltrados();

    this._paginacaoAtual.update((current) => {
      const totalPaginas = Math.max(1, Math.ceil(totalItensFiltrados / current.itensPorPagina));
      const paginaAtualAjustada = Math.min(current.paginaAtual, totalPaginas - 1);

      if (paginaAtualAjustada === current.paginaAtual) {
        return current;
      }

      return {
        ...current,
        paginaAtual: paginaAtualAjustada
      };
    });
  }
}
