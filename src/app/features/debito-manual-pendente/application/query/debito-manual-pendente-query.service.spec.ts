import { DebitoManualPendenteGateway } from './debito-manual-pendente-query.service';
import { DebitoManualPendenteService } from '../../../../services/debito-pendente/debito-manual-pendente.service';
import * as abortHelper from '../../../../shared/errors/handlers/abort-error/abort-error-handler';

describe('DebitoManualPendenteGateway', () => {

  let gateway: DebitoManualPendenteGateway;
  let apiMock: jest.Mocked<DebitoManualPendenteService>;

  beforeEach(() => {
    apiMock = {
      buscarDebitosManuaisPendentes: jest.fn(),
      autorizarDebitoManual: jest.fn(),
      retentarDebitoManual: jest.fn(),
      realizarAcertoManual: jest.fn(),
    } as any;

    gateway = new DebitoManualPendenteGateway(apiMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================
  // BUSCAR
  // ============================
  it('deve buscar débitos com sucesso', async () => {
    const controller = new AbortController();
    const data = [{ id: 1 }] as any;
    const parametros = [{ titulo: 'pendentes', valor: "true" }] as any;

    apiMock.buscarDebitosManuaisPendentes.mockResolvedValue(data);

    const result = await gateway.buscarDebitosManuaisPendentes(controller, parametros);

    expect(apiMock.buscarDebitosManuaisPendentes)
      .toHaveBeenCalledWith(controller, parametros);

    expect(result).toEqual({
      ok: true,
      data,
    });
  });

  it('deve retornar erro ao buscar com falha', async () => {
    const controller = new AbortController();
    const error = new Error('erro');

    jest.spyOn(abortHelper, 'ehAbortError').mockReturnValue(false);
    apiMock.buscarDebitosManuaisPendentes.mockRejectedValue(error);

    const parametros = [{ titulo: 'pendentes', valor: "true" }] as any;
    const result = await gateway.buscarDebitosManuaisPendentes(controller, parametros);

    expect(result).toEqual({
      ok: false,
      error,
      abort: false,
    });
  });

  // ============================
  // AUTORIZAR
  // ============================
  it('deve autorizar débito com sucesso', async () => {
    const controller = new AbortController();
    const data = [] as any;

    apiMock.autorizarDebitoManual.mockResolvedValue(data);

    const result = await gateway.autorizarDebitoManualPendente(1, '2026-05', controller);

    expect(apiMock.autorizarDebitoManual).toHaveBeenCalledWith(
      1,
      '2026-05',
      controller
    );

    expect(result).toEqual({
      ok: true,
      data,
    });
  });

  it('deve retornar erro de abort na autorização', async () => {
    const controller = new AbortController();
    const error = new Error('abort');

    jest.spyOn(abortHelper, 'ehAbortError').mockReturnValue(true);
    apiMock.autorizarDebitoManual.mockRejectedValue(error);

    const result = await gateway.autorizarDebitoManualPendente(1, '2026-05', controller);

    expect(result).toEqual({
      ok: false,
      error,
      abort: true,
    });
  });

  // ============================
  // RETENTAR
  // ============================
  it('deve retentar débito com sucesso', async () => {
    const controller = new AbortController();
    const data = [] as any;

    apiMock.retentarDebitoManual.mockResolvedValue(data);

    const result = await gateway.retentarDebitoManualPendente(1, '2026-05', controller);

    expect(apiMock.retentarDebitoManual).toHaveBeenCalledWith(
      1,
      '2026-05',
      controller
    );

    expect(result).toEqual({
      ok: true,
      data,
    });
  });

  it('deve retornar erro ao retentar sem abort', async () => {
    const controller = new AbortController();
    const error = new Error('erro');

    jest.spyOn(abortHelper, 'ehAbortError').mockReturnValue(false);
    apiMock.retentarDebitoManual.mockRejectedValue(error);

    const result = await gateway.retentarDebitoManualPendente(1, '2026-05', controller);

    expect(result).toEqual({
      ok: false,
      error,
      abort: false,
    });
  });

  // ============================
  // ACERTO MANUAL
  // ============================
  it('deve executar acerto manual com sucesso', async () => {
    const controller = new AbortController();
    const data = [] as any;

    apiMock.realizarAcertoManual.mockResolvedValue(data);

    const result = await gateway.acertoManualDebitoManualPendente(
      1,
      '2026-05',
      'obs',
      controller
    );

    expect(apiMock.realizarAcertoManual).toHaveBeenCalledWith(
      1,
      '2026-05',
      'obs',
      controller
    );

    expect(result).toEqual({
      ok: true,
      data,
    });
  });

  it('deve retornar erro de abort no acerto manual', async () => {
    const controller = new AbortController();
    const error = new Error('abort');

    jest.spyOn(abortHelper, 'ehAbortError').mockReturnValue(true);
    apiMock.realizarAcertoManual.mockRejectedValue(error);

    const result = await gateway.acertoManualDebitoManualPendente(
      1,
      '2026-05',
      'obs',
      controller
    );

    expect(result).toEqual({
      ok: false,
      error,
      abort: true,
    });
  });

});
