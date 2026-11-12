import { TabelaLoteStore } from './tabela-lote.store';
import { FormatadorFeedbackService } from '../../../../../../services/formatador-feedback/formatador-feedback.service';
import { MENSAGENS_TABELA_LOTE, PAGINACAO_INICIAL_TABELA_LOTE } from '../../domain/tabela-lote.constants';
import { TabelaLoteQueryResult } from '../../domain/tabela-lote.model';
import { LotesCobrResponse } from '../../../../domain/lote-agendamentos.model';

describe('TabelaLoteStore', () => {
  let store: TabelaLoteStore;
  let tabelaLoteQueryServiceMock: { buscarLotes: jest.Mock };
  let formatadorFeedbackServiceMock: { formatarFeedbackErro: jest.Mock };

  beforeEach(() => {
    tabelaLoteQueryServiceMock = { buscarLotes: jest.fn() };
    formatadorFeedbackServiceMock = { formatarFeedbackErro: jest.fn() };
    store = new TabelaLoteStore(
      tabelaLoteQueryServiceMock as any,
      formatadorFeedbackServiceMock as unknown as FormatadorFeedbackService
    );
  });

  it('deve inicializar com paginação e lotes vazios', () => {
    expect(store.paginacaoAtual()).toEqual(PAGINACAO_INICIAL_TABELA_LOTE);
    expect(store.lotesFormatados()).toEqual([]);
  });

  it('deve sincronizar retorno da API', () => {
    const retorno: LotesCobrResponse = {
      parametros: { paginacao: { paginaAtual: 2, itensPorPagina: 10, totalRegistros: 100 } },
      lotesCobr: [
        { id: 1, convenio: 2, nome: 'Teste', dataEnvioFormatada: '', situacaoFormatada: '', totalSolicitacoes: 1 }
      ]
    } as any;
    store.sincronizarRetornoApi(retorno);
    expect(store.paginacaoAtual()).toEqual({ paginaAtual: 2, itensPorPagina: 10, totalRegistros: 100 });
    expect(store.lotesFormatados().length).toBe(1);
  });

  it('deve atualizar e reverter paginação', () => {
    store.atualizarPaginacao({ pageIndex: 1, pageSize: 20 } as any);
    expect(store.paginacaoAtual().paginaAtual).toBe(1);
    expect(store.paginacaoAtual().itensPorPagina).toBe(20);
    store.reverterPaginacao();
    expect(store.paginacaoAtual()).toEqual(PAGINACAO_INICIAL_TABELA_LOTE);
  });

  it('deve cancelar e iniciar nova consulta', () => {
    const ctrl1 = store.iniciarNovaConsulta();
    expect(ctrl1).toBeInstanceOf(AbortController);
    const ctrl2 = store.iniciarNovaConsulta();
    expect(ctrl1.signal.aborted).toBe(true);
    expect(ctrl2).not.toBe(ctrl1);
    store.cancelarConsultaAtual();
    expect(ctrl2.signal.aborted).toBe(true);
  });

  describe('atualizarDados', () => {
    const parametrosOriginais = [{ nome: 'pagina', valor: '0' }] as any;

    it('deve aplicar resultado e retornar ok=true quando query retorna sucesso', async () => {
      const data: LotesCobrResponse = {
        parametros: { paginacao: { paginaAtual: 0, itensPorPagina: 10, totalPaginas: 1, totalRegistros: 1 } },
        lotesCobr: []
      } as any;
      const queryResult: TabelaLoteQueryResult = { ok: true, data };

      tabelaLoteQueryServiceMock.buscarLotes.mockResolvedValue(queryResult);

      const result = await store.atualizarDados(parametrosOriginais);

      expect(tabelaLoteQueryServiceMock.buscarLotes).toHaveBeenCalled();
      expect(result).toEqual({ ok: true });
    });

    it('deve reverter paginação e retornar abort=true quando query retorna abort', async () => {
      const abortError = { name: 'AbortError' };
      const queryResult: TabelaLoteQueryResult = { ok: false, abort: true, error: abortError };

      store.atualizarPaginacao({ pageIndex: 1, pageSize: 20 } as any);
      tabelaLoteQueryServiceMock.buscarLotes.mockResolvedValue(queryResult);

      const result = await store.atualizarDados(parametrosOriginais);

      expect(store.paginacaoAtual()).toEqual(PAGINACAO_INICIAL_TABELA_LOTE);
      expect(result).toEqual({ ok: false, abort: true });
    });

    it('deve reverter paginação e repassar feedback quando query retorna erro genérico', async () => {
      const feedback = { titulo: 'Titulo', descricao: 'Descricao' } as any;
      const erro = new Error('falha na API');
      const queryResult: TabelaLoteQueryResult = { ok: false, error: erro };

      store.atualizarPaginacao({ pageIndex: 1, pageSize: 20 } as any);
      tabelaLoteQueryServiceMock.buscarLotes.mockResolvedValue(queryResult);
      formatadorFeedbackServiceMock.formatarFeedbackErro.mockReturnValue(feedback);

      const result = await store.atualizarDados(parametrosOriginais);

      expect(store.paginacaoAtual()).toEqual(PAGINACAO_INICIAL_TABELA_LOTE);
      expect(formatadorFeedbackServiceMock.formatarFeedbackErro).toHaveBeenCalledWith(
        erro,
        MENSAGENS_TABELA_LOTE.tituloFeedback,
        MENSAGENS_TABELA_LOTE.erroConsulta,
        null
      );
      expect(result).toEqual({ ok: false, feedback });
    });
  });
});

