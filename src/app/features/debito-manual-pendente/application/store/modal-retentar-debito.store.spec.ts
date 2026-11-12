import { ModalRetentarDebitoStore } from './modal-retentar-debito.store';
import { DebitoManualPendenteGateway } from '../query/debito-manual-pendente-query.service';
import { FormatadorFeedbackService } from '../../../../services/formatador-feedback/formatador-feedback.service';
import { MENSAGENS_MODAL_RETENTAR_DEBITO } from '../../domain/debito-manual-pendente.constants';
import { createMockDebitoManualPendenteFormatado } from '../../../../../test-helpers/createMockDebitoManualPendente';
import { EnumSituacaoDebitoManual } from '../../domain/debito-manual.enum';
import * as helpers from '../../debito-manual-pendente.helpers';
import * as stringUtils from '../../../../shared/utils/string/string.utils';

jest.mock('../../debito-manual-pendente.helpers', () => ({
  atualizarDebitoManualPendenteComCobrancasEPermissoes: jest.fn(),
}));

jest.mock('../../../../shared/utils/string/string.utils', () => ({
  formatarValor: jest.fn(),
}));

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

describe('ModalRetentarDebitoStore', () => {

  let store: ModalRetentarDebitoStore;
  let gatewayMock: jest.Mocked<DebitoManualPendenteGateway>;
  let formatadorMock: jest.Mocked<FormatadorFeedbackService>;

  beforeEach(() => {
    gatewayMock = {
      retentarDebitoManualPendente: jest.fn(),
    } as any;

    formatadorMock = {
      formatarFeedbackErro: jest.fn(),
    } as any;

    store = new ModalRetentarDebitoStore(gatewayMock, formatadorMock);
    store.inicializar(createMockDebitoManualPendenteFormatado());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================
  // SUCESSO
  // ============================
  it('deve executar retentativa com sucesso', async () => {
    (helpers.atualizarDebitoManualPendenteComCobrancasEPermissoes as jest.Mock)
      .mockReturnValue(createMockDebitoManualPendenteFormatado());

    gatewayMock.retentarDebitoManualPendente.mockResolvedValue({
      ok: true,
      data: [] as any,
    });

    const result = await store.retentarDebito(1, '2026-05');

    expect(result.ok).toBe(true);
    expect(store.cobrancaFoiAtualizada()).toBe(true);
    expect(store.isSending()).toBe(false);

    expect(gatewayMock.retentarDebitoManualPendente).toHaveBeenCalledWith(
      1,
      '2026-05',
      expect.any(AbortController)
    );
  });

  // ============================
  // ERRO
  // ============================
  it('deve retornar erro formatado', async () => {
    const feedback = { variant: 'danger' } as any;

    gatewayMock.retentarDebitoManualPendente.mockResolvedValue({
      ok: false,
      abort: false,
      error: new Error('erro'),
    });

    formatadorMock.formatarFeedbackErro.mockReturnValue(feedback);

    const result = await store.retentarDebito(1, '2026-05');

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
  it('deve retornar cancelamento quando abort', async () => {
    gatewayMock.retentarDebitoManualPendente.mockResolvedValue({
      ok: false,
      abort: true,
      error: null,
    });

    const result = await store.retentarDebito(1, '2026-05');

    expect(result).toEqual({
      ok: false,
      isFeedback: false,
      mensagem: MENSAGENS_MODAL_RETENTAR_DEBITO.requisicaoCancelada,
    });
  });

  // ============================
  // DUPLICIDADE
  // ============================
  it('deve impedir requisição duplicada', async () => {
    const pending = createDeferred<any>();

    gatewayMock.retentarDebitoManualPendente
      .mockImplementationOnce(() => pending.promise)
      .mockResolvedValueOnce({ ok: true, data: [] });

    const primeira = store.retentarDebito(1, '2026-05');
    await Promise.resolve();

    const segunda = await store.retentarDebito(1, '2026-05');

    expect(segunda).toEqual({
      ok: false,
      isFeedback: false,
      mensagem: MENSAGENS_MODAL_RETENTAR_DEBITO.requisicaoEmAndamento,
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

    gatewayMock.retentarDebitoManualPendente.mockImplementationOnce(
      (_, __, ctrl: AbortController) => {
        controller = ctrl;
        return pending.promise;
      }
    );

    const req = store.retentarDebito(1, '2026-05');
    await Promise.resolve();

    store.cancelarRequisicaoAtual();

    expect(controller?.signal.aborted).toBe(true);

    pending.resolve({ ok: false, abort: true, error: null });
    await req;
  });

  // ============================
  // COMPUTED: cobrancas
  // ============================
  it('deve filtrar cobrancas FATAL para retentativa', () => {
    const mock = createMockDebitoManualPendenteFormatado();

    mock.cobrancasFormatadas = [
      { situacao: EnumSituacaoDebitoManual.FATAL },
      { situacao: EnumSituacaoDebitoManual.SUCESSO },
    ] as any;

    store.inicializar(mock);

    const result = store.cobrancasParaRetentativa();

    expect(result).toHaveLength(1);
    expect(result[0].situacao).toBe(EnumSituacaoDebitoManual.FATAL);
  });

  // ============================
  // COMPUTED: valor
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

    const result = store.valorApuradoRetentativa();

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

    const result = store.valorApuradoRetentativa();

    expect(result).toBe('R$ 0');
  });

  describe('cobrancasParaRetentativa', () => {

    it('deve retornar apenas cobrancas com situacao FATAL', () => {
      const mock = createMockDebitoManualPendenteFormatado();

      mock.cobrancasFormatadas = [
        { situacao: EnumSituacaoDebitoManual.FATAL, valor: 100 },
        { situacao: EnumSituacaoDebitoManual.SUCESSO, valor: 200 },
        { situacao: EnumSituacaoDebitoManual.FATAL, valor: 300 },
      ] as any;

      store.inicializar(mock);

      const result = store.cobrancasParaRetentativa();

      expect(result).toHaveLength(2);
      expect(result.every(c => c.situacao === EnumSituacaoDebitoManual.FATAL)).toBe(true);
    });

    it('deve retornar array vazio quando não houver FATAL', () => {
      const mock = createMockDebitoManualPendenteFormatado();

      mock.cobrancasFormatadas = [
        { situacao: EnumSituacaoDebitoManual.SUCESSO },
        { situacao: EnumSituacaoDebitoManual.INADIMPLENTE },
      ] as any;

      store.inicializar(mock);

      const result = store.cobrancasParaRetentativa();

      expect(result).toEqual([]);
    });

    it('deve retornar array vazio quando cobrancasFormatadas estiver vazio', () => {
      const mock = createMockDebitoManualPendenteFormatado();

      mock.cobrancasFormatadas = [];

      store.inicializar(mock);

      const result = store.cobrancasParaRetentativa();

      expect(result).toEqual([]);
    });

    it('deve retornar array vazio quando debitoFormatado for null', () => {
      store.inicializar(null as any);

      const result = store.cobrancasParaRetentativa();

      expect(result).toEqual([]);
    });

    it('deve reagir a mudanças no estado (reatividade)', () => {
      const mock = createMockDebitoManualPendenteFormatado();

      mock.cobrancasFormatadas = [
        { situacao: EnumSituacaoDebitoManual.SUCESSO },
      ] as any;

      store.inicializar(mock);

      expect(store.cobrancasParaRetentativa()).toHaveLength(0);

      // atualiza estado
      mock.cobrancasFormatadas = [
        { situacao: EnumSituacaoDebitoManual.FATAL },
      ] as any;

      store.inicializar(mock);

      expect(store.cobrancasParaRetentativa()).toHaveLength(1);
    });

  });

});
