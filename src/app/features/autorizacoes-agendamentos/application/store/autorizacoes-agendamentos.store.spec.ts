import { AutorizacoesAgendamentosStore } from './autorizacoes-agendamentos.store';
import { AutorizacoesAgendamentosQueryService } from '../query/autorizacoes-agendamentos-query.service';
import { AutorizacoesAgendamentosErrorMapperService } from '../../domain/autorizacoes-agendamentos-error-mapper.service';
import { EnumOpcoesDePagina, EnumOpcoesAutorizacaoAgendamento } from '../../../../shared/models/autorizacao-agendamento/utils.enum';
import { EnumTipoRetornoConsulta } from '../../domain/autorizacoes-agendamentos-consulta-result.model';

describe('AutorizacoesAgendamentosStore', () => {
  let store: AutorizacoesAgendamentosStore;
  let serviceMock: any;
  let queryServiceMock: any;
  let errorMapperMock: any;

  beforeEach(() => {
    queryServiceMock = { consultar: jest.fn() };
    errorMapperMock = { mapearErro: jest.fn() };
    store = new AutorizacoesAgendamentosStore(
      queryServiceMock as AutorizacoesAgendamentosQueryService,
      errorMapperMock as AutorizacoesAgendamentosErrorMapperService
    );
  });

  it('deve iniciar com estado padrão', () => {
    expect(store.paginaParaMostrar()).toBe(EnumOpcoesDePagina.FILTRO);
    expect(store.mostrarFiltro()).toBe(true);
    expect(store.mostrarTabela()).toBe(false);
  });

  it('deve configurar destino corretamente', () => {
    const opcao = { destino: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO } as any;
    store.configurarDestino(opcao);
    expect(store.destinoSelecionado()).toBe(EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO);
    expect(store.opcaoSelecionada()).toBe(opcao);
  });

  it('deve manter controller ao configurar mesmo destino', () => {
    const abortMock = jest.fn();
    store.controller = { abort: abortMock } as any;

    store.configurarDestino({ destino: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO } as any);
    store.configurarDestino({ destino: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO } as any);

    expect(abortMock).not.toHaveBeenCalled();
  });

  it('deve abortar controller ao trocar destino', () => {
    const abortMock = jest.fn();
    store.controller = { abort: abortMock } as any;

    store.configurarDestino({ destino: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO } as any);
    store.configurarDestino({ destino: EnumOpcoesAutorizacaoAgendamento.AGENDAMENTO } as any);

    expect(abortMock).toHaveBeenCalledTimes(1);
  });

  it('deve voltar para filtro', () => {
    store.voltarParaDestino(EnumOpcoesDePagina.FILTRO);
    expect(store.paginaParaMostrar()).toBe(EnumOpcoesDePagina.FILTRO);
  });

  it('deve voltar para destino de tabela quando informado', () => {
    store.voltarParaDestino(EnumOpcoesDePagina.AGENDAMENTO);
    expect(store.paginaParaMostrar()).toBe(EnumOpcoesDePagina.AGENDAMENTO);
  });

  it('deve destruir abortando controller', () => {
    const abortMock = jest.fn();
    (store as any).controllerInterno = { abort: abortMock };
    store.destruir();
    expect(abortMock).toHaveBeenCalled();
  });

  it('deve retornar comando de snackbar quando policy mapear abort', async () => {
    const retornoErro = { type: EnumTipoRetornoConsulta.ERROR, domain: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO, error: new Error('AbortError') };
    queryServiceMock.consultar.mockResolvedValue(retornoErro);
    errorMapperMock.mapearErro.mockReturnValue({ kind: 'snackbar-info', message: 'Requisição foi cancelada.' });

    store.configurarDestino({ destino: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO } as any);
    const resultado = await store.consultar({ convenio: '123456' });

    expect(errorMapperMock.mapearErro).toHaveBeenCalledWith(retornoErro, EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO);
    expect(resultado).toEqual({ kind: 'snackbar-info', message: 'Requisição foi cancelada.' });
  });

  it('deve preencher opções ao iniciar sem destino selecionado', () => {
    store.iniciar();

    expect(store.opcoesDeRelatorio().length).toBe(3);
    expect(store.opcaoSelecionada()).toBeUndefined();
  });

  it('deve atualizar opcaoSelecionada ao iniciar quando já houver destino', () => {
    store.configurarDestino({ destino: EnumOpcoesAutorizacaoAgendamento.AGENDAMENTO } as any);

    store.iniciar();

    expect(store.opcoesDeRelatorio().length).toBe(3);
    expect(store.opcaoSelecionada()?.destino).toBe(EnumOpcoesAutorizacaoAgendamento.AGENDAMENTO);
  });

  it('deve consultar AUTORIZACAO com sucesso', async () => {
    const retorno = {
      type: EnumTipoRetornoConsulta.SUCCESS,
      domain: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO,
      data: { parametros: {}, recorrencias: [] },
      parametrosSemPaginacao: [{ titulo: 'Convênio', valor: '123' }]
    } as any;
    queryServiceMock.consultar.mockResolvedValue(retorno);
    store.configurarDestino({ destino: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO } as any);

    const resultado = await store.consultar({ convenio: '123' });

    expect(resultado).toEqual({ kind: 'success' });
    expect(store.retornoAPIRec()).toEqual(retorno.data);
    expect(store.paginaParaMostrar()).toBe(EnumOpcoesDePagina.AUTORIZACAO);
    expect(store.btnIsLoading()).toBe(false);
  });

  it('deve consultar AGENDAMENTO com sucesso e ajustar origem', async () => {
    const retorno = {
      type: EnumTipoRetornoConsulta.SUCCESS,
      domain: EnumOpcoesAutorizacaoAgendamento.AGENDAMENTO,
      data: { parametros: {}, cobsr: [] },
      parametrosSemPaginacao: []
    } as any;
    queryServiceMock.consultar.mockResolvedValue(retorno);
    store.configurarDestino({ destino: EnumOpcoesAutorizacaoAgendamento.AGENDAMENTO } as any);

    const resultado = await store.consultar({ convenio: '123' });

    expect(resultado).toEqual({ kind: 'success' });
    expect(store.retornoAPICobR()).toEqual(retorno.data);
    expect(store.origemDosDadosDoAgendamento()).toBe(EnumOpcoesDePagina.FILTRO);
    expect(store.paginaParaMostrar()).toBe(EnumOpcoesDePagina.AGENDAMENTO);
  });

  it('deve consultar LOTE com sucesso', async () => {
    const retorno = {
      type: EnumTipoRetornoConsulta.SUCCESS,
      domain: EnumOpcoesAutorizacaoAgendamento.LOTE,
      data: { parametros: {}, lotesCobr: [] },
      parametrosSemPaginacao: []
    } as any;
    queryServiceMock.consultar.mockResolvedValue(retorno);
    store.configurarDestino({ destino: EnumOpcoesAutorizacaoAgendamento.LOTE } as any);

    const resultado = await store.consultar({ convenio: '123' });

    expect(resultado).toEqual({ kind: 'success' });
    expect(store.retornoAPILote()).toEqual(retorno.data);
    expect(store.paginaParaMostrar()).toBe(EnumOpcoesDePagina.LOTE);
  });

  it('deve retornar success no domínio default sem quebrar fluxo', async () => {
    const retorno = {
      type: EnumTipoRetornoConsulta.SUCCESS,
      domain: 'DESCONHECIDO',
      data: {},
      parametrosSemPaginacao: []
    } as any;
    queryServiceMock.consultar.mockResolvedValue(retorno);
    store.configurarDestino({ destino: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO } as any);

    const resultado = await store.consultar({});

    expect(resultado).toEqual({ kind: 'success' });
    expect(store.btnIsLoading()).toBe(false);
  });

  it('deve listar agendamentos a partir da tela de autorização', () => {
    const response = { cobsr: [] } as any;

    store.onListarAgendamentos(response);

    expect(store.retornoAPICobR()).toEqual(response);
    expect(store.origemDosDadosDoAgendamento()).toBe(EnumOpcoesDePagina.AUTORIZACAO);
    expect(store.paginaParaMostrar()).toBe(EnumOpcoesDePagina.AGENDAMENTO);
  });
});
