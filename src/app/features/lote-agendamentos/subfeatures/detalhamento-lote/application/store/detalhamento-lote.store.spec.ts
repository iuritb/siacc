import { FormatadorFeedbackService } from '../../../../../../services/formatador-feedback/formatador-feedback.service';
import { PAGINACAO_INICIAL_DETALHAMENTO_LOTE } from '../../domain/detalhamento-lote.constants';
import { DetalhamentoLoteQueryResult } from '../../domain/detalhamento-lote.model';
import { DetalhamentoLoteStore } from './detalhamento-lote.store';

describe('DetalhamentoLoteStore', () => {
  let store: DetalhamentoLoteStore;
  let detalhamentoLoteQueryServiceMock: { buscarDetalhamento: jest.Mock };
  let formatadorFeedbackServiceMock: { formatarMensagemErro: jest.Mock };

  beforeEach(() => {
    detalhamentoLoteQueryServiceMock = { buscarDetalhamento: jest.fn() };
    formatadorFeedbackServiceMock = { formatarMensagemErro: jest.fn() };
    store = new DetalhamentoLoteStore(
      detalhamentoLoteQueryServiceMock as any,
      formatadorFeedbackServiceMock as unknown as FormatadorFeedbackService
    );
  });

  it('deve inicializar com estado vazio e paginação inicial', () => {
    expect(store.paginacaoAtual()).toEqual(PAGINACAO_INICIAL_DETALHAMENTO_LOTE);
    expect(store.contextoAtual()).toBeNull();
    expect(store.detalhamentoLote()).toBeNull();
    expect(store.cobsrFormatados()).toEqual([]);
    expect(store.carregadoComSucesso()).toBe(false);
  });

  it('deve tratar erro de validação de identificadores e não chamar query', async () => {
    const feedback = { titulo: 'Erro', listaMensagem: ['id inválido'] } as any;
    formatadorFeedbackServiceMock.formatarMensagemErro.mockReturnValue(feedback);

    await store.inicializarContexto(null, 20);

    expect(detalhamentoLoteQueryServiceMock.buscarDetalhamento).not.toHaveBeenCalled();
    expect(store.mensagemErro()).toEqual(feedback);
    expect(store.detalhamentoLote()).toBeNull();
  });

  it('deve carregar dados com sucesso e evitar nova consulta no mesmo contexto já carregado', async () => {
    const response = {
      parametros: {
        id: 10,
        convenio: 20,
        paginacao: { paginaAtual: 0, itensPorPagina: 10, totalPaginas: 1, totalRegistros: 1 }
      },
      cobsr: []
    } as any;
    const queryResult: DetalhamentoLoteQueryResult = { ok: true, data: response };
    detalhamentoLoteQueryServiceMock.buscarDetalhamento.mockResolvedValue(queryResult);

    await store.inicializarContexto(10, 20);
    await store.inicializarContexto(10, 20);

    expect(detalhamentoLoteQueryServiceMock.buscarDetalhamento).toHaveBeenCalledTimes(1);
    expect(store.contextoAtual()).toEqual({ idLote: 10, convenio: 20 });
    expect(store.carregadoComSucesso()).toBe(true);
    expect(store.detalhamentoLote()).toEqual(response);
  });

  it('deve reverter paginação quando ocorrer abort na consulta de página', async () => {
    const response = {
      parametros: {
        id: 10,
        convenio: 20,
        paginacao: { paginaAtual: 0, itensPorPagina: 10, totalPaginas: 2, totalRegistros: 20 }
      },
      cobsr: []
    } as any;

    detalhamentoLoteQueryServiceMock.buscarDetalhamento
      .mockResolvedValueOnce({ ok: true, data: response })
      .mockResolvedValueOnce({ ok: false, abort: true, error: { name: 'AbortError' } });

    await store.inicializarContexto(10, 20);
    await store.atualizarPaginacao({ pageIndex: 1, pageSize: 10 } as any);

    expect(store.paginacaoAtual().paginaAtual).toBe(0);
    expect(store.carregadoComSucesso()).toBe(true);
  });

  it('deve limpar dados e setar mensagem de erro quando query retorna erro genérico', async () => {
    const feedback = { titulo: 'Erro', listaMensagem: ['falha'] } as any;
    formatadorFeedbackServiceMock.formatarMensagemErro.mockReturnValue(feedback);
    const erro = new Error('falha na API');

    detalhamentoLoteQueryServiceMock.buscarDetalhamento.mockResolvedValue({ ok: false, error: erro });

    await store.inicializarContexto(10, 20);

    expect(store.carregadoComSucesso()).toBe(false);
    expect(store.detalhamentoLote()).toBeNull();
    expect(store.cobsrFormatados()).toEqual([]);
    expect(store.mensagemErro()).toEqual(feedback);
    expect(formatadorFeedbackServiceMock.formatarMensagemErro).toHaveBeenCalled();
  });

  it('deve recarregar somente quando existir contexto', async () => {
    const response = {
      parametros: {
        id: 10,
        convenio: 20,
        paginacao: { paginaAtual: 0, itensPorPagina: 10, totalPaginas: 1, totalRegistros: 1 }
      },
      cobsr: []
    } as any;

    detalhamentoLoteQueryServiceMock.buscarDetalhamento.mockResolvedValue({ ok: true, data: response });

    await store.recarregar();
    expect(detalhamentoLoteQueryServiceMock.buscarDetalhamento).not.toHaveBeenCalled();

    await store.inicializarContexto(10, 20);
    await store.recarregar();

    expect(detalhamentoLoteQueryServiceMock.buscarDetalhamento).toHaveBeenCalledTimes(2);
  });

  it('deve reverter paginação ao atualizar página sem contexto', async () => {
    await store.atualizarPaginacao({ pageIndex: 3, pageSize: 20 } as any);

    expect(detalhamentoLoteQueryServiceMock.buscarDetalhamento).not.toHaveBeenCalled();
    expect(store.paginacaoAtual()).toEqual(PAGINACAO_INICIAL_DETALHAMENTO_LOTE);
  });

  it('deve aplicar estado de erro com reversão quando query lança exceção', async () => {
    const response = {
      parametros: {
        id: 10,
        convenio: 20,
        paginacao: { paginaAtual: 0, itensPorPagina: 10, totalPaginas: 2, totalRegistros: 20 }
      },
      cobsr: []
    } as any;
    const feedback = { titulo: 'Erro', listaMensagem: ['falha inesperada'] } as any;

    formatadorFeedbackServiceMock.formatarMensagemErro.mockReturnValue(feedback);
    detalhamentoLoteQueryServiceMock.buscarDetalhamento
      .mockResolvedValueOnce({ ok: true, data: response })
      .mockRejectedValueOnce(new Error('quebra de rede'));

    await store.inicializarContexto(10, 20);
    await store.atualizarPaginacao({ pageIndex: 1, pageSize: 10 } as any);

    expect(store.paginacaoAtual().paginaAtual).toBe(0);
    expect(store.mensagemErro()).toEqual(feedback);
    expect(store.carregadoComSucesso()).toBe(false);
  });

  it('deve manter paginação atual quando resposta de sucesso não trouxer paginação', async () => {
    const respostaSemPaginacao = {
      parametros: { id: 10, convenio: 20 },
      cobsr: []
    } as any;

    detalhamentoLoteQueryServiceMock.buscarDetalhamento.mockResolvedValue({ ok: true, data: respostaSemPaginacao });

    await store.inicializarContexto(10, 20);

    expect(store.paginacaoAtual()).toEqual(PAGINACAO_INICIAL_DETALHAMENTO_LOTE);
    expect(store.carregadoComSucesso()).toBe(true);
  });

  it('deve abortar a consulta anterior quando uma nova consulta inicia', async () => {
    const response = {
      parametros: {
        id: 11,
        convenio: 21,
        paginacao: { paginaAtual: 0, itensPorPagina: 10, totalPaginas: 1, totalRegistros: 1 }
      },
      cobsr: []
    } as any;

    detalhamentoLoteQueryServiceMock.buscarDetalhamento
      .mockImplementationOnce((_idLote, _convenio, _params, controller: AbortController) => {
        return new Promise((resolve) => {
          controller.signal.addEventListener('abort', () => {
            resolve({ ok: false, abort: true, error: { name: 'AbortError' } });
          });
        });
      })
      .mockResolvedValueOnce({ ok: true, data: response });

    const primeiraConsulta = store.inicializarContexto(10, 20);
    await store.inicializarContexto(11, 21);
    await primeiraConsulta;

    const primeiroController = detalhamentoLoteQueryServiceMock.buscarDetalhamento.mock.calls[0][3] as AbortController;

    expect(primeiroController.signal.aborted).toBe(true);
    expect(store.contextoAtual()).toEqual({ idLote: 11, convenio: 21 });
    expect(store.carregadoComSucesso()).toBe(true);
  });

  it('deve cancelar consulta ativa ao chamar cancelarConsultaAtual', async () => {
    detalhamentoLoteQueryServiceMock.buscarDetalhamento
      .mockImplementationOnce((_idLote, _convenio, _params, controller: AbortController) => {
        return new Promise((resolve) => {
          controller.signal.addEventListener('abort', () => {
            resolve({ ok: false, abort: true, error: { name: 'AbortError' } });
          });
        });
      });

    const consulta = store.inicializarContexto(10, 20);
    const controller = detalhamentoLoteQueryServiceMock.buscarDetalhamento.mock.calls[0][3] as AbortController;

    store.cancelarConsultaAtual();
    await consulta;

    expect(controller.signal.aborted).toBe(true);
    expect(store.isLoading()).toBe(false);
  });
});
