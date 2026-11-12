import { FormatadorFeedbackService } from '../../../../../../services/formatador-feedback/formatador-feedback.service';
import { DetalhamentoAgendamentoLoteStore } from './detalhamento-agendamento-lote.store';

describe('DetalhamentoAgendamentoLoteStore', () => {
  let store: DetalhamentoAgendamentoLoteStore;
  let queryServiceMock: { carregarDetalhamento: jest.Mock };
  let formatadorFeedbackServiceMock: { formatarMensagemErro: jest.Mock };

  const contextoEntrada = (txid = 'txid-1', deveConsultarApi = true) => ({
    cobSelecionada: {
      txid,
      recebedor: { conta: '1234', tipoConta: 'CORRENTE', agencia: '0001' },
      situacao: 'SUCESSO',
      dataHoraSituacao: '2026-05-20T11:30:00Z',
      integracao: []
    } as any,
    deveConsultarApi
  });

  beforeEach(() => {
    queryServiceMock = { carregarDetalhamento: jest.fn() };
    formatadorFeedbackServiceMock = { formatarMensagemErro: jest.fn() };

    store = new DetalhamentoAgendamentoLoteStore(
      queryServiceMock as any,
      formatadorFeedbackServiceMock as unknown as FormatadorFeedbackService
    );
  });

  it('deve inicializar com estado vazio', () => {
    expect(store.contextoAtual()).toBeNull();
    expect(store.isLoading()).toBe(false);
    expect(store.mensagemErro()).toBeNull();
    expect(store.dadoDetalhado()).toBeNull();
    expect(store.carregadoComSucesso()).toBe(false);
  });

  it('deve tratar erro de validação quando txid não for informado', async () => {
    const feedback = { titulo: 'Erro', listaMensagem: ['txid inválido'] } as any;
    formatadorFeedbackServiceMock.formatarMensagemErro.mockReturnValue(feedback);

    await store.inicializarContexto({ ...contextoEntrada('   ').cobSelecionada }, true);

    expect(queryServiceMock.carregarDetalhamento).not.toHaveBeenCalled();
    expect(store.mensagemErro()).toEqual(feedback);
    expect(store.dadoDetalhado()).toBeNull();
  });

  it('deve carregar dados com sucesso e não recarregar no mesmo contexto', async () => {
    const response = { txid: 'txid-1' } as any;
    queryServiceMock.carregarDetalhamento.mockResolvedValue({ ok: true, data: response });

    const entrada = contextoEntrada('txid-1', true);

    await store.inicializarContexto(entrada.cobSelecionada, entrada.deveConsultarApi);
    await store.inicializarContexto(entrada.cobSelecionada, entrada.deveConsultarApi);

    expect(queryServiceMock.carregarDetalhamento).toHaveBeenCalledTimes(1);
    expect(store.contextoAtual()?.cobSelecionada.txid).toBe('txid-1');
    expect(store.carregadoComSucesso()).toBe(true);
    expect(store.dadoDetalhado()).toEqual(response);
  });

  it('deve recarregar quando o mesmo txid mudar o flag deveConsultarApi', async () => {
    queryServiceMock.carregarDetalhamento.mockResolvedValue({ ok: true, data: { txid: 'txid-1' } });

    await store.inicializarContexto(contextoEntrada('txid-1', false).cobSelecionada, false);
    await store.inicializarContexto(contextoEntrada('txid-1', true).cobSelecionada, true);

    expect(queryServiceMock.carregarDetalhamento).toHaveBeenCalledTimes(2);
    expect(store.contextoAtual()?.deveConsultarApi).toBe(true);
  });

  it('deve manter dados quando retorno da query for abort', async () => {
    queryServiceMock.carregarDetalhamento
      .mockResolvedValueOnce({ ok: true, data: { txid: 'txid-1' } })
      .mockResolvedValueOnce({ ok: false, abort: true, error: { name: 'AbortError' } });

    const entrada = contextoEntrada('txid-1', true);

    await store.inicializarContexto(entrada.cobSelecionada, entrada.deveConsultarApi);
    await store.recarregar();

    expect(store.dadoDetalhado()).toEqual({ txid: 'txid-1' });
    expect(store.carregadoComSucesso()).toBe(true);
    expect(store.mensagemErro()).toBeNull();
  });

  it('deve limpar dados e setar mensagem quando query retornar erro', async () => {
    const feedback = { titulo: 'Erro', listaMensagem: ['falha'] } as any;
    const erro = new Error('falha na API');

    formatadorFeedbackServiceMock.formatarMensagemErro.mockReturnValue(feedback);
    queryServiceMock.carregarDetalhamento.mockResolvedValue({ ok: false, error: erro });

    const entrada = contextoEntrada('txid-1', true);
    await store.inicializarContexto(entrada.cobSelecionada, entrada.deveConsultarApi);

    expect(store.dadoDetalhado()).toBeNull();
    expect(store.carregadoComSucesso()).toBe(false);
    expect(store.mensagemErro()).toEqual(feedback);
    expect(formatadorFeedbackServiceMock.formatarMensagemErro).toHaveBeenCalled();
  });

  it('deve abortar consulta ativa ao chamar cancelarConsultaAtual', async () => {
    queryServiceMock.carregarDetalhamento.mockImplementationOnce((_contexto, controller: AbortController) => {
      return new Promise((resolve) => {
        controller.signal.addEventListener('abort', () => {
          resolve({ ok: false, abort: true, error: { name: 'AbortError' } });
        });
      });
    });

    const entrada = contextoEntrada('txid-1', true);
    const consulta = store.inicializarContexto(entrada.cobSelecionada, entrada.deveConsultarApi);
    const controller = queryServiceMock.carregarDetalhamento.mock.calls[0][1] as AbortController;

    store.cancelarConsultaAtual();
    await consulta;

    expect(controller.signal.aborted).toBe(true);
    expect(store.isLoading()).toBe(false);
  });
});
