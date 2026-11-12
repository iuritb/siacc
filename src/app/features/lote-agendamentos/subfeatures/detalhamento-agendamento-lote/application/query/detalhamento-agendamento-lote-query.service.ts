import { Injectable } from '@angular/core';
import { CobrService } from '../../../../../../services/cobr/cobr.service';
import { ehAbortError } from '../../../../../../shared/errors/handlers/abort-error/abort-error-handler';
import { ErroGenericoInterno } from '../../../../../../shared/errors/erro-generico-interno';
import { MENSAGENS_DETALHAMENTO_AGENDAMENTO_LOTE } from '../../domain/detalhamento-agendamento-lote.constants';
import { DetalhamentoAgendamentoLoteContexto } from '../../domain/detalhamento-agendamento-lote.contracts';
import { DetalhamentoAgendamentoLoteQueryResult } from '../../domain/detalhamento-agendamento-lote.model';
import { montarDetalhamentoAgendamentoLoteFallback } from '../../detalhamento-agendamento-lote.helpers';

@Injectable({ providedIn: null })
export class DetalhamentoAgendamentoLoteQueryService {
  constructor(
    private cobrService: CobrService
  ) { }

  async carregarDetalhamento(
    contexto: DetalhamentoAgendamentoLoteContexto,
    controller: AbortController
  ): Promise<DetalhamentoAgendamentoLoteQueryResult> {
    if (!contexto.deveConsultarApi) {
      return { ok: true, data: montarDetalhamentoAgendamentoLoteFallback(contexto.cobSelecionada) };
    }

    try {
      const txid = contexto.cobSelecionada.txid.trim();
      const data = await this.cobrService.detalharCobrancaRecorrente(txid, controller);

      if (!data) {
        throw new ErroGenericoInterno(
          MENSAGENS_DETALHAMENTO_AGENDAMENTO_LOTE.tituloResponseVazia,
          [MENSAGENS_DETALHAMENTO_AGENDAMENTO_LOTE.descricaoResponseVazia]
        );
      }

      return { ok: true, data };
    } catch (error: unknown) {
      if (ehAbortError(error)) {
        return { ok: false, abort: true, error };
      }
      return { ok: false, error };
    }
  }
}
