import { ErroGenericoInterno } from '../../../../../../shared/errors/erro-generico-interno';
import { DetalhamentoAgendamentoLoteQueryService } from './detalhamento-agendamento-lote-query.service';

describe('DetalhamentoAgendamentoLoteQueryService', () => {
  let service: DetalhamentoAgendamentoLoteQueryService;
  let cobrServiceMock: { detalharCobrancaRecorrente: jest.Mock };

  const contextoBase = () => ({
    cobSelecionada: {
      txid: 'txid-1',
      recebedor: { conta: '1234', tipoConta: 'CORRENTE', agencia: '0001' },
      situacao: 'SUCESSO',
      dataHoraSituacao: '2026-05-20T11:30:00Z',
      integracao: []
    } as any,
    deveConsultarApi: true
  });

  beforeEach(() => {
    cobrServiceMock = {
      detalharCobrancaRecorrente: jest.fn()
    };

    service = new DetalhamentoAgendamentoLoteQueryService(cobrServiceMock as any);
  });

  it('deve retornar fallback quando deveConsultarApi for false', async () => {
    const controller = new AbortController();
    const contexto = { ...contextoBase(), deveConsultarApi: false };

    const result = await service.carregarDetalhamento(contexto, controller);

    expect(cobrServiceMock.detalharCobrancaRecorrente).not.toHaveBeenCalled();
    expect(result.ok).toBe(true);
    expect(result.ok && result.data.txid).toBe('txid-1');
  });

  it('deve retornar ok=true com data quando API responde com sucesso', async () => {
    const controller = new AbortController();
    const contexto = contextoBase();
    const response = { txid: 'txid-1', status: 'ATIVA' } as any;

    cobrServiceMock.detalharCobrancaRecorrente.mockResolvedValue(response);

    const result = await service.carregarDetalhamento(contexto, controller);

    expect(cobrServiceMock.detalharCobrancaRecorrente).toHaveBeenCalledWith('txid-1', controller);
    expect(result).toEqual({ ok: true, data: response });
  });

  it('deve retornar abort=true quando ocorrer AbortError', async () => {
    const controller = new AbortController();
    const contexto = contextoBase();
    const abortError = { name: 'AbortError' };

    cobrServiceMock.detalharCobrancaRecorrente.mockRejectedValue(abortError);

    const result = await service.carregarDetalhamento(contexto, controller);

    expect(result).toEqual({ ok: false, abort: true, error: abortError });
  });

  it('deve retornar erro quando API responder null', async () => {
    const controller = new AbortController();
    const contexto = contextoBase();

    cobrServiceMock.detalharCobrancaRecorrente.mockResolvedValue(null);

    const result = await service.carregarDetalhamento(contexto, controller);

    expect(result.ok).toBe(false);
    if (!result.ok && !result.abort) {
      expect(result.error).toBeInstanceOf(ErroGenericoInterno);
    }
  });

  it('deve retornar erro bruto quando ocorrer erro genérico', async () => {
    const controller = new AbortController();
    const contexto = contextoBase();
    const erro = new Error('falha na API');

    cobrServiceMock.detalharCobrancaRecorrente.mockRejectedValue(erro);

    const result = await service.carregarDetalhamento(contexto, controller);

    expect(result).toEqual({ ok: false, error: erro });
  });
});
