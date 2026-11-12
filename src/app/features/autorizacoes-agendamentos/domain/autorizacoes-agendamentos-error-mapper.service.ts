import { Injectable } from '@angular/core';
import { ehAbortError } from '../../../shared/errors/handlers/abort-error/abort-error-handler';
import { EnumOpcoesAutorizacaoAgendamento } from '../../../shared/models/autorizacao-agendamento/utils.enum';
import { FormatadorFeedbackService } from '../../../services/formatador-feedback/formatador-feedback.service';
import { AutorizacaoAgendamentoService } from '../../../services/autorizacao-agendamento/autorizacao-agendamento.service';
import { ConsultaResultError } from './autorizacoes-agendamentos-consulta-result.model';
import { ConsultaPresentationResult, MENSAGEM_REQUISICAO_CANCELADA } from './autorizacoes-agendamentos-presentation-result.model';
import { MENSAGENS_FILTRO_AGENDAMENTO, MENSAGENS_FILTRO_AUTORIZACAO, MENSAGENS_FILTRO_LOTE } from './autorizacoes-agendamentos.constants';

@Injectable({
  providedIn: 'root'
})
export class AutorizacoesAgendamentosErrorMapperService {
  constructor(
    private formatadorFeedbackService: FormatadorFeedbackService,
    private autorizacaoAgendamentoService: AutorizacaoAgendamentoService
  ) { }

  public mapearErro(
    result: ConsultaResultError,
    destinoSelecionado: EnumOpcoesAutorizacaoAgendamento | null
  ): ConsultaPresentationResult {
    if (ehAbortError(result.error)) {
      return {
        kind: 'snackbar-info',
        message: MENSAGEM_REQUISICAO_CANCELADA
      };
    }

    const dominio = result.domain ?? destinoSelecionado;
    const mensagens = this.obterMensagensPorDominio(dominio);
    return {
      kind: 'modal-error',
      feedback: this.formatadorFeedbackService.formatarFeedbackErro(result.error, mensagens.titulo, mensagens.subTitulo, null)
    };
  }

  private obterMensagensPorDominio(destino: EnumOpcoesAutorizacaoAgendamento | null): { titulo: string; subTitulo: string } {
    switch (destino) {
      case EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO:
        return {
          titulo: MENSAGENS_FILTRO_AUTORIZACAO.tituloModal,
          subTitulo: MENSAGENS_FILTRO_AUTORIZACAO.subTituloModal
        };
      case EnumOpcoesAutorizacaoAgendamento.AGENDAMENTO:
        return {
          titulo: MENSAGENS_FILTRO_AGENDAMENTO.tituloModal,
          subTitulo: MENSAGENS_FILTRO_AGENDAMENTO.subTituloModal
        };
      case EnumOpcoesAutorizacaoAgendamento.LOTE:
        return {
          titulo: MENSAGENS_FILTRO_LOTE.tituloModal,
          subTitulo: MENSAGENS_FILTRO_LOTE.subTituloModal
        };
      default:
        return {
          titulo: this.autorizacaoAgendamentoService.formatarNomeDestino(destino),
          subTitulo: 'Nao foi possivel realizar a consulta, tente novamente mais tarde.'
        };
    }
  }
}
