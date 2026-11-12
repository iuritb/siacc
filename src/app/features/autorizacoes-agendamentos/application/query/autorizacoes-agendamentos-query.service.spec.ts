import { AutorizacoesAgendamentosQueryService } from './autorizacoes-agendamentos-query.service';
import { EnumOpcoesAutorizacaoAgendamento } from '../../../../shared/models/autorizacao-agendamento/utils.enum';

describe('AutorizacoesAgendamentosQueryService', () => {
  let service: AutorizacoesAgendamentosQueryService;
  let facadeMock: any;
  let agendamentoServiceMock: any;

  beforeEach(() => {
    facadeMock = {
      buscarRecorrencias: jest.fn(),
      buscarCobrancasRecorrentes: jest.fn(),
      buscarLotes: jest.fn()
    };
    agendamentoServiceMock = {
      prepararQueryParams: jest.fn(() => ({ parametrosSemPaginacao: [], parametrosComPaginacao: [] })),
      prepararQueryParamsLote: jest.fn(() => ({ parametrosSemPaginacao: [], parametrosComPaginacao: [] }))
    };
    service = new AutorizacoesAgendamentosQueryService(
      { buscarRecorrencias: facadeMock.buscarRecorrencias } as any,
      { buscarCobrancasRecorrentes: facadeMock.buscarCobrancasRecorrentes } as any,
      { buscarLotes: facadeMock.buscarLotes } as any,
      agendamentoServiceMock
    );
  });

  it('deve retornar erro genérico se destino for nulo', async () => {
    const result = await service.consultar(null, {}, new AbortController());
    expect(result.type).toBe('error');
    if (result.type === 'error') {
      expect(result.domain).toBeNull();
    }
  });

  it('deve chamar buscarRecorrencias para AUTORIZACAO', async () => {
    facadeMock.buscarRecorrencias.mockResolvedValue({ recs: [1] });
    const result = await service.consultar(EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO, {}, new AbortController());
    expect(facadeMock.buscarRecorrencias).toHaveBeenCalled();
    expect(result.type).toBe('success');
  });

  it('deve chamar buscarCobrancasRecorrentes para AGENDAMENTO', async () => {
    facadeMock.buscarCobrancasRecorrentes.mockResolvedValue({ cobsr: [1] });
    const result = await service.consultar(EnumOpcoesAutorizacaoAgendamento.AGENDAMENTO, {}, new AbortController());
    expect(facadeMock.buscarCobrancasRecorrentes).toHaveBeenCalled();
    expect(result.type).toBe('success');
  });

  it('deve chamar buscarLotes para LOTE', async () => {
    facadeMock.buscarLotes.mockResolvedValue({ lotesCobr: [1] });
    const result = await service.consultar(EnumOpcoesAutorizacaoAgendamento.LOTE, {}, new AbortController());
    expect(facadeMock.buscarLotes).toHaveBeenCalled();
    expect(result.type).toBe('success');
  });
});
