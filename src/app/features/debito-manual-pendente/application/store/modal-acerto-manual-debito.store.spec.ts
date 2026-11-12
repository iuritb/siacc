import { ModalAcertoManualDebitoStore } from './modal-acerto-manual-debito.store';
import { DebitoManualPendenteGateway } from '../query/debito-manual-pendente-query.service';
import { FormatadorFeedbackService } from '../../../../services/formatador-feedback/formatador-feedback.service';
import { MENSAGENS_MODAL_ACERTO_MANUAL_DEBITO } from '../../domain/debito-manual-pendente.constants';
import { createMockDebitoManualPendenteFormatado } from '../../../../../test-helpers/createMockDebitoManualPendente';
import { EnumSituacaoDebitoManual, EnumTipoDebitoManual } from '../../domain/debito-manual.enum';
import * as helpers from '../../debito-manual-pendente.helpers';
import * as stringUtils from '../../../../shared/utils/string/string.utils';


type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

const createDeferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

jest.mock('../../debito-manual-pendente.helpers', () => ({
  atualizarDebitoManualPendenteComCobrancasEPermissoes: jest.fn(),
}));

jest.mock('../../../../shared/utils/string/string.utils', () => ({
  formatarValor: jest.fn(),
}));

describe('ModalAcertoManualDebitoStore', () => {
  let store: ModalAcertoManualDebitoStore;
  let gatewayMock: jest.Mocked<DebitoManualPendenteGateway>;
  let formatadorFeedbackServiceMock: jest.Mocked<FormatadorFeedbackService>;

  beforeEach(() => {
    gatewayMock = {
      acertoManualDebitoManualPendente: jest.fn(),
    } as any;

    formatadorFeedbackServiceMock = {
      formatarFeedbackErro: jest.fn(),
    } as any;

    store = new ModalAcertoManualDebitoStore(gatewayMock, formatadorFeedbackServiceMock);
    store.inicializar(createMockDebitoManualPendenteFormatado());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('cobrancasParaAcertoManual', () => {

    it('deve retornar apenas cobranças com situacao FATAL', () => {
      const mock = createMockDebitoManualPendenteFormatado();

      mock.cobrancasFormatadas = [
        { situacao: EnumSituacaoDebitoManual.FATAL },
        { situacao: EnumSituacaoDebitoManual.SUCESSO },
        { situacao: EnumSituacaoDebitoManual.FATAL },
      ] as any;

      store.inicializar(mock);

      const resultado = store.cobrancasParaAcertoManual();

      expect(resultado).toHaveLength(2);
      expect(resultado.every(c => c.situacao === EnumSituacaoDebitoManual.FATAL)).toBe(true);
    });

    it('deve retornar lista vazia quando não houver FATAL', () => {
      const mock = createMockDebitoManualPendenteFormatado();

      mock.cobrancasFormatadas = [
        { situacao: EnumSituacaoDebitoManual.SUCESSO },
        { situacao: EnumSituacaoDebitoManual.INADIMPLENTE },
      ] as any;

      store.inicializar(mock);

      const resultado = store.cobrancasParaAcertoManual();

      expect(resultado).toEqual([]);
    });

    it('deve retornar lista vazia quando não houver debitoFormatado', () => {
      // força um estado "null"
      store.inicializar(null as any);

      const resultado = store.cobrancasParaAcertoManual();

      expect(resultado).toEqual([]);
    });

    it('deve reagir a mudanças no estado (reatividade do signal)', () => {
      const mock = createMockDebitoManualPendenteFormatado();

      mock.cobrancasFormatadas = [
        { situacao: EnumSituacaoDebitoManual.SUCESSO },
      ] as any;

      store.inicializar(mock);

      expect(store.cobrancasParaAcertoManual()).toHaveLength(0);

      // atualiza o estado
      mock.cobrancasFormatadas = [
        { situacao: EnumSituacaoDebitoManual.FATAL },
      ] as any;

      store.inicializar(mock);

      expect(store.cobrancasParaAcertoManual()).toHaveLength(1);
    });

  });


  it('deve retornar feedback de erro quando gateway falhar', async () => {
    const feedbackErro = { titulo: 'Erro', mensagem: 'Falhou', descricao: 'x', variant: 'danger' } as any;
    gatewayMock.acertoManualDebitoManualPendente.mockResolvedValue({ ok: false, abort: false, error: new Error('falha') });
    formatadorFeedbackServiceMock.formatarFeedbackErro.mockReturnValue(feedbackErro);

    const resultado = await store.acertoManual(1001, '2026-05', 'observacao');

    expect(gatewayMock.acertoManualDebitoManualPendente).toHaveBeenCalled();
    expect(resultado).toEqual({ ok: false, isFeedback: true, feedback: feedbackErro });
  });

  it('deve executar acerto manual com sucesso', async () => {
    const debitoMock = createMockDebitoManualPendenteFormatado();

    (helpers.atualizarDebitoManualPendenteComCobrancasEPermissoes as jest.Mock)
      .mockReturnValue(debitoMock);

    gatewayMock.acertoManualDebitoManualPendente.mockResolvedValue({
      ok: true,
      data: [
        {
          tipo: EnumTipoDebitoManual.CAIXA,
          repasseId: 1,
          valor: 1,
          situacao: EnumSituacaoDebitoManual.SUCESSO,
          descricaoSituacao: 'Atualizado',
          dataSituacao: '2026-06-01T00:00:00',
        },
      ] as any
    });

    const resultado = await store.acertoManual(1001, '2026-05', 'ajuste autorizado');

    expect(gatewayMock.acertoManualDebitoManualPendente).toHaveBeenCalledWith(
      1001,
      '2026-05',
      'ajuste autorizado',
      expect.any(AbortController)
    );

    expect(helpers.atualizarDebitoManualPendenteComCobrancasEPermissoes)
      .toHaveBeenCalled();

    expect(resultado.ok).toBe(true);

    if (resultado.ok) {
      expect(resultado.feedback.variant).toBe('success');
    }

    expect(store.cobrancaFoiAtualizada()).toBe(true);
    expect(store.isSending()).toBe(false);
  });


  it('deve impedir envio duplicado no acerto manual', async () => {
    const pendente = createDeferred<any>();

    gatewayMock.acertoManualDebitoManualPendente
      .mockImplementationOnce(() => pendente.promise)
      .mockResolvedValueOnce({ ok: true, data: [] as any });

    const primeira = store.acertoManual(1001, '2026-05', 'primeira tentativa');
    await Promise.resolve();

    const segunda = await store.acertoManual(1001, '2026-05', 'segunda tentativa');

    expect(segunda).toEqual({
      ok: false,
      isFeedback: false,
      mensagem: MENSAGENS_MODAL_ACERTO_MANUAL_DEBITO.requisicaoEmAndamento,
    });

    pendente.resolve({ ok: true, data: [] as any });
    await primeira;
  });

  it('deve retornar mensagem de cancelamento quando gateway sinalizar abort', async () => {
    gatewayMock.acertoManualDebitoManualPendente.mockResolvedValue({ ok: false, abort: true, error: null });

    const resultado = await store.acertoManual(1001, '2026-05', 'observacao');

    expect(resultado).toEqual({
      ok: false,
      isFeedback: false,
      mensagem: MENSAGENS_MODAL_ACERTO_MANUAL_DEBITO.requisicaoCancelada,
    });
  });

  it('deve retornar feedback formatado quando houver erro não abortado', async () => {
    const feedbackErro = { titulo: 'Erro', mensagem: 'Falhou', descricao: 'x', variant: 'danger' } as any;
    gatewayMock.acertoManualDebitoManualPendente.mockResolvedValue({ ok: false, abort: false, error: new Error('falha') });
    formatadorFeedbackServiceMock.formatarFeedbackErro.mockReturnValue(feedbackErro);

    const resultado = await store.acertoManual(1001, '2026-05', 'observacao');

    expect(formatadorFeedbackServiceMock.formatarFeedbackErro).toHaveBeenCalled();
    expect(resultado).toEqual({ ok: false, isFeedback: true, feedback: feedbackErro });
  });

  it('deve cancelar requisição em andamento', async () => {
    const pendente = createDeferred<any>();
    let controllerCapturado: AbortController | undefined;

    gatewayMock.acertoManualDebitoManualPendente.mockImplementationOnce((_, __, ___, controller: AbortController) => {
      controllerCapturado = controller;
      return pendente.promise;
    });

    const requisicao = store.acertoManual(1001, '2026-05', 'observacao');
    await Promise.resolve();

    store.cancelarRequisicaoAtual();

    expect(controllerCapturado).toBeDefined();
    expect(controllerCapturado?.signal.aborted).toBe(true);

    pendente.resolve({ ok: false, abort: true, error: null });
    await requisicao;
  });

  // ============================
  // ✅ COMPUTED: valor
  // ============================
  it('deve calcular valor total das cobrancas FATAL', () => {
    (stringUtils.formatarValor as jest.Mock).mockReturnValue('R$ 300');

    const mock = createMockDebitoManualPendenteFormatado();

    mock.cobrancasFormatadas = [
      { valor: 100, situacao: EnumSituacaoDebitoManual.FATAL },
      { valor: 200, situacao: EnumSituacaoDebitoManual.FATAL },
      { valor: 500, situacao: EnumSituacaoDebitoManual.SUCESSO },
    ] as any;

    store.inicializar(mock);

    const result = store.valorApuradoAcerto();

    expect(stringUtils.formatarValor).toHaveBeenCalledWith(300);
    expect(result).toBe('R$ 300');
  });

  it('deve retornar valor zero formatado quando não houver FATAL', () => {
    (stringUtils.formatarValor as jest.Mock).mockReturnValue('R$ 0');

    const mock = createMockDebitoManualPendenteFormatado();

    mock.cobrancasFormatadas = [
      { valor: 500, situacao: EnumSituacaoDebitoManual.SUCESSO },
    ] as any;

    store.inicializar(mock);

    const result = store.valorApuradoAcerto();

    expect(result).toBe('R$ 0');
  });

});
