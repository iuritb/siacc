import { Injectable } from '@angular/core';
import { ErroGenericoInterno } from '../../../../shared/errors/erro-generico-interno';
import { ErroAPISemDados } from '../../../../shared/errors/erro-api-sem-dados';
import { EnumOpcoesAutorizacaoAgendamento } from '../../../../shared/models/autorizacao-agendamento/utils.enum';
import { RecService } from '../../../../services/rec/rec.service';
import { CobrService } from '../../../../services/cobr/cobr.service';
import { LoteCobrService } from '../../../../services/lote-cobr/lote-cobr.service';
import { AutorizacaoAgendamentoService } from '../../../../services/autorizacao-agendamento/autorizacao-agendamento.service';
import { ConsultaResult, EnumTipoRetornoConsulta } from '../../domain/autorizacoes-agendamentos-consulta-result.model';
import { MENSAGENS_FILTRO_AUTORIZACAO, MENSAGENS_FILTRO_AGENDAMENTO, MENSAGENS_FILTRO_LOTE } from '../../domain/autorizacoes-agendamentos.constants';

@Injectable({
  providedIn: 'root'
})
export class AutorizacoesAgendamentosQueryService {
  constructor(
    private recService: RecService,
    private cobrService: CobrService,
    private loteCobrService: LoteCobrService,
    private autorizacaoAgendamentoService: AutorizacaoAgendamentoService
  ) { }

  public async consultar(
    destino: EnumOpcoesAutorizacaoAgendamento | null,
    query: Record<string, string>,
    controller: AbortController
  ): Promise<ConsultaResult> {
    try {
      if (!destino) {
        return {
          type: EnumTipoRetornoConsulta.ERROR,
          domain: null,
          error: new ErroGenericoInterno('Destino selecionado e invalido ou nulo.', null)
        };
      }

      const paramsPreparados = destino === EnumOpcoesAutorizacaoAgendamento.LOTE
        ? this.autorizacaoAgendamentoService.prepararQueryParamsLote(query)
        : this.autorizacaoAgendamentoService.prepararQueryParams(query);

      const { parametrosSemPaginacao, parametrosComPaginacao } = paramsPreparados;

      switch (destino) {
        case EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO:
          return this.consultarAutorizacoes(parametrosComPaginacao, parametrosSemPaginacao, controller);
        case EnumOpcoesAutorizacaoAgendamento.AGENDAMENTO:
          return this.consultarAgendamentos(parametrosComPaginacao, parametrosSemPaginacao, controller);
        case EnumOpcoesAutorizacaoAgendamento.LOTE:
          return this.consultarLotes(parametrosComPaginacao, parametrosSemPaginacao, controller);
        default:
          return {
            type: EnumTipoRetornoConsulta.ERROR,
            domain: null,
            error: new ErroGenericoInterno('Destino selecionado e invalido ou nulo.', null)
          };
      }
    } catch (error: unknown) {
      return {
        type: EnumTipoRetornoConsulta.ERROR,
        domain: destino,
        error
      };
    }
  }

  private async consultarAutorizacoes(
    parametrosComPaginacao: { titulo: string; valor: string }[],
    parametrosSemPaginacao: { titulo: string; valor: string }[],
    controller: AbortController
  ): Promise<ConsultaResult> {
    try {
      const response = await this.recService.buscarRecorrencias(parametrosComPaginacao, controller);
      if (!response?.recs?.length) {
        return {
          type: EnumTipoRetornoConsulta.ERROR,
          domain: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO,
          error: new ErroAPISemDados(MENSAGENS_FILTRO_AUTORIZACAO.erroSemDadosDoFiltro, null)
        };
      }

      return {
        type: EnumTipoRetornoConsulta.SUCCESS,
        domain: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO,
        parametrosSemPaginacao,
        data: response
      };
    } catch (error: unknown) {
      return {
        type: EnumTipoRetornoConsulta.ERROR,
        domain: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO,
        error
      };
    }
  }

  private async consultarAgendamentos(
    parametrosComPaginacao: { titulo: string; valor: string }[],
    parametrosSemPaginacao: { titulo: string; valor: string }[],
    controller: AbortController
  ): Promise<ConsultaResult> {
    try {
      const response = await this.cobrService.buscarCobrancasRecorrentes(parametrosComPaginacao, controller);
      if (!response?.cobsr?.length) {
        return {
          type: EnumTipoRetornoConsulta.ERROR,
          domain: EnumOpcoesAutorizacaoAgendamento.AGENDAMENTO,
          error: new ErroAPISemDados(MENSAGENS_FILTRO_AGENDAMENTO.erroSemDadosDoFiltro, null)
        };
      }

      return {
        type: EnumTipoRetornoConsulta.SUCCESS,
        domain: EnumOpcoesAutorizacaoAgendamento.AGENDAMENTO,
        parametrosSemPaginacao,
        data: response
      };
    } catch (error: unknown) {
      return {
        type: EnumTipoRetornoConsulta.ERROR,
        domain: EnumOpcoesAutorizacaoAgendamento.AGENDAMENTO,
        error
      };
    }
  }

  private async consultarLotes(
    parametrosComPaginacao: { titulo: string; valor: string }[],
    parametrosSemPaginacao: { titulo: string; valor: string }[],
    controller: AbortController
  ): Promise<ConsultaResult> {
    try {
      const response = await this.loteCobrService.buscarLotes(parametrosComPaginacao, controller);
      if (!response?.lotesCobr?.length) {
        return {
          type: EnumTipoRetornoConsulta.ERROR,
          domain: EnumOpcoesAutorizacaoAgendamento.LOTE,
          error: new ErroAPISemDados(MENSAGENS_FILTRO_LOTE.erroSemDadosDoFiltro, null)
        };
      }

      return {
        type: EnumTipoRetornoConsulta.SUCCESS,
        domain: EnumOpcoesAutorizacaoAgendamento.LOTE,
        parametrosSemPaginacao,
        data: response
      };
    } catch (error: unknown) {
      return {
        type: EnumTipoRetornoConsulta.ERROR,
        domain: EnumOpcoesAutorizacaoAgendamento.LOTE,
        error
      };
    }
  }
}
