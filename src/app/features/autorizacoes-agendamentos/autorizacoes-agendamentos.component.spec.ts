import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DscSnackbarService } from 'sidsc-components/dsc-snackbar';

import { AutorizacoesAgendamentosComponent } from './autorizacoes-agendamentos.component';
import { RecService } from '../../services/rec/rec.service';
import { CobrService } from '../../services/cobr/cobr.service';
import { LoteCobrService } from '../../services/lote-cobr/lote-cobr.service';
import { FormatadorFeedbackService } from '../../services/formatador-feedback/formatador-feedback.service';
import { AutorizacaoAgendamentoService } from '../../services/autorizacao-agendamento/autorizacao-agendamento.service';
import { RecorrenciasResponse } from '../../shared/models/autorizacao-agendamento/rec.model';
import { CobrancasRecorrentesResponse } from '../../shared/models/autorizacao-agendamento/cobr.model';
import { EnumOpcoesAutorizacaoAgendamento, EnumOpcoesDePagina } from '../../shared/models/autorizacao-agendamento/utils.enum';
import { RelatorioOpcao } from '../../shared/models/utils/filtro-dinamico.model';
import { ErroAPISemDados } from '../../shared/errors/erro-api-sem-dados';
import { LotesCobrResponse } from '../lote-agendamentos/domain/lote-agendamentos.model';
import { MENSAGENS_FILTRO_AUTORIZACAO, MENSAGENS_FILTRO_AGENDAMENTO, MENSAGENS_FILTRO_LOTE } from './domain/autorizacoes-agendamentos.constants';

const flushPromises = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 0));
};

describe('AutorizacoesAgendamentosComponent', () => {
  let component: AutorizacoesAgendamentosComponent;
  let fixture: ComponentFixture<AutorizacoesAgendamentosComponent>;

  let modalServiceMock: { open: jest.Mock };
  let snackbarServiceMock: { add: jest.Mock };
  let recServiceMock: { buscarRecorrencias: jest.Mock };
  let cobrServiceMock: { buscarCobrancasRecorrentes: jest.Mock };
  let loteCobrServiceMock: { buscarLotes: jest.Mock };
  let formatadorFeedbackServiceMock: { formatarFeedbackErro: jest.Mock };
  let autorizacaoAgendamentoServiceMock: {
    prepararQueryParams: jest.Mock;
    prepararQueryParamsLote: jest.Mock;
    formatarNomeDestino: jest.Mock;
    convenioLoteObrigatorio: jest.Mock;
  };

  const criarOpcaoConsultaAutorizacao = (): RelatorioOpcao<EnumOpcoesAutorizacaoAgendamento> => ({
    destino: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO,
    label: 'Autorizações',
    icon: 'search',
    configs: [],
    btnConfig: { label: 'Consultar', size: 'small', icon: 'search', variant: 'secondary' } as any,
  });

  const criarOpcaoConsultaAgendamento = (): RelatorioOpcao<EnumOpcoesAutorizacaoAgendamento> => ({
    destino: EnumOpcoesAutorizacaoAgendamento.AGENDAMENTO,
    label: 'Agendamentos',
    icon: 'search',
    configs: [],
    btnConfig: { label: 'Consultar', size: 'small', icon: 'search', variant: 'secondary' } as any,
  });

  const criarOpcaoConsultaLote = (): RelatorioOpcao<EnumOpcoesAutorizacaoAgendamento> => ({
    destino: EnumOpcoesAutorizacaoAgendamento.LOTE,
    label: 'Lote de Agendamentos',
    icon: 'search',
    configs: [],
    btnConfig: { label: 'Consultar', size: 'small', icon: 'search', variant: 'secondary' } as any,
  });

  const criarRetornoApiRec = (): RecorrenciasResponse => ({
    parametros: {
      dataInicio: '2025-01-01T00:00:00Z',
      dataFim: '2025-01-31T00:00:00Z',
      recebedor: { convenio: '123456' },
      paginacao: {
        paginaAtual: 0,
        itensPorPagina: 10,
        quantidadeTotalDeItens: 1,
        quantidadeDePaginas: 1,
      },
    },
    recs: [
      {
        idRec: 'rec-123',
        status: 'ATIVA',
        calendario: { criacao: '2025-01-01T10:00:00Z', dataDeVencimento: '2025-01-07' },
        valor: { original: '100.00' },
        atualizacao: [],
      } as any,
    ],
  });

  const criarRetornoApiCobr = (): CobrancasRecorrentesResponse => ({
    parametros: {
      dataInicio: '2025-01-01T00:00:00Z',
      dataFim: '2025-01-31T00:00:00Z',
      recebedor: { convenio: '123456' },
      paginacao: {
        paginaAtual: 0,
        itensPorPagina: 10,
        quantidadeTotalDeItens: 1,
        quantidadeDePaginas: 1,
      },
    } as any,
    cobsr: [
      {
        idRec: '1',
        txid: 'tx-001',
        status: 'ATIVA',
        calendario: { criacao: '2025-01-01T10:00:00Z', dataDeVencimento: '2025-01-07' },
        valor: { original: '50.00' },
        atualizacao: [],
      } as any,
    ],
  });

  const criarRetornoApiLote = (): LotesCobrResponse => ({
    parametros: {
      dataInicio: '2025-01-01T00:00:00Z',
      dataFim: '2025-01-31T00:00:00Z',
      convenio: '123456',
      paginacao: {
        paginaAtual: 0,
        itensPorPagina: 10,
        totalPaginas: 1,
        totalRegistros: 1,
      }
    },
    lotesCobr: [
      {
        id: 1,
        convenio: 123456,
        tipo: 'INCLUSAO' as any,
        situacao: 'PROCESSADO' as any,
        calendario: { criacao: '2025-01-01T10:00:00Z' },
        totalSolicitacoes: 5
      }
    ]
  });

  beforeEach(() => {
    modalServiceMock = { open: jest.fn() };
    snackbarServiceMock = { add: jest.fn() };
    recServiceMock = { buscarRecorrencias: jest.fn() };
    cobrServiceMock = { buscarCobrancasRecorrentes: jest.fn() };
    loteCobrServiceMock = { buscarLotes: jest.fn() };
    formatadorFeedbackServiceMock = { formatarFeedbackErro: jest.fn() };
    autorizacaoAgendamentoServiceMock = {
      prepararQueryParams: jest.fn(() => ({
        parametrosSemPaginacao: [{ titulo: 'inicio', valor: '2025-01-01' }],
        parametrosComPaginacao: [{ titulo: 'inicio', valor: '2025-01-01' }],
      })),
      prepararQueryParamsLote: jest.fn(() => ({
        parametrosSemPaginacao: [{ titulo: 'inicio', valor: '2025-01-01' }],
        parametrosComPaginacao: [{ titulo: 'inicio', valor: '2025-01-01' }],
      })),
      formatarNomeDestino: jest.fn((destino: EnumOpcoesAutorizacaoAgendamento) => {
        if (destino === EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO) return 'Autorizações';
        if (destino === EnumOpcoesAutorizacaoAgendamento.LOTE) return 'Lotes';
        return 'Agendamentos';
      }),
      convenioLoteObrigatorio: jest.fn().mockReturnValue(false),
    };

    TestBed.configureTestingModule({
      declarations: [AutorizacoesAgendamentosComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: DscSnackbarService, useValue: snackbarServiceMock },
        { provide: RecService, useValue: recServiceMock },
        { provide: CobrService, useValue: cobrServiceMock },
        { provide: LoteCobrService, useValue: loteCobrServiceMock },
        { provide: FormatadorFeedbackService, useValue: formatadorFeedbackServiceMock },
        { provide: AutorizacaoAgendamentoService, useValue: autorizacaoAgendamentoServiceMock },
      ],
    });

    fixture = TestBed.createComponent(AutorizacoesAgendamentosComponent);
    component = fixture.componentInstance;
    component.voltarParaDestino(EnumOpcoesDePagina.FILTRO);
  });

  afterEach(() => {
    fixture.destroy();
    jest.clearAllMocks();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar signals com valores padrão', () => {
    expect(component.mostrarTabela()).toBe(false);
    expect(component.mostrarFiltro()).toBe(true);
    expect(component.paginaParaMostrar()).toBe(EnumOpcoesDePagina.FILTRO);
    expect(component.origemDosDadosDoAgendamento()).toBe(EnumOpcoesDePagina.FILTRO);
    expect(component.destinoSelecionado()).toBeNull();
    expect(component.retornoAPIRec()).toBeNull();
    expect(component.retornoAPICobR()).toBeNull();
    expect(component.retornoAPILote()).toBeNull();
  });

  it('deve expor enumOpcoesDePagina', () => {
    expect(component.enumOpcoesDePagina).toBe(EnumOpcoesDePagina);
  });

  it('deve configurar destino de autorização ao selecionar opção', () => {
    const opcao = criarOpcaoConsultaAutorizacao();

    component.configuraDestino(opcao);

    expect(component.destinoSelecionado()).toBe(EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO);
    expect(component.opcaoSelecionada()).toEqual(opcao);
    expect(component.btnIsLoading()).toBe(false);
  });

  it('deve configurar destino de agendamento ao selecionar opção', () => {
    const opcao = criarOpcaoConsultaAgendamento();

    component.configuraDestino(opcao);

    expect(component.destinoSelecionado()).toBe(EnumOpcoesAutorizacaoAgendamento.AGENDAMENTO);
    expect(component.opcaoSelecionada()).toEqual(opcao);
  });

  it('deve configurar destino de lote ao selecionar opção', () => {
    const opcao = criarOpcaoConsultaLote();

    component.configuraDestino(opcao);

    expect(component.destinoSelecionado()).toBe(EnumOpcoesAutorizacaoAgendamento.LOTE);
    expect(component.opcaoSelecionada()).toEqual(opcao);
  });

  it('deve abortar requisição anterior ao trocar de destino', () => {
    const controller = new AbortController();
    const abortSpy = jest.spyOn(controller, 'abort');
    component.controller = controller;
    component.configuraDestino(criarOpcaoConsultaAutorizacao());

    const opcao = criarOpcaoConsultaAgendamento();
    component.configuraDestino(opcao);

    expect(abortSpy).toHaveBeenCalled();
  });

  it('não deve abortar requisição ao selecionar o mesmo destino', () => {
    const controller = new AbortController();
    const abortSpy = jest.spyOn(controller, 'abort');
    component.controller = controller;
    component.configuraDestino(criarOpcaoConsultaAutorizacao());

    const opcao = criarOpcaoConsultaAutorizacao();
    component.configuraDestino(opcao);

    expect(abortSpy).not.toHaveBeenCalled();
  });

  it('não deve abortar requisição se nenhuma foi iniciada', () => {
    component.controller = null;
    component.configuraDestino(criarOpcaoConsultaAutorizacao());

    expect(() => component.configuraDestino(criarOpcaoConsultaAutorizacao())).not.toThrow();
  });

  it('deve buscar recorrências quando autorização é selecionada e query é enviada', async () => {
    const retornoApi = criarRetornoApiRec();
    recServiceMock.buscarRecorrencias.mockResolvedValue(retornoApi);

    component.configuraDestino(criarOpcaoConsultaAutorizacao());

    await component.onQueryParams({ convenio: '123456' });
    await flushPromises();

    expect(autorizacaoAgendamentoServiceMock.prepararQueryParams).toHaveBeenCalledWith({ convenio: '123456' });
    expect(recServiceMock.buscarRecorrencias).toHaveBeenCalled();
    expect(component.retornoAPIRec()).toEqual(retornoApi);
    expect(component.mostrarTabela()).toBe(true);
    expect(component.mostrarFiltro()).toBe(false);
  });

  it('deve buscar cobrações recorrentes quando agendamento é selecionado e query é enviada', async () => {
    const retornoApi = criarRetornoApiCobr();
    cobrServiceMock.buscarCobrancasRecorrentes.mockResolvedValue(retornoApi);

    component.configuraDestino(criarOpcaoConsultaAgendamento());

    await component.onQueryParams({ convenio: '123456' });
    await flushPromises();

    expect(cobrServiceMock.buscarCobrancasRecorrentes).toHaveBeenCalled();
    expect(component.retornoAPICobR()).toEqual(retornoApi);
    expect(component.mostrarTabela()).toBe(true);
    expect(component.mostrarFiltro()).toBe(false);
  });

  it('deve buscar lotes quando destino LOTE é selecionado e query é enviada', async () => {
    const retornoApi = criarRetornoApiLote();
    loteCobrServiceMock.buscarLotes.mockResolvedValue(retornoApi);

    component.configuraDestino(criarOpcaoConsultaLote());

    await component.onQueryParams({ convenio: '123456' });
    await flushPromises();

    expect(autorizacaoAgendamentoServiceMock.prepararQueryParamsLote).toHaveBeenCalledWith({ convenio: '123456' });
    expect(loteCobrServiceMock.buscarLotes).toHaveBeenCalled();
    expect(component.retornoAPILote()).toEqual(retornoApi);
    expect(component.paginaParaMostrar()).toBe(EnumOpcoesDePagina.LOTE);
  });

  it('deve abrir modal de erro quando busca de autorização falha', async () => {
    const erro = new Error('Erro na API');
    const feedback = { titulo: 'Erro', mensagem: 'Falha na busca' };
    const modalRefMock = { componentInstance: {} };

    recServiceMock.buscarRecorrencias.mockRejectedValue(erro);
    formatadorFeedbackServiceMock.formatarFeedbackErro.mockReturnValue(feedback);
    modalServiceMock.open.mockReturnValue(modalRefMock);

    component.configuraDestino(criarOpcaoConsultaAutorizacao());

    await component.onQueryParams({ convenio: '123456' });
    await flushPromises();

    expect(formatadorFeedbackServiceMock.formatarFeedbackErro).toHaveBeenCalledWith(
      erro,
      'Consulta de Autorizações',
      expect.any(String),
      null
    );
    expect(modalServiceMock.open).toHaveBeenCalled();
    expect(snackbarServiceMock.add).not.toHaveBeenCalled();
  });

  it('deve exibir snackbar e nao abrir modal quando erro for AbortError', async () => {
    const abortError = new Error('Requisição abortada');
    abortError.name = 'AbortError';

    recServiceMock.buscarRecorrencias.mockRejectedValue(abortError);
    component.configuraDestino(criarOpcaoConsultaAutorizacao());

    await component.onQueryParams({ convenio: '123456' });
    await flushPromises();

    expect(modalServiceMock.open).not.toHaveBeenCalled();
    expect(snackbarServiceMock.add).toHaveBeenCalledWith({
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      data: {
        variant: 'info',
        message: 'Requisição foi cancelada.',
        showIcon: true
      }
    });
  });

  it('deve abrir modal de erro quando busca de agendamento retorna vazio', async () => {
    const feedback = { titulo: 'Erro', mensagem: 'Sem dados' };
    const modalRefMock = { componentInstance: {} };

    cobrServiceMock.buscarCobrancasRecorrentes.mockResolvedValue({ ...criarRetornoApiCobr(), cobsr: [] });
    formatadorFeedbackServiceMock.formatarFeedbackErro.mockReturnValue(feedback);
    modalServiceMock.open.mockReturnValue(modalRefMock);

    component.configuraDestino(criarOpcaoConsultaAgendamento());

    await component.onQueryParams({ convenio: '123456' });
    await flushPromises();

    expect(formatadorFeedbackServiceMock.formatarFeedbackErro).toHaveBeenCalled();
    expect(modalServiceMock.open).toHaveBeenCalled();
  });

  it('deve formatar erro ErroAPISemDados quando busca de autorização retorna recs vazia', async () => {
    const feedback = { titulo: 'Erro', mensagem: 'Sem dados' };
    const modalRefMock = { componentInstance: {} };

    recServiceMock.buscarRecorrencias.mockResolvedValue({ ...criarRetornoApiRec(), recs: [] });
    formatadorFeedbackServiceMock.formatarFeedbackErro.mockReturnValue(feedback);
    modalServiceMock.open.mockReturnValue(modalRefMock);

    component.configuraDestino(criarOpcaoConsultaAutorizacao());

    await component.onQueryParams({ convenio: '123456' });
    await flushPromises();

    expect(formatadorFeedbackServiceMock.formatarFeedbackErro).toHaveBeenCalledWith(
      expect.any(ErroAPISemDados),
      MENSAGENS_FILTRO_AUTORIZACAO.tituloModal,
      MENSAGENS_FILTRO_AUTORIZACAO.subTituloModal,
      null
    );
    expect(modalServiceMock.open).toHaveBeenCalled();
  });

  it('deve formatar erro ErroAPISemDados quando busca de agendamento retorna cobsr vazia', async () => {
    const feedback = { titulo: 'Erro', mensagem: 'Sem dados' };
    const modalRefMock = { componentInstance: {} };

    cobrServiceMock.buscarCobrancasRecorrentes.mockResolvedValue({ ...criarRetornoApiCobr(), cobsr: [] });
    formatadorFeedbackServiceMock.formatarFeedbackErro.mockReturnValue(feedback);
    modalServiceMock.open.mockReturnValue(modalRefMock);

    component.configuraDestino(criarOpcaoConsultaAgendamento());

    await component.onQueryParams({ convenio: '123456' });
    await flushPromises();

    expect(formatadorFeedbackServiceMock.formatarFeedbackErro).toHaveBeenCalledWith(
      expect.any(ErroAPISemDados),
      MENSAGENS_FILTRO_AGENDAMENTO.tituloModal,
      MENSAGENS_FILTRO_AGENDAMENTO.subTituloModal,
      null
    );
    expect(modalServiceMock.open).toHaveBeenCalled();
  });

  it('deve formatar erro ErroAPISemDados quando busca de lotes retorna vazio', async () => {
    const feedback = { titulo: 'Erro', mensagem: 'Sem dados' };
    const modalRefMock = { componentInstance: {} };

    loteCobrServiceMock.buscarLotes.mockResolvedValue({ ...criarRetornoApiLote(), lotesCobr: [] });
    formatadorFeedbackServiceMock.formatarFeedbackErro.mockReturnValue(feedback);
    modalServiceMock.open.mockReturnValue(modalRefMock);

    component.configuraDestino(criarOpcaoConsultaLote());

    await component.onQueryParams({ convenio: '123456' });
    await flushPromises();

    expect(formatadorFeedbackServiceMock.formatarFeedbackErro).toHaveBeenCalledWith(
      expect.any(ErroAPISemDados),
      MENSAGENS_FILTRO_LOTE.tituloModal,
      MENSAGENS_FILTRO_LOTE.subTituloModal,
      null
    );
    expect(modalServiceMock.open).toHaveBeenCalled();
  });

  it('deve listar agendamentos com origem correta', () => {
    const retornoApi = criarRetornoApiCobr();

    component.onListarAgendamentos(retornoApi);

    expect(component.retornoAPICobR()).toEqual(retornoApi);
    expect(component.origemDosDadosDoAgendamento()).toBe(EnumOpcoesDePagina.AUTORIZACAO);
    expect(component.mostrarTabela()).toBe(true);
    expect(component.mostrarFiltro()).toBe(false);
    expect(component.paginaParaMostrar()).toBe(EnumOpcoesDePagina.AGENDAMENTO);
  });

  it('deve voltar ao filtro quando destino for FILTRO', () => {
    component.voltarParaDestino(EnumOpcoesDePagina.FILTRO);

    expect(component.mostrarTabela()).toBe(false);
    expect(component.mostrarFiltro()).toBe(true);
    expect(component.paginaParaMostrar()).toBe(EnumOpcoesDePagina.FILTRO);
  });

  it('deve mostrar listagem de autorização ao voltar com destino AUTORIZACAO', () => {
    component.voltarParaDestino(EnumOpcoesDePagina.AUTORIZACAO);

    expect(component.mostrarTabela()).toBe(true);
    expect(component.mostrarFiltro()).toBe(false);
    expect(component.paginaParaMostrar()).toBe(EnumOpcoesDePagina.AUTORIZACAO);
  });

  it('deve mostrar listagem de agendamento ao voltar com destino AGENDAMENTO', () => {
    component.voltarParaDestino(EnumOpcoesDePagina.AGENDAMENTO);

    expect(component.mostrarTabela()).toBe(true);
    expect(component.mostrarFiltro()).toBe(false);
    expect(component.paginaParaMostrar()).toBe(EnumOpcoesDePagina.AGENDAMENTO);
  });

  it('deve mostrar listagem de lote ao voltar com destino LOTE', () => {
    component.voltarParaDestino(EnumOpcoesDePagina.LOTE);

    expect(component.mostrarTabela()).toBe(true);
    expect(component.mostrarFiltro()).toBe(false);
    expect(component.paginaParaMostrar()).toBe(EnumOpcoesDePagina.LOTE);
  });

  it('deve settar origem como FILTRO ao buscar agendamentos diretamente', async () => {
    const retornoApi = criarRetornoApiCobr();
    cobrServiceMock.buscarCobrancasRecorrentes.mockResolvedValue(retornoApi);

    component.configuraDestino(criarOpcaoConsultaAgendamento());

    await component.onQueryParams({ convenio: '123456' });
    await flushPromises();

    expect(component.origemDosDadosDoAgendamento()).toBe(EnumOpcoesDePagina.FILTRO);
  });

  it('deve abortar requisição no destroy', () => {
    component.controller = new AbortController();
    const abortSpy = jest.spyOn(component.controller, 'abort');

    component.ngOnDestroy();

    expect(abortSpy).toHaveBeenCalledTimes(1);
  });

  it('deve ignorar destroy se controller é null', () => {
    component.controller = null;

    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('deve manter btnIsLoading como false após erro na consulta', async () => {
    recServiceMock.buscarRecorrencias.mockRejectedValue(new Error('Erro'));
    formatadorFeedbackServiceMock.formatarFeedbackErro.mockReturnValue({});
    modalServiceMock.open.mockReturnValue({ componentInstance: {} });

    component.configuraDestino(criarOpcaoConsultaAutorizacao());

    await component.onQueryParams({ convenio: '123456' });
    await flushPromises();

    expect(component.btnIsLoading()).toBe(false);
  });

  it('deve lançar erro quando destino selecionado é inválido na busca', async () => {
    formatadorFeedbackServiceMock.formatarFeedbackErro.mockReturnValue({});
    modalServiceMock.open.mockReturnValue({ componentInstance: {} });

    await component.onQueryParams({ convenio: '123456' });
    await flushPromises();

    expect(formatadorFeedbackServiceMock.formatarFeedbackErro).toHaveBeenCalled();
  });

  it('deve manter patchValue com dados da query', async () => {
    const query = { convenio: '123456', cpf: '12345678900' };
    recServiceMock.buscarRecorrencias.mockResolvedValue(criarRetornoApiRec());

    component.configuraDestino(criarOpcaoConsultaAutorizacao());

    await component.onQueryParams(query);

    expect(component.patchValue()).toEqual(query);
  });

  it('deve resetar destino selecionado', () => {
    const opcao = criarOpcaoConsultaAutorizacao();
    component.configuraDestino(opcao);

    expect(component.destinoSelecionado()).toBe(EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO);
  });
});
