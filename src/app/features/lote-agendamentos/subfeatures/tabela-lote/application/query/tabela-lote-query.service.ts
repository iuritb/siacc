import { Injectable } from '@angular/core';
import { LoteCobrService } from '../../../../../../services/lote-cobr/lote-cobr.service';
import { ParametroConsulta } from '../../../../../../shared/models/utils/query-params.model';
import { ehAbortError } from '../../../../../../shared/errors/handlers/abort-error/abort-error-handler';
import { TabelaLoteQueryResult } from '../../domain/tabela-lote.model';

@Injectable({ providedIn: null })
export class TabelaLoteQueryService {
  constructor(
    private loteCobrService: LoteCobrService
  ) { }

  async buscarLotes(params: ParametroConsulta[], controller: AbortController): Promise<TabelaLoteQueryResult> {
    try {
      const data = await this.loteCobrService.buscarLotes(params, controller);
      return { ok: true, data };
    } catch (error: unknown) {
      if (ehAbortError(error)) {
        return { ok: false, abort: true, error };
      }
      return { ok: false, error };
    }
  }
}
