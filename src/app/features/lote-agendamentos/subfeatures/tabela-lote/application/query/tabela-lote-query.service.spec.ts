import { TabelaLoteQueryService } from './tabela-lote-query.service';

describe('TabelaLoteQueryService', () => {
  let service: TabelaLoteQueryService;
  let loteCobrServiceMock: { buscarLotes: jest.Mock };

  beforeEach(() => {
    loteCobrServiceMock = { buscarLotes: jest.fn() };
    service = new TabelaLoteQueryService(loteCobrServiceMock as any);
  });

  it('deve retornar ok=true com data quando a API responde com sucesso', async () => {
    const controller = new AbortController();
    const params = [{ nome: 'pagina', valor: '0' }] as any;
    const response = {
      parametros: { paginacao: { paginaAtual: 0, itensPorPagina: 10, totalPaginas: 1, totalRegistros: 1 } },
      lotesCobr: []
    } as any;

    loteCobrServiceMock.buscarLotes.mockResolvedValue(response);

    const result = await service.buscarLotes(params, controller);

    expect(loteCobrServiceMock.buscarLotes).toHaveBeenCalledWith(params, controller);
    expect(result).toEqual({ ok: true, data: response });
  });

  it('deve retornar ok=false com abort=true quando ocorrer AbortError', async () => {
    const controller = new AbortController();
    const abortError = { name: 'AbortError' };

    loteCobrServiceMock.buscarLotes.mockRejectedValue(abortError);

    const result = await service.buscarLotes([], controller);

    expect(result).toEqual({ ok: false, abort: true, error: abortError });
  });

  it('deve retornar ok=false com erro bruto quando ocorrer erro genérico', async () => {
    const controller = new AbortController();
    const erro = new Error('falha na API');

    loteCobrServiceMock.buscarLotes.mockRejectedValue(erro);

    const result = await service.buscarLotes([], controller);

    expect(result).toEqual({ ok: false, error: erro });
  });
});

