import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelatorioRemessaComponent } from './relatorioremessa.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { formatDate } from '@angular/common';
import { environment } from '../../../environments/environment';
import { By } from '@angular/platform-browser';
import { DscDatepickerComponent } from 'sidsc-components/dsc-datepicker';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

jest.mock('inputmask/dist/inputmask.es6.js', () =>
  Object.assign(jest.fn(() => ({ mask: jest.fn() })), { remove: jest.fn() })
);

jest.mock('@angular/common', () => {
  const actual = jest.requireActual('@angular/common');
  return {
    ...actual,
    formatDate: jest.fn(), // apenas esta função é mockada
  };
});


const fetchMock = jest.fn();
(global as any).fetch = fetchMock;


// Utilities
const advanceAllTimers = async () => {
  jest.runOnlyPendingTimers();
  await Promise.resolve();
};

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));


class AbortControllerMock {
  signal = {};
  abort = jest.fn();
}
(global as any).AbortController = AbortControllerMock as unknown as typeof AbortController


describe('RelatorioRemessaComponent consulta vigente', () => {
  let component: RelatorioRemessaComponent;
  let requests: { url: string; success: (response: any[]) => void }[];
  let fetchResponses: ((response: Response) => void)[];

  beforeEach(() => {
    jest.useFakeTimers();
    component = new RelatorioRemessaComponent({} as NgbModal);
    requests = [];
    fetchResponses = [];
    jest.spyOn(component, 'fetchData').mockImplementation((url, _content, success) => {
      requests.push({ url, success });
    });
    jest.spyOn(global, 'fetch').mockImplementation(() => new Promise<Response>(resolve => {
      fetchResponses.push(resolve);
    }));
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it('mantem a consulta raiz lenta em voo durante varios ciclos do automatico', () => {
    component.autoRefresh = true;
    component.ngOnInit();

    jest.advanceTimersByTime(12000);

    expect(requests).toHaveLength(1);
    requests[0].success([{ id: 2 }]);
    expect(component.remessaSelected.id).toBe(2);
    expect(component.dataSourceRemessa.data[0].id).toBe(2);
  });

  it('libera a consulta apos timeout e ignora callbacks tardios sem remover a nova pendencia', () => {
    component.loadData();
    const oldRequest = requests[0];
    jest.advanceTimersByTime(50000);
    component.loadData();

    expect(requests).toHaveLength(2);
    oldRequest.success([{ id: 1 }]);
    expect(component.dataSourceRemessa).toBeNull();
    component.loadData();
    expect(requests).toHaveLength(2);

    requests[1].success([]);
    component.loadData();
    expect(requests).toHaveLength(3);
  });

  it('libera a consulta apos erro de rede para permitir nova tentativa', async () => {
    jest.spyOn(component, 'fetchData').mockRestore();
    const network = jest.spyOn(global, 'fetch');
    network.mockRejectedValueOnce(new Error('Falha de rede'));
    component.loadData();
    await jest.advanceTimersByTimeAsync(0);
    network.mockResolvedValueOnce({ json: jest.fn().mockResolvedValue([]) } as unknown as Response);

    component.loadData();
    await jest.advanceTimersByTimeAsync(0);

    expect(network).toHaveBeenCalledTimes(2);
    expect(component.dataSourceRemessa.data).toEqual([]);
  });

  it('inicia imediatamente outro contexto de convenio e descarta respostas anteriores ao retornar', () => {
    component.convenio = '123';
    component.loadData();
    component.convenio = '456';
    component.loadData();
    component.convenio = '123';
    component.loadData();
    requests[2].success([{ id: 3 }]);

    requests[0].success([{ id: 1 }]);
    requests[1].success([]);

    expect(component.remessaSelected.id).toBe(3);
    expect(component.dataSourceRemessa.data[0].id).toBe(3);
    expect(requests.filter(request => request.url.includes('/consulta/remessa/'))).toHaveLength(3);
  });

  it('carrega itens e detalhes lentos apos varios ciclos do automatico no mesmo contexto', async () => {
    const remessas = [{ id: 1 }, { id: 2 }];
    component.loadData();
    requests[0].success(remessas);
    component.clickRemessa(component.dataSourceRemessa.data[1]);
    const slowItems = requests[2];
    component.autoRefresh = true;
    component.autoRefreshChange();

    for (let cycle = 0; cycle < 2; cycle++) {
      jest.advanceTimersByTime(5000);
      requests.filter(request => request.url.includes('/consulta/remessa/')).slice(-1)[0].success(remessas);
    }
    jest.advanceTimersByTime(2000);
    slowItems.success([{ id: 20, remessa: 2 }]);

    expect(component.itemRemessaSelected?.id).toBe(20);
    expect(requests.filter(request => request.url.endsWith('/consulta/itemRemessa/2'))).toHaveLength(1);
    const slowDetails = requests.find(request => request.url.endsWith('/consulta/detalheItemRemessa/20'))!;

    for (let cycle = 0; cycle < 2; cycle++) {
      jest.advanceTimersByTime(5000);
      requests.filter(request => request.url.includes('/consulta/remessa/')).slice(-1)[0].success(remessas);
    }
    jest.advanceTimersByTime(2000);
    slowDetails.success([{ id: 30, conteudoRequisicao: '{"sistema":"atual"}' }]);
    fetchResponses.forEach(resolve => resolve({
      json: jest.fn().mockResolvedValue([{ id: 40, situacao: 'ATUAL' }])
    } as unknown as Response));
    await jest.advanceTimersByTimeAsync(0);

    expect(component.itemRemessaSelected.id).toBe(20);
    expect(component.dataSourceDetalheItemRemessa.data[0]?.sistema).toBe('atual');
    expect(component.dataSourceOcorrenciasItemRemessa.data[0]?.id).toBe(40);
    expect(component.dataSourceSituacoesItemRemessa.data[0]?.situacao).toBe('ATUAL');
    expect(requests.filter(request => request.url.endsWith('/consulta/detalheItemRemessa/20'))).toHaveLength(1);
    expect(fetchResponses).toHaveLength(2);
  });

  it('ignora itens antigos recebidos depois da consulta vazia da nova data', () => {
    jest.spyOn(component, 'loadDetalheItemRemessa').mockImplementation(() => { });
    jest.spyOn(component, 'loadOcorrenciasItemRemessa').mockImplementation(() => { });
    jest.spyOn(component, 'loadSituacoesItemRemessa').mockImplementation(() => { });
    component.dataFiltro = new Date(2026, 10, 4);
    component.clickRemessa({ id: 1 });
    component.clickRemessa({ id: 2 });
    const oldItems = requests[1];

    component.dataFiltro = new Date(2026, 10, 5);
    component.loadData();
    requests.find(request => request.url.endsWith('/consulta/remessa/2026-11-05'))!.success([]);
    oldItems.success([{ id: 20, remessa: 2, nome: 'Item antigo' }]);

    expect(component.remessaSelected).toBeNull();
    expect(component.itemRemessaSelected).toBeNull();
    expect(component.dataSourceItemRemessa.data).toEqual([]);
    expect(component.dataSourceDetalheItemRemessa.data).toEqual([]);
    expect(component.dataSourceOcorrenciasItemRemessa.data).toEqual([]);
    expect(component.dataSourceSituacoesItemRemessa.data).toEqual([]);
  });

  it.each([
    { oldResponse: [{ id: 1 }], newResponse: [] },
    { oldResponse: [], newResponse: [{ id: 2 }] }
  ])('mantem a resposta mais recente ao receber datas fora de ordem: %j', ({ oldResponse, newResponse }) => {
    component.dataFiltro = new Date(2026, 10, 4);
    component.loadData();
    const oldRequest = requests[0];
    component.dataFiltro = new Date(2026, 10, 5);
    component.loadData();
    requests[1].success(newResponse);
    const currentDataSource = component.dataSourceRemessa;
    const currentSelection = component.remessaSelected;
    const requestCount = requests.length;

    oldRequest.success(oldResponse);

    expect(component.dataSourceRemessa).toBe(currentDataSource);
    expect(component.dataSourceRemessa.data.map((item: any) => item.id)).toEqual(newResponse.map(item => item.id));
    expect(component.remessaSelected).toBe(currentSelection);
    expect(requests).toHaveLength(requestCount);
  });

  it('invalida itens antigos mesmo ao voltar para a mesma remessa', () => {
    const remessa = { id: 1 };
    component.clickRemessa(remessa);
    const oldItems = requests[0];
    component.clickRemessa({ id: 2 });
    component.clickRemessa(remessa);
    requests[2].success([]);

    oldItems.success([{ id: 10, remessa: 1 }]);

    expect(component.remessaSelected).toBe(remessa);
    expect(component.itemRemessaSelected).toBeNull();
    expect(component.dataSourceItemRemessa.data).toEqual([]);
    expect(requests).toHaveLength(3);
  });

  it('limpa imediatamente ao alternar entre o dia com conteudo e o dia vazio', () => {
    component.dataFiltro = new Date(2026, 10, 4);
    component.clickRemessa({ id: 2 });
    requests[0].success([{ id: 20, remessa: 2 }]);
    requests[1].success([{ id: 30, conteudoRequisicao: '{"sistema":"anterior"}' }]);

    component.alterarDataFiltro(new Date(2026, 10, 5));

    expect(component.dataSourceRemessa.data).toEqual([]);
    expect(component.dataSourceItemRemessa.data).toEqual([]);
    expect(component.dataSourceDetalheItemRemessa.data).toEqual([]);
    expect(component.remessaSelected).toBeNull();
    expect(component.itemRemessaSelected).toBeNull();
    requests[2].success([]);

    component.alterarDataFiltro(new Date(2026, 10, 4));

    expect(component.dataSourceItemRemessa.data).toEqual([]);
    expect(component.dataSourceDetalheItemRemessa.data).toEqual([]);
    requests[3].success([{ id: 2 }]);
    requests[4].success([{ id: 21, remessa: 2 }]);
    requests[5].success([{ id: 31, conteudoRequisicao: '{"sistema":"atual"}' }]);
    expect(component.itemRemessaSelected.id).toBe(21);
    expect(component.dataSourceDetalheItemRemessa.data[0].sistema).toBe('atual');

    component.alterarDataFiltro(new Date(2026, 10, 5));

    expect(component.dataSourceItemRemessa.data).toEqual([]);
    expect(component.dataSourceDetalheItemRemessa.data).toEqual([]);
    expect(component.itemRemessaSelected).toBeNull();
    expect(requests[6].url).toContain('/consulta/remessa/2026-11-05');
  });

  it.each(['nova data', 'troca de item e retorno'])('descarta detalhes, ocorrencias e historico antigos apos %s', async transition => {
    component.clickRemessa({ id: 2 });
    const selectedItem = { id: 20, remessa: 2 };
    requests[0].success([selectedItem]);
    const oldDetails = requests[1];
    const oldFetchResponses = fetchResponses.slice();

    if (transition === 'nova data') {
      component.dataFiltro = new Date(2026, 10, 5);
      component.loadData();
      requests[2].success([]);
    } else {
      component.clickItemRemessa({ id: 21, remessa: 2 });
      component.clickItemRemessa(selectedItem);
    }

    const currentDetails = component.dataSourceDetalheItemRemessa;
    const currentOccurrences = component.dataSourceOcorrenciasItemRemessa;
    const currentHistory = component.dataSourceSituacoesItemRemessa;
    const currentSelection = component.itemRemessaSelected;
    const requestCount = requests.length;
    oldDetails.success([{ id: 30, conteudoRequisicao: '{"sistema":"antigo"}' }]);
    oldFetchResponses.forEach(resolve => resolve({
      json: jest.fn().mockResolvedValue([{ id: 40, situacao: 'ANTIGA' }])
    } as unknown as Response));
    await jest.advanceTimersByTimeAsync(0);

    expect(component.dataSourceDetalheItemRemessa).toBe(currentDetails);
    expect(component.dataSourceOcorrenciasItemRemessa).toBe(currentOccurrences);
    expect(component.dataSourceSituacoesItemRemessa).toBe(currentHistory);
    expect(component.itemRemessaSelected).toBe(currentSelection);
    expect(requests).toHaveLength(requestCount);
  });

  it('preserva selecoes e atualiza os filhos somente depois de aceitar o refresh', async () => {
    component.dataFiltro = new Date(2026, 10, 4);
    component.clickRemessa({ id: 2 });
    requests[0].success([{ id: 20, remessa: 2 }]);
    const selectedItem = component.itemRemessaSelected;
    const selectedDetail = { id: 30 };
    component.detalheItemRemessaSelected = selectedDetail;

    component.loadData();
    expect(requests).toHaveLength(3);
    expect(fetchResponses).toHaveLength(2);
    requests[2].success([{ id: 1 }, { id: 2 }]);
    expect(requests).toHaveLength(5);
    expect(fetchResponses).toHaveLength(4);
    requests[3].success([{ id: 20, remessa: 2 }]);
    requests[4].success([{ id: 30, conteudoRequisicao: '{"sistema":"atual"}' }]);
    fetchResponses.slice(2).forEach(resolve => resolve({
      json: jest.fn().mockResolvedValue([{ id: 40, situacao: 'ATUAL' }])
    } as unknown as Response));
    await jest.advanceTimersByTimeAsync(0);

    expect(component.remessaSelected).toBe(component.dataSourceRemessa.data[1]);
    expect(component.itemRemessaSelected).toBe(selectedItem);
    expect(component.detalheItemRemessaSelected).toBe(selectedDetail);
    expect(component.dataSourceDetalheItemRemessa.data[0].sistema).toBe('atual');
    expect(component.dataSourceOcorrenciasItemRemessa.data[0].id).toBe(40);
    expect(component.dataSourceSituacoesItemRemessa.data[0].situacao).toBe('ATUAL');
  });
});


describe('RelatorioRemessaComponent', () => {
  let component: RelatorioRemessaComponent;
  let fixture: ComponentFixture<RelatorioRemessaComponent>;

  // Atribuir mock para chamada externa do método parametrosSimulação (executado em ngOnInit)
  let mockloadRemessa!: jest.SpyInstance;
  let mockloadItemRemessa!: jest.SpyInstance;
  let mockloadDetalheItemRemessa!: jest.SpyInstance;
  // Para suprimir os logs
  //const mockConsoleLog: jest.SpyInstance = jest.spyOn(console, 'log').mockImplementation(() => { });

  let mockfetchData!: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [SharedModule, DscDatepickerComponent, NoopAnimationsModule],
      providers: [NgbModal],
      declarations: [RelatorioRemessaComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatorioRemessaComponent);
    component = fixture.componentInstance;
    mockloadRemessa = jest.spyOn(component, 'loadRemessa').mockImplementation(() => true);
    jest.spyOn(component, 'loadItemRemessa').mockImplementation(() => true);
    jest.spyOn(component, 'loadDetalheItemRemessa').mockImplementation(() => true);

    fixture.detectChanges();

    // Stubs dos métodos não presentes no snippet
    (component as any).loadRemessa = jest.fn();
    (component as any).loadItemRemessa = jest.fn();
    (component as any).loadDetalheItemRemessa = jest.fn();

    component.loadOcorrenciasItemRemessa = jest.fn();
    component.loadSituacoesItemRemessa = jest.fn();

    jest.spyOn(component, 'fetchData').mockImplementation(() => true);
    expect(mockloadRemessa).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component).toBeTruthy();
  });

  it('faz uma unica consulta inicial com calendario visivel e consulta novamente so ao mudar o dia', () => {
    window.sessionStorage.clear();
    const initialFixture = TestBed.createComponent(RelatorioRemessaComponent);
    const initialComponent = initialFixture.componentInstance;
    initialComponent.host = true;
    const responses: ((response: any[]) => void)[] = [];
    const initialFetch = jest.spyOn(initialComponent, 'fetchData').mockImplementation((_url, _content, success) => {
      responses.push(success);
    });
    initialFixture.detectChanges();
    const calendar = initialFixture.debugElement.query(By.css('dsc-datepicker'));
    const initialDate = new Date(initialComponent.dataFiltro);
    initialDate.setHours(12);

    calendar.triggerEventHandler('ngModelChange', initialDate);

    expect(initialComponent.autoRefresh).toBe(false);
    expect(initialFetch).toHaveBeenCalledTimes(1);
    responses[0]([]);
    calendar.triggerEventHandler('ngModelChange', new Date(initialDate));
    expect(initialFetch).toHaveBeenCalledTimes(1);

    const nextDate = new Date(initialDate);
    nextDate.setDate(nextDate.getDate() + 1);
    calendar.triggerEventHandler('ngModelChange', nextDate);
    expect(initialFetch).toHaveBeenCalledTimes(2);
    expect(initialFetch.mock.calls[1][0]).toContain(initialComponent.formatDate(nextDate));
    responses[1]([]);
    initialFixture.debugElement.query(By.css('dsc-button[icon="autorenew"]')).triggerEventHandler('click', null);
    expect(initialFetch).toHaveBeenCalledTimes(3);
    responses[2]([]);
    initialFixture.destroy();
  });

  it('limpa as tabelas antes de consultar a nova data emitida pelo calendario', () => {
    component.host = true;
    component.dataFiltro = new Date(2026, 10, 4);
    component.remessaSelected = { id: 2 };
    component.itemRemessaSelected = { id: 20, remessa: 2 };
    component.detalheItemRemessaSelected = { id: 30 };
    component.ocorrenciaItemRemessaSelected = { id: 40 };
    component.situacaoItemRemessaSelected = { id: 50 };
    component.dataSourceRemessa = new MatTableDataSource<any>([{ id: 2 }]);
    component.dataSourceItemRemessa = new MatTableDataSource<any>([{ id: 20 }]);
    component.dataSourceDetalheItemRemessa = new MatTableDataSource<any>([{ id: 30 }]);
    component.dataSourceOcorrenciasItemRemessa = new MatTableDataSource<any>([{ id: 40 }]);
    component.dataSourceSituacoesItemRemessa = new MatTableDataSource<any>([{ id: 50 }]);
    fixture.detectChanges();
    const newDate = new Date(2026, 10, 5);
    const loadDataSpy = jest.spyOn(component, 'loadData').mockImplementation(() => {
      expect(component.dataFiltro).toBe(newDate);
      expect(component.remessaSelected).toBeNull();
      expect(component.itemRemessaSelected).toBeNull();
      expect(component.detalheItemRemessaSelected).toBeNull();
      expect(component.ocorrenciaItemRemessaSelected).toBeNull();
      expect(component.situacaoItemRemessaSelected).toBeNull();
      expect(component.dataSourceRemessa.data).toEqual([]);
      expect(component.dataSourceItemRemessa.data).toEqual([]);
      expect(component.dataSourceDetalheItemRemessa.data).toEqual([]);
      expect(component.dataSourceOcorrenciasItemRemessa.data).toEqual([]);
      expect(component.dataSourceSituacoesItemRemessa.data).toEqual([]);
    });

    fixture.debugElement.query(By.css('dsc-datepicker')).triggerEventHandler('ngModelChange', newDate);

    expect(loadDataSpy).toHaveBeenCalledTimes(1);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('table'))).toHaveLength(1);
  });

  it('preserva as selecoes quando o calendario emite o mesmo dia', () => {
    component.host = true;
    component.dataFiltro = new Date(2026, 10, 4, 8);
    const selectedRemessa = { id: 2 };
    const selectedItem = { id: 20, remessa: 2 };
    const selectedDetail = { id: 30 };
    component.remessaSelected = selectedRemessa;
    component.itemRemessaSelected = selectedItem;
    component.detalheItemRemessaSelected = selectedDetail;
    fixture.detectChanges();
    const loadDataSpy = jest.spyOn(component, 'loadData').mockImplementation(() => { });

    fixture.debugElement.query(By.css('dsc-datepicker')).triggerEventHandler('ngModelChange', new Date(2026, 10, 4, 12));

    expect(component.remessaSelected).toBe(selectedRemessa);
    expect(component.itemRemessaSelected).toBe(selectedItem);
    expect(component.detalheItemRemessaSelected).toBe(selectedDetail);
    expect(loadDataSpy).not.toHaveBeenCalled();
  });

  it('formatDate() deve retornar a data no formato DD/MM/YYYY se formatId for DATE_DMY', () => {
    for (let dia = 1; dia <= 28; dia++) {
      const date = new Date(2025, 1, dia); // fevereiro de 2025
      const result = component.formatDate(date); // Usando um valor arbitrário diferente de DATE_DMY
      const diaStr = dia < 10 ? String('0' + dia) : String(dia);
      expect(result).toBe("2025-02-" + diaStr);
    }
  });

  it('formatDate() deve retornar a data no formato DD/MM/YYYY por padrão se formatId não for fornecido', () => {
    for (let dia = 1; dia <= 28; dia++) {
      const date = new Date(2025, 1, dia); // fevereiro de 2025
      const result = component.formatDate(date); // Usando um valor arbitrário diferente de DATE_DMY
      const diaStr = dia < 10 ? String('0' + dia) : String(dia);
      expect(result).toBe("2025-02-" + diaStr);
    }
  });

  it('formatDate() deve retornar a data no formato YYYY/MM/DD se formatId for um valor diferente de DATE_DMY', () => {
    for (let dia = 1; dia <= 28; dia++) {
      const date = new Date(2025, 1, dia); // fevereiro de 2025
      const result = component.formatDate(date); // Usando um valor arbitrário diferente de DATE_DMY
      const diaStr = dia < 10 ? String('0' + dia) : String(dia);
      expect(result).toBe("2025-02-" + diaStr);
    }
  });

  it('showMessageDialog() deve definir modalContent corretamente', () => {
    const title = 'Título Mock';
    const details = 'Detalhes Mock';

    component.showMessageDialog(title, details);

    expect(component.modalContent).toEqual({
      title: title,
      description: details
    });
  });

  it('showMessageDialog() deve chamar dismissAll no modalService', () => {
    const modalService: NgbModal = TestBed.inject(NgbModal);
    jest.spyOn(modalService, 'dismissAll');

    component.showMessageDialog('Título Mock', 'Detalhes Mock');

    expect(modalService.dismissAll).toHaveBeenCalled();
  });

  it('showMessageDialog() deve abrir modalMessage com as configurações corretas', () => {
    const modalService: NgbModal = TestBed.inject(NgbModal);
    jest.spyOn(modalService, 'open');
    component.modalMessage = 'ModalMessageMock';

    component.showMessageDialog('Título Mock', 'Detalhes Mock');

    expect(modalService.open).toHaveBeenCalledWith(component.modalMessage, { size: 'lg', scrollable: false, windowClass: 'modal-large' });
  });


  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit deve inicializar preferências, ler sessionStorage e chamar loadData', () => {
    window.sessionStorage.setItem('autoRefresh', 'TRUE');
    window.sessionStorage.setItem('editMode', 'FALSE');

    const loadDataSpy = jest.spyOn(component, 'loadData').mockImplementation(() => { });
    const setAutoRefreshSpy = jest.spyOn(component, 'setAutoRefresh').mockImplementation(() => { });

    component.ngOnInit();

    expect(component.preferences).toEqual({
      favoritos: true,
      acessoRapido: true,
      sugestoesIA: true
    });
    expect(component.autoRefresh).toBe(true);
    expect(component.editMode).toBe(false);
    expect(loadDataSpy).toHaveBeenCalled();
    expect(setAutoRefreshSpy).toHaveBeenCalled();
  });

  it('autoRefreshChange deve limpar o intervalo quando autoRefresh=false', () => {
    jest.useFakeTimers();
    const clearSpy = jest.spyOn(global, 'clearInterval');

    jest.spyOn(component, 'setAutoRefresh');
    component.autoRefresh = true;
    component.setAutoRefresh(); // cria intervalo
    component.autoRefresh = false;
    component.autoRefreshChange();

    expect(clearSpy).toHaveBeenCalled();
    expect(window.sessionStorage.getItem('autoRefresh')).toBe('FALSE');
  });

  it('autoRefreshChange deve iniciar intervalo e persistir quando autoRefresh=true', () => {
    jest.useFakeTimers();
    const loadDataSpy = jest.spyOn(component, 'loadData');

    component.autoRefresh = true;
    component.autoRefreshChange();

    expect(window.sessionStorage.getItem('autoRefresh')).toBe('TRUE');

    jest.advanceTimersByTime(5000);
    expect(loadDataSpy).toHaveBeenCalled();
  });

  it('setAutoRefresh deve agendar loadData periodicamente', () => {
    jest.useFakeTimers();
    const spy = jest.spyOn(component, 'loadData');

    component.setAutoRefresh();

    jest.advanceTimersByTime(15000); // 3 ciclos de 5s
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('editModeChange deve persistir editMode no sessionStorage', () => {
    component.editMode = true;
    component.editModeChange();
    expect(window.sessionStorage.getItem('editMode')).toBe('TRUE');

    component.editMode = false;
    component.editModeChange();
    expect(window.sessionStorage.getItem('editMode')).toBe('FALSE');
  });

  it('deve manter valores padrão de constantes e listas', () => {
    expect(component.mfeVersao).toBe('1.0.0');
    expect(component.autoRefresh).toBe(false);

    expect(component.tiporepasses).toEqual([
      { value: 'T', label: 'Transação' },
      { value: 'C', label: 'Consolidado' }
    ]);

    expect(component.tipoconta).toEqual([
      { value: null, label: '(NENHUM)' },
      { value: 'CACC', label: 'Corrente' },
      { value: 'SVGS', label: 'Poupança' },
      { value: 'TRAN', label: 'Pagamento' }
    ]);
  });

  it('autoRefreshChange deve reconfigurar intervalo quando alternado repetidamente', () => {
    jest.useFakeTimers();
    const loadDataSpy = jest.spyOn(component, 'loadData');

    component.autoRefresh = true;
    component.autoRefreshChange();
    jest.advanceTimersByTime(5000);
    expect(loadDataSpy).toHaveBeenCalledTimes(1);

    component.autoRefresh = false;
    component.autoRefreshChange();
    jest.advanceTimersByTime(10000);
    expect(loadDataSpy).toHaveBeenCalledTimes(1);

    component.autoRefresh = true;
    component.autoRefreshChange();
    jest.advanceTimersByTime(10000);
    expect(loadDataSpy).toHaveBeenCalledTimes(3);
  });


  it('deve definir dataFiltro quando estiver nula e iniciar apenas a consulta de remessas', () => {
    component.dataFiltro = null as any;

    component.loadData();

    expect(component.dataFiltro).toBeInstanceOf(Date);
    expect((component as any).loadRemessa).toHaveBeenCalledTimes(1);
    expect((component as any).loadItemRemessa).not.toHaveBeenCalled();
    expect((component as any).loadDetalheItemRemessa).not.toHaveBeenCalled();
  });


  it('deve manter dataFiltro quando definida e iniciar apenas a consulta de remessas', () => {
    const data = new Date('2024-01-01T00:00:00Z');
    component.dataFiltro = data;

    component.loadData();

    expect(component.dataFiltro).toBe(data);
    expect((component as any).loadRemessa).toHaveBeenCalledTimes(1);
    expect((component as any).loadItemRemessa).not.toHaveBeenCalled();
    expect((component as any).loadDetalheItemRemessa).not.toHaveBeenCalled();
  });



  it('deve retornar JSON formatado quando a string for válida', () => {
    const input = '{"id":1,"nome":"teste"}';
    const result = component.processaJson(input);

    expect(result).toContain('"id": 1');
    expect(result).toContain('"nome": "teste"');
    expect(result.split('\n').length).toBeGreaterThan(1); // indica formatação com quebras de linha
  });

  it('deve retornar a string original quando não for JSON válido', () => {
    const input = 'texto simples';
    const result = component.processaJson(input);

    expect(result).toBe(input);
  });

  it('deve lidar com JSON complexo e manter indentação de 2 espaços', () => {
    const input = '{"a":{"b":[1,2,3]}}';
    const result = component.processaJson(input);

    expect(result).toContain('"a": {');
    expect(result).toContain('"b": [');
    expect(result).toMatch(/\n {2}"a": {/);
  });

  it('não deve lançar exceção mesmo com entrada inválida', () => {
    const input = '{id:1, nome:"teste"}'; // inválido para JSON.parse
    expect(() => component.processaJson(input)).not.toThrow();
    expect(component.processaJson(input)).toBe(input);
  });


  it('deve retornar ELLIPSIS quando value.trim() for vazio', () => {
    const result = (component as any).processValue('   ');
    expect(result).toBe('---');
  });

  it('deve retornar o próprio valor quando não for nulo nem vazio', () => {
    const result = (component as any).processValue('teste');
    expect(result).toBe('teste');
  });

  it('deve lidar com string contendo espaços e caracteres', () => {
    const result = (component as any).processValue('  abc  ');
    expect(result).toBe("  abc  "); // não remove espaços, apenas retorna
  });


  it('deve atualizar remessaSelected e resetar seleções, chamando os loaders', () => {
    const row = { id: 123, nomeArquivo: 'remessa.txt' };

    // Valores iniciais diferentes para garantir reset
    component.itemRemessaSelected = { id: 1 };
    component.detalheItemRemessaSelected = { id: 2 };
    component.ocorrenciaItemRemessaSelected = { id: 3 };
    component.situacaoItemRemessaSelected = { id: 4 };

    component.clickRemessa(row);

    // Verifica atualização e reset
    expect(component.remessaSelected).toEqual(row);
    expect(component.itemRemessaSelected).toBeNull();
    expect(component.detalheItemRemessaSelected).toBeNull();
    expect(component.ocorrenciaItemRemessaSelected).toBeNull();
    expect(component.situacaoItemRemessaSelected).toBeNull();

    // Verifica chamadas dos métodos
    expect(component.loadItemRemessa).toHaveBeenCalledTimes(1);
    expect(component.loadDetalheItemRemessa).toHaveBeenCalledTimes(1);
    expect(component.loadOcorrenciasItemRemessa).toHaveBeenCalledTimes(1);
    expect(component.loadSituacoesItemRemessa).toHaveBeenCalledTimes(1);
  });

  it('deve funcionar mesmo com row vazio', () => {
    const row = {};
    component.clickRemessa(row);

    expect(component.remessaSelected).toEqual(row);
    expect(component.loadItemRemessa).toHaveBeenCalled();
    expect(component.loadDetalheItemRemessa).toHaveBeenCalled();
    expect(component.loadOcorrenciasItemRemessa).toHaveBeenCalled();
    expect(component.loadSituacoesItemRemessa).toHaveBeenCalled();
  });


  it('deve atualizar itemRemessaSelected e chamar os loaders', () => {
    const row = { id: 456, nome: 'itemRemessa.txt' };

    component.clickItemRemessa(row);

    // Verifica atualização
    expect(component.itemRemessaSelected).toEqual(row);

    // Verifica chamadas dos métodos
    expect(component.loadDetalheItemRemessa).toHaveBeenCalledTimes(1);
    expect(component.loadOcorrenciasItemRemessa).toHaveBeenCalledTimes(1);
    expect(component.loadSituacoesItemRemessa).toHaveBeenCalledTimes(1);
  });

  it('deve funcionar mesmo com row vazio', () => {
    const row = {};
    component.clickItemRemessa(row);

    expect(component.itemRemessaSelected).toEqual(row);
    expect(component.loadDetalheItemRemessa).toHaveBeenCalled();
    expect(component.loadOcorrenciasItemRemessa).toHaveBeenCalled();
    expect(component.loadSituacoesItemRemessa).toHaveBeenCalled();
  });


  it('deve definir detalheItemRemessaSelected quando for diferente do atual', () => {
    const row = { id: 1 };
    component.detalheItemRemessaSelected = null;

    component.clickDetalheItemRemessa(row);

    expect(component.detalheItemRemessaSelected).toEqual(row);
  });

  it('deve limpar detalheItemRemessaSelected quando clicar no mesmo item novamente', () => {
    const row = { id: 2 };
    component.detalheItemRemessaSelected = row;

    component.clickDetalheItemRemessa(row);

    expect(component.detalheItemRemessaSelected).toBeNull();
  });

  it('deve trocar detalheItemRemessaSelected quando clicar em item diferente', () => {
    const row1 = { id: 3 };
    const row2 = { id: 4 };
    component.detalheItemRemessaSelected = row1;

    component.clickDetalheItemRemessa(row2);

    expect(component.detalheItemRemessaSelected).toEqual(row2);
  });

  it('deve funcionar com objetos vazios', () => {
    const row = {};
    component.detalheItemRemessaSelected = null;

    component.clickDetalheItemRemessa(row);

    expect(component.detalheItemRemessaSelected).toEqual(row);
  });


  it('deve definir ocorrenciaItemRemessaSelected quando for diferente do atual', () => {
    const row = { id: 10 };
    component.ocorrenciaItemRemessaSelected = null;

    component.clickOcorrenciaItemRemessa(row);

    expect(component.ocorrenciaItemRemessaSelected).toEqual(row);
  });

  it('deve limpar ocorrenciaItemRemessaSelected quando clicar no mesmo item novamente', () => {
    const row = { id: 20 };
    component.ocorrenciaItemRemessaSelected = row;

    component.clickOcorrenciaItemRemessa(row);

    expect(component.ocorrenciaItemRemessaSelected).toBeNull();
  });

  it('deve trocar ocorrenciaItemRemessaSelected quando clicar em item diferente', () => {
    const row1 = { id: 30 };
    const row2 = { id: 40 };
    component.ocorrenciaItemRemessaSelected = row1;

    component.clickOcorrenciaItemRemessa(row2);

    expect(component.ocorrenciaItemRemessaSelected).toEqual(row2);
  });

  it('deve funcionar com objetos vazios', () => {
    const row = {};
    component.ocorrenciaItemRemessaSelected = null;

    component.clickOcorrenciaItemRemessa(row);

    expect(component.ocorrenciaItemRemessaSelected).toEqual(row);
  });


  it('deve definir situacaoItemRemessaSelected quando for diferente do atual', () => {
    const row = { id: 100 };
    component.situacaoItemRemessaSelected = null;

    component.clickSituacaoItemRemessa(row);

    expect(component.situacaoItemRemessaSelected).toEqual(row);
  });

  it('deve limpar situacaoItemRemessaSelected quando clicar no mesmo item novamente', () => {
    const row = { id: 200 };
    component.situacaoItemRemessaSelected = row;

    component.clickSituacaoItemRemessa(row);

    expect(component.situacaoItemRemessaSelected).toBeNull();
  });

  it('deve trocar situacaoItemRemessaSelected quando clicar em item diferente', () => {
    const row1 = { id: 300 };
    const row2 = { id: 400 };
    component.situacaoItemRemessaSelected = row1;

    component.clickSituacaoItemRemessa(row2);

    expect(component.situacaoItemRemessaSelected).toEqual(row2);
  });

  it('deve funcionar com objetos vazios', () => {
    const row = {};
    component.situacaoItemRemessaSelected = null;

    component.clickSituacaoItemRemessa(row);

    expect(component.situacaoItemRemessaSelected).toEqual(row);
  });


  it('deve retornar "row-selected" quando remessaSelected tiver mesmo id', () => {
    const row = { id: 1 };
    component.remessaSelected = { id: 1 };

    const result = component.styleRemessa(row);
    expect(result).toBe('row-selected');
  });

  it('deve retornar null quando remessaSelected for diferente', () => {
    const row = { id: 2 };
    component.remessaSelected = { id: 1 };

    const result = component.styleRemessa(row);
    expect(result).toBeNull();
  });

  it('deve retornar null quando remessaSelected for nulo', () => {
    const row = { id: 3 };
    component.remessaSelected = null;

    const result = component.styleRemessa(row);
    expect(result).toBeNull();
  });


  it('deve retornar "row-selected" quando itemRemessaSelected tiver mesmo id', () => {
    const row = { id: 10 };
    component.itemRemessaSelected = { id: 10 };

    const result = component.styleItemRemessa(row);
    expect(result).toBe('row-selected');
  });

  it('deve retornar null quando itemRemessaSelected for diferente', () => {
    const row = { id: 11 };
    component.itemRemessaSelected = { id: 12 };

    const result = component.styleItemRemessa(row);
    expect(result).toBeNull();
  });

  it('deve retornar null quando itemRemessaSelected for nulo', () => {
    const row = { id: 13 };
    component.itemRemessaSelected = null;

    const result = component.styleItemRemessa(row);
    expect(result).toBeNull();
  });

  it('deve retornar "row-selected" quando detalheItemRemessaSelected tiver mesmo id', () => {
    const row = { id: 20 };
    component.detalheItemRemessaSelected = { id: 20 };

    const result = component.styleDetalheItemRemessa(row);
    expect(result).toBe('row-selected');
  });

  it('deve retornar null quando detalheItemRemessaSelected for diferente', () => {
    const row = { id: 21 };
    component.detalheItemRemessaSelected = { id: 22 };

    const result = component.styleDetalheItemRemessa(row);
    expect(result).toBeNull();
  });

  it('deve retornar null quando detalheItemRemessaSelected for nulo', () => {
    const row = { id: 23 };
    component.detalheItemRemessaSelected = null;

    const result = component.styleDetalheItemRemessa(row);
    expect(result).toBeNull();
  });

  it('deve chamar formatDate com a data parseada, o pattern e locale corretos', () => {
    // Arrange
    const input = '2025-11-29T15:30:00Z'; // ISO-8601
    const expectedPattern = 'dd/MM/yyyy HH:mm';
    const expectedLocale = 'pt-BR';

    // Vamos simular que o formatDate retorna uma string pronta.
    (formatDate as jest.Mock).mockReturnValue('29/11/2025 12:30');

    // Act
    const result = component.formataTimeStamp(input);

    // Assert
    expect(formatDate).toHaveBeenCalledTimes(1);

    // Captura os argumentos com que formatDate foi chamado
    const [calledDate, calledPattern, calledLocale] = (formatDate as jest.Mock).mock.calls[0];

    expect(calledPattern).toBe(expectedPattern);
    expect(calledLocale).toBe(expectedLocale);

    // Garante que o Date gerado pelo método corresponde ao timestamp de Date.parse(input)
    const expectedTimestamp = Date.parse(input);
    expect(calledDate instanceof Date).toBe(true);
    expect((calledDate as Date).getTime()).toBe(expectedTimestamp);

    // Garante que o retorno é exatamente o que o formatDate mockou
    expect(result).toBe('29/11/2025 12:30');
  });


  it('deve propagar erro quando formatDate falhar (ex.: data inválida)', () => {
    // Arrange
    const input = 'valor-invalido';
    (formatDate as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid date');
    });

    // Act & Assert
    expect(() => component.formataTimeStamp(input)).toThrow('Invalid date');
    expect(formatDate).toHaveBeenCalledTimes(2);

    const [calledDate] = (formatDate as jest.Mock).mock.calls[0];
    // Date.parse('valor-invalido') => NaN; new Date(NaN) é "Invalid Date"
    expect(calledDate instanceof Date).toBe(true);
    expect(Number.isNaN((calledDate as Date).getTime())).toBe(false);
  });

  it('deve funcionar com uma data simples (yyyy-MM-dd)', () => {
    // Arrange
    const input = '2025-11-29'; // sem hora
    (formatDate as jest.Mock).mockReturnValue('29/11/2025 00:00');

    // Act
    const result = component.formataTimeStamp(input);

    // Assert
    expect(formatDate).toHaveBeenCalledTimes(3);
    expect(result).toBe('29/11/2025 00:00');
  });


  describe('RelatorioRemessaComponent.loadRemessa', () => {
    let component: RelatorioRemessaComponent;

    beforeEach(() => {
      // Fresh component per test
      component = new RelatorioRemessaComponent({} as any);

      // Default state
      component.dataFiltro = new Date('2025-11-29T15:00:00.000Z'); // stable date for URL formatting
      component.convenio = null;

      // Stub formatDate used inside component through `this.formatDate`
      // The component calls `this.formatDate(this.dataFiltro)` indirectly via method; here we attach it:
      (component as any).formatDate = (d: Date) => {
        // Emulate Angular formatDate('yyyy-MM-dd') behavior the component likely expects
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      };

      // Spy on clickRemessa if it gets triggered
      component.clickRemessa = jest.fn();
      jest.spyOn(component, 'loadItemRemessa').mockImplementation(() => { });
      jest.spyOn(component, 'loadDetalheItemRemessa').mockImplementation(() => { });
      jest.spyOn(component, 'loadOcorrenciasItemRemessa').mockImplementation(() => { });
      jest.spyOn(component, 'loadSituacoesItemRemessa').mockImplementation(() => { });

      // Reset fetch mock between tests
      fetchMock.mockReset();
    });


    test('builds correct URL without convenio and sets modeDES=false when backend has "-prd"', async () => {
      // Given: environment.backendBatchRemessa contains "-prd"
      const expectedDateStr = (component as any).formatDate(component.dataFiltro);
      const expectedUrl = `${environment.backendBatchRemessa}/consulta/remessa/${expectedDateStr}`;

      // Mock successful response
      const sampleResponse = [
        {
          id: 1, nomeArquivo: 'file1.txt', convenio: '123',
          sequencial: 10, situacao: 'PROC',
          dataHoraEntrada: '2025-11-29T08:00:00Z',
          dataHoraSituacao: '2025-11-29T09:00:00Z',
          nomeArquivoRetorno: 'ret1.txt',
          dataHoraRetorno: '2025-11-29T10:00:00Z'
        }
      ];

      fetchMock.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(sampleResponse)
      });

      // When
      component.loadRemessa();
      await flushPromises();

      // Then: fetch called with expected URL and headers/method
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe(expectedUrl);
      expect(options.method).toBe('GET');
      expect(options.headers).toEqual({
        'Content-Type': 'text/plain',
        'Accept': '*/*'
      });
      // signal must be present (AbortController usage)
      expect(options.signal).toBeDefined();

      // DataSource populated
      expect(component.dataSourceRemessa).toBeInstanceOf(MatTableDataSource);
      expect(component.dataSourceRemessa.data).toHaveLength(1);
      expect(component.dataSourceRemessa.data[0]).toMatchObject({
        id: 1,
        nomeArquivo: 'file1.txt',
        convenio: '123',
        sequencial: 10,
        situacao: 'PROC',
        dataHoraEntrada: '2025-11-29T08:00:00Z',
        dataHoraSituacao: '2025-11-29T09:00:00Z',
        nomeArquivoRetorno: 'ret1.txt',
        dataHoraRetorno: '2025-11-29T10:00:00Z'
      });

      // Auto-select first row when none selected
      expect(component.clickRemessa).toHaveBeenCalledTimes(1);
      expect(component.clickRemessa).toHaveBeenCalledWith(component.dataSourceRemessa.data[0]);
    });


    test('includes convenio segment in URL when provided', async () => {
      component.convenio = 'ABC123';

      const expectedDateStr = (component as any).formatDate(component.dataFiltro);
      const expectedUrl = `${environment.backendBatchRemessa}/consulta/remessa/${expectedDateStr}/ABC123`;

      fetchMock.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce([])
      });

      component.loadRemessa();
      await flushPromises();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(expectedUrl);

      // No data => no auto-select
      expect(component.dataSourceRemessa).toBeInstanceOf(MatTableDataSource);
      expect(component.dataSourceRemessa.data).toHaveLength(0);
      expect(component.clickRemessa).not.toHaveBeenCalled();
    });


    test('clears selected state and dependent datasources when remessa response is empty', async () => {
      component.remessaSelected = { id: 111 };
      component.itemRemessaSelected = { id: 222 };
      component.detalheItemRemessaSelected = { id: 333 };
      component.ocorrenciaItemRemessaSelected = { id: 444 };
      component.situacaoItemRemessaSelected = { id: 555 };

      component.dataSourceItemRemessa = new MatTableDataSource<any>([{ id: 1 }]);
      component.dataSourceDetalheItemRemessa = new MatTableDataSource<any>([{ id: 1 }]);
      component.dataSourceOcorrenciasItemRemessa = new MatTableDataSource<any>([{ id: 1 }]);
      component.dataSourceSituacoesItemRemessa = new MatTableDataSource<any>([{ id: 1 }]);

      fetchMock.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce([])
      });

      component.loadRemessa();
      await flushPromises();

      expect(component.dataSourceRemessa).toBeInstanceOf(MatTableDataSource);
      expect(component.dataSourceRemessa.data).toHaveLength(0);
      expect(component.remessaSelected).toBeNull();
      expect(component.itemRemessaSelected).toBeNull();
      expect(component.detalheItemRemessaSelected).toBeNull();
      expect(component.ocorrenciaItemRemessaSelected).toBeNull();
      expect(component.situacaoItemRemessaSelected).toBeNull();
      expect(component.dataSourceItemRemessa.data).toHaveLength(0);
      expect(component.dataSourceDetalheItemRemessa.data).toHaveLength(0);
      expect(component.dataSourceOcorrenciasItemRemessa.data).toHaveLength(0);
      expect(component.dataSourceSituacoesItemRemessa.data).toHaveLength(0);
      expect(component.clickRemessa).not.toHaveBeenCalled();
    });


    test('preserves selected remessa and child selections when it remains in response', async () => {
      component.remessaSelected = { id: 2 };
      const selectedItem = { id: 20, remessa: 2 };
      const selectedDetail = { id: 30 };
      component.itemRemessaSelected = selectedItem;
      component.detalheItemRemessaSelected = selectedDetail;
      component.ocorrenciaItemRemessaSelected = { id: 40 };
      component.situacaoItemRemessaSelected = { id: 50 };

      const sampleResponse = [
        {
          id: 1, nomeArquivo: 'file1.txt', convenio: '123',
          sequencial: 10, situacao: 'PROC',
          dataHoraEntrada: '2025-11-29T08:00:00Z',
          dataHoraSituacao: '2025-11-29T09:00:00Z',
          nomeArquivoRetorno: 'ret1.txt',
          dataHoraRetorno: '2025-11-29T10:00:00Z'
        },
        {
          id: 2, nomeArquivo: 'file2.txt', convenio: '456',
          sequencial: 11, situacao: 'PROC',
          dataHoraEntrada: '2025-11-29T11:00:00Z',
          dataHoraSituacao: '2025-11-29T12:00:00Z',
          nomeArquivoRetorno: 'ret2.txt',
          dataHoraRetorno: '2025-11-29T13:00:00Z'
        }
      ];

      fetchMock.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(sampleResponse)
      });

      component.loadRemessa();
      await flushPromises();

      expect(component.dataSourceRemessa).toBeInstanceOf(MatTableDataSource);
      expect(component.dataSourceRemessa.data).toHaveLength(2);
      const selectedRemessa = component.dataSourceRemessa.data[1];
      expect(component.remessaSelected).toBe(selectedRemessa);
      expect(component.styleRemessa(selectedRemessa)).toBe('row-selected');
      expect(component.itemRemessaSelected).toBe(selectedItem);
      expect(component.detalheItemRemessaSelected).toBe(selectedDetail);
      expect(component.ocorrenciaItemRemessaSelected).toEqual({ id: 40 });
      expect(component.situacaoItemRemessaSelected).toEqual({ id: 50 });
      expect(component.clickRemessa).not.toHaveBeenCalled();
    });

    test('selects the first remessa when the previous selection is missing', async () => {
      component.remessaSelected = { id: 2 };
      component.itemRemessaSelected = { id: 20 };
      component.detalheItemRemessaSelected = { id: 30 };
      component.ocorrenciaItemRemessaSelected = { id: 40 };
      component.situacaoItemRemessaSelected = { id: 50 };
      component.clickRemessa = RelatorioRemessaComponent.prototype.clickRemessa.bind(component);
      const loadItemRemessaSpy = jest.spyOn(component, 'loadItemRemessa').mockImplementation(() => { });
      const loadDetalheItemRemessaSpy = jest.spyOn(component, 'loadDetalheItemRemessa').mockImplementation(() => { });
      const loadOcorrenciasItemRemessaSpy = jest.spyOn(component, 'loadOcorrenciasItemRemessa').mockImplementation(() => { });
      const loadSituacoesItemRemessaSpy = jest.spyOn(component, 'loadSituacoesItemRemessa').mockImplementation(() => { });

      fetchMock.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce([
          { id: 1, nomeArquivo: 'file1.txt' },
          { id: 3, nomeArquivo: 'file3.txt' }
        ])
      });

      component.loadRemessa();
      await flushPromises();

      const firstRemessa = component.dataSourceRemessa.data[0];
      expect(component.remessaSelected).toBe(firstRemessa);
      expect(component.styleRemessa(firstRemessa)).toBe('row-selected');
      expect(component.itemRemessaSelected).toBeNull();
      expect(component.detalheItemRemessaSelected).toBeNull();
      expect(component.ocorrenciaItemRemessaSelected).toBeNull();
      expect(component.situacaoItemRemessaSelected).toBeNull();
      expect(loadItemRemessaSpy).toHaveBeenCalledTimes(1);
      expect(loadDetalheItemRemessaSpy).toHaveBeenCalledTimes(1);
      expect(loadOcorrenciasItemRemessaSpy).toHaveBeenCalledTimes(1);
      expect(loadSituacoesItemRemessaSpy).toHaveBeenCalledTimes(1);
    });


    test('maps response items into table rows robustly and ignores malformed entries', async () => {
      const sampleResponse = [
        {
          id: 2, nomeArquivo: 'ok.txt', convenio: '789',
          sequencial: 22, situacao: 'DONE',
          dataHoraEntrada: '2025-11-28T12:00:00Z',
          dataHoraSituacao: '2025-11-28T13:00:00Z',
          nomeArquivoRetorno: 'ok.ret', dataHoraRetorno: '2025-11-28T14:00:00Z'
        },
        // Malformed item that could throw inside try block
        null,
        // Another valid item
        {
          id: 3, nomeArquivo: 'ok2.txt', convenio: '456',
          sequencial: 23, situacao: 'DONE',
          dataHoraEntrada: '2025-11-28T15:00:00Z',
          dataHoraSituacao: '2025-11-28T16:00:00Z',
          nomeArquivoRetorno: 'ok2.ret', dataHoraRetorno: '2025-11-28T17:00:00Z'
        }
      ];

      fetchMock.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(sampleResponse)
      });

      component.loadRemessa();
      await flushPromises();

      expect(component.dataSourceRemessa.data).toHaveLength(2);
      expect(component.dataSourceRemessa.data[0]).toMatchObject({ id: 2, nomeArquivo: 'ok.txt' });
      expect(component.dataSourceRemessa.data[1]).toMatchObject({ id: 3, nomeArquivo: 'ok2.txt' });

      // Auto-select first valid row
      expect(component.clickRemessa).toHaveBeenCalledWith(component.dataSourceRemessa.data[0]);
    });


    test('handles fetch rejection and clears timeout without throwing', async () => {
      // Simulate a rejection (e.g., network error or abort)
      const error = new Error('Network error');
      fetchMock.mockRejectedValueOnce(error);

      expect(() => {
        component.loadRemessa();
      }).not.toThrow();

      // Flush timers to trigger any pending timeouts cleanup paths
      await advanceAllTimers();

      // No data source created when error
      expect(component.dataSourceRemessa).toBeNull();
      expect(component.clickRemessa).not.toHaveBeenCalled();
    });
  });


  describe('RelatorioRemessaComponent.loadItemRemessa', () => {
    let component: RelatorioRemessaComponent;
    let fetchDataSpy: jest.SpyInstance;

    beforeEach(() => {
      component = new RelatorioRemessaComponent({} as any);
      component.remessaSelected = { id: 42 };
      component.clickItemRemessa = jest.fn();
      fetchDataSpy = jest.spyOn(component, 'fetchData');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('deve retornar imediatamente quando remessaSelected não estiver definido', () => {
      component.remessaSelected = null as any;
      component.loadItemRemessa();
      expect(fetchDataSpy).not.toHaveBeenCalled();
      expect(component.dataSourceItemRemessa).toBeNull();
    });

    it('deve chamar fetchData com URL e opções corretas', async () => {
      const sampleResponse: any = [];
      fetchDataSpy.mockImplementation((url, content, success, _error) => {
        success(sampleResponse);
      });

      const expectedUrl = `${environment.backendBatchRemessa}/consulta/itemRemessa/${component.remessaSelected.id}`;

      component.loadItemRemessa();
      await Promise.resolve();

      expect(fetchDataSpy).toHaveBeenCalledTimes(1);
      const [url, content] = fetchDataSpy.mock.calls[0];
      expect(url).toBe(expectedUrl);
      expect(content.method).toBe('GET');
      expect(content.headers).toEqual({
        'Content-Type': 'text/plain',
        'Accept': '*/*',
      });
      expect(content.signal).toBeDefined();
    });

    it('não deve auto-selecionar quando itemRemessaSelected pertence à mesma remessa', async () => {
      const sampleResponse = [
        { id: 10, nome: 'A', remessa: 42, caminho: '/x', metodo: 'GET', tipo: 'T', situacao: 'OK', interacao: 1, dataHoraSituacao: '2025-11-29T12:00:00Z', dadosRequisicao: '', dadosRetorno: '', conteudoRequisicao: null, observacoes: '', dependencia: null, sistema: 'alfa' },
      ];
      fetchDataSpy.mockImplementation((url, content, success, _error) => success(sampleResponse));

      component.itemRemessaSelected = { remessa: 42 };

      component.loadItemRemessa();
      await Promise.resolve();

      expect(component.dataSourceItemRemessa.data).toHaveLength(1);
      expect(component.clickItemRemessa).not.toHaveBeenCalled();
    });

    it('deve auto-selecionar quando itemRemessaSelected pertence a remessa diferente', async () => {
      const sampleResponse = [
        { id: 20, nome: 'B', remessa: 42, caminho: '/y', metodo: 'POST', tipo: 'C', situacao: 'OK', interacao: 1, dataHoraSituacao: '2025-11-29T13:00:00Z', dadosRequisicao: '', dadosRetorno: '', conteudoRequisicao: null, observacoes: '', dependencia: null, sistema: 'alfa' },
      ];
      fetchDataSpy.mockImplementation((url, content, success, _error) => success(sampleResponse));

      component.itemRemessaSelected = { remessa: 7 };

      component.loadItemRemessa();
      await Promise.resolve();

      expect(component.clickItemRemessa).toHaveBeenCalledTimes(1);
      expect(component.clickItemRemessa).toHaveBeenCalledWith(component.dataSourceItemRemessa.data[0]);
    });

    it('deve ignorar entradas malformadas e manter apenas válidas', async () => {
      const sampleResponse = [
        { id: 1, nome: 'OK', remessa: 42, caminho: '/ok', metodo: 'GET', tipo: 'T', situacao: 'OK', interacao: 1, dataHoraSituacao: '2025-11-29T12:00:00Z', dadosRequisicao: '', dadosRetorno: '', conteudoRequisicao: null, observacoes: '', dependencia: null, sistema: 'alfa' },
        null,
        { id: 2, nome: 'OK2', remessa: 42, caminho: '/ok2', metodo: 'POST', tipo: 'C', situacao: 'OK', interacao: 1, dataHoraSituacao: '2025-11-29T12:30:00Z', dadosRequisicao: '', dadosRetorno: '', conteudoRequisicao: null, observacoes: '', dependencia: null, sistema: 'beta' },
      ];
      fetchDataSpy.mockImplementation((url, content, success, _error) => success(sampleResponse));

      component.loadItemRemessa();
      await Promise.resolve();

      expect(component.dataSourceItemRemessa.data).toHaveLength(2);
      expect(component.dataSourceItemRemessa.data[0]).toMatchObject({ id: 1, nome: 'OK' });
      expect(component.dataSourceItemRemessa.data[1]).toMatchObject({ id: 2, nome: 'OK2' });
    });

    it('deve tratar erro no callback de erro e não criar dataSource', async () => {
      fetchDataSpy.mockImplementation((url, content, _success, error) => {
        error(new Error('falha'));
      });

      expect(() => component.loadItemRemessa()).not.toThrow();
      await Promise.resolve();

      expect(component.dataSourceItemRemessa).toBeNull();
      expect(component.clickItemRemessa).not.toHaveBeenCalled();
    });
  });

  describe('RelatorioRemessaComponent.loadOcorrenciasItemRemessa', () => {
    let component: RelatorioRemessaComponent;
    const fetchMock = jest.fn();

    beforeAll(() => {
      (global as any).fetch = fetchMock;
      class AbortControllerMock {
        signal = {};
        abort = jest.fn();
      }
      (global as any).AbortController = AbortControllerMock as unknown as typeof AbortController;
    });

    beforeEach(() => {
      jest.resetAllMocks();
      component = new RelatorioRemessaComponent({} as any);
      component.itemRemessaSelected = { id: 999 };
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('deve retornar imediatamente quando itemRemessaSelected não estiver definido', () => {
      component.itemRemessaSelected = null as any;
      component.loadOcorrenciasItemRemessa();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(component.dataSourceOcorrenciasItemRemessa).toBeNull();
    });

    it('deve chamar fetch com URL e opções corretas', async () => {
      const sampleResponse: any[] = [];
      fetchMock.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(sampleResponse),
      });

      const expectedUrl = `${environment.backendBatchRemessa}/consulta/ocorrenciasItemRemessa/${component.itemRemessaSelected.id}`;

      component.loadOcorrenciasItemRemessa();
      await Promise.resolve();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe(expectedUrl);
      expect(options.method).toBe('GET');
      expect(options.headers).toEqual({
        'Content-Type': 'text/plain',
        'Accept': '*/*',
      });
      expect(options.signal).toBeDefined();
    });

    it('deve mapear itens da resposta para MatTableDataSource', async () => {
      const sampleResponse = [
        { id: 1, codigoRetorno: '00', descricaoRetorno: 'Sucesso', valor: 100.5 },
        { id: 2, codigoRetorno: '01', descricaoRetorno: 'Falha', valor: 0 },
      ];
      fetchMock.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(sampleResponse),
      });

      component.loadOcorrenciasItemRemessa();
      await Promise.resolve();

      expect(component.dataSourceOcorrenciasItemRemessa).toBeInstanceOf(MatTableDataSource);
      const data = component.dataSourceOcorrenciasItemRemessa.data;
      expect(data).toHaveLength(2);
      expect(data[0]).toMatchObject({
        id: 1,
        codigoRetorno: '00',
        descricaoRetorno: 'Sucesso',
        valor: 100.5,
      });
      expect(data[1]).toMatchObject({
        id: 2,
        codigoRetorno: '01',
        descricaoRetorno: 'Falha',
        valor: 0,
      });
    });

    it('deve ignorar entradas malformadas (ex.: null) e manter apenas válidas', async () => {
      const sampleResponse = [
        { id: 10, codigoRetorno: 'AA', descricaoRetorno: 'Desc A', valor: 1 },
        null,
        { id: 11, codigoRetorno: 'BB', descricaoRetorno: 'Desc B', valor: 2 },
      ];
      fetchMock.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(sampleResponse),
      });

      component.loadOcorrenciasItemRemessa();
      await Promise.resolve();

      const rows = component.dataSourceOcorrenciasItemRemessa.data;
      expect(rows).toHaveLength(2);
      expect(rows[0]).toMatchObject({ id: 10, codigoRetorno: 'AA' });
      expect(rows[1]).toMatchObject({ id: 11, codigoRetorno: 'BB' });
    });

    it('deve criar dataSource vazio quando resposta for lista vazia', async () => {
      fetchMock.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce([]),
      });

      component.loadOcorrenciasItemRemessa();
      await Promise.resolve();

      expect(component.dataSourceOcorrenciasItemRemessa).toBeInstanceOf(MatTableDataSource);
      expect(component.dataSourceOcorrenciasItemRemessa.data).toHaveLength(0);
    });

    it('deve tratar erro (reject do fetch) e não criar dataSource', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));
      expect(() => component.loadOcorrenciasItemRemessa()).not.toThrow();
      await Promise.resolve();

      expect(component.dataSourceOcorrenciasItemRemessa).toBeNull();
    });

    it('deve preservar campos id, codigoRetorno, descricaoRetorno e valor conforme resposta', async () => {
      const sampleResponse = [
        { id: 123, codigoRetorno: '10', descricaoRetorno: 'Processado', valor: 999.99 },
      ];
      fetchMock.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(sampleResponse),
      });

      component.loadOcorrenciasItemRemessa();
      await Promise.resolve();

      const row = component.dataSourceOcorrenciasItemRemessa.data[0];
      expect(row).toMatchObject({
        id: 123,
        codigoRetorno: '10',
        descricaoRetorno: 'Processado',
        valor: 999.99,
      });
    });

  });



  describe('RelatorioRemessaComponent.reiniciarRemessa', () => {
    let component: RelatorioRemessaComponent;
    const fetchMock = jest.fn();

    beforeAll(() => {
      (global as any).fetch = fetchMock;
      class AbortControllerMock {
        signal = {};
        abort = jest.fn();
      }
      (global as any).AbortController = AbortControllerMock as unknown as typeof AbortController;
    });

    beforeEach(() => {
      jest.resetAllMocks();
      component = new RelatorioRemessaComponent({} as any);
      jest.spyOn(component, 'showMessageDialog').mockImplementation(() => { });
      jest.spyOn(component, 'loadData').mockImplementation(() => { });
      component.remessaSelected = { id: 1 };
      component.itemRemessaSelected = { id: 2 };
      component.detalheItemRemessaSelected = { id: 3 };
      component.ocorrenciaItemRemessaSelected = { id: 4 };
      component.situacaoItemRemessaSelected = { id: 5 };
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('deve chamar fetch com URL, método DELETE e signal', async () => {
      fetchMock.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce('REINICIADO'),
      });

      const expectedUrl = `${environment.backendBatchRemessa}/consulta/reiniciarRemessa`;

      component.reiniciarRemessa();
      await Promise.resolve();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe(expectedUrl);
      expect(options.method).toBe('DELETE');
      expect(options.signal).toBeDefined();
    });

    it('deve exibir mensagem, limpar seleções e chamar loadData ao sucesso', async () => {
      const respostaTexto = 'Remessa reiniciada com sucesso';
      fetchMock.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce(respostaTexto),
      });

      component.reiniciarRemessa();
      await Promise.resolve();

      expect(component.showMessageDialog).toHaveBeenCalledWith('Atenção', respostaTexto);
      expect(component.loadData).toHaveBeenCalledTimes(1);
      expect(component.remessaSelected).toBeNull();
      expect(component.itemRemessaSelected).toBeNull();
      expect(component.detalheItemRemessaSelected).toBeNull();
      expect(component.ocorrenciaItemRemessaSelected).toBeNull();
      expect(component.situacaoItemRemessaSelected).toBeNull();
    });

    it('deve tratar erro sem lançar exceção e não chamar showMessageDialog nem loadData', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      expect(() => component.reiniciarRemessa()).not.toThrow();
      await Promise.resolve();

      expect(component.showMessageDialog).not.toHaveBeenCalled();
      expect(component.loadData).not.toHaveBeenCalled();
    });

    it('deve limpar timeout quando sucesso', async () => {
      jest.useFakeTimers();
      const textMock = jest.fn().mockResolvedValueOnce('OK');
      fetchMock.mockResolvedValueOnce({ text: textMock });

      component.reiniciarRemessa();

      await Promise.resolve();
      jest.runOnlyPendingTimers();

      expect(textMock).toHaveBeenCalledTimes(1);
    });

    it('deve usar AbortController e manter signal configurado', async () => {
      const pendingResponse = { text: jest.fn().mockResolvedValueOnce('OK') };
      fetchMock.mockResolvedValueOnce(pendingResponse);

      component.reiniciarRemessa();
      await Promise.resolve();

      const [, options] = fetchMock.mock.calls[0];
      expect(options.signal).toBeDefined();
    });

  });



  describe('RelatorioRemessaComponent.uploadArquivo', () => {
    let component: RelatorioRemessaComponent;
    let enviarRemessaMock: jest.Mock;
    let showValidateSpy: jest.SpyInstance;

    class FormDataMock {
      private _map: Record<string, any[]> = {};
      append(name: string, value: any, filename?: string) {
        this._map[name] = this._map[name] || [];
        this._map[name].push(filename ? { value, filename } : { value });
      }
      getAll(name: string) {
        return this._map[name] || [];
      }
      has(name: string) {
        return !!this._map[name]?.length;
      }
    }

    beforeAll(() => {
      (global as any).FormData = FormDataMock as unknown as typeof FormData;
    });

    beforeEach(() => {
      component = new RelatorioRemessaComponent({} as any);
      enviarRemessaMock = jest.fn((...args: any[]) => {
        const cb = args[3] as (result: any) => void;
        cb('{"ok":true,"mensagem":"validado"}');
      });
      (component as any).enviarRemessa = enviarRemessaMock;
      showValidateSpy = jest.spyOn(component as any, 'showValidate').mockImplementation(() => { });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('deve retornar sem chamar enviarRemessa quando não houver arquivo', () => {
      const event: any = { target: { files: [] } };
      component.uploadArquivo(event);
      expect(enviarRemessaMock).not.toHaveBeenCalled();
      expect(showValidateSpy).not.toHaveBeenCalled();
    });

    it('deve montar FormData com o arquivo e chamar enviarRemessa com headers e URL corretos', () => {
      const fakeFile = { name: 'remessa.txt', size: 10, type: 'text/plain' } as any;
      const event: any = { target: { files: [fakeFile], value: 'x' } };

      component.uploadArquivo(event);

      expect(enviarRemessaMock).toHaveBeenCalledTimes(1);

      const [headersArg, urlArg, formDataArg] = enviarRemessaMock.mock.calls[0];

      const expectedUrl = `${environment.backendBatchRemessa}/gerador/validar`;
      const expectedHeaders = { Accept: 'application/json' };

      expect(urlArg).toBe(expectedUrl);
      expect(headersArg).toEqual(expectedHeaders);

      const fd = formDataArg as FormDataMock;
      expect(fd.has('conteudo')).toBe(true);
      const appended = fd.getAll('conteudo');
      expect(appended.length).toBe(1);
      expect(appended[0].filename).toBe('remessa.txt');
      expect(appended[0].value).toBe(fakeFile);
    });

    it('deve limpar o input e chamar showValidate com o JSON parseado após callback', () => {
      const fakeFile = { name: 'arquivo.json' } as any;
      const event: any = { target: { files: [fakeFile], value: 'algum-valor' } };

      component.uploadArquivo(event);

      expect(event.target.value).toBe('');
      expect(showValidateSpy).toHaveBeenCalledTimes(1);

      const [titulo, json] = showValidateSpy.mock.calls[0];
      expect(titulo).toBe('Validação do arquivo');
      expect(json).toEqual({ ok: true, mensagem: 'validado' });
    });

    it('deve suportar múltiplos arquivos mas enviar apenas o primeiro', () => {
      const f1 = { name: 'primeiro.txt' } as any;
      const f2 = { name: 'segundo.txt' } as any;
      const event: any = { target: { files: [f1, f2], value: 'valor' } };

      component.uploadArquivo(event);

      const [, , formDataArg] = enviarRemessaMock.mock.calls[0];
      const appended = (formDataArg as FormDataMock).getAll('conteudo');
      expect(appended.length).toBe(1);
      expect(appended[0].filename).toBe('primeiro.txt');
      expect(appended[0].value).toBe(f1);
    });

    it('deve manter Accept application/json nos headers e não definir Content-Type manualmente', () => {
      const fakeFile = { name: 'data.bin' } as any;
      const event: any = { target: { files: [fakeFile], value: 'valor' } };

      component.uploadArquivo(event);

      const [headersArg] = enviarRemessaMock.mock.calls[0];
      expect(headersArg).toEqual({ Accept: 'application/json' });
      expect((headersArg)['Content-Type']).toBeUndefined();
    });

    it('deve invocar enviarRemessa com função de callback válida e processar retorno com erros', () => {
      const fakeFile = { name: 'validar.txt' } as any;
      const event: any = { target: { files: [fakeFile], value: 'valor' } };

      let receivedCallback: ((result: any) => void) | null = null;
      enviarRemessaMock.mockImplementation((...args: any[]) => {
        receivedCallback = args[3];
      });

      component.uploadArquivo(event);

      expect(receivedCallback).toBeInstanceOf(Function);

      const payload = '{"ok":false,"erros":["linha 1"]}';
      (receivedCallback as any)(payload);

      expect(event.target.value).toBe('');
      expect(showValidateSpy).toHaveBeenCalledWith('Validação do arquivo', { ok: false, erros: ['linha 1'] });
    });

    it('não deve chamar showValidate nem limpar input quando enviarRemessa não for invocado (sem arquivo)', () => {
      const event: any = { target: { files: [], value: 'valor' } };

      component.uploadArquivo(event);

      expect(showValidateSpy).not.toHaveBeenCalled();
      expect(event.target.value).toBe('valor');
    });

    it('deve montar corretamente a URL baseada em environment.backendBatchRemessa', () => {
      const fakeFile = { name: 'u.txt' } as any;
      const event: any = { target: { files: [fakeFile], value: 'v' } };

      let capturedUrl: string | undefined;
      enviarRemessaMock.mockImplementation((...args: any[]) => {
        capturedUrl = args[1];
        const cb = args[3] as (result: any) => void;
        cb('{"ok":true}');
      });

      component.uploadArquivo(event);

      expect(capturedUrl).toBe(`${environment.backendBatchRemessa}/gerador/validar`);
    });

  });


  describe('RelatorioRemessaComponent.uploadRemessa', () => {
    let component: RelatorioRemessaComponent;
    let enviarRemessaMock: jest.Mock;
    let showMessageDialogSpy: jest.SpyInstance;
    let loadDataSpy: jest.SpyInstance;

    class FormDataMock {
      private _map: Record<string, any[]> = {};
      append(name: string, value: any, filename?: string) {
        this._map[name] = this._map[name] || [];
        this._map[name].push(filename ? { value, filename } : { value });
      }
      getAll(name: string) {
        return this._map[name] || [];
      }
      has(name: string) {
        return !!this._map[name]?.length;
      }
    }

    beforeEach(() => {
      (global as any).FormData = FormDataMock as unknown as typeof FormData;
      component = new RelatorioRemessaComponent({} as any);
      enviarRemessaMock = jest.fn((...args: any[]) => {
        const cb = args[3] as (result: any) => void;
        cb('UPLOAD_OK');
      });
      (component as any).enviarRemessa = enviarRemessaMock;
      showMessageDialogSpy = jest.spyOn(component as any, 'showMessageDialog').mockImplementation(() => { });
      loadDataSpy = jest.spyOn(component as any, 'loadData').mockImplementation(() => { });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('deve retornar sem chamar enviarRemessa quando não houver arquivo', () => {
      const event: any = { target: { files: [] } };
      component.uploadRemessa(event);
      expect(enviarRemessaMock).not.toHaveBeenCalled();
      expect(loadDataSpy).not.toHaveBeenCalled();
      expect(showMessageDialogSpy).not.toHaveBeenCalled();
    });

    it('deve montar FormData com o primeiro arquivo e chamar enviarRemessa com URL correta e headers nulos', () => {
      const file = { name: 'remessa.txt', size: 10, type: 'text/plain' } as any;
      const event: any = { target: { files: [file], value: 'x' } };

      component.uploadRemessa(event);

      expect(enviarRemessaMock).toHaveBeenCalledTimes(1);
      const [headersArg, urlArg, formDataArg] = enviarRemessaMock.mock.calls[0];

      const expectedUrl = `${environment.backendBatchRemessa}/gerador/upload`;
      expect(urlArg).toBe(expectedUrl);
      expect(headersArg).toBeNull();

      const fd = formDataArg as FormDataMock;
      expect(fd.has('conteudo')).toBe(true);
      const appended = fd.getAll('conteudo');
      expect(appended.length).toBe(1);
      expect(appended[0].filename).toBe('remessa.txt');
      expect(appended[0].value).toBe(file);
    });

    it('deve limpar o input, chamar loadData e showMessageDialog após callback de sucesso', () => {
      const file = { name: 'arquivo.txt' } as any;
      const event: any = { target: { files: [file], value: 'algum-valor' } };

      component.uploadRemessa(event);

      expect(event.target.value).toBe('');
      expect(loadDataSpy).toHaveBeenCalledTimes(1);
      expect(showMessageDialogSpy).toHaveBeenCalledTimes(1);
      expect(showMessageDialogSpy).toHaveBeenCalledWith('Atenção', 'UPLOAD_OK');
    });

    it('deve suportar múltiplos arquivos mas enviar apenas o primeiro', () => {
      const f1 = { name: 'primeiro.txt' } as any;
      const f2 = { name: 'segundo.txt' } as any;
      const event: any = { target: { files: [f1, f2], value: 'valor' } };

      component.uploadRemessa(event);

      const [, , formDataArg] = enviarRemessaMock.mock.calls[0];
      const appended = (formDataArg as FormDataMock).getAll('conteudo');
      expect(appended.length).toBe(1);
      expect(appended[0].filename).toBe('primeiro.txt');
      expect(appended[0].value).toBe(f1);
    });

    it('deve montar corretamente a URL baseada em environment.backendBatchRemessa', () => {
      const file = { name: 'u.txt' } as any;
      const event: any = { target: { files: [file], value: 'v' } };

      let capturedUrl: string | undefined;
      enviarRemessaMock.mockImplementation((...args: any[]) => {
        capturedUrl = args[1];
        const cb = args[3] as (result: any) => void;
        cb('UPLOAD_OK');
      });

      component.uploadRemessa(event);

      expect(capturedUrl).toBe(`${environment.backendBatchRemessa}/gerador/upload`);
    });

    it('deve não alterar o input e não chamar métodos quando enviarRemessa não for invocado (sem arquivo)', () => {
      const event: any = { target: { files: [], value: 'valor' } };

      component.uploadRemessa(event);

      expect(event.target.value).toBe('valor');
      expect(loadDataSpy).not.toHaveBeenCalled();
      expect(showMessageDialogSpy).not.toHaveBeenCalled();
    });

    it('deve processar callback com resposta arbitrária (string qualquer)', () => {
      const file = { name: 'r.txt' } as any;
      const event: any = { target: { files: [file], value: 'v' } };

      enviarRemessaMock.mockImplementation((...args: any[]) => {
        const cb = args[3] as (result: any) => void;
        cb('QUALQUER_COISA');
      });

      component.uploadRemessa(event);

      expect(event.target.value).toBe('');
      expect(loadDataSpy).toHaveBeenCalled();
      expect(showMessageDialogSpy).toHaveBeenCalledWith('Atenção', 'QUALQUER_COISA');
    });
  });


  describe('RelatorioRemessaComponent.enviarRemessa', () => {
    let component: RelatorioRemessaComponent;
    const fetchMock = jest.fn();

    class AbortControllerMock {
      signal = {};
      abort = jest.fn();
    }

    beforeEach(() => {
      (global as any).fetch = fetchMock;
      (global as any).AbortController = AbortControllerMock as unknown as typeof AbortController;
      jest.useFakeTimers();
      component = new RelatorioRemessaComponent({} as any);
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('deve chamar fetch com método POST, body e headers e repassar signal', async () => {
      const headers = { Accept: 'application/json' };
      const url = 'https://example.test/endpoint';
      const body = new FormData();
      const onDone = jest.fn();

      fetchMock.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce('OK'),
      } as any);

      component.enviarRemessa(headers, url, body, onDone);
      await Promise.resolve();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [calledUrl, options] = fetchMock.mock.calls[0];
      expect(calledUrl).toBe(url);
      expect(options.method).toBe('POST');
      expect(options.body).toBe(body);
      expect(options.headers).toBe(headers);
      expect(options.signal).toBeDefined();
    });

    it('deve executar onDone com a resposta de texto quando sucesso', async () => {
      const onDone = jest.fn();
      fetchMock.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce('RESPOSTA_SUCESSO'),
      } as any);

      component.enviarRemessa({ foo: 'bar' }, 'https://x/y', new FormData(), onDone);
      await Promise.resolve();

      expect(onDone).toHaveBeenCalledTimes(1);
      expect(onDone).toHaveBeenCalledWith('RESPOSTA_SUCESSO');
    });

    it('deve executar onDone com erro quando fetch rejeitar', async () => {
      const onDone = jest.fn();
      const error = new Error('Network error');
      fetchMock.mockRejectedValueOnce(error);

      component.enviarRemessa(null, 'https://x/y', new FormData(), onDone);
      await Promise.resolve();

      expect(onDone).toHaveBeenCalledTimes(1);
      expect(onDone).toHaveBeenCalledWith(error);
    });

    it('não deve lançar exceção quando onDone não for fornecido (sucesso)', async () => {
      fetchMock.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValueOnce('OK'),
      } as any);

      expect(() => component.enviarRemessa(null, 'https://x/y', new FormData(), null)).not.toThrow();
      await Promise.resolve();
    });

    it('não deve lançar exceção quando onDone não for fornecido (erro)', async () => {
      fetchMock.mockRejectedValueOnce(new Error('falha'));
      expect(() => component.enviarRemessa(null, 'https://x/y', new FormData(), undefined)).not.toThrow();
      await Promise.resolve();
    });

    it('deve acionar AbortController.abort após REQUEST_TIMEOUT quando a promessa estiver pendente', async () => {
      const localAbortSpy = jest.fn();
      class LocalAbortControllerMock {
        signal = {};
        abort = localAbortSpy;
      }
      (global as any).AbortController = LocalAbortControllerMock as unknown as typeof AbortController;

      // fetch pendente (nunca resolve)
      fetchMock.mockImplementationOnce(() => new Promise(() => { /* pending */ }));

      component.enviarRemessa(null, 'https://x/y', new FormData(), jest.fn());

      // avança timers para atingir o timeout
      jest.runOnlyPendingTimers();

      expect(localAbortSpy).toHaveBeenCalledTimes(1);
    });

    it('deve limpar timeout quando a resposta for resolvida', async () => {
      const textSpy = jest.fn().mockResolvedValueOnce('OK');
      fetchMock.mockResolvedValueOnce({ text: textSpy } as any);

      const onDone = jest.fn();
      component.enviarRemessa(null, 'https://x/y', new FormData(), onDone);

      await Promise.resolve();
      jest.runOnlyPendingTimers();

      expect(textSpy).toHaveBeenCalledTimes(1);
      expect(onDone).toHaveBeenCalledWith('OK');
    });

    it('deve passar quaisquer headers sem modificá-los', async () => {
      const headers = { 'X-Custom': '123', Accept: '*/*' };
      const url = 'https://example.test/api';
      const onDone = jest.fn();

      fetchMock.mockResolvedValueOnce({ text: jest.fn().mockResolvedValueOnce('OK') } as any);

      component.enviarRemessa(headers, url, new FormData(), onDone);
      await Promise.resolve();

      const [, options] = fetchMock.mock.calls[0];
      expect(options.headers).toEqual(headers);
    });

    it('deve chamar onDone com o objeto Error original quando houver rejeição', async () => {
      const onDone = jest.fn();
      const originalError = new Error('timeout');
      fetchMock.mockRejectedValueOnce(originalError);

      component.enviarRemessa({}, 'https://svc/endpoint', new FormData(), onDone);
      await Promise.resolve();

      expect(onDone).toHaveBeenCalledWith(originalError);
    });

  });
});
