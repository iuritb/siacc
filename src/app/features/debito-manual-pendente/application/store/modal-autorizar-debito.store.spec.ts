import { ModalAutorizarDebitoStore } from './modal-autorizar-debito.store';
import { DebitoManualPendenteGateway } from '../query/debito-manual-pendente-query.service';
import { FormatadorFeedbackService } from '../../../../services/formatador-feedback/formatador-feedback.service';
import { MENSAGENS_MODAL_AUTORIZAR_DEBITO } from '../../domain/debito-manual-pendente.constants';
import { createMockDebitoManualPendenteFormatado } from '../../../../../test-helpers/createMockDebitoManualPendente';
import { EnumSituacaoDebitoManual } from '../../domain/debito-manual.enum';
import * as helpers from '../../debito-manual-pendente.helpers';

jest.mock('../../debito-manual-pendente.helpers', () => ({
  calcularPermissaoAcao: jest.fn(),
  formatarDadosDasCobrancas: jest.fn(),
}));

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

const createDeferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => { resolve = res; });
  return { promise, resolve };
};

describe('ModalAutorizarDebitoStore', () => {

  let store: ModalAutorizarDebitoStore;
  let gatewayMock: jest.Mocked<DebitoManualPendenteGateway>;
  let formatadorMock: jest.Mocked<FormatadorFeedbackService>;

  beforeEach(() => {
    gatewayMock = {
      autorizarDebitoManualPendente: jest.fn(),
    } as any;

    formatadorMock = {
      formatarFeedbackErro: jest.fn(),
    } as any;

    store = new ModalAutorizarDebitoStore(gatewayMock, formatadorMock);
    store.inicializar(createMockDebitoManualPendenteFormatado());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================
  // SUCESSO
  // ============================
  it('deve autorizar débito com sucesso', async () => {
    (helpers.formatarDadosDasCobrancas as jest.Mock).mockReturnValue([]);
    (helpers.calcularPermissaoAcao as jest.Mock).mockReturnValue({
      podeAutorizar: true,
    });

    gatewayMock.autorizarDebitoManualPendente.mockResolvedValue({
      ok: true,
      data: [] as any,
    });

    const result = await store.autorizarDebito(1, '2026-05');

    expect(result.ok).toBe(true);
    expect(store.cobrancaFoiAtualizada()).toBe(true);
    expect(store.isSending()).toBe(false);

    expect(gatewayMock.autorizarDebitoManualPendente).toHaveBeenCalledWith(
      1,
      '2026-05',
      expect.any(AbortController)
    );
  });

  // ============================
  // ERRO
  // ============================
  it('deve retornar erro com feedback formatado', async () => {
    const feedback = { variant: 'danger' } as any;

    gatewayMock.autorizarDebitoManualPendente.mockResolvedValue({
      ok: false,
      abort: false,
      error: new Error('erro'),
    });

    formatadorMock.formatarFeedbackErro.mockReturnValue(feedback);

    const result = await store.autorizarDebito(1, '2026-05');

    expect(result).toEqual({
      ok: false,
      isFeedback: true,
      feedback,
    });

    expect(formatadorMock.formatarFeedbackErro).toHaveBeenCalled();
  });

  // ============================
  // ABORT
  // ============================
  it('deve retornar cancelamento quando abort for true', async () => {
    gatewayMock.autorizarDebitoManualPendente.mockResolvedValue({
      ok: false,
      abort: true,
      error: null,
    });

    const result = await store.autorizarDebito(1, '2026-05');

    expect(result).toEqual({
      ok: false,
      isFeedback: false,
      mensagem: MENSAGENS_MODAL_AUTORIZAR_DEBITO.requisicaoCancelada,
    });
  });

  // ============================
  // DUPLICIDADE
  // ============================
  it('deve impedir requisição duplicada', async () => {
    const pending = createDeferred<any>();

    gatewayMock.autorizarDebitoManualPendente
      .mockImplementationOnce(() => pending.promise)
      .mockResolvedValueOnce({ ok: true, data: [] });

    const primeira = store.autorizarDebito(1, '2026-05');
    await Promise.resolve();

    const segunda = await store.autorizarDebito(1, '2026-05');

    expect(segunda).toEqual({
      ok: false,
      isFeedback: false,
      mensagem: MENSAGENS_MODAL_AUTORIZAR_DEBITO.requisicaoEmAndamento,
    });

    pending.resolve({ ok: true, data: [] });
    await primeira;
  });

  // ============================
  // CANCELAR
  // ============================
  it('deve cancelar requisição em andamento', async () => {
    const pending = createDeferred<any>();
    let controller: AbortController | undefined;

    gatewayMock.autorizarDebitoManualPendente.mockImplementationOnce(
      (_, __, ctrl: AbortController) => {
        controller = ctrl;
        return pending.promise;
      }
    );

    const req = store.autorizarDebito(1, '2026-05');
    await Promise.resolve();

    store.cancelarRequisicaoAtual();

    expect(controller?.signal.aborted).toBe(true);

    pending.resolve({ ok: false, abort: true, error: null });
    await req;
  });

  // ============================
  // COMPUTED
  // ============================
  describe('cobrancasParaAutorizar', () => {

    it('deve filtrar apenas AGUARDANDO_APROVACAO e INADIMPLENTE', () => {
      const mock = createMockDebitoManualPendenteFormatado();

      mock.cobrancasFormatadas = [
        { situacao: EnumSituacaoDebitoManual.AGUARDANDO_APROVACAO },
        { situacao: EnumSituacaoDebitoManual.INADIMPLENTE },
        { situacao: EnumSituacaoDebitoManual.SUCESSO },
      ] as any;

      store.inicializar(mock);

      const result = store.cobrancasParaAutorizar();

      expect(result).toHaveLength(2);
      expect(result.every(c =>
        c.situacao === EnumSituacaoDebitoManual.AGUARDANDO_APROVACAO ||
        c.situacao === EnumSituacaoDebitoManual.INADIMPLENTE
      )).toBe(true);
    });

    it('deve retornar vazio quando não houver cobrancas válidas', () => {
      const mock = createMockDebitoManualPendenteFormatado();

      mock.cobrancasFormatadas = [
        { situacao: EnumSituacaoDebitoManual.SUCESSO },
      ] as any;

      store.inicializar(mock);

      expect(store.cobrancasParaAutorizar()).toEqual([]);
    });

    it('deve retornar vazio quando estado for null', () => {
      store.inicializar(null as any);

      expect(store.cobrancasParaAutorizar()).toEqual([]);
    });

  });

});
