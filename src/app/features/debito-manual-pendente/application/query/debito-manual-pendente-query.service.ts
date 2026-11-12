import { Injectable } from '@angular/core';
import { DebitoManualPendenteGatewayResult } from '../../domain/debito-manual-pendente-contracts.interface';
import { ehAbortError } from '../../../../shared/errors/handlers/abort-error/abort-error-handler';
import { DebitoManualPendenteService } from '../../../../services/debito-pendente/debito-manual-pendente.service';
import { CobrancaTarifa, DebitoManualPendenteResponse } from '../../domain/debito-manual-pendente.model';

@Injectable({ providedIn: 'root' })
export class DebitoManualPendenteGateway {
  constructor(
    private readonly apiService: DebitoManualPendenteService
  ) { }

  async buscarDebitosManuaisPendentes(controller: AbortController, params: { titulo: string; valor: string }[]): Promise<DebitoManualPendenteGatewayResult<DebitoManualPendenteResponse>> {
    return this.handleRequest(() => {
      return this.apiService.buscarDebitosManuaisPendentes(controller, params);
    });
  }

  /**
   * Autorizar débito manual pendente.
   * Contrato de retorno do backend: retorna a lista completa de cobranças
   * (CAIXA, OUTRAS_IF e RETENTATIVA), mesmo quando apenas parte mudou.
   */
  async autorizarDebitoManualPendente(convenioId: number, periodo: string, controller: AbortController): Promise<DebitoManualPendenteGatewayResult<CobrancaTarifa[]>> {
    return this.handleRequest(() =>
      this.apiService.autorizarDebitoManual(convenioId, periodo, controller)
    );

  }

  /**
   * Retentar débito manual pendente.
   * Contrato de retorno do backend: retorna apenas as cobranças efetivamente modificadas.
   * Os tipos não retornados devem manter os dados atuais no estado da tela.
   */
  async retentarDebitoManualPendente(convenioId: number, periodo: string, controller: AbortController): Promise<DebitoManualPendenteGatewayResult<CobrancaTarifa[]>> {
    return this.handleRequest(() =>
      this.apiService.retentarDebitoManual(convenioId, periodo, controller)
    );
  }

  /**
   * Acerto manual de débito pendente.
   * Contrato de retorno do backend: retorna apenas as cobranças efetivamente modificadas
   * após o acerto manual, com a observação registrada no histórico.
   */
  async acertoManualDebitoManualPendente(
    convenioId: number,
    mesRef: string,
    observacao: string,
    controller: AbortController
  ): Promise<DebitoManualPendenteGatewayResult<CobrancaTarifa[]>> {
    return this.handleRequest(() =>
      this.apiService.realizarAcertoManual(convenioId, mesRef, observacao, controller)
    );
  }

  private async handleRequest<T>(fn: () => Promise<T>): Promise<DebitoManualPendenteGatewayResult<T>> {
    try {
      const data = await fn();
      return { ok: true, data };
    } catch (error: unknown) {
      return {
        ok: false,
        error,
        abort: ehAbortError(error)
      };
    }
  }
}
