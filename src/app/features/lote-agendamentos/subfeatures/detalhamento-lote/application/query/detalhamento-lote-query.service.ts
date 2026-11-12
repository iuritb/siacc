import { Injectable } from '@angular/core';
import { LoteCobrService } from '../../../../../../services/lote-cobr/lote-cobr.service';
import { ehAbortError } from '../../../../../../shared/errors/handlers/abort-error/abort-error-handler';
import { ParametroConsulta } from '../../../../../../shared/models/utils/query-params.model';
import { DetalhamentoLoteQueryResult } from '../../domain/detalhamento-lote.model';

@Injectable({ providedIn: null })
export class DetalhamentoLoteQueryService {
  constructor(
    private loteCobrService: LoteCobrService
  ) { }

  async buscarDetalhamento(
    idLote: number,
    convenio: number,
    params: ParametroConsulta[],
    controller: AbortController
  ): Promise<DetalhamentoLoteQueryResult> {
    try {
      const data = await this.loteCobrService.listarAgendamentosDoLote(idLote, convenio, params, controller);
      return { ok: true, data };
    } catch (error: unknown) {
      if (ehAbortError(error)) {
        return { ok: false, abort: true, error };
      }
      return { ok: false, error };
    }
  }
}
