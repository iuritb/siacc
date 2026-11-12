import { DetalhamentoLoteQueryService } from './detalhamento-lote-query.service';

describe('DetalhamentoLoteQueryService', () => {
  let service: DetalhamentoLoteQueryService;
  let loteCobrServiceMock: { listarAgendamentosDoLote: jest.Mock };

  beforeEach(() => {
    loteCobrServiceMock = { listarAgendamentosDoLote: jest.fn() };
    service = new DetalhamentoLoteQueryService(loteCobrServiceMock as any);
  });

  it('deve retornar ok=true com data quando a API responde com sucesso', async () => {
    const controller = new AbortController();
    const params = [{ nome: 'pagina', valor: '0' }] as any;
    const response = {
      parametros: {
        id: 10,
        convenio: 20,
        paginacao: { paginaAtual: 0, itensPorPagina: 10, totalPaginas: 1, totalRegistros: 1 }
      },
      cobsr: []
    } as any;

    loteCobrServiceMock.listarAgendamentosDoLote.mockResolvedValue(response);

    const result = await service.buscarDetalhamento(10, 20, params, controller);

    expect(loteCobrServiceMock.listarAgendamentosDoLote).toHaveBeenCalledWith(10, 20, params, controller);
    expect(result).toEqual({ ok: true, data: response });
  });

  it('deve retornar ok=false com abort=true quando ocorrer AbortError', async () => {
    const controller = new AbortController();
    const abortError = { name: 'AbortError' };

    loteCobrServiceMock.listarAgendamentosDoLote.mockRejectedValue(abortError);

    const result = await service.buscarDetalhamento(10, 20, [], controller);

    expect(result).toEqual({ ok: false, abort: true, error: abortError });
  });

  it('deve retornar ok=false com erro bruto quando ocorrer erro genérico', async () => {
    const controller = new AbortController();
    const erro = new Error('falha na API');

    loteCobrServiceMock.listarAgendamentosDoLote.mockRejectedValue(erro);

    const result = await service.buscarDetalhamento(10, 20, [], controller);

    expect(result).toEqual({ ok: false, error: erro });
  });
});
