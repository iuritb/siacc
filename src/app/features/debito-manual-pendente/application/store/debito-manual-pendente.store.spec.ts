import { DebitoManualPendenteStore } from './debito-manual-pendente.store';
import { DebitoManualPendenteGateway } from '../query/debito-manual-pendente-query.service';
import { FormatadorFeedbackService } from '../../../../services/formatador-feedback/formatador-feedback.service';
import { EnumModoConsultaDebitoManualPendente } from '../../domain/debito-manual.enum';
import { MENSAGENS_TABELA_DEBITO_MANUAL_PENDENTE } from '../../domain/debito-manual-pendente.constants';
import * as helpers from '../../debito-manual-pendente.helpers';
import { createMockDebitoManualPendenteFormatado } from '../../../../../test-helpers/createMockDebitoManualPendente';

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

describe('DebitoManualPendenteStore', () => {
  let store: DebitoManualPendenteStore;
  let gatewayMock: jest.Mocked<DebitoManualPendenteGateway>;
  let formatadorFeedbackServiceMock: jest.Mocked<FormatadorFeedbackService>;

  beforeEach(() => {
    gatewayMock = {
      buscarDebitosManuaisPendentes: jest.fn(),
    } as any;

    formatadorFeedbackServiceMock = {
      formatarMensagemErro: jest.fn(),
    } as any;

    store = new DebitoManualPendenteStore(formatadorFeedbackServiceMock, gatewayMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve criar o store', () => {
    expect(store).toBeTruthy();
  });

  it('deve inicializar com paginação padrão', () => {
    expect(store.paginacaoAtual()).toBeDefined();
    expect(store.termoFiltro()).toBe('');
    expect(store.mensagemErro()).toBeNull();
    expect(store.isLoading()).toBe(false);
  });

  it('deve carregar débitos com sucesso e sincronizar paginação', async () => {
    const debitosFormatados = [
      createMockDebitoManualPendenteFormatado({ convenioId: 1, cnpj: '11.111.111/1111-11' }),
      createMockDebitoManualPendenteFormatado({ convenioId: 2, cnpj: '22.222.222/2222-22' })
    ];

    jest.spyOn(helpers, 'formatarDebitoManualPendente').mockReturnValue(debitosFormatados);
    gatewayMock.buscarDebitosManuaisPendentes.mockResolvedValue({ ok: true, data: [] as any });

    await store.orquestrarModoDeConsulta(EnumModoConsultaDebitoManualPendente.PENDENTES);

    expect(gatewayMock.buscarDebitosManuaisPendentes).toHaveBeenCalledWith(expect.any(AbortController), [{ "titulo": "pendente", "valor": "true" }]);
    expect(store.isLoading()).toBe(false);
    expect(store.mensagemErro()).toBeNull();
    expect(store.totalItensFiltrados()).toBe(2);
    expect(store.debitosFiltrados()).toEqual(debitosFormatados);
  });

  it('deve aplicar estado de erro quando consulta falhar', async () => {
    const erro = new Error('falha');
    const mensagemErroMock = { titulo: 'Erro', descricao: 'Falhou' } as any;

    gatewayMock.buscarDebitosManuaisPendentes.mockResolvedValue({ ok: false, error: erro });
    formatadorFeedbackServiceMock.formatarMensagemErro.mockReturnValue(mensagemErroMock);

    await store.orquestrarModoDeConsulta(EnumModoConsultaDebitoManualPendente.PENDENTES);

    expect(formatadorFeedbackServiceMock.formatarMensagemErro).toHaveBeenCalledWith(
      erro,
      MENSAGENS_TABELA_DEBITO_MANUAL_PENDENTE.erroCarregarDebitos
    );
    expect(store.mensagemErro()).toEqual(mensagemErroMock);
    expect(store.debitosFiltrados()).toEqual([]);
    expect(store.isLoading()).toBe(false);
  });

  it('deve resetar paginação ao alterar filtro', async () => {
    const debitosFormatados = [
      createMockDebitoManualPendenteFormatado({ convenioId: 1, razaoSocial: 'Empresa Alfa' }),
      createMockDebitoManualPendenteFormatado({ convenioId: 2, razaoSocial: 'Empresa Beta' }),
    ];

    jest.spyOn(helpers, 'formatarDebitoManualPendente').mockReturnValue(debitosFormatados);
    gatewayMock.buscarDebitosManuaisPendentes.mockResolvedValue({ ok: true, data: [] as any });

    await store.orquestrarModoDeConsulta(EnumModoConsultaDebitoManualPendente.PENDENTES);
    store.atualizarPaginacao({ pageIndex: 1, pageSize: 5, length: 6 } as any);

    expect(store.paginacaoAtual().paginaAtual).toBe(1);

    store.setTermoFiltro('alfa');

    expect(store.termoFiltro()).toBe('alfa');
    expect(store.paginacaoAtual().paginaAtual).toBe(0);
    expect(store.totalItensFiltrados()).toBe(1);
  });

  it('deve atualizar apenas o débito correspondente', async () => {
    const original = createMockDebitoManualPendenteFormatado({ convenioId: 111, periodo: '2026-05', cnpj: '11.111.111/1111-11', razaoSocial: 'Empresa A' });
    const outro = createMockDebitoManualPendenteFormatado({ convenioId: 222, periodo: '2026-06', cnpj: '22.222.222/2222-22', razaoSocial: 'Empresa B' });
    const atualizado = createMockDebitoManualPendenteFormatado({ convenioId: 111, periodo: '2026-05', cnpj: '11.111.111/1111-11', razaoSocial: 'Empresa A Atualizada' });

    jest.spyOn(helpers, 'formatarDebitoManualPendente').mockReturnValue([original, outro]);
    gatewayMock.buscarDebitosManuaisPendentes.mockResolvedValue({ ok: true, data: [] as any });

    await store.orquestrarModoDeConsulta(EnumModoConsultaDebitoManualPendente.PENDENTES);
    store.atualizarDebitoManualPendente(atualizado);

    const debitos = store.debitosFiltrados();
    expect(debitos.find((debito) => debito.convenioId === 111)?.razaoSocial).toBe('Empresa A Atualizada');
    expect(debitos.find((debito) => debito.convenioId === 222)?.razaoSocial).toBe('Empresa B');
  });

  it('deve abortar requisição anterior ao recarregar', async () => {
    const primeira = createDeferred<any>();
    let primeiroController: AbortController | undefined;

    gatewayMock.buscarDebitosManuaisPendentes
      .mockImplementationOnce((controller: AbortController) => {
        primeiroController = controller;
        return primeira.promise;
      })
      .mockResolvedValueOnce({ ok: true, data: [] as any });

    const primeiraChamada = store.orquestrarModoDeConsulta(EnumModoConsultaDebitoManualPendente.PENDENTES);
    await Promise.resolve();

    const segundaChamada = store.orquestrarModoDeConsulta(EnumModoConsultaDebitoManualPendente.PENDENTES);

    expect(primeiroController).toBeDefined();
    expect(primeiroController?.signal.aborted).toBe(true);

    primeira.resolve({ ok: true, data: [] as any });

    await Promise.all([primeiraChamada, segundaChamada]);
  });

  it('não deve recarregar pendentes quando já houver cache', async () => {
    jest.spyOn(helpers, 'formatarDebitoManualPendente').mockReturnValue([]);
    gatewayMock.buscarDebitosManuaisPendentes.mockResolvedValue({ ok: true, data: [] as any });

    await store.orquestrarModoDeConsulta(EnumModoConsultaDebitoManualPendente.PENDENTES);
    const primeiraCall = gatewayMock.buscarDebitosManuaisPendentes.mock.calls.length;

    await store.orquestrarModoDeConsulta(EnumModoConsultaDebitoManualPendente.PENDENTES);
    const segundaCall = gatewayMock.buscarDebitosManuaisPendentes.mock.calls.length;

    expect(primeiraCall).toBe(segundaCall);
  });
});
