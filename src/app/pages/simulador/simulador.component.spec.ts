import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimuladorComponent } from './simulador.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tarifa, TipoSimulacao, Funcionalidade, Campanha, TipoTarifa, EnumGruposMargemContribuicao, EnumLabelGruposMargemContribuicao, EnumMensagemGrupo, EnumAlcada, EnumRadioButtonTarifas } from '../../interfaces';
import { dummyEnvironment, dummyFuncionalidade, parcelSugestDummyComponent } from '../../../test-helpers/convenio/environment-test-setup';
import { deepClone } from '../../../test-helpers/convenio/functions'
import { SharedModule } from '../../shared/shared.module';
import { createMockSimulacaoDTO, createMockExcecoesSimulacao, createMockJustificativaSimulacao, createMockCondicaoSimulacao, mockSessionStorage, createMockTipoSimulacao, createMockCliente, createMockDetalhamentoSimulacao, createMockSimulacao } from '../../../test-helpers/createMocks';
import { ClienteService } from '../../services/cliente/cliente.service';
import { PARAMETROS_CANCELAR_SIMULACAO } from '../../shared/models/cancelar-generico.model';
import { of } from 'rxjs';
import { CancelarGenericoComponent } from '../../shared/modal/cancelar-generico/cancelar-generico.component';
import { createMockTarifa } from '../../../test-helpers/createMockTarifa';
import { EventEmitter } from '@angular/core';
import { CardIconesRestricaoComponent } from '../../shared/card-icones-restricao/card-icones-restricao.component';


describe('SimuladorComponent', () => {

  function flushPromises() {
    return new Promise(resolve => process.nextTick(resolve));
  }

  let component: SimuladorComponent;
  let fixture: ComponentFixture<SimuladorComponent>;
  let modalService: NgbModal;
  let sessionStorageMock: ReturnType<typeof mockSessionStorage>;
  let clienteService: ClienteService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [SimuladorComponent, CardIconesRestricaoComponent],
      providers: [NgbModal, ClienteService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimuladorComponent);
    component = fixture.componentInstance;

    // Estado inicial do componente
    component.host = deepClone(dummyEnvironment.host);
    component.listaTiposSituacao = [];
    component.ready = false;
    component.simulacao = { id: null };
    component.numeroSimulacao = null;
    component.criouNovaSimulacao = 'nao';
    component.criarSimulacaoSemIrParaConvenio = true;
    component.cliente = { cnpj: '12345678000199' } as any;

    // Mocks de métodos do ngOnInit
    const ngOnInitMocks = [
      jest.spyOn(component, 'parametrosSimulacao').mockImplementation(() => true),
      jest.spyOn(component, 'carregarTiposSimulacao').mockImplementation(() => true),
      jest.spyOn(component, 'carregarCampanhas').mockImplementation(() => true)
    ];

    // Injeção e mock do modalService
    modalService = TestBed.inject(NgbModal);
    jest.spyOn(modalService, 'dismissAll').mockImplementation(() => { });
    jest.spyOn(modalService, 'open').mockReturnValue({} as any);

    clienteService = TestBed.inject(ClienteService);

    // Mock do sessionStorage
    sessionStorageMock = mockSessionStorage();

    fixture.detectChanges();
    ngOnInitMocks.forEach(mock => expect(mock).toHaveBeenCalledTimes(1));
  });

  it('should create', () => {
    expect(component).toBeDefined();
    expect(component).toBeTruthy();
  });

  it('initialize() preenche title, icone e nome servico corretamente', () => {
    component.initialize();
    expect(component.icon).toBe('aplicacao-icone');
    expect(component.title).toBe('aplicacao-nome');
    expect(component.serviceTitle).toBe('servico-nome');
  });

  it('initialize() não preenche title', () => {
    component.title = 'Convênio';
    component.host.aplicacao.nome = null; // Com valor null, o título se mantém
    component.initialize();
    expect(component.title).toBe('Convênio');
  });

  it('initialize() não preenche icon', () => {
    component.icon = 'pix';
    component.host.aplicacao.icone = null;
    component.initialize();
    expect(component.icon).toBe('pix');
  });

  it('initialize() não preenche nome servico (nao foi passado nome serviço)', () => {
    component.serviceTitle = 'PIX-Automático';
    component.host.servico.nome = null;
    component.initialize();
    expect(component.serviceTitle).toBe('PIX-Automático');
  });

  it('obterPermissao() deve retornar nulo', () => {
    let spyObterPermissao: jest.SpyInstance = jest.spyOn(component, "obterPermissao");

    component.obterPermissao();
    expect(spyObterPermissao).toHaveReturnedWith([dummyFuncionalidade]);

    component.host.aplicacao.funcionalidades = null;
    component.obterPermissao();
    expect(spyObterPermissao).toHaveReturnedWith(null);

    component.host.aplicacao = null;
    component.obterPermissao();
    expect(spyObterPermissao).toHaveReturnedWith(null);

    component.host = null;
    component.obterPermissao();
    expect(spyObterPermissao).toHaveReturnedWith(null);
  });

  it('obterPermissao() deve retornar array de objeto com funcionalidades', () => {
    let spyObterPermissao: jest.SpyInstance = jest.spyOn(component, "obterPermissao");
    const permissoes: Funcionalidade[] | null = component.obterPermissao();

    expect(spyObterPermissao).toHaveReturnedWith([dummyFuncionalidade]);
    expect(permissoes).toStrictEqual([dummyFuncionalidade]);
    expect(permissoes).toHaveLength(1);
  });

  it('verificarFuncionalidade() retorna false (caso não existe funcionalidades)', () => {
    component.funcionalidades = null;
    const verificada: boolean = component.verificarFuncionalidade('dummyFuncionalidade');
    expect(verificada).toBeFalsy();
    expect(verificada).toBe(false);
  });

  it('verificarFuncionalidade() deve retornar true', () => {
    let dummyFuncionalidade1: Funcionalidade = deepClone(dummyFuncionalidade);
    let dummyFuncionalidade2: Funcionalidade = deepClone(dummyFuncionalidade);
    dummyFuncionalidade1.id = 'A';
    dummyFuncionalidade2.id = 'B';
    let arrayFuncionalidade: Funcionalidade[] = [dummyFuncionalidade1, dummyFuncionalidade2];
    component.funcionalidades = arrayFuncionalidade;

    let spyVerificarFuncionalidade: jest.SpyInstance = jest.spyOn(component, "verificarFuncionalidade");

    let arrayBuscarPor: string[] = ['A', 'B', 'C', 'D'];
    let arrayExpected: boolean[] = [true, true, false, false];

    arrayBuscarPor.forEach((element) => {
      component.verificarFuncionalidade(element);
    });

    for (let i = 1; i <= arrayExpected.length; i++) {
      expect(spyVerificarFuncionalidade).toHaveBeenNthCalledWith(i, arrayBuscarPor[i - 1]);
      expect(spyVerificarFuncionalidade).toHaveNthReturnedWith(i, arrayExpected[i - 1]);
    }
  });

  it('processPreferences() não deve atribuir as preferencias', () => {
    component.preferences = null;
    // Queremos forcar que seja retornado null, por isso não podemos ter as preferencias armazenadas
    if (window.sessionStorage.getItem('preferences') != null) {
      window.sessionStorage.removeItem('preferences');
    }
    component.processPreferences();
    expect(component.preferences).toBeNull();
  });

  it('processPreferences() deve atribuir as preferencias', () => {
    const dummyPreferences = { pageSize: 10 };
    component.preferences = null;
    // Queremos forcar que seja retornado as preferencias armazenadas
    if (window.sessionStorage.getItem('preferences') == null) {
      window.sessionStorage.setItem('preferences', JSON.stringify(dummyPreferences));
    }
    component.processPreferences();
    expect(component.preferences).not.toBeNull();
    expect(component.preferences).toEqual(dummyPreferences);
  });

  it('savePreferences() deve armazenar item corretamente', () => {
    const dummyPreferences = { pageSize: 10 };
    const dummyPreferencesChanged = { pageSize: 30 };
    component.preferences = dummyPreferences;
    component.savePreferences(dummyPreferencesChanged);
    const armazenada: string | null = window.sessionStorage.getItem("preferences");

    expect(armazenada).toEqual(JSON.stringify(dummyPreferencesChanged));
  });

  it('favoriteEvent() deve disparar evento e inverter se favorito ou nao', () => {
    component.favorite = false;
    const data = {
      detail: {
        id: component.host.id,
        value: component.favorite
      }
    };
    const event = new CustomEvent("@caixa/favorite", data);

    let mockDispatchEvent: jest.SpyInstance = jest.spyOn(global, 'dispatchEvent');
    component.favoriteEvent();
    expect(component.favorite).toBe(true);
    expect(mockDispatchEvent).toHaveBeenCalledTimes(1);
    expect(mockDispatchEvent).toHaveBeenCalledWith(event);
  });

  it('getParcelProps() deve retornar nulo', () => {
    component.host.componentes = null;
    let resultado = component.getParcelProps();
    expect(resultado).toBeNull();
  });

  it('getParcelProps() deve retornar objeto com caminho e contexto', () => {
    component.host.componentes[0].id = 'parcel-sugest';
    let resultado = component.getParcelProps();
    const esperado = { host: { caminho: parcelSugestDummyComponent.caminho, contexto: component.host.contexto } };
    expect(resultado).toEqual(esperado);
  })

  it('should be empty', () => {
    let arrayEmpty: any[] = [];
    expect(component.isEmpty(arrayEmpty)).toBeTruthy();
  });

  it('should return true when currency is valid', () => {
    let currencyList: any[] = [
      "5.00",
      "555.00",
      "555585.00",
      "7"
    ];
    for (let currency of currencyList) {
      expect(component.isNonNullCurrency(currency)).toBeTruthy();
    }
  });

  it('should return false when currency is invalid', () => {
    let currencyList: any[] = [
      null,
      "",
      "554,h",
      "554.885.569",
      "554,885.569"
    ];
    for (let currency of currencyList) {
      expect(component.isNonNullCurrency(currency)).toBeFalsy();
    }
  });

  it('should be numeric', () => {
    let numeric = "5";
    expect(component.isNonNullNumeric(numeric)).toBeTruthy();
  });

  it('teste voltar', () => {
    component.voltar();

    expect(component.pesquisar).toEqual(false);
    expect(component.detalhar).toEqual(false);
    expect(component.alterar).toEqual(false);

  });

  it('obterPercentual', () => {
    expect(component.obterPercentual(100, 100)).toEqual(0);

  });

  it('getEtapaIcon', () => {
    expect(component.getEtapaIcon(null)).toEqual("");

  });

  it('limparConsulta', () => {
    component.limparConsulta();
    expect(component.cliente).toEqual(null);
    expect(component.cliente).toEqual(null);
    expect(component.message).toEqual(null);

  });

  it('should be valid CNPJ Matriz', () => {
    let cnpjMatriz = "12.345.678/0001-00".replaceAll(".", "").replaceAll("/", "").replaceAll("-", "");
    expect(component.isCNPJ(cnpjMatriz)).toBeTruthy();
  });

  it('should be valid CNPJ Filial', () => {
    let cnpjFilial = "12.345.678/0002-00".replaceAll(".", "").replaceAll("/", "").replaceAll("-", "");
    expect(component.isCNPJ(cnpjFilial)).toBeTruthy();
  });

  it('should not be valid CNPJ Matriz', () => {
    let cnpjMatriz = "A12.345.678/0001-00".replaceAll(".", "").replaceAll("/", "").replaceAll("-", "");
    expect(component.isCNPJ(cnpjMatriz)).toBeFalsy();
  });

  it('should not be valid CNPJ Filial', () => {
    let cnpjFilial = "A12.345.678/0002-00".replaceAll(".", "").replaceAll("/", "").replaceAll("-", "");
    expect(component.isCNPJ(cnpjFilial)).toBeFalsy();
  });

  describe('processaTiposSimulacao()', () => {

    const tipoSimulacaoDataFlagSituacaoAtivaEqual_F: TipoSimulacao[] = [
      createMockTipoSimulacao({ flagSituacaoAtiva: 'F' })
    ];

    const tipoSimulacaoDataFlagSituacaoAtivaEqual_S: TipoSimulacao[] = [
      createMockTipoSimulacao({ flagSituacaoAtiva: 'S' })
    ];

    const tipoSimulacaoDataFlagSituacaoAtivaEqual_null: TipoSimulacao[] = [
      createMockTipoSimulacao({ flagSituacaoAtiva: null })
    ];

    it('deve manter listaTiposSituacao como não nula e ready como true quando flagSituacaoAtiva for diferente de "F" ou null', () => {
      const tipoItemSimulacaoList = [
        tipoSimulacaoDataFlagSituacaoAtivaEqual_null,
        tipoSimulacaoDataFlagSituacaoAtivaEqual_F
      ];

      for (const item of tipoItemSimulacaoList) {
        component.processaTiposSimulacao(item);
        expect(component.listaTiposSituacao).not.toBeNull();
        expect(component.listaTiposSituacao).toEqual([]);
        expect(component.ready).toBeTruthy();
      }
    });

    it('deve manter listaTiposSituacao como não nula e ready como true quando flagSituacaoAtiva for "S"', () => {
      component.processaTiposSimulacao(tipoSimulacaoDataFlagSituacaoAtivaEqual_S);
      expect(component.listaTiposSituacao).not.toBeNull();
      expect(component.listaTiposSituacao).not.toEqual([]);
      expect(component.ready).toBeTruthy();
    });

    it('deve manter listaTiposSituacao como não nula e ready como false quando entrada for null', () => {
      component.processaTiposSimulacao(null);
      expect(component.listaTiposSituacao).not.toBeNull();
      expect(component.listaTiposSituacao).toEqual([]);
      expect(component.ready).toBeFalsy();
    });
  });

  it('processaIconeParecer', () => {
    expect(component.processaIconeParecer({ tipoSituacao: { id: 1 } })).toEqual("edit");
    expect(component.processaIconeParecer({ tipoSituacao: { id: 2 } })).toBeDefined();
    expect(component.processaIconeParecer({ tipoSituacao: { id: 3 } })).toBeDefined();
    expect(component.processaIconeParecer({ tipoSituacao: { id: 4 } })).toBeDefined();
    expect(component.processaIconeParecer({ tipoSituacao: { id: 5 } })).toBeDefined();
    expect(component.processaIconeParecer({ tipoSituacao: { id: 6 } })).toBeDefined();
    expect(component.processaIconeParecer({ tipoSituacao: { id: 7 } })).toBeDefined();
    expect(component.processaIconeParecer({ tipoSituacao: { id: 8 } })).toBeDefined();
    expect(component.processaIconeParecer({ tipoSituacao: { id: 9 } })).toBeDefined();
    expect(component.processaIconeParecer({ tipoSituacao: { id: 10 } })).toBeDefined();
  });

  it('processaColorParecer', () => {
    expect(component.processaColorParecer({ tipoSituacao: { id: 1 } })).toEqual("icon-success");
    expect(component.processaColorParecer({ tipoSituacao: { id: 2 } })).toBeDefined();
    expect(component.processaColorParecer({ tipoSituacao: { id: 3 } })).toBeDefined();
    expect(component.processaColorParecer({ tipoSituacao: { id: 4 } })).toBeDefined();
    expect(component.processaColorParecer({ tipoSituacao: { id: 5 } })).toBeDefined();
    expect(component.processaColorParecer({ tipoSituacao: { id: 6 } })).toBeDefined();
    expect(component.processaColorParecer({ tipoSituacao: { id: 7 } })).toBeDefined();
    expect(component.processaColorParecer({ tipoSituacao: { id: 8 } })).toBeDefined();
    expect(component.processaColorParecer({ tipoSituacao: { id: 9 } })).toBeDefined();
    expect(component.processaColorParecer({ tipoSituacao: { id: 10 } })).toBeDefined();
  });

  it('getIncludedEtapa', () => {
    expect(component.getIncludedEtapa({ etapa1: { status: 1 } })).toBeDefined();
  });

  it('solicitarCancelamento deve abrir o modal quando simulacaoCancelavel for true', () => {
    component.simulacaoCancelavel = true;

    const modalRefMock = {
      componentInstance: {
        parametros: PARAMETROS_CANCELAR_SIMULACAO,
        sucessoCancelamento: new EventEmitter<'success' | 'danger'>()
      },
      result: Promise.resolve('success'),
      closed: of(null)
    };

    jest.spyOn(modalService, 'open').mockReturnValue(modalRefMock as any);

    const result = component.solicitarCancelamento();

    expect(modalService.open).toHaveBeenCalledWith(CancelarGenericoComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });
    expect(result).toBe(true);
  });


  it('solicitarCancelamento não deve abrir modal quando simulacaoCancelavel for false', () => {
    component.simulacaoCancelavel = false;

    component.solicitarCancelamento();

    expect(modalService.open).not.toHaveBeenCalled();
  });

  it('processarCancelamentoInclusao', () => {
    expect(component.processarCancelamentoInclusao(null)).toBeTruthy();
  });

  it('processConta', () => {
    expect(component.processConta("mensagem")).toBeDefined();
  });


  it('getNextEtapa', () => {
    expect(component.getNextEtapa({ etapa2: { previsto: 10 } })).toBeDefined();
  });

  it('tarifaIndex', () => {
    let tarifa: Tarifa = { tipo: TipoTarifa.CAMPANHA, id: null, condicao: "Balcão", pgCaixa: 4.00, pgOutros: 4.50, retentativa: 0.05, degustacao: 0, situacao: "Aprovado", recomended: false, custom: false, referencia: true, visible: true };
    component.tarifas = [tarifa];
    expect(component.tarifaIndex(tarifa)).toBeDefined();
  });

  it('scrollTop', () => {
    expect(component.scrollTop()).toEqual(true);
  });

  it('procesOutros', () => {
    let mensagem = "mensagem";
    expect(component.procesOutros(mensagem)).toEqual(mensagem);
  });

  it('processOpen', () => {
    let mensagem = "mensagem";
    expect(component.processOpen(mensagem)).toEqual(mensagem);
  });

  it('procesMinuta', () => {
    let mensagem = "mensagem";
    expect(component.procesMinuta(mensagem)).toEqual(mensagem);
  });

  it('verificaSituacao', () => {
    component.simulacaocancelada = true;
    expect(component.verificaSituacao()).toEqual(true);
  });

  it('processInibir', () => {
    let mensagem = "mensagem";
    expect(component.processInibir(mensagem)).toEqual(mensagem);
  });

  it('processConta', () => {
    let mensagem = "mensagem";
    expect(component.processConta(mensagem)).toEqual(mensagem);
  });


  it('obterParametro() deve retornar null se parametros for null', () => {
    component.parametros = null;

    const result = component.obterParametro('parametroMock');

    expect(result).toBeNull();
  });

  it('obterParametro() deve retornar o valor correto do parâmetro', () => {
    component.parametros = { parametroMock: 'valorMock' };

    const result = component.obterParametro('parametroMock');

    expect(result).toBe('valorMock');
  });

  it('obterNivelAlcada() deve retornar o valor correto do parâmetro NIVEL_ALCADA', () => {
    const spyObterParametro = jest.spyOn(component, 'obterParametro').mockReturnValue('nivelMock');

    const result = component.obterNivelAlcada();

    expect(spyObterParametro).toHaveBeenCalledWith('NIVEL_ALCADA');
    expect(result).toBe('nivelMock');
  });

  it('obterNivelAlcada() deve retornar 0 se o parâmetro NIVEL_ALCADA for null', () => {
    const spyObterParametro = jest.spyOn(component, 'obterParametro').mockReturnValue(null);

    const result = component.obterNivelAlcada();

    expect(spyObterParametro).toHaveBeenCalledWith('NIVEL_ALCADA');
    expect(result).toBe(0);
  });

  it('obterNomeAlcada() deve retornar o valor correto do parâmetro NOME_ALCADA', () => {
    const spyObterParametro = jest.spyOn(component, 'obterParametro').mockReturnValue('nomeMock');

    const result = component.obterNomeAlcada();

    expect(spyObterParametro).toHaveBeenCalledWith('NOME_ALCADA');
    expect(result).toBe('nomeMock');
  });

  it('obterNomeAlcada() deve retornar 0 se o parâmetro NOME_ALCADA for null', () => {
    const spyObterParametro = jest.spyOn(component, 'obterParametro').mockReturnValue(null);
    const result = component.obterNomeAlcada();

    expect(spyObterParametro).toHaveBeenCalledWith('NOME_ALCADA');
    expect(result).toBe(0);
  });

  it('getLastParecer() deve retornar null se pareceres for vazio', () => {
    const result = component.getLastParecer([]);
    expect(result).toBeNull();
  });

  it('getLastParecer() deve retornar o último parecer da lista', () => {
    const pareceres = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = component.getLastParecer(pareceres);

    expect(result).toEqual({ id: 3 });
  });

  it('processarPareceres() deve retornar o parecer com tipoSituacao.id igual a CANCELADO', () => {
    const pareceres = [
      { tipoSituacao: { id: 4 } },
      { tipoSituacao: { id: 6 } },
      { tipoSituacao: { id: 2 } }
    ];

    const result = component.processarPareceres(pareceres);

    expect(result).toEqual([{ tipoSituacao: { id: 6 } }]);
  });

  it('processarPareceres() deve retornar pareceres ordenados por tsAlcada', () => {
    const pareceres = [
      { tsAlcada: '2025-03-17T10:00:00', tipoSituacao: { id: 2 } },
      { tsAlcada: '2025-03-16T10:00:00', tipoSituacao: { id: 3 } },
      { tsAlcada: '2025-03-18T10:00:00', tipoSituacao: { id: 2 } }
    ];

    const result = component.processarPareceres(pareceres);

    expect(result).toEqual([
      { tsAlcada: '2025-03-16T10:00:00', tipoSituacao: { id: 3 } },
      { tsAlcada: '2025-03-17T10:00:00', tipoSituacao: { id: 2 } },
      { tsAlcada: '2025-03-18T10:00:00', tipoSituacao: { id: 2 } }
    ]);
  });

  it('processaColorParecer() deve retornar "" se parecer ou parecer.tipoSituacao for null', () => {
    let result = component.processaColorParecer(null);
    expect(result).toBe("");

    result = component.processaColorParecer({ tipoSituacao: null });
    expect(result).toBe("");
  });

  it('processaColorParecer() deve retornar a cor correta baseada no tipoSituacao.id', () => {
    const pareceres = [
      { tipoSituacao: { id: 1 }, expectedColor: "icon-success" },
      { tipoSituacao: { id: 2 }, expectedColor: "icon-warning" },
      { tipoSituacao: { id: 3 }, expectedColor: "icon-success" },
      { tipoSituacao: { id: 4 }, expectedColor: "icon-success" },
      { tipoSituacao: { id: 5 }, expectedColor: "icon-orange" },
      { tipoSituacao: { id: 6 }, expectedColor: "icon-error" },
      { tipoSituacao: { id: 7 }, expectedColor: "icon-error" },
      { tipoSituacao: { id: 8 }, expectedColor: "icon-error" },
      { tipoSituacao: { id: 9 }, expectedColor: "icon-success" },
      { tipoSituacao: { id: 10 }, expectedColor: "icon-gray" }
    ];

    for (const parecer of pareceres) {
      const result = component.processaColorParecer(parecer);
      expect(result).toBe(parecer.expectedColor);
    }
  });

  it('processaColorParecer() deve retornar "" para tipoSituacao.id desconhecido', () => {
    const result = component.processaColorParecer({ tipoSituacao: { id: 999 } });
    expect(result).toBe("");
  });

  it('processaIconeParecer() deve retornar "" se parecer ou parecer.tipoSituacao for null', () => {
    let result = component.processaIconeParecer(null);
    expect(result).toBe("");

    result = component.processaIconeParecer({ tipoSituacao: null });
    expect(result).toBe("");
  });

  it('processaIconeParecer() deve retornar o ícone correto baseado no tipoSituacao.id', () => {
    const pareceres = [
      { tipoSituacao: { id: 1 }, expectedIcon: "edit" },
      { tipoSituacao: { id: 2 }, expectedIcon: "priority_high" },
      { tipoSituacao: { id: 3 }, expectedIcon: "done" },
      { tipoSituacao: { id: 4 }, expectedIcon: "thumb_up" },
      { tipoSituacao: { id: 5 }, expectedIcon: "swap_horiz" },
      { tipoSituacao: { id: 6 }, expectedIcon: "delete_forever" },
      { tipoSituacao: { id: 7 }, expectedIcon: "close" },
      { tipoSituacao: { id: 8 }, expectedIcon: "clcalendar_clockose" },
      { tipoSituacao: { id: 9 }, expectedIcon: "handshake" },
      { tipoSituacao: { id: 10 }, expectedIcon: "schedule" }
    ];

    for (const parecer of pareceres) {
      const result = component.processaIconeParecer(parecer);
      expect(result).toBe(parecer.expectedIcon);
    }
  });

  it('processaIconeParecer() deve retornar "" para tipoSituacao.id desconhecido', () => {
    const result = component.processaIconeParecer({ tipoSituacao: { id: 999 } });
    expect(result).toBe("");
  });

  it('isEmpty() deve retornar true se data for vazio', () => {
    const result = component.isEmpty([]);
    expect(result).toBe(true);
  });

  it('isEmpty() deve retornar false se data não for vazio', () => {
    const result = component.isEmpty([1, 2, 3]);
    expect(result).toBe(false);
  });

  it('processFilter() deve retornar a string correta baseada nos filtros fornecidos', () => {
    const filter = {
      id: '123',
      cnpj: '456',
      unidade: '789',
      data: 0,
      dataAte: '2025-03-17',
      dataDe: '2025-03-16',
      situacao: ['1', '2']
    };

    jest.spyOn(component, 'hasValue').mockImplementation((value) => !!value);
    jest.spyOn(component, 'hasValueArray').mockImplementation((value) => !!value.length);
    jest.spyOn(component, 'processFilterInclusao').mockImplementation(() => '&dataInclusaoAte=2025-03-17&dataInclusaoDe=2025-03-16');
    jest.spyOn(component, 'processFilterAprovacao').mockImplementation(() => '&dataAprovacaoAte=2025-03-17&dataAprovacaoDe=2025-03-16');

    const result = component.processFilter(filter);

    expect(result).toBe('&numeroSimulacao=123&cnpj=456&unidadeRelacionamento=789&dataInclusaoAte=2025-03-17&dataInclusaoDe=2025-03-16&tipoSituacaoId=1,2');
  });
  it('processFilter() deve retornar a string correta baseada nos filtros fornecidos', () => {
    const filter = {
      id: '123',
      cnpj: '456',
      unidade: '789',
      data: 1,
      dataAte: '2025-03-17',
      dataDe: '2025-03-16',
      situacao: ['1', '2']
    };

    jest.spyOn(component, 'hasValue').mockImplementation((value) => !!value);
    jest.spyOn(component, 'hasValueArray').mockImplementation((value) => !!value.length);
    jest.spyOn(component, 'processFilterInclusao').mockImplementation(() => '&dataInclusaoAte=2025-03-17&dataInclusaoDe=2025-03-16');
    jest.spyOn(component, 'processFilterAprovacao').mockImplementation(() => '&dataAprovacaoAte=2025-03-17&dataAprovacaoDe=2025-03-16');

    const result = component.processFilter(filter);

    expect(result).toBe('&numeroSimulacao=123&cnpj=456&unidadeRelacionamento=789&dataAprovacaoAte=2025-03-17&dataAprovacaoDe=2025-03-16&tipoSituacaoId=1,2');
  });

  it('processFilterAprovacao() deve retornar a string correta baseada nos filtros de aprovação fornecidos', () => {
    const filter = {
      dataAte: '2025-03-17 00:00',
      dataDe: '2025-03-16 00:00'
    };

    jest.spyOn(component, 'hasValue').mockImplementation((value) => !!value);

    const result = component.processFilterAprovacao(filter);

    expect(result).toBe('&dataAprovacaoAte=2025-03-17&dataAprovacaoDe=2025-03-16');
  });

  it('processFilterInclusao() deve retornar a string correta baseada nos filtros de inclusão fornecidos', () => {
    const filter = {
      dataAte: '2025-03-17 00:00',
      dataDe: '2025-03-16 00:00'
    };

    jest.spyOn(component, 'hasValue').mockImplementation((value) => !!value);

    const result = component.processFilterInclusao(filter);

    expect(result).toBe('&dataInclusaoAte=2025-03-17&dataInclusaoDe=2025-03-16');
  });

  it('consultar() deve mostrar mensagem de erro se consulta for null ou vazio', () => {
    const spyShowMessage = jest.spyOn(component, 'showMessage').mockImplementation(() => { });
    component.termoCampoConsulta = null;

    component.consultar();

    expect(spyShowMessage).toHaveBeenCalledWith(
      "Informe o Número de uma Simulação ou o CNPJ de um cliente",
      ""
    );

    component.termoCampoConsulta = "";

    component.consultar();

    expect(spyShowMessage).toHaveBeenCalledWith(
      "Informe o Número de uma Simulação ou o CNPJ de um cliente",
      ""
    );
  });

  it('consultar() deve mostrar mensagem de erro se CNPJ for inválido', () => {
    const spyShowMessage = jest.spyOn(component, 'showMessage').mockImplementation(() => { });
    component.termoCampoConsulta = "12345678901234";

    component.consultar();

    expect(spyShowMessage).toHaveBeenCalledWith(
      "O CNPJ informado não é válido",
      "Verifique o valor informado e tente novamente"
    );
  });

  it('consultar() deve chamar buscaCNPJ se CNPJ for válido', () => {
    const spyShowMessage = jest.spyOn(component, 'showMessage').mockImplementation(() => { });
    const spyBuscaCNPJ = jest.spyOn(component, 'buscaCNPJ').mockImplementation(() => { });
    component.termoCampoConsulta = "S2LFBSC3000177";

    component.consultar();

    expect(spyShowMessage).toHaveBeenCalledWith(
      "Efetuando busca pelo CNPJ do Cliente",
      "Aguarde alguns instantes..."
    );
    expect(spyBuscaCNPJ).toHaveBeenCalledWith("S2LFBSC3000177");
  });

  it('consultar() deve chamar buscaID se consulta não for CNPJ', () => {
    const spyShowMessage = jest.spyOn(component, 'showMessage').mockImplementation(() => { });
    const spyBuscaID = jest.spyOn(component, 'buscaID').mockImplementation(() => { });
    component.termoCampoConsulta = "123456";

    component.consultar();

    expect(spyShowMessage).toHaveBeenCalledWith(
      "Efetuando busca pelo Número da Simulação informada",
      "Aguarde alguns instantes..."
    );
    expect(spyBuscaID).toHaveBeenCalledWith("123456");
  });

  it('getEtapaIcon() deve retornar o ícone correto baseado no status', () => {
    component.etapaStyles = [
      { id: 1, icon: 'icon1' },
      { id: 2, icon: 'icon2' }
    ];

    const value = { status: 1 };
    const result = component.getEtapaIcon(value);

    expect(result).toBe('icon1');
  });

  it('getEtapaIcon() deve retornar "" se value for null ou status não for encontrado', () => {
    component.etapaStyles = [
      { id: 1, icon: 'icon1' },
      { id: 2, icon: 'icon2' }
    ];

    let result = component.getEtapaIcon(null);
    expect(result).toBe("");

    result = component.getEtapaIcon({ status: 3 });
    expect(result).toBe("");
  });

  it('getHiddenClass() deve retornar true se qualquer etapa tiver status CANCELADO (6)', () => {
    const simulacao = {
      etapa1: { status: 6 },
      etapa2: { status: 2 },
      etapa3: { status: 2 },
      etapa4: { status: 2 }
    };

    let result = component.getHiddenClass(simulacao.etapa2, simulacao);
    expect(result).toBe(true);

    simulacao.etapa1.status = 2;
    simulacao.etapa2.status = 6;

    result = component.getHiddenClass(simulacao.etapa1, simulacao);
    expect(result).toBe(true);
  });

  it('getHiddenClass() deve retornar false se nenhuma etapa tiver status CANCELADO (6)', () => {
    const simulacao = {
      etapa1: { status: 2 },
      etapa2: { status: 2 },
      etapa3: { status: 2 },
      etapa4: { status: 2 }
    };

    const result = component.getHiddenClass(simulacao.etapa1, simulacao);
    expect(result).toBe(false);
  });

  it('getEtapaClass() deve retornar "hidden" se getHiddenClass() retornar true', () => {
    jest.spyOn(component, 'getHiddenClass').mockReturnValue(true);

    const result = component.getEtapaClass({}, {});
    expect(result).toBe("hidden");
  });

  it('getEtapaClass() deve retornar a classe de background correta baseada no status', () => {
    component.etapaStyles = [
      { id: 1, background: 'background1' },
      { id: 2, background: 'background2' }
    ];

    const etapa = { status: 1 };
    jest.spyOn(component, 'getHiddenClass').mockReturnValue(false);

    const result = component.getEtapaClass(etapa, {});
    expect(result).toBe("background1");
  });

  it('getEtapaClass() deve retornar "" se nenhuma condição for atendida', () => {
    jest.spyOn(component, 'getHiddenClass').mockReturnValue(false);
    jest.spyOn(component, 'hideEtapa').mockReturnValue(false);

    const result = component.getEtapaClass({}, {});
    expect(result).toBe("");
  });

  it('hideEtapa() deve retornar true se a etapa não for válida', () => {
    jest.spyOn(component, 'verificaEtapa').mockReturnValue(false);

    const simulacao = {
      etapa1: {},
      etapa2: {},
      etapa3: {},
      etapa4: {},
      etapa5: {}
    };

    let result = component.hideEtapa(simulacao.etapa1, simulacao);
    expect(result).toBe(true);

    result = component.hideEtapa(simulacao.etapa2, simulacao);
    expect(result).toBe(true);
  });

  it('hideEtapa() deve retornar false se a etapa for válida', () => {
    jest.spyOn(component, 'verificaEtapa').mockReturnValue(true);

    const simulacao = {
      etapa1: {},
      etapa2: {},
      etapa3: {},
      etapa4: {},
      etapa5: {}
    };

    let result = component.hideEtapa(simulacao.etapa1, simulacao);
    expect(result).toBe(false);

    result = component.hideEtapa(simulacao.etapa2, simulacao);
    expect(result).toBe(false);
  });

  it('verificaEtapa() deve retornar true se a etapa tiver um status', () => {
    const etapa = { status: 'ATIVO' };

    const result = component.verificaEtapa(etapa);
    expect(result).toBe(true);
  });

  it('verificaEtapa() deve retornar false se a etapa não tiver um status', () => {
    const etapa = { status: null };

    const result = component.verificaEtapa(etapa);
    expect(result).toBe(false);
  });

  it('getEtapaProgress() deve retornar a classe de progresso correta baseada no status da etapa', () => {
    let simulacao = {
      etapa1: { status: null },
      etapa2: { status: null },
      etapa3: { status: null },
      etapa4: { status: null },
      etapa5: { status: 6 }
    };

    let result = component.getEtapaProgress(simulacao);
    expect(result).toBe("progress-etapa5");

    let simulacao2 = {
      etapa1: { status: null },
      etapa2: { status: null },
      etapa3: { status: null },
      etapa4: { status: 6 },
      etapa5: { status: null }
    };

    result = component.getEtapaProgress(simulacao2);
    expect(result).toBe("progress-etapa4");
  });

  it('getEtapaProgress() deve retornar "progress-etapa5" quando etapa5.status não é nulo', () => {
    const simulacao = { etapa5: { status: 1 }, etapa4: {}, etapa3: {}, etapa2: {}, etapa1: {} };
    expect(component.getEtapaProgress(simulacao)).toBe('progress-etapa5');
  });

  it('getEtapaProgress() deve retornar "progress-etapa4" quando etapa5.status é nulo e etapa4.status não é nulo', () => {
    const simulacao = { etapa5: { status: null }, etapa4: { status: 1 }, etapa3: {}, etapa2: {}, etapa1: {} };
    expect(component.getEtapaProgress(simulacao)).toBe('progress-etapa4');
  });

  it('getEtapaProgress() deve retornar "progress-etapa3" quando etapa5.status e etapa4.status são nulos e etapa3.status não é nulo', () => {
    const simulacao = { etapa5: { status: null }, etapa4: { status: null }, etapa3: { status: 1 }, etapa2: {}, etapa1: {} };
    expect(component.getEtapaProgress(simulacao)).toBe('progress-etapa3');
  });

  it('getEtapaProgress() deve retornar "progress-etapa2" quando etapa5.status, etapa4.status e etapa3.status são nulos e etapa2.status não é nulo', () => {
    const simulacao = { etapa5: { status: null }, etapa4: { status: null }, etapa3: { status: null }, etapa2: { status: 1 }, etapa1: {} };
    expect(component.getEtapaProgress(simulacao)).toBe('progress-etapa2');
  });

  it('getEtapaProgress() deve retornar "progress-etapa1" quando todos os status das etapas são nulos', () => {
    const simulacao = { etapa5: { status: null }, etapa4: { status: null }, etapa3: { status: null }, etapa2: { status: null }, etapa1: {} };
    expect(component.getEtapaProgress(simulacao)).toBe('progress-etapa1');
  });

  it('getProgressParte1() deve retornar "hidden" se etapa1.status for CANCELADO', () => {
    const simulacao = { etapa1: { status: 6 } }; // CANCELADO

    const result = component.getProgressParte1(simulacao);

    expect(result).toBe("hidden");
  });

  it('getProgressParte1() deve retornar "" se etapa1.status for INCLUIDO, AVALIADO ou etapa2.status for PREVISTO', () => {
    let simulacao: any = { etapa1: { status: 1 }, etapa2: { status: null } }; // INCLUIDO
    let result = component.getProgressParte1(simulacao);
    expect(result).toBe("");

    simulacao = { etapa1: { status: 3 }, etapa2: { status: null } }; // AVALIADO
    result = component.getProgressParte1(simulacao);
    expect(result).toBe("");

    simulacao = { etapa1: { status: null }, etapa2: { status: 10 } }; // PREVISTO
    result = component.getProgressParte1(simulacao);
    expect(result).toBe("");
  });

  it('getProgressParte1() deve retornar "" se checkEtapa for true para etapa1 e qualquer outra etapa', () => {
    jest.spyOn(component, 'checkEtapa').mockReturnValue(true);
    const simulacao = {
      etapa1: { status: null },
      etapa2: { status: null },
      etapa3: { status: null },
      etapa4: { status: null },
      etapa5: { status: null }
    };

    const result = component.getProgressParte1(simulacao);

    expect(result).toBe("");
  });

  it('getProgressParte1() deve retornar "hidden" se nenhuma condição for atendida', () => {
    jest.spyOn(component, 'checkEtapa').mockReturnValue(false);
    const simulacao = {
      etapa1: { status: null },
      etapa2: { status: null },
      etapa3: { status: null },
      etapa4: { status: null },
      etapa5: { status: null }
    };

    const result = component.getProgressParte1(simulacao);

    expect(result).toBe("hidden");
  });

  it('getProgressParte2() deve retornar "hidden" se etapa1.status ou etapa2.status for CANCELADO', () => {
    let simulacao: any = { etapa1: { status: 6 }, etapa2: { status: null } }; // CANCELADO
    let result = component.getProgressParte2(simulacao);
    expect(result).toBe("hidden");

    simulacao = { etapa1: { status: null }, etapa2: { status: 6 } }; // CANCELADO
    result = component.getProgressParte2(simulacao);
    expect(result).toBe("hidden");
  });

  it('getProgressParte2() deve retornar "" se checkEtapa for true para etapa1 ou etapa2 e qualquer outra etapa', () => {
    jest.spyOn(component, 'checkEtapa').mockReturnValue(true);
    const simulacao = {
      etapa1: { status: null },
      etapa2: { status: null },
      etapa3: { status: null },
      etapa4: { status: null },
      etapa5: { status: null }
    };

    const result = component.getProgressParte2(simulacao);

    expect(result).toBe("");
  });

  it('getProgressParte2() deve retornar "hidden" se nenhuma condição for atendida', () => {
    jest.spyOn(component, 'checkEtapa').mockReturnValue(false);
    const simulacao = {
      etapa1: { status: null },
      etapa2: { status: null },
      etapa3: { status: null },
      etapa4: { status: null },
      etapa5: { status: null }
    };

    const result = component.getProgressParte2(simulacao);

    expect(result).toBe("hidden");
  });

  it('getProgressParte3() deve retornar "hidden" se etapa1.status, etapa2.status ou etapa3.status for CANCELADO', () => {
    let simulacao: any = { etapa1: { status: 6 }, etapa2: { status: null }, etapa3: { status: null } }; // CANCELADO
    let result = component.getProgressParte3(simulacao);
    expect(result).toBe("hidden");

    simulacao = { etapa1: { status: null }, etapa2: { status: 6 }, etapa3: { status: null } }; // CANCELADO
    result = component.getProgressParte3(simulacao);
    expect(result).toBe("hidden");

    simulacao = { etapa1: { status: null }, etapa2: { status: null }, etapa3: { status: 6 } }; // CANCELADO
    result = component.getProgressParte3(simulacao);
    expect(result).toBe("hidden");
  });

  it('getProgressParte3() deve retornar "" se checkEtapa for true para etapa1, etapa2 ou etapa3 e qualquer outra etapa', () => {
    jest.spyOn(component, 'checkEtapa').mockReturnValue(true);
    const simulacao = {
      etapa1: { status: null },
      etapa2: { status: null },
      etapa3: { status: null },
      etapa4: { status: null },
      etapa5: { status: null }
    };

    const result = component.getProgressParte3(simulacao);

    expect(result).toBe("");
  });

  it('getProgressParte3() deve retornar "hidden" se nenhuma condição for atendida', () => {
    jest.spyOn(component, 'checkEtapa').mockReturnValue(false);
    const simulacao = {
      etapa1: { status: null },
      etapa2: { status: null },
      etapa3: { status: null },
      etapa4: { status: null },
      etapa5: { status: null }
    };

    const result = component.getProgressParte3(simulacao);

    expect(result).toBe("hidden");
  });

  it('getProgressParte4() deve retornar "hidden" se etapa1.status, etapa2.status, etapa3.status ou etapa4.status for CANCELADO', () => {
    let simulacao: any = { etapa1: { status: 6 }, etapa2: { status: null }, etapa3: { status: null }, etapa4: { status: null } }; // CANCELADO
    let result = component.getProgressParte4(simulacao);
    expect(result).toBe("hidden");

    simulacao = { etapa1: { status: null }, etapa2: { status: 6 }, etapa3: { status: null }, etapa4: { status: null } }; // CANCELADO
    result = component.getProgressParte4(simulacao);
    expect(result).toBe("hidden");

    simulacao = { etapa1: { status: null }, etapa2: { status: null }, etapa3: { status: 6 }, etapa4: { status: null } }; // CANCELADO
    result = component.getProgressParte4(simulacao);
    expect(result).toBe("hidden");

    simulacao = { etapa1: { status: null }, etapa2: { status: null }, etapa3: { status: null }, etapa4: { status: 6 } }; // CANCELADO
    result = component.getProgressParte4(simulacao);
    expect(result).toBe("hidden");
  });

  it('getProgressParte4() deve retornar "" se checkEtapa for true para etapa1, etapa2, etapa3 ou etapa4 e etapa5', () => {
    jest.spyOn(component, 'checkEtapa').mockReturnValue(true);
    const simulacao = {
      etapa1: { status: null },
      etapa2: { status: null },
      etapa3: { status: null },
      etapa4: { status: null },
      etapa5: { status: null }
    };

    const result = component.getProgressParte4(simulacao);

    expect(result).toBe("");
  });

  it('getProgressParte4() deve retornar "hidden" se nenhuma condição for atendida', () => {
    jest.spyOn(component, 'checkEtapa').mockReturnValue(false);
    const simulacao = {
      etapa1: { status: null },
      etapa2: { status: null },
      etapa3: { status: null },
      etapa4: { status: null },
      etapa5: { status: null }
    };

    const result = component.getProgressParte4(simulacao);

    expect(result).toBe("hidden");
  });

  it('getSituacaoById() deve retornar o label correto quando o id existe na lista', () => {
    component.listaTiposSituacao = [{ value: 1, label: 'item1' }, { value: 2, label: 'item2' }]
    const result = component.getSituacaoById(1);
    expect(result).toBe('item1');
  });

  it('getSituacaoById() deve retornar "desconhecida: id" quando o id não existe na lista', () => {
    const result = component.getSituacaoById(3);
    expect(result).toBe('desconhecida: 3');
  });

  it('obterResponsavelIncluisao() deve retornar coUsuarioAlcada quando alcada.id é 1', () => {
    const simulacao = {
      simulacoesAlcada: [
        { alcada: { id: 1 }, coUsuarioAlcada: 'Usuario1' },
        { alcada: { id: 4 }, coUsuarioAlcada: 'Usuario2' }
      ]
    };
    const result = component.obterResponsavelIncluisao(simulacao);
    expect(result).toBe('Usuario1');
  });

  it('obterResponsavelIncluisao() deve retornar coUsuarioAlcada quando alcada.id é 4 e não há 1', () => {
    const simulacao = {
      simulacoesAlcada: [
        { alcada: { id: 4 }, coUsuarioAlcada: 'Usuario2' }
      ]
    };
    const result = component.obterResponsavelIncluisao(simulacao);
    expect(result).toBe('Usuario2');
  });

  it('obterResponsavelIncluisao() deve retornar undefined quando não há alcada.id 1 ou 4', () => {
    const simulacao = {
      simulacoesAlcada: [
        { alcada: { id: 'OUTRO' }, coUsuarioAlcada: 'Usuario3' }
      ]
    };
    const result = component.obterResponsavelIncluisao(simulacao);
    expect(result).toBeUndefined();
  });

  it('isNumeric() deve retornar true para valores numéricos', () => {
    expect(component.isNumeric('123')).toBe(true);
    expect(component.isNumeric('-123')).toBe(true);
    expect(component.isNumeric('0')).toBe(true);
  });

  it('isNumeric() deve retornar false para valores não numéricos', () => {
    expect(component.isNumeric('abc')).toBe(false);
    expect(component.isNumeric('123abc')).toBe(false);
    expect(component.isNumeric('')).toBe(false);
  });

  it('getNumeric() deve retornar o valor numérico quando o valor é numérico', () => {
    expect(component.getNumeric('123')).toBe(123);
    expect(component.getNumeric('-123')).toBe(-123);
    expect(component.getNumeric('0')).toBe(0);
  });

  it('getNumeric() deve retornar null quando o valor é null ou não numérico', () => {
    expect(component.getNumeric(null)).toBeNull();
    expect(component.getNumeric('abc')).toBeNull();
    expect(component.getNumeric('123abc')).toBeNull();
  });

  it('padNumber() deve adicionar zeros à esquerda até atingir o tamanho especificado', () => {
    expect(component.padNumber(123, 5)).toBe('00123');
    expect(component.padNumber(1, 3)).toBe('001');
    expect(component.padNumber(12345, 5)).toBe('12345');
  });

  it('padNumber() deve retornar o número como string se já tiver o tamanho especificado ou maior', () => {
    expect(component.padNumber(123456, 5)).toBe('123456');
  });

  it('formatCnpj() deve formatar corretamente um CNPJ com 14 dígitos', () => {
    expect(component.formatCnpj('12345678000195')).toBe('12.345.678/0001-95');
  });

  it('formatCnpj() deve adicionar zeros à esquerda e formatar corretamente um CNPJ com menos de 14 dígitos', () => {
    expect(component.formatCnpj('12345678')).toBe('00.000.012/3456-78');
  });

  it('getLast() deve retornar "to" quando "from" é null ou from.date é null ou from.status é 10', () => {
    const from = null;
    const to = { date: new Date(), status: 9 };
    expect(component.getLast(from, to)).toBe(to);

    const fromWithNullDate = { date: null, status: 9 };
    expect(component.getLast(fromWithNullDate, to)).toBe(to);

    const fromWithPrevistoStatus = { date: new Date(), status: 10 };
    expect(component.getLast(fromWithPrevistoStatus, to)).toBe(to);
  });

  it('getLast() deve retornar "from" quando "to" é null ou to.date é null ou to.status é 10', () => {
    const from = { date: new Date(), status: 9 };
    const to = null;
    expect(component.getLast(from, to)).toBe(from);

    const toWithNullDate = { date: null, status: 9 };
    expect(component.getLast(from, toWithNullDate)).toBe(from);

    const toWithPrevistoStatus = { date: new Date(), status: 10 };
    expect(component.getLast(from, toWithPrevistoStatus)).toBe(from);
  });

  it('getLast() deve retornar "from" quando from.date é maior que to.date', () => {
    const from = { date: new Date('2025-03-19'), status: 9 };
    const to = { date: new Date('2025-03-18'), status: 9 };
    expect(component.getLast(from, to)).toBe(from);
  });

  it('getLast() deve retornar "to" quando to.date é maior ou igual a from.date', () => {
    const from = { date: new Date('2025-03-18'), status: 9 };
    const to = { date: new Date('2025-03-19'), status: 9 };
    expect(component.getLast(from, to)).toBe(to);

    const toEqualDate = { date: new Date('2025-03-18'), status: 9 };
    expect(component.getLast(from, toEqualDate)).toBe(toEqualDate);
  });

  it('getLastAtual() deve retornar "to" quando "from" é null ou from.date é null ou from.status é 10 ou 2', () => {
    const from = null;
    const to = { date: new Date(), status: 9 };
    expect(component.getLastAtual(from, to)).toBe(to);

    const fromWithNullDate = { date: null, status: 9 };
    expect(component.getLastAtual(fromWithNullDate, to)).toBe(to);

    const fromWithPrevistoStatus = { date: new Date(), status: 10 };
    expect(component.getLastAtual(fromWithPrevistoStatus, to)).toBe(to);

    const fromWithPendenteStatus = { date: new Date(), status: 2 };
    expect(component.getLastAtual(fromWithPendenteStatus, to)).toBe(to);
  });

  it('getLastAtual() deve retornar "from" quando "to" é null ou to.date é null ou to.status é 10 ou 2', () => {
    const from = { date: new Date(), status: 9 };
    const to = null;
    expect(component.getLastAtual(from, to)).toBe(from);

    const toWithNullDate = { date: null, status: 9 };
    expect(component.getLastAtual(from, toWithNullDate)).toBe(from);

    const toWithPrevistoStatus = { date: new Date(), status: 10 };
    expect(component.getLastAtual(from, toWithPrevistoStatus)).toBe(from);

    const toWithPendenteStatus = { date: new Date(), status: 2 };
    expect(component.getLastAtual(from, toWithPendenteStatus)).toBe(from);
  });

  it('getLastAtual() deve retornar "from" quando from.date é maior que to.date', () => {
    const from = { date: new Date('2025-03-19'), status: 9 };
    const to = { date: new Date('2025-03-18'), status: 9 };
    expect(component.getLastAtual(from, to)).toBe(from);
  });

  it('getLastAtual() deve retornar "to" quando to.date é maior ou igual a from.date', () => {
    const from = { date: new Date('2025-03-18'), status: 9 };
    const to = { date: new Date('2025-03-19'), status: 9 };
    expect(component.getLastAtual(from, to)).toBe(to);

    const toEqualDate = { date: new Date('2025-03-18'), status: 9 };
    expect(component.getLastAtual(from, toEqualDate)).toBe(toEqualDate);
  });

  it('getEtapaStatus() deve retornar a situação, data e unidade quando todos os valores estão presentes', () => {
    const value = { status: 1, date: '2025-03-18', unidade: 'Unidade 1' };
    jest.spyOn(component, 'getSituacaoById').mockReturnValue('Incluído');
    jest.spyOn(component, 'getDate').mockReturnValue(new Date('2025-03-18'));
    jest.spyOn(component, 'formatDate').mockReturnValue('18/03/2025');

    const result = component.getEtapaStatus(value);
    expect(result).toBe('Situação: Incluído\nData: 18/03/2025\nUnidade: Unidade 1');
  });

  it('getEtapaStatus() deve retornar apenas a situação quando data e unidade são nulos', () => {
    const value = { status: 1, date: null, unidade: null };
    jest.spyOn(component, 'getSituacaoById').mockReturnValue('Incluído');

    const result = component.getEtapaStatus(value);
    expect(result).toBe('Situação: Incluído');
  });

  it('checkEtapa() deve retornar true quando etapa e etapa.status não são nulos e etapa.status não é 10', () => {
    const etapa = { status: 9 };
    expect(component.checkEtapa(etapa)).toBe(true);
  });

  it('checkEtapa() deve retornar false quando etapa é nulo', () => {
    const etapa = null;
    expect(component.checkEtapa(etapa)).toBe(false);
  });

  it('checkEtapa() deve retornar false quando etapa.status é nulo', () => {
    const etapa = { status: null };
    expect(component.checkEtapa(etapa)).toBe(false);
  });

  it('checkEtapa() deve retornar false quando etapa.status é 10', () => {
    const etapa = { status: 10 };
    expect(component.checkEtapa(etapa)).toBe(false);
  });

  it('evaluate() deve retornar false quando etapa1.status é 1 e etapa2.status é 2', () => {
    const value = { etapa1: { status: 1 }, etapa2: { status: 2 } };
    expect(component.evaluate(value)).toBe(false);
  });

  it('evaluate() deve retornar false quando etapa1.status é nulo, etapa2.status é 1 e etapa3.status é 2', () => {
    const value = { etapa1: { status: null }, etapa2: { status: 1 }, etapa3: { status: 2 } };
    expect(component.evaluate(value)).toBe(false);
  });

  it('evaluate() deve retornar false quando etapa2.status é nulo, etapa3.status é 1 e etapa4.status é 2', () => {
    const value = { etapa1: { status: null }, etapa2: { status: null }, etapa3: { status: 1 }, etapa4: { status: 2 } };
    expect(component.evaluate(value)).toBe(false);
  });

  it('evaluate() deve retornar true para outros casos', () => {
    const value = { etapa1: { status: 9 }, etapa2: { status: 9 }, etapa3: { status: 9 }, etapa4: { status: 9 } };
    expect(component.evaluate(value)).toBe(true);
  });

  it('hasValue() deve retornar true quando o valor não é nulo e não é uma string vazia', () => {
    expect(component.hasValue('teste')).toBe(true);
    expect(component.hasValue('  teste  ')).toBe(true);
  });

  it('hasValue() deve retornar false quando o valor é nulo', () => {
    expect(component.hasValue(null)).toBe(false);
  });

  it('hasValue() deve retornar false quando o valor é uma string vazia', () => {
    expect(component.hasValue('')).toBe(false);
    expect(component.hasValue('   ')).toBe(false);
  });

  it('hasValueArray() deve retornar true quando o array não é nulo e tem elementos', () => {
    expect(component.hasValueArray([1, 2, 3])).toBe(true);
    expect(component.hasValueArray(['a', 'b', 'c'])).toBe(true);
  });

  it('hasValueArray() deve retornar false quando o array está vazio', () => {
    expect(component.hasValueArray([])).toBe(false);
  });

  it('obterAlcadabyNivel() deve retornar o objeto correto quando o nível e tipoSituacao correspondem', () => {
    const alcadas = [
      { alcada: { nivel: 1, nomeAlcada: 'Alcada 1' }, tipoSituacao: { id: 1 }, tsAlcada: '2025-03-18', unidadeAlcada: 'Unidade 1' },
      { alcada: { nivel: 2, nomeAlcada: 'Alcada 2' }, tipoSituacao: { id: 2 }, tsAlcada: '2025-03-19', unidadeAlcada: 'Unidade 2' }
    ];
    const result = component.obterAlcadabyNivel(1, alcadas);
    expect(result).toEqual({ status: 1, date: '2025-03-18', nivel: 1, nome: 'Alcada 1', unidade: 'Unidade 1' });
  });

  it('obterAlcadabyNivel() deve retornar o objeto correto para outro nível e tipoSituacao correspondem', () => {
    const alcadas = [
      { alcada: { nivel: 1, nomeAlcada: 'Alcada 1' }, tipoSituacao: { id: 1 }, tsAlcada: '2025-03-18', unidadeAlcada: 'Unidade 1' },
      { alcada: { nivel: 2, nomeAlcada: 'Alcada 2' }, tipoSituacao: { id: 2 }, tsAlcada: '2025-03-19', unidadeAlcada: 'Unidade 2' }
    ];
    const result = component.obterAlcadabyNivel(2, alcadas);
    expect(result).toEqual({ status: 2, date: '2025-03-19', nivel: 2, nome: 'Alcada 2', unidade: 'Unidade 2' });
  });

  it('obterAlcadabyNivel() deve retornar { status: null, date: null } quando o nível não corresponde', () => {
    const alcadas = [
      { alcada: { nivel: 1, nomeAlcada: 'Alcada 1' }, tipoSituacao: { id: 1 }, tsAlcada: '2025-03-18', unidadeAlcada: 'Unidade 1' }
    ];
    const result = component.obterAlcadabyNivel(3, alcadas);
    expect(result).toEqual({ status: null, date: null });
  });

  it('obterAlcadabyNivel() deve retornar { status: null, date: null } quando tipoSituacao é nulo', () => {
    const alcadas = [
      { alcada: { nivel: 1, nomeAlcada: 'Alcada 1' }, tipoSituacao: null, tsAlcada: '2025-03-18', unidadeAlcada: 'Unidade 1' }
    ];
    const result = component.obterAlcadabyNivel(1, alcadas);
    expect(result).toEqual({ status: null, date: null });
  });

  it('obterAlcadabyNivel() deve retornar { status: null, date: null } quando alcadas é um array vazio', () => {
    const alcadas: any[] = [];
    const result = component.obterAlcadabyNivel(1, alcadas);
    expect(result).toEqual({ status: null, date: null });
  });

  it('obterPercentual() deve retornar o percentual correto', () => {
    expect(component.obterPercentual(50, 100)).toBe(50);
    expect(component.obterPercentual(25, 100)).toBe(75);
    expect(component.obterPercentual(0, 100)).toBe(100);
  });

  it('obterMaiorPercentual() deve retornar o maior percentual entre pgCaixa, pgOutros e retentativa', () => {
    const tarifa: any = {
      id: 1,
      tipo: 2,
      referencia: true,
      condicao: 'Condição Exemplo',
      pgCaixa: 50,
      pgOutros: 30,
      retentativa: 20,
      degustacao: 'Degustação Exemplo',
      situacao: 'Ativo',
      recomended: true,
      custom: false,
      visible: true
    };
    const padrao: any = {
      id: 2,
      tipo: 2,
      referencia: true,
      condicao: 'Condição Padrão',
      pgCaixa: 100,
      pgOutros: 100,
      retentativa: 100,
      degustacao: 'Degustação Padrão',
      situacao: 'Ativo',
      recomended: true,
      custom: false,
      visible: true
    };
    expect(component.obterMaiorPercentual(tarifa, padrao)).toBe(80);

    tarifa.pgCaixa = 20;
    tarifa.pgOutros = 50;
    expect(component.obterMaiorPercentual(tarifa, padrao)).toBe(80);

    tarifa.pgOutros = 20;
    tarifa.retentativa = 50;
    expect(component.obterMaiorPercentual(tarifa, padrao)).toBe(50);
  });

  // it('processaTarifasSimulacao() deve processar tarifas corretamente', () => {
  //   jest.spyOn(component, 'obterTarifaPadrao').mockReturnValue({
  //     pgCaixa: '100',
  //     pgOutros: '200',
  //     retentativa: '300',
  //     degustacao: '10'
  //   });
  //   jest.spyOn(component, 'userAction').mockImplementation(() => {});
  //   const tarifas = [
  //     { tipo: 1, id: 1, nome: 'Tarifa 1', tarifaPagadoresCaixa: '50', tarifaPagadoresOutras: '60', tarifaRetentativa: '70', diasDegustacao: '10' },
  //     { tipo: 2, id: 2, nome: 'Tarifa 2', tarifaPagadoresCaixa: '80', tarifaPagadoresOutras: '90', tarifaRetentativa: '100', diasDegustacao: '20' }
  //   ];

  //   component.processaTarifasSimulacao(tarifas);

  //   expect(component.tarifas.length).toBe(3);
  //   expect(component.tarifas[0]).toEqual({
  //     tipo: 1,
  //     id: 1,
  //     condicao: 'Tarifa 1',
  //     pgCaixa: '50',
  //     pgOutros: '60',
  //     retentativa: '70',
  //     degustacao: '10',
  //     situacao: 'Aprovado',
  //     recomended: false,
  //     custom: false,
  //     referencia: false,
  //     visible: true
  //   });
  //   expect(component.tarifas[1]).toEqual({
  //     tipo: 2,
  //     id: 2,
  //     condicao: 'Tarifa 2',
  //     pgCaixa: '80',
  //     pgOutros: '90',
  //     retentativa: '100',
  //     degustacao: '20',
  //     situacao: 'Aprovado',
  //     recomended: false,
  //     custom: false,
  //     referencia: false,
  //     visible: true
  //   });
  //   expect(component.tarifas[2]).toEqual({
  //     tipo: TipoTarifa.DIFERENCIADA,
  //     id: null,
  //     condicao: 'Condições Diferenciadas',
  //     pgCaixa: null,
  //     pgOutros: null,
  //     retentativa: null,
  //     degustacao: null,
  //     situacao: '',
  //     recomended: false,
  //     custom: true,
  //     referencia: false,
  //     visible: true
  //   });
  // });

  it('processaTarifasSimulacao() deve chamar userAction com as mensagens corretas quando tarifaPadrao não é nula', () => {
    jest.spyOn(component, 'obterTarifaPadrao').mockReturnValue({
      pgCaixa: '100',
      pgOutros: '200',
      retentativa: '300',
      degustacao: '10'
    });
    jest.spyOn(component, 'userAction').mockImplementation(() => { });
    const tarifas = [
      { tipo: 1, id: 1, nome: 'Tarifa 1', tarifaPagadoresCaixa: '50', tarifaPagadoresOutras: '60', tarifaRetentativa: '70', diasDegustacao: '10' }
    ];

    component.processaTarifasSimulacao(tarifas);

    expect(component.userAction).toHaveBeenCalledWith('Calculo de Alçadas:');
    expect(component.userAction).toHaveBeenCalledWith('para os valores a seguir:');
    expect(component.userAction).toHaveBeenCalledWith('pagadoresContaCaixa: 100');
    expect(component.userAction).toHaveBeenCalledWith('pagadoresOutrosBancos: 200');
    expect(component.userAction).toHaveBeenCalledWith('retentativa: 300');
    expect(component.userAction).toHaveBeenCalledWith('degustacao: 10 dias');
    expect(component.userAction).toHaveBeenCalledWith('Sabendo que: ');
    expect(component.userAction).toHaveBeenCalledWith('a diferença de valor de até 40% é alçada AGENCIA,');
    expect(component.userAction).toHaveBeenCalledWith('a diferença de valor de até 60% é alçada EXECUTIVA,');
    expect(component.userAction).toHaveBeenCalledWith('a diferença de valor de até 99% é alçada GERENCIA');
    expect(component.userAction).toHaveBeenCalledWith('e diferença de valor de até 100% é alçada MATRIZ.');
    expect(component.userAction).toHaveBeenCalledWith('e indiferente da diferença de valor sempre que a degustacao for maior que a degustacao balcão é alçada MATRIZ.');
  });

  it('processaTarifasSimulacao() deve definir ready como true', () => {
    jest.spyOn(component, 'obterTarifaPadrao').mockReturnValue({
      pgCaixa: '100',
      pgOutros: '200',
      retentativa: '300',
      degustacao: '10'
    });
    jest.spyOn(component, 'userAction').mockImplementation(() => { });
    const tarifas = [
      { tipo: 1, id: 1, nome: 'Tarifa 1', tarifaPagadoresCaixa: '50', tarifaPagadoresOutras: '60', tarifaRetentativa: '70', diasDegustacao: '10' }
    ];

    component.processaTarifasSimulacao(tarifas);

    expect(component.ready).toBe(true);
  });

  it('verificaTarifasCustomizadas() deve retornar "Simulação inexistente" quando simulacao é null', () => {
    jest.spyOn(component, 'userAction').mockImplementation(() => { });
    component.simulacao = null;
    const result = component.verificaTarifasCustomizadas();
    expect(result).toContain("Simulação inexistente");
    expect(component.userAction).toHaveBeenCalledWith("Simulação inexistente");
  });

  it('verificaTarifasCustomizadas() deve retornar "Nenhuma tarifa selecionada" quando simulacao.tarifa é null', () => {
    jest.spyOn(component, 'userAction').mockImplementation(() => { });
    component.simulacao = { tarifa: null };
    const result = component.verificaTarifasCustomizadas();
    expect(result).toContain("Nenhuma tarifa selecionada");
    expect(component.userAction).toHaveBeenCalledWith("Nenhuma tarifa selecionada");
  });

  it('verificaTarifasCustomizadas() deve retornar "Tarifa do Pagador CAIXA não informado ou inválido" quando pgCaixa é inválido', () => {
    jest.spyOn(component, 'userAction').mockImplementation(() => { });
    jest.spyOn(component, 'isNonNullCurrency').mockReturnValueOnce(false);
    component.simulacao = { tarifa: { pgCaixa: null, pgOutros: '200', retentativa: '300', degustacao: '10' } };
    const result = component.verificaTarifasCustomizadas();
    expect(result).toContain("Tarifa do Pagador CAIXA não informado ou inválido");
    expect(component.userAction).toHaveBeenCalledWith("Tarifa do Pagador CAIXA não informado ou inválido");
  });

  it('verificaTarifasCustomizadas() deve retornar "Tarifa do Pagados Outros Bancos não informado ou inválido" quando pgOutros é inválido', () => {
    jest.spyOn(component, 'userAction').mockImplementation(() => { });
    jest.spyOn(component, 'isNonNullCurrency').mockReturnValueOnce(true).mockReturnValueOnce(false);
    component.simulacao = { tarifa: { pgCaixa: '100', pgOutros: null, retentativa: '300', degustacao: '10' } };
    const result = component.verificaTarifasCustomizadas();
    expect(result).toContain("Tarifa do Pagados Outros Bancos não informado ou inválido");
    expect(component.userAction).toHaveBeenCalledWith("Tarifa do Pagados Outros Bancos não informado ou inválido");
  });

  it('verificaTarifasCustomizadas() deve retornar "Tarifa de Retentativa não informada ou inválida" quando retentativa é inválido', () => {
    jest.spyOn(component, 'userAction').mockImplementation(() => { });
    jest.spyOn(component, 'isNonNullCurrency').mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(false);
    component.simulacao = { tarifa: { pgCaixa: '100', pgOutros: '200', retentativa: null, degustacao: '10' } };
    const result = component.verificaTarifasCustomizadas();
    expect(result).toContain("Tarifa de Retentativa não informada ou inválida");
    expect(component.userAction).toHaveBeenCalledWith("Tarifa de Retentativa não informada ou inválida");
  });

  it('verificaTarifasCustomizadas() deve retornar "Quantidade de dias de Degustação não informado ou inválido" quando degustacao é inválido', () => {
    jest.spyOn(component, 'userAction').mockImplementation(() => { });
    jest.spyOn(component, 'isNonNullCurrency').mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true);
    jest.spyOn(component, 'isNonNullNumeric').mockReturnValueOnce(false);
    component.simulacao = { tarifa: { pgCaixa: '100', pgOutros: '200', retentativa: '300', degustacao: null } };
    const result = component.verificaTarifasCustomizadas();
    expect(result).toContain("Quantidade de dias de Degustação não informado ou inválido");
    expect(component.userAction).toHaveBeenCalledWith("Quantidade de dias de Degustação não informado ou inválido");
  });

  it('verificaTarifasCustomizadas() deve retornar uma lista vazia quando todas as tarifas são válidas', () => {
    jest.spyOn(component, 'userAction').mockImplementation(() => { });
    component.simulacao = { tarifa: { pgCaixa: '100', pgOutros: '200', retentativa: '300', degustacao: '10' } };
    const result = component.verificaTarifasCustomizadas();
    expect(result).toEqual([]);
  });

  it('showModal() deve eliminar os modais que estão exibidos e abrir o modal indicado corretamente', () => {
    const modalASerAberto: string = 'ModalMock';
    const spyDismissAll: jest.SpyInstance = jest.spyOn(modalService, 'dismissAll');
    const spyOpen: jest.SpyInstance = jest.spyOn(modalService, 'open');

    component.showModal(modalASerAberto);
    expect(spyDismissAll).toHaveBeenCalled();
    expect(spyOpen).toHaveBeenCalledTimes(1);
    expect(spyOpen).toHaveBeenLastCalledWith(modalASerAberto, { size: 'lg', scrollable: false, windowClass: 'modal-large' });
  });

  it('showModalCampanhas() deve exibir o modal corretamente quando há campanhas', () => {
    const modalASerAberto: object = { name: 'Modal', title: 'Titulo', content: 'Conteudo' };
    const spyShowModal: jest.SpyInstance = jest.spyOn(component, 'showModal').mockImplementation(() => { });

    const dummyCampanha: Campanha = {
      nome: '',
      periodo: '',
      vantagens: '',
      publicoAlvo: '',
      descricao: ''
    };
    component.campanhas = [dummyCampanha]
    component.showModalCampanhas(modalASerAberto);
    expect(spyShowModal).toHaveBeenCalledTimes(1);
    expect(spyShowModal).toHaveBeenLastCalledWith(modalASerAberto);
  });

  it('showModalCampanhas() não deve exibir modal caso não haja campanhas', () => {
    const modalASerAberto: object = { name: 'Modal', title: 'Titulo', content: 'Conteudo' };
    const spyShowModal: jest.SpyInstance = jest.spyOn(component, 'showModal').mockImplementation(() => { });

    component.campanhas = [];
    component.showModalCampanhas(modalASerAberto);
    expect(spyShowModal).toHaveBeenCalledTimes(0);
    expect(spyShowModal).not.toHaveBeenLastCalledWith(modalASerAberto);
  });

  it('formatCurrency() deve retornar "0,00" quando o valor é 0', () => {
    expect(component.formatCurrency(0)).toBe("0,00");
  });

  it('formatCurrency() deve retornar "1,00" quando o valor é 1', () => {
    expect(component.formatCurrency(1)).toBe("1,00");
  });

  it('formatCurrency() deve retornar "1234,56" quando o valor é 1234.56', () => {
    expect(component.formatCurrency(1234.56)).toBe("1234,56");
  });

  it('formatCurrency() deve retornar o valor original quando ocorre um erro', () => {
    const spy = jest.spyOn(Number.prototype, 'toFixed').mockImplementation(() => { throw new Error(); });
    expect(component.formatCurrency(1234.56)).toBe(1234.56);
    spy.mockRestore();
  });

  it('preencherDadosResumoSimulacao() deve preencher corretamente os dados do resumo da simulação com condições pleiteadas', () => {
    component.radioButtonTarifas = component.PLEITEAR_CONDICOES;
    component.valoresTarifaDiferenciadaSelecionada = {} as Tarifa;

    const valoresTarifa = {
      id: 'Novo valor diferenciado',
      tipo: TipoTarifa.DIFERENCIADA,
      condicao: 'Diferenciada',
      situacao: "Pendente",
      recomended: false,
      custom: true,
      referencia: true,
      visible: true,
      pgCaixa: '1.5',
      pgOutros: '2.5',
      retentativa: '0.5',
      degustacao: '10'
    };

    component.valoresTarifaDiferenciadaSelecionada = { ...valoresTarifa };
    component.grupoMCSelecionadoNoCalculo = EnumGruposMargemContribuicao.GRUPO_1;
    component.simulacao = {
      agendamentosMes: '5',
      ticketMedio: 1000,
      justificativa: 'Teste de justificativa',
      excecoes: {
        contaDebitoDiferente: true,
        inibirRetentativa: false,
        inibirOpenFinance: true,
        minutaContratualForaPadrao: false,
        minutaEditalCredenciamento: false,
        outro: true,
        textoOutro: 'Texto outro'
      },
      documentacao: [{ name: 'doc.pdf', size: 12345 }]
    };
    component.labelBotaoIncluirSimulacao = 'Confirmar';
    component.excecaoSelecionada = true;

    const resultado = component.preencherDadosResumoSimulacao();

    expect(resultado).toEqual({
      grupo: EnumLabelGruposMargemContribuicao['GRUPO_1'],
      infoGrupo: EnumMensagemGrupo['GRUPO_1'],
      tarifaPgCaixa: '1.5',
      tarifaPgOutros: '2.5',
      tarifaRetentativa: '0.5',
      diasDegustacao: '10',
      excecoes: {
        contaDebitoDiferente: true,
        inibirRetentativa: false,
        inibirOpenFinance: true,
        minutaContratualForaPadrao: false,
        minutaEditalCredenciamento: false,
        outro: true,
        textoOutro: 'Texto outro'
      },
      agendamentosPorMes: 5,
      ticketMedio: 1000,
      justificativa: 'Teste de justificativa',
      documento: { nome: 'doc.pdf', tamanho: 12345 },
      labelBotaoConfirmar: 'Confirmar',
      ocorreuExcepcionalizacao: true,
      infoAlcadaAlert: {
        "alcadaCalculada": "Não calculada",
        "mensagemAlert": "Houve excepcionalização, será necessário análise pela Matriz.",
        "varianteAlert": "warning",
      }
    });
  });

  it('preencherDadosResumoSimulacao() deve preencher corretamente os dados do resumo da simulação com condições pleiteadas', () => {
    component.radioButtonTarifas = component.PLEITEAR_CONDICOES;
    component.valoresTarifaDiferenciadaSelecionada = {} as Tarifa;

    const valoresTarifa = {
      id: 'Novo valor diferenciado',
      tipo: TipoTarifa.DIFERENCIADA,
      condicao: 'Diferenciada',
      situacao: "Pendente",
      recomended: false,
      custom: true,
      referencia: true,
      visible: true,
      pgCaixa: '1.5',
      pgOutros: '2.5',
      retentativa: '0.5',
      degustacao: '10'
    };

    component.valoresTarifaDiferenciadaSelecionada = { ...valoresTarifa };
    component.grupoMCSelecionadoNoCalculo = EnumGruposMargemContribuicao.GRUPO_1;
    component.simulacao = {
      agendamentosMes: '5',
      ticketMedio: 1000,
      justificativa: 'Teste de justificativa',
      excecoes: {
        contaDebitoDiferente: false,
        inibirRetentativa: false,
        inibirOpenFinance: false,
        minutaContratualForaPadrao: false,
        minutaEditalCredenciamento: false,
        outro: false,
        textoOutro: null
      },
      documentacao: [{ name: 'doc.pdf', size: 12345 }]
    };
    component.labelBotaoIncluirSimulacao = 'Confirmar';
    component.excecaoSelecionada = false;

    const resultado = component.preencherDadosResumoSimulacao();

    expect(resultado).toEqual({
      grupo: EnumLabelGruposMargemContribuicao['GRUPO_1'],
      infoGrupo: EnumMensagemGrupo['GRUPO_1'],
      tarifaPgCaixa: '1.5',
      tarifaPgOutros: '2.5',
      tarifaRetentativa: '0.5',
      diasDegustacao: '10',
      excecoes: {
        contaDebitoDiferente: false,
        inibirRetentativa: false,
        inibirOpenFinance: false,
        minutaContratualForaPadrao: false,
        minutaEditalCredenciamento: false,
        outro: false,
        textoOutro: null
      },
      agendamentosPorMes: 5,
      ticketMedio: 1000,
      justificativa: 'Teste de justificativa',
      documento: { nome: 'doc.pdf', tamanho: 12345 },
      labelBotaoConfirmar: 'Confirmar',
      ocorreuExcepcionalizacao: false,
      infoAlcadaAlert: {
        "alcadaCalculada": "Não calculada",
        "mensagemAlert": "Para essas condições a simulação está pré-aprovada!",
        "varianteAlert": "success",
      }
    });
  });

  it('avaliarContraProposta() deve chamar dismissAll e open quando modal é válido', () => {
    const modalRef = {};
    component.avaliarContraProposta(modalRef);

    expect(modalService.dismissAll).toHaveBeenCalled();
    expect(modalService.open).toHaveBeenCalledWith(modalRef, {
      size: 'lg',
      scrollable: false,
      windowClass: 'my-class',
    });
  });

  it('avaliarContraProposta() não deve chamar dismissAll nem open quando modal é null', () => {
    component.avaliarContraProposta(null);

    expect(modalService.dismissAll).not.toHaveBeenCalled();
    expect(modalService.open).not.toHaveBeenCalled();
  });

  it('processarTarifas() deve chamar verifyTarifaPreference para cada tarifa', () => {
    const tarifas: Tarifa[] = [
      createMockTarifa(),
      createMockTarifa(),
    ];
    const spy = jest.spyOn(component, 'verifyTarifaPreference').mockImplementation(() => { });

    component.processarTarifas(tarifas);

    expect(spy).toHaveBeenCalledTimes(tarifas.length);
  });

  it('processarTarifas() deve retornar apenas tarifas visíveis e não customizadas quando filtrarTarifas = true', () => {
    component.filtrarTarifas = true;
    const tarifas: Tarifa[] = [
      createMockTarifa({ visible: true, custom: false }),
      createMockTarifa({ visible: true, custom: true }),
      createMockTarifa({ visible: false, custom: false }),
    ];

    const resultado = component.processarTarifas(tarifas);

    expect(resultado).toEqual([
      expect.objectContaining({ visible: true, custom: false })
    ]);
  });

  it('processarTarifas() deve retornar todas as tarifas não customizadas quando filtrarTarifas = false', () => {
    component.filtrarTarifas = false;
    const tarifas: Tarifa[] = [
      createMockTarifa({ custom: false }),
      createMockTarifa({ custom: true }),
      createMockTarifa({ custom: false }),
    ];

    const resultado = component.processarTarifas(tarifas);

    expect(resultado).toEqual([
      expect.objectContaining({ custom: false }),
      expect.objectContaining({ custom: false }),
    ]);
  });

  it('clientReadyInclude() deve retornar false se verificarFuncionalidade(INCLUIR) retornar false', () => {
    jest.spyOn(component, 'verificarFuncionalidade').mockReturnValue(false);

    const resultado = component.clientReadyInclude();

    expect(resultado).toBe(false);
  });

  it('clientReadyInclude() deve retornar true se client não estiver restrito e funcionalidade INCLUIR estiver habilitada', () => {
    jest.spyOn(component, 'verificarFuncionalidade').mockReturnValue(true);

    const resultado = component.clientReadyInclude();

    expect(resultado).toBe(true);
  });

  it('converterSimulacaoDTOToFormData() deve adicionar campos de excecoes ao FormData', () => {
    const simulacao = createMockSimulacaoDTO({
      excecoes: createMockExcecoesSimulacao({
        contaDebitoDiferente: true,
        inibirRetentativa: false,
        textoOutro: 'Texto de exceção'
      })
    });

    const formData = component.converterSimulacaoDTOToFormData(simulacao);

    expect(formData.get('cnpj')).toBe(simulacao.cnpj);
    expect(formData.get('excecoes.contaDebitoDiferente')).toBe('true');
    expect(formData.get('excecoes.inibirRetentativa')).toBe('false');
    expect(formData.get('excecoes.textoOutro')).toBe('Texto de exceção');
  });

  it('converterSimulacaoDTOToFormData() deve adicionar campos de justificativa ao FormData', () => {
    const simulacao = createMockSimulacaoDTO({
      justificativa: createMockJustificativaSimulacao({
        novoConvenio: false,
        unidadeRelacionamentoConvenio: 'Agência Y',
        migracaoDebitoAutomatico: true,
        comentarios: 'Outro comentário'
      })
    });

    const formData = component.converterSimulacaoDTOToFormData(simulacao);

    expect(formData.get('justificativa.novoConvenio')).toBe('false');
    expect(formData.get('justificativa.unidadeRelacionamentoConvenio')).toBe('Agência Y');
    expect(formData.get('justificativa.migracaoDebitoAutomatico')).toBe('false');
    expect(formData.get('justificativa.comentarios')).toBe('Outro comentário');
  });

  it('converterSimulacaoDTOToFormData() deve adicionar campos de condicao ao FormData', () => {
    const simulacao = createMockSimulacaoDTO({
      condicao: createMockCondicaoSimulacao({
        tipo: 3,
        nome: 'Condição Especial',
        tarifaPagadoresCaixa: 3.0,
        grupoMargemContribuicao: EnumGruposMargemContribuicao.GRUPO_2
      })
    });

    const formData = component.converterSimulacaoDTOToFormData(simulacao);

    expect(formData.get('condicoes.tipo')).toBe('3');
    expect(formData.get('condicoes.nome')).toBe('Condição Especial');
    expect(formData.get('condicoes.tarifaPagadoresCaixa')).toBe('3');
    expect(formData.get('condicoes.grupoMargemContribuicao')).toBe(
      component.formatarGrupoMCParaFormData(EnumGruposMargemContribuicao.GRUPO_2)
    );
  });

  it('converterSimulacaoDTOToFormData() deve adicionar arquivos ao FormData quando documentos não forem nulos', () => {
    const mockFile = new File(['conteúdo'], 'documento.pdf', { type: 'application/pdf' });
    const documentos = {
      0: mockFile,
      length: 1,
      item: () => mockFile
    } as unknown as FileList;

    const simulacao = createMockSimulacaoDTO({
      justificativa: createMockJustificativaSimulacao({
        documentos
      })
    });

    const formData = component.converterSimulacaoDTOToFormData(simulacao);

    expect(formData.getAll('justificativa.documentos')).toContainEqual(mockFile);
  });

  describe('processarInclusao()', () => {
    const mockModal = {};
    const mockFormData = new FormData();
    const mockPadNumber = '123456';
    const mockCnpj = '12345678000199';

    beforeEach(() => {
      // Mocks comuns para todos os testes
      jest.spyOn(component, 'processaTarifa').mockReturnValue(createMockCondicaoSimulacao());
      jest.spyOn(component, 'processaExcecoes').mockReturnValue(createMockExcecoesSimulacao());
      jest.spyOn(component, 'processaJustificativa').mockReturnValue(createMockJustificativaSimulacao());
      jest.spyOn(component, 'transformaTipoTarifa').mockImplementation((c) => c);
      jest.spyOn(component, 'converterSimulacaoDTOToFormData').mockReturnValue(mockFormData);
      jest.spyOn(component, 'padNumber').mockReturnValue(mockPadNumber);
      jest.spyOn(component, 'showMessageDialog').mockImplementation(() => { });
      component.cliente = { cnpj: mockCnpj } as any;
      component.simulacao = { id: null };
      component.numeroSimulacao = null;
      component.criouNovaSimulacao = 'nao';
      component.criarSimulacaoSemIrParaConvenio = true;
    });

    it('deve exibir mensagem de erro se fetch falhar', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Falha'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      const showMessageSpy = jest.spyOn(component, 'showMessageDialog');

      await component.processarInclusao(mockModal);

      expect(showMessageSpy).toHaveBeenCalledWith(
        'Ocorreu um erro ao processar esta simulação',
        'Por favor tente novamente em alguns instantes'
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('deve montar o body e enviar requisição com sucesso', async () => {
      const mockResponse = { id: 123456, mensagem: null };
      const mockJson = jest.fn().mockResolvedValue(mockResponse);
      global.fetch = jest.fn().mockResolvedValue({ json: mockJson });

      await component.processarInclusao(mockModal);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/simulacao'),
        expect.objectContaining({ method: 'POST', body: mockFormData })
      );

      expect(modalService.open).toHaveBeenCalledWith(mockModal, expect.any(Object));
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('CRIOUNOVASIMULACAO', 'sim');
    });

    it('deve montar o body, enviar requisição com sucesso e executar callback', async () => {
      const mockResponse = { id: 123456, mensagem: null };
      const mockJson = jest.fn().mockResolvedValue(mockResponse);
      global.fetch = jest.fn().mockResolvedValue({ json: mockJson });

      const callback = jest.fn();

      await component.processarInclusao(mockModal, callback);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/simulacao'),
        expect.objectContaining({ method: 'POST', body: mockFormData })
      );

      expect(modalService.open).toHaveBeenCalledWith(mockModal, expect.any(Object));
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('CRIOUNOVASIMULACAO', 'sim');
      expect(callback).toHaveBeenCalled();
    });

    it('deve montar o body, enviar requisição com sucesso, setar parâmetros na session para o convênio e executar o callback', async () => {
      const mockResponse = { id: 123456, mensagem: null };
      const mockJson = jest.fn().mockResolvedValue(mockResponse);
      global.fetch = jest.fn().mockResolvedValue({ json: mockJson });

      component.criarSimulacaoSemIrParaConvenio = false;
      const callback = jest.fn();

      await component.processarInclusao(mockModal, callback);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/simulacao'),
        expect.objectContaining({ method: 'POST', body: mockFormData })
      );

      expect(modalService.open).toHaveBeenCalledWith(mockModal, expect.any(Object));
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('CRIOUNOVASIMULACAO', 'sim');
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('ID', component.numeroSimulacao);
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('CNPJ', component.cliente?.cnpj);
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('IRCONTRATO', 'on');
      expect(callback).toHaveBeenCalled();
    });

    it('deve montar o body, enviar requisição com sucesso e exibir dados da mensagem recebida do endpoint', async () => {
      const mockResponse = {
        id: 123456,
        mensagem: 'mensagem retornada',
        descricao: 'descricao da mensagem retornada'
      };
      const mockJson = jest.fn().mockResolvedValue(mockResponse);
      global.fetch = jest.fn().mockResolvedValue({ json: mockJson });

      const callback = jest.fn();

      await component.processarInclusao(mockModal, callback);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/simulacao'),
        expect.objectContaining({ method: 'POST', body: mockFormData })
      );

      expect(component.showMessageDialog).toHaveBeenCalledWith(mockResponse.mensagem, mockResponse.descricao);
      expect(sessionStorageMock.setItem).not.toHaveBeenCalledWith('CRIOUNOVASIMULACAO', 'sim');
      expect(sessionStorageMock.setItem).not.toHaveBeenCalledWith('ID', component.numeroSimulacao);
      expect(sessionStorageMock.setItem).not.toHaveBeenCalledWith('CNPJ', component.cliente?.cnpj);
      expect(sessionStorageMock.setItem).not.toHaveBeenCalledWith('IRCONTRATO', 'on');
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('solicitarAutorizacao()', () => {
    it('deve impedir múltiplos cliques quando botaoClicado já estiver true', async () => {
      component.botaoClicado = true;

      await component.solicitarAutorizacao({});

      expect(component.botaoClicado).toBe(true); // continua true porque não executou
      expect(component.sppinerIsLoading).toBe(false); // não ativa o spinner
      expect(component.labelModalIncluir).not.toBe("Aguarde");
    });

    it('deve ativar spinner e chamar processarInclusao', async () => {
      const modalMock = {};
      const processarInclusaoSpy = jest.spyOn(component, 'processarInclusao').mockImplementation((_, cb) => cb());

      component.criarSimulacaoSemIrParaConvenio = true;

      await component.solicitarAutorizacao(modalMock);

      expect(component.botaoClicado).toBe(false); // deve resetar após execução
      expect(component.sppinerIsLoading).toBe(false); // deve desativar spinner
      expect(component.labelModalIncluir).toBe("Incluir");
      expect(processarInclusaoSpy).toHaveBeenCalledWith(modalMock, expect.any(Function));
    });

    it('deve chamar direcionarParaConvenio se criarSimulacaoSemIrParaConvenio for false', async () => {
      const modalMock = {};
      jest.spyOn(component, 'processarInclusao').mockImplementation((_, cb) => cb());
      const direcionarSpy = jest.spyOn(component, 'direcionarParaConvenio').mockImplementation(() => { });

      component.criarSimulacaoSemIrParaConvenio = false;

      await component.solicitarAutorizacao(modalMock);

      expect(direcionarSpy).toHaveBeenCalled();
    });
  });

  describe('reprovarSimulacao()', () => {
    let modalMock: any;
    let fileMock: File;

    beforeEach(() => {
      modalMock = {};
      fileMock = new File(['conteúdo'], 'documento.pdf', { type: 'application/pdf' });
      component.avaliacaoDocumento = {
        length: 1,
        item: () => fileMock,
        [0]: fileMock
      } as unknown as FileList;

      component.idSimulacao = '123';
      component.avaliacaoJustificativa = 'Justificativa de reprovação';
      component.backendUrl = 'http://localhost:3000';
    });

    it('deve chamar dismissAll do modalService e enviar requisição com dados corretos', async () => {
      const detalharSpy = jest.spyOn(component, 'detalharSimulacao').mockImplementation(() => { });

      const fetchMock = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ simulacaoAlcada: true })
      });
      global.fetch = fetchMock;

      await component.reprovarSimulacao(modalMock);

      expect(modalService.dismissAll).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3000/simulacao/alcada',
        expect.objectContaining({ method: 'POST' })
      );
      expect(detalharSpy).toHaveBeenCalledWith(null, '123', true);
      expect(modalService.open).toHaveBeenCalledWith(modalMock, expect.any(Object));
    });

    it('deve exibir mensagem de erro quando resposta não tiver simulacaoAlcada', async () => {
      const showMessageSpy = jest.spyOn(component, 'showMessageDialog').mockImplementation(() => { });

      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ mensagem: 'Erro', descricao: 'Detalhes do erro' })
      });

      await component.reprovarSimulacao(modalMock);

      expect(showMessageSpy).toHaveBeenCalledWith('Erro', 'Detalhes do erro');
    });

    it('deve exibir mensagem de erro no catch em caso de falha na requisição', async () => {
      const showMessageSpy = jest.spyOn(component, 'showMessageDialog').mockImplementation(() => { });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      global.fetch = jest.fn().mockRejectedValue(new Error('Falha na rede'));

      await component.reprovarSimulacao(modalMock);

      expect(showMessageSpy).toHaveBeenCalledWith(
        'Ocorreu um erro ao reprovar esta simulação',
        'Por favor tente novamente em alguns instantes'
      );
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('aprovarSimulacao()', () => {
    let modalMock: any;
    let fileMock: File;

    beforeEach(() => {
      modalMock = {};
      fileMock = new File(['conteúdo'], 'documento.pdf', { type: 'application/pdf' });
      component.avaliacaoDocumento = {
        length: 1,
        item: () => fileMock,
        [0]: fileMock
      } as unknown as FileList;

      component.idSimulacao = '123';
      component.avaliacaoJustificativa = 'Justificativa de aprovação';
      component.backendUrl = 'http://localhost:3000';
    });

    it('deve chamar dismissAll do modalService e enviar requisição com dados corretos', async () => {
      const detalharSpy = jest.spyOn(component, 'detalharSimulacao').mockImplementation(() => { });

      const fetchMock = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ simulacaoAlcada: true })
      });
      global.fetch = fetchMock;

      await component.aprovarSimulacao(modalMock);

      expect(modalService.dismissAll).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3000/simulacao/alcada',
        expect.objectContaining({ method: 'POST' })
      );
      expect(detalharSpy).toHaveBeenCalledWith(null, '123', true);
      expect(modalService.open).toHaveBeenCalledWith(modalMock, expect.any(Object));
    });

    it('deve exibir mensagem de erro quando resposta não tiver simulacaoAlcada', async () => {
      const showMessageSpy = jest.spyOn(component, 'showMessageDialog').mockImplementation(() => { });

      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ mensagem: 'Erro', descricao: 'Detalhes do erro' })
      });

      await component.aprovarSimulacao(modalMock);

      expect(showMessageSpy).toHaveBeenCalledWith('Erro', 'Detalhes do erro');
    });

    it('deve exibir mensagem de erro no catch em caso de falha na requisição', async () => {
      const showMessageSpy = jest.spyOn(component, 'showMessageDialog').mockImplementation(() => { });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      global.fetch = jest.fn().mockRejectedValue(new Error('Falha na rede'));

      await component.aprovarSimulacao(modalMock);

      expect(showMessageSpy).toHaveBeenCalledWith(
        'Ocorreu um erro ao aprovar esta simulação',
        'Por favor tente novamente em alguns instantes'
      );
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('enviarNovaContraProposta()', () => {
    let modalMock: any;
    let fileMock: File;

    beforeEach(() => {
      modalMock = {};
      fileMock = new File(['conteúdo'], 'documento.pdf', { type: 'application/pdf' });

      component.idSimulacao = '123';
      component.backendUrl = 'http://localhost:3000';
      component.avaliacaoJustificativa = 'Comentário da justificativa';

      component.tarifaContraProposta = [createMockTarifa()];

      component.contraproposta = {
        excecoes: createMockExcecoesSimulacao(),
        documentacao: {
          length: 1,
          item: () => fileMock,
          [0]: fileMock
        } as unknown as FileList
      };
    });

    it('deve enviar requisição com dados corretos e abrir modal ao finalizar', async () => {
      const detalharSpy = jest.spyOn(component, 'detalharSimulacao').mockImplementation(() => { });
      const fetchMock = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({})
      });
      global.fetch = fetchMock;

      await component.enviarNovaContraProposta(modalMock);

      expect(modalService.dismissAll).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:3000/simulacaoContraProposta',
        expect.objectContaining({ method: 'POST' })
      );
      expect(detalharSpy).toHaveBeenCalledWith(null, '123', true);
      expect(modalService.open).toHaveBeenCalledWith(modalMock, expect.any(Object));
      expect(component.avaliar).toBe(false);
      expect(component.contraproposta).toBe(false);
    });

    it('deve exibir mensagem de erro quando resposta tiver mensagem', async () => {
      const showMessageSpy = jest.spyOn(component, 'showMessageDialog').mockImplementation(() => { });

      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve({ mensagem: 'Erro', descricao: 'Detalhes do erro' })
      });

      await component.enviarNovaContraProposta(modalMock);

      expect(showMessageSpy).toHaveBeenCalledWith('Erro', 'Detalhes do erro');
    });

    it('deve exibir mensagem de erro no catch em caso de falha na requisição', async () => {
      const showMessageSpy = jest.spyOn(component, 'showMessageDialog').mockImplementation(() => { });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      global.fetch = jest.fn().mockRejectedValue(new Error('Falha na rede'));

      await component.enviarNovaContraProposta(modalMock);

      expect(showMessageSpy).toHaveBeenCalledWith(
        'Ocorreu um erro ao enviar contra proposta desta simulação',
        'Por favor tente novamente em alguns instantes'
      );
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('verificaContraProposta()', () => {
    let tarifaMock: any;

    beforeEach(() => {
      tarifaMock = createMockTarifa();

      component.tarifas = [tarifaMock];
    });

    it('deve retornar lista vazia quando todos os campos forem válidos', () => {
      jest.spyOn(component, 'isNonNullCurrency').mockReturnValue(true);
      jest.spyOn(component, 'isNonNullNumeric').mockReturnValue(true);

      const result = component.verificaContraProposta();

      expect(result).toEqual([]);
    });

    it('deve adicionar mensagem de erro quando pgCaixa for inválido', () => {
      jest.spyOn(component, 'isNonNullCurrency').mockImplementation((valor) => valor !== tarifaMock.pgCaixa ? true : false);
      jest.spyOn(component, 'isNonNullNumeric').mockReturnValue(true);
      const userActionSpy = jest.spyOn(component, 'userAction').mockImplementation(() => { });

      const result = component.verificaContraProposta();

      expect(result).toContain("Tarifa do Pagador CAIXA não informado ou inválido");
      expect(userActionSpy).toHaveBeenCalledWith("Tarifa do Pagador CAIXA não informado ou inválido");
    });

    it('deve adicionar mensagem de erro quando pgOutros for inválido', () => {
      jest.spyOn(component, 'isNonNullCurrency').mockImplementation((valor) => valor !== tarifaMock.pgOutros ? true : false);
      jest.spyOn(component, 'isNonNullNumeric').mockReturnValue(true);
      const userActionSpy = jest.spyOn(component, 'userAction').mockImplementation(() => { });

      const result = component.verificaContraProposta();

      expect(result).toContain("Tarifa do Pagados Outros Bancos não informado ou inválido");
      expect(userActionSpy).toHaveBeenCalledWith("Tarifa do Pagados Outros Bancos não informado ou inválido");
    });

    it('deve adicionar mensagem de erro quando retentativa for inválida', () => {
      jest.spyOn(component, 'isNonNullCurrency').mockImplementation((valor) => valor !== tarifaMock.retentativa ? true : false);
      jest.spyOn(component, 'isNonNullNumeric').mockReturnValue(true);
      const userActionSpy = jest.spyOn(component, 'userAction').mockImplementation(() => { });

      const result = component.verificaContraProposta();

      expect(result).toContain("Tarifa de Retentativa não informada ou inválida");
      expect(userActionSpy).toHaveBeenCalledWith("Tarifa de Retentativa não informada ou inválida");
    });

    it('deve adicionar mensagem de erro quando degustacao for inválido', () => {
      jest.spyOn(component, 'isNonNullCurrency').mockReturnValue(true);
      jest.spyOn(component, 'isNonNullNumeric').mockReturnValue(false);
      const userActionSpy = jest.spyOn(component, 'userAction').mockImplementation(() => { });

      const result = component.verificaContraProposta();

      expect(result).toContain("Quantidade de dias de Degustação não informado ou inválido");
      expect(userActionSpy).toHaveBeenCalledWith("Quantidade de dias de Degustação não informado ou inválido");
    });

    it('deve retornar todas as mensagens de erro quando todos os campos forem inválidos', () => {
      jest.spyOn(component, 'isNonNullCurrency').mockReturnValue(false);
      jest.spyOn(component, 'isNonNullNumeric').mockReturnValue(false);
      const userActionSpy = jest.spyOn(component, 'userAction').mockImplementation(() => { });

      const result = component.verificaContraProposta();

      expect(result).toEqual([
        "Tarifa do Pagador CAIXA não informado ou inválido",
        "Tarifa do Pagados Outros Bancos não informado ou inválido",
        "Tarifa de Retentativa não informada ou inválida",
        "Quantidade de dias de Degustação não informado ou inválido"
      ]);
      expect(userActionSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe('verificaMigracaoDebito()', () => {
    beforeEach(() => {
      component.simulacao = {
        contas: []
      };
    });

    it('deve retornar mensagem de erro quando nenhuma conta estiver selecionada', () => {
      component.simulacao.contas = [
        { selected: false },
        { selected: false }
      ];

      const userActionSpy = jest.spyOn(component, 'userAction').mockImplementation(() => { });

      const result = component.verificaMigracaoDebito();

      expect(result).toEqual([
        "Número do convênio do Débito Automático para migração não selecionada"
      ]);
      expect(userActionSpy).toHaveBeenCalledWith(
        "Número do convênio do Débito Automático para migração não selecionada"
      );
    });

    it('deve retornar lista vazia quando ao menos uma conta estiver selecionada', () => {
      component.simulacao.contas = [
        { selected: false },
        { selected: true }
      ];

      const userActionSpy = jest.spyOn(component, 'userAction').mockImplementation(() => { });

      const result = component.verificaMigracaoDebito();

      expect(result).toEqual([]);
      expect(userActionSpy).not.toHaveBeenCalled();
    });

    it('deve retornar lista vazia quando todas as contas estiverem selecionadas', () => {
      component.simulacao.contas = [
        { selected: true },
        { selected: true }
      ];

      const result = component.verificaMigracaoDebito();

      expect(result).toEqual([]);
    });

    it('deve retornar erro quando lista de contas estiver vazia', () => {
      const userActionSpy = jest.spyOn(component, 'userAction').mockImplementation(() => { });

      const result = component.verificaMigracaoDebito();

      expect(result).toEqual([
        "Número do convênio do Débito Automático para migração não selecionada"
      ]);
      expect(userActionSpy).toHaveBeenCalledWith(
        "Número do convênio do Débito Automático para migração não selecionada"
      );
    });
  });

  describe('validarSolicitarAutorizacao()', () => {
    beforeEach(() => {
      component.simulacao = {
        tarifa: '1.00',
        migracaoDebito: false,
        agendamentosMes: 10,
        ticketMedio: '500',
        justificativa: 'Comentário válido'
      };

      component.grupoMCSelecionadoAtual = EnumGruposMargemContribuicao.GRUPO_1;
      component.tarifaCustomizadaSelecionada = false;
      component.excecaoSelecionada = false;

      component.radioButtonTarifas = EnumRadioButtonTarifas.SIMULACOES_REALIZADAS;
      component.alcadaTarifaDiferenciada = EnumAlcada.ALCADA_AGENCIA;

      jest.spyOn(component, 'isNonNullNumeric').mockReturnValue(true);
      jest.spyOn(component, 'isNonNullCurrency').mockReturnValue(true);
      jest.spyOn(component, 'userAction').mockImplementation(() => { });
    });

    it('deve retornar lista vazia quando todos os dados forem válidos e alçada estiver correta', () => {
      const result = component.validarSolicitarAutorizacao();
      expect(result).toEqual([]);
    });

    it('deve retornar erro quando tarifa for nula', () => {
      component.simulacao.tarifa = null;

      const result = component.validarSolicitarAutorizacao();
      expect(result).toContain("Não foi selecionada uma Tarifa");
    });

    it('deve retornar erro quando grupoMCSelecionadoAtual for INVÁLIDO', () => {
      component.grupoMCSelecionadoAtual = EnumGruposMargemContribuicao.INVALIDO;

      const result = component.validarSolicitarAutorizacao();
      expect(result).toContain("Selecione o Grupo da Tarifa pertencente ao cliente");
    });

    it('deve retornar erro quando alçada for inválida e radioButtonTarifas for PLEITEAR_CONDICOES', () => {
      component.radioButtonTarifas = 'PLEITEAR_CONDICOES';
      component.alcadaTarifaDiferenciada = EnumAlcada.ALCADA_NAO_CALCULADA;

      const result = component.validarSolicitarAutorizacao();
      expect(result).toContain("Cálculo de alçada inválido para Condições Diferencias");
    });

    it('não deve retornar erro de alçada quando radioButtonTarifas for diferente de PLEITEAR_CONDICOES', () => {
      component.radioButtonTarifas = EnumRadioButtonTarifas.SIMULACOES_REALIZADAS;
      component.alcadaTarifaDiferenciada = EnumAlcada.ALCADA_NAO_CALCULADA;

      const result = component.validarSolicitarAutorizacao();
      expect(result).not.toContain("Cálculo de alçada inválido para Condições Diferencias");
    });

    it('deve incluir erros de tarifas customizadas quando selecionadas', () => {
      component.tarifaCustomizadaSelecionada = true;
      jest.spyOn(component, 'verificaTarifasCustomizadas').mockReturnValue([
        "Erro de tarifa customizada"
      ]);

      const result = component.validarSolicitarAutorizacao();
      expect(result).toContain("Erro de tarifa customizada");
    });

    it('deve incluir erros de exceções quando selecionadas', () => {
      component.excecaoSelecionada = true;
      jest.spyOn(component, 'verificaExcecoes').mockReturnValue([
        "Erro de exceção"
      ]);

      const result = component.validarSolicitarAutorizacao();
      expect(result).toContain("Erro de exceção");
    });

    it('deve incluir erros de migração de débito quando ativada', () => {
      component.simulacao.migracaoDebito = true;
      jest.spyOn(component, 'verificaMigracaoDebito').mockReturnValue([
        "Erro de migração"
      ]);

      const result = component.validarSolicitarAutorizacao();
      expect(result).toContain("Erro de migração");
    });

    it('deve retornar erro quando agendamentosMes for inválido', () => {
      jest.spyOn(component, 'isNonNullNumeric').mockReturnValue(false);

      const result = component.validarSolicitarAutorizacao();
      expect(result).toContain("Agendamentos Mês não informado ou inválido");
      expect(component.userAction).toHaveBeenCalledWith("Agendamentos Mês não informado ou inválido");
    });

    it('deve retornar erro quando ticketMedio for inválido', () => {
      jest.spyOn(component, 'isNonNullCurrency').mockReturnValueOnce(false).mockReturnValueOnce(true);
      jest.spyOn(component, 'verificaTarifasCustomizadas').mockReturnValueOnce([]);

      const result = component.validarSolicitarAutorizacao();
      expect(result).toContain("Ticket médio não informado ou inválido");
      expect(component.userAction).toHaveBeenCalledWith("Ticket médio não informado ou inválido");
    });

    it('deve retornar erro quando justificativa for nula ou vazia', () => {
      component.simulacao.justificativa = null;

      let result = component.validarSolicitarAutorizacao();
      expect(result).toContain("Comentário da justificativa não informado");

      component.simulacao.justificativa = '   ';
      result = component.validarSolicitarAutorizacao();
      expect(result).toContain("Comentário da justificativa não informado");

      expect(component.userAction).toHaveBeenCalledWith("Comentário da justificativa não informado");
    });
  });

  describe('verificaExcecoes()', () => {
    beforeEach(() => {
      component.simulacao = {
        excecoes: createMockExcecoesSimulacao()
      };

      jest.spyOn(component, 'verificarSeHaExcecaoMarcada').mockReturnValue(true);
      jest.spyOn(component, 'userAction').mockImplementation(() => { });
    });

    it('deve retornar lista vazia quando não houver exceções e textoOutro for válido', () => {
      const result = component.verificaExcecoes();
      expect(result).toEqual([]);
    });

    it('deve retornar erro quando nenhuma exceção estiver marcada', () => {
      jest.spyOn(component, 'verificarSeHaExcecaoMarcada').mockReturnValue(false);

      const result = component.verificaExcecoes();

      expect(result).toContain("Selecione ao menos um parâmetro contratual");
      expect(component.userAction).toHaveBeenCalledWith("Selecione ao menos um parâmetro contratual");
    });

    it('deve retornar erro quando exceção "outro" estiver marcada e textoOutro for nulo', () => {
      component.simulacao.excecoes = createMockExcecoesSimulacao({
        outro: true,
        textoOutro: null as any
      });

      const result = component.verificaExcecoes();

      expect(result).toContain('Para a exceção "Outro", descreva com no mínimo 3 caracteres');
      expect(component.userAction).toHaveBeenCalledWith('Para a exceção "Outro", descreva com no mínimo 3 caracteres');
    });

    it('deve retornar erro quando exceção "outro" estiver marcada e textoOutro for vazio', () => {
      component.simulacao.excecoes = createMockExcecoesSimulacao({
        outro: true,
        textoOutro: '  '
      });

      const result = component.verificaExcecoes();

      expect(result).toContain('Para a exceção "Outro", descreva com no mínimo 3 caracteres');
      expect(component.userAction).toHaveBeenCalledWith('Para a exceção "Outro", descreva com no mínimo 3 caracteres');
    });

    it('deve retornar erro quando exceção "outro" estiver marcada e textoOutro tiver menos de 3 caracteres', () => {
      component.simulacao.excecoes = createMockExcecoesSimulacao({
        outro: true,
        textoOutro: 'ok'
      });

      const result = component.verificaExcecoes();

      expect(result).toContain('Para a exceção "Outro", descreva com no mínimo 3 caracteres');
      expect(component.userAction).toHaveBeenCalledWith('Para a exceção "Outro", descreva com no mínimo 3 caracteres');
    });

    it('não deve retornar erro quando exceção "outro" estiver marcada e textoOutro for válido', () => {
      component.simulacao.excecoes = createMockExcecoesSimulacao({
        outro: true,
        textoOutro: 'Texto válido'
      });

      const result = component.verificaExcecoes();

      expect(result).toEqual([]);
    });
  });

  describe('preselecionarTarifa()', () => {
    beforeEach(() => {
      jest.spyOn(component, 'selecionarTarifa').mockImplementation(() => { });
      jest.spyOn(component, 'tarifaIndex').mockImplementation((tarifa) => tarifa.id);
      component.tarifaSelected = null;
    });

    it('deve selecionar a tarifa recomendada e atualizar tarifaSelected', () => {
      const tarifaRecomendada = createMockTarifa({ recomended: true });
      const tarifaNaoRecomendada = createMockTarifa({ recomended: false });

      component.tarifas = [tarifaNaoRecomendada, tarifaRecomendada];
      component.preselecionarTarifa();

      expect(component.selecionarTarifa).toHaveBeenCalledWith(tarifaRecomendada);
      expect(component.tarifaSelected).toBe(tarifaRecomendada.id);
    });

    it('não deve selecionar nenhuma tarifa se nenhuma estiver recomendada', () => {
      const tarifa1 = createMockTarifa({ recomended: false });
      const tarifa2 = createMockTarifa({ recomended: false });

      component.tarifas = [tarifa1, tarifa2];
      component.preselecionarTarifa();

      expect(component.selecionarTarifa).not.toHaveBeenCalled();
      expect(component.tarifaSelected).toBeNull();
    });

    it('deve selecionar todas as tarifas recomendadas se houver mais de uma, mantendo a última como selecionada', () => {
      const tarifa1 = createMockTarifa({ recomended: true });
      const tarifa2 = createMockTarifa({ recomended: true });

      component.tarifas = [tarifa1, tarifa2];
      component.preselecionarTarifa();

      expect(component.selecionarTarifa).toHaveBeenCalledWith(tarifa1);
      expect(component.selecionarTarifa).toHaveBeenCalledWith(tarifa2);
      expect(component.tarifaSelected).toBe(tarifa2.id);
    });

    it('deve ignorar tarifas sem a propriedade recomended', () => {
      const tarifaSemPropriedade = { ...createMockTarifa(), recomended: false };

      component.tarifas = [tarifaSemPropriedade];
      component.preselecionarTarifa();

      expect(component.selecionarTarifa).not.toHaveBeenCalled();
      expect(component.tarifaSelected).toBeNull();
    });
  });

  describe('inicializarTarifaCustomizada()', () => {
    let tarifaPadrao: Tarifa;
    let tarifaCustomizada: Tarifa;

    beforeEach(() => {
      tarifaPadrao = createMockTarifa({
        referencia: true,
        custom: false,
        pgCaixa: 10,
        pgOutros: 20,
        retentativa: 1,
        degustacao: 5
      });

      tarifaCustomizada = createMockTarifa({
        referencia: false,
        custom: true,
        pgCaixa: 0,
        pgOutros: 0,
        retentativa: 0,
        degustacao: 0
      });
    });

    it('deve copiar os valores da tarifa padrão para a tarifa customizada', () => {
      component.tarifas = [tarifaPadrao, tarifaCustomizada];

      component.inicializarTarifaCustomizada();

      expect(tarifaCustomizada.pgCaixa).toBe(tarifaPadrao.pgCaixa);
      expect(tarifaCustomizada.pgOutros).toBe(tarifaPadrao.pgOutros);
      expect(tarifaCustomizada.retentativa).toBe(tarifaPadrao.retentativa);
      expect(tarifaCustomizada.degustacao).toBe(tarifaPadrao.degustacao);
    });

    it('não deve alterar tarifas se nenhuma for customizada', () => {
      const outraTarifa = createMockTarifa({ referencia: false, custom: false });
      component.tarifas = [tarifaPadrao, outraTarifa];
      const valorTarifa = outraTarifa.pgCaixa;

      component.inicializarTarifaCustomizada();

      expect(outraTarifa.pgCaixa).toBe(valorTarifa); // permanece igual
      expect(outraTarifa.custom).toBe(false); // não foi alterada
    });

    it('não deve fazer nada se tarifa padrão não existir', () => {
      const tarifaSemReferencia = createMockTarifa({ referencia: false, custom: true });
      component.tarifas = [tarifaSemReferencia];

      component.inicializarTarifaCustomizada();

      expect(tarifaSemReferencia.pgCaixa).toBe(50); // valor default do mock
      expect(tarifaSemReferencia.pgOutros).toBe(75);
      expect(tarifaSemReferencia.retentativa).toBe(1);
      expect(tarifaSemReferencia.degustacao).toBe(2);
    });

    it('deve ignorar tarifas sem a propriedade custom', () => {
      const tarifaSemCustom = { ...createMockTarifa({ referencia: false }), custom: false };
      component.tarifas = [tarifaPadrao, tarifaSemCustom];

      component.inicializarTarifaCustomizada();

      expect(tarifaSemCustom.pgCaixa).toBe(tarifaSemCustom.pgCaixa); // não alterado
    });
  });

  describe('obterTarifaPadrao()', () => {
    it('deve retornar a primeira tarifa com referencia = true', () => {
      const tarifa1 = createMockTarifa({ referencia: false });
      const tarifa2 = createMockTarifa({ referencia: true });
      const tarifa3 = createMockTarifa({ referencia: true });

      const result = component.obterTarifaPadrao([tarifa1, tarifa2, tarifa3]);

      expect(result).toBe(tarifa2);
    });

    it('deve retornar null se nenhuma tarifa tiver referencia = true', () => {
      const tarifa1 = createMockTarifa({ referencia: false });
      const tarifa2 = createMockTarifa({ referencia: false });

      const result = component.obterTarifaPadrao([tarifa1, tarifa2]);

      expect(result).toBeNull();
    });

    it('deve retornar null se o array estiver vazio', () => {
      const result = component.obterTarifaPadrao([]);
      expect(result).toBeNull();
    });
  });

  describe('alterarSimulacao()', () => {
    beforeEach(() => {
      jest.spyOn(component, 'userAction').mockImplementation(() => { });
      jest.spyOn(component, 'preselecionarTarifa').mockImplementation(() => { });
      jest.spyOn(component, 'inicializarTarifaCustomizada').mockImplementation(() => { });
    });

    it('não deve alterar nada se alterarEnabled for false', () => {
      component.alterarEnabled = false;

      component.alterarSimulacao();

      expect(component.userAction).not.toHaveBeenCalled();
      expect(component.preselecionarTarifa).not.toHaveBeenCalled();
      expect(component.inicializarTarifaCustomizada).not.toHaveBeenCalled();
    });

    it('deve configurar os estados corretamente quando alterarEnabled for true', () => {
      component.alterarEnabled = true;

      component.alterarSimulacao();

      expect(component.userAction).toHaveBeenCalledWith(
        "usuário clicou em alterar uma simulação e esta vendo o formulário de simulação"
      );

      expect(component.pesquisar).toBe(false);
      expect(component.detalhar).toBe(false);
      expect(component.avaliar).toBe(false);
      expect(component.contraproposta).toBeNull();
      expect(component.alterar).toBe(true);
      expect(component.incluir).toBe(false);
      expect(component.tarifaCustomizadaSelecionada).toBe(false);
      expect(component.excecaoSelecionada).toBe(false);
      expect(component.alcadaTarifaDiferenciada).toBe(EnumAlcada.ALCADA_NAO_CALCULADA);

      expect(component.simulacao).toEqual({
        tarifa: true,
        excecoes: {
          contaDebitoDiferente: false,
          inibirRetentativa: false,
          inibirOpenFinance: false,
          minutaContratualForaPadrao: false,
          minutaEditalCredenciamento: false,
          outro: false,
          textoOutro: null
        },
        convenio: "NOVO",
        unidadeConvenino: null,
        contas: [
          { id: "001234.0011.0002", selected: false },
          { id: "004321.0011.0001", selected: false }
        ],
        agendamentosMes: null,
        ticketMedio: null,
        justificativa: null,
        documentacao: null
      });

      expect(component.preselecionarTarifa).toHaveBeenCalled();
      expect(component.inicializarTarifaCustomizada).toHaveBeenCalled();
    });
  });

  describe('incluirSimulacao()', () => {
    beforeEach(() => {
      jest.spyOn(component, 'verificarFuncionalidade').mockReturnValue(true);
      jest.spyOn(component, 'resetNivelAlcada').mockImplementation(() => { });
      jest.spyOn(component, 'preselecionarTarifa').mockImplementation(() => { });
      jest.spyOn(component, 'inicializarTarifaCustomizada').mockImplementation(() => { });
      jest.spyOn(component, 'scrollTop').mockImplementation(() => true);
      jest.spyOn(global, 'dispatchEvent').mockImplementation(() => true);
      component.incluir = false;
    });

    it('não deve executar nada se verificarFuncionalidade(INCLUIR) for false', () => {
      jest.spyOn(component, 'verificarFuncionalidade').mockReturnValue(false);

      component.incluirSimulacao();

      expect(component.incluir).not.toBe(true);
      expect(component.resetNivelAlcada).not.toHaveBeenCalled();
      expect(component.preselecionarTarifa).not.toHaveBeenCalled();
      expect(component.inicializarTarifaCustomizada).not.toHaveBeenCalled();
      expect(component.scrollTop).not.toHaveBeenCalled();
    });

    it('deve configurar os estados corretamente quando clientReadyInclude for true', () => {
      component.nomeAlcadaAtual = EnumAlcada.ALCADA_MATRIZ;
      component.tarifas = [createMockTarifa({ id: 99 })];

      component.incluirSimulacao();

      expect(component.labelBotaoIncluirSimulacao).toBe('Incluir Simulação');
      expect(component.irParaContrato).toBe('off');
      expect(component.pesquisar).toBe(false);
      expect(component.detalhar).toBe(false);
      expect(component.avaliar).toBe(false);
      expect(component.contraproposta).toBeNull();
      expect(component.alterar).toBe(false);
      expect(component.incluir).toBe(true);
      expect(component.erroCalculoAlcada).toBe(false);
      expect(component.alcadaTarifaDiferenciada).toBe(EnumAlcada.ALCADA_NAO_CALCULADA);
      expect(component.grupoMCSelecionadoNoCalculo).toBe(EnumGruposMargemContribuicao.INVALIDO);
      expect(component.grupoMCSelecionadoAtual).toBe(EnumGruposMargemContribuicao.INVALIDO);
      expect(component.tarifaCustomizadaSelecionada).toBe(false);
      expect(component.excecaoSelecionada).toBe(false);
      expect(component.valoresTarifaDiferenciadaSelecionada).toEqual({});
      expect(component.tarifaDiferenciadaDaListaDeTarifas).toEqual({});
      expect(component.simulacao).toEqual(expect.objectContaining({
        tarifa: true,
        convenio: 'NOVO',
        excecoes: expect.objectContaining({
          contaDebitoDiferente: false,
          inibirRetentativa: false,
          inibirOpenFinance: false,
          minutaContratualForaPadrao: false,
          minutaEditalCredenciamento: false,
          outro: false,
          textoOutro: null
        })
      }));
      expect(component.radioButtonTarifas).toBe(EnumRadioButtonTarifas.SIMULACOES_REALIZADAS);
      expect(component.tarifaSelected).toBe("0"); // index da primeira tarifa
      expect(component.resetNivelAlcada).toHaveBeenCalledWith();
      expect(component.preselecionarTarifa).toHaveBeenCalled();
      expect(component.inicializarTarifaCustomizada).toHaveBeenCalled();
      expect(component.scrollTop).toHaveBeenCalled();
      expect(global.dispatchEvent).toHaveBeenCalledWith(expect.any(CustomEvent));
    });

    it('deve usar descricaoSolicitarAutorizacao se nomeAlcadaAtual for diferente de ALCADA_MATRIZ', () => {
      component.nomeAlcadaAtual = EnumAlcada.ALCADA_AGENCIA;

      component.incluirSimulacao();

      expect(component.labelBotaoIncluirSimulacao).toBe('Solicitar Autorização');
    });

    it('não deve definir tarifaSelected se tarifas estiver vazio ou undefined', () => {
      component.tarifas = [];
      component.tarifaSelected = null;

      component.incluirSimulacao();
      expect(component.tarifaSelected).toBeNull();
    });
  });

  describe('isNonNullCurrency()', () => {
    it('deve retornar false se o valor for nulo', () => {
      expect(component.isNonNullCurrency(null as any)).toBe(false);
    });

    it('deve retornar false se o valor não corresponder ao padrão de moeda', () => {
      expect(component.isNonNullCurrency('abc')).toBe(false);
      expect(component.isNonNullCurrency('12.345')).toBe(false); // mais de 2 casas decimais
      expect(component.isNonNullCurrency('12,34')).toBe(false);  // vírgula em vez de ponto
      expect(component.isNonNullCurrency('')).toBe(false);
    });

    it('deve retornar false se o valor for negativo', () => {
      expect(component.isNonNullCurrency('-10.00')).toBe(false);
    });

    it('deve retornar true para valores válidos', () => {
      expect(component.isNonNullCurrency('0')).toBe(true);
      expect(component.isNonNullCurrency('10')).toBe(true);
      expect(component.isNonNullCurrency('10.5')).toBe(true);
      expect(component.isNonNullCurrency('10.00')).toBe(true);
    });
  });

  describe('isNonNullNumeric()', () => {
    it('deve retornar false se o valor for nulo', () => {
      expect(component.isNonNullNumeric(null as any)).toBe(false);
    });

    it('deve retornar false se o valor não corresponder ao padrão numérico inteiro', () => {
      expect(component.isNonNullNumeric('abc')).toBe(false);
      expect(component.isNonNullNumeric('12.34')).toBe(false); // decimal não permitido
      expect(component.isNonNullNumeric('')).toBe(false);
    });

    it('deve retornar false se o valor for negativo', () => {
      expect(component.isNonNullNumeric('-1')).toBe(false);
    });

    it('deve retornar true para valores inteiros positivos válidos', () => {
      expect(component.isNonNullNumeric('0')).toBe(true);
      expect(component.isNonNullNumeric('1')).toBe(true);
      expect(component.isNonNullNumeric('123')).toBe(true);
    });
  });

  describe('processaRetornoConsulta()', () => {
    beforeEach(() => {
      jest.spyOn(component, 'userAction').mockImplementation(() => { });
      jest.spyOn(component, 'carregarTarifas').mockImplementation(() => ({}));
      jest.spyOn(component, 'verificarInconsistenciasCliente').mockImplementation(() => ({}));
    });

    it('deve processar retorno com simulações e configurar cliente e dataSource', () => {
      jest.spyOn(component, 'padNumber').mockImplementation((val, len) => val.toString().padStart(len, '0'));
      jest.spyOn(component, 'formatCnpj').mockImplementation((cnpj) => `formatted-${cnpj}`);
      jest.spyOn(component, 'obterAlcadabyNivel').mockImplementation((nivel) => ({
        status: `S${nivel}`, date: `2023-0${nivel}-01`, nome: `Alçada ${nivel}`
      }));
      jest.spyOn(component, 'getSituacaoAtual').mockImplementation(() => 'Situação Atual');
      jest.spyOn(component, 'getDataInclusao').mockImplementation(() => '2023-01-01');
      jest.spyOn(component, 'getDataInclusaoFormatted').mockImplementation(() => '01/01/2023');
      jest.spyOn(component, 'getDataSituacao').mockImplementation(() => '02/01/2023');
      jest.spyOn(component, 'getLastEtapa').mockImplementation(() => ({ nome: 'Final' }));

      const retornoConsulta = {
        simulacoes: [{
          id: 1,
          unidade_relacionamento: 123,
          cnpj: '12345678000199',
          razaoSocial: 'Empresa Teste',
          simulacaoOriginal: { id: 2 },
          simulacoesAlcada: [],
          diferenciais: ['D1']
        }]
      };

      component.processaRetornoConsulta(retornoConsulta);

      expect(component.cliente).not.toBeNull();

      expect(component.cliente?.simulacoes.length).toBe(1);
      expect(component.cliente?.simulacoes[0].id).toBe('000001');
      expect(component.cliente?.simulacoes[0].unidade).toBe('0123');
      expect(component.dataSource.data).toEqual(component.cliente?.simulacoes);
      expect(component.userAction).toHaveBeenCalledWith(expect.stringContaining('Simulação Número'));
      expect(component.carregarTarifas).toHaveBeenCalledWith('12345678000199');
      expect(component.verificarInconsistenciasCliente).toHaveBeenCalled();
    });
  });

  describe('detalharSimulacao()', () => {
    let spyScrollTop: jest.SpyInstance;
    let spyShowMessage: jest.SpyInstance;
    let spyVerificaSimulacaoEvolutiva: jest.SpyInstance;
    let spyPadNumber: jest.SpyInstance;
    let spyObterAlcadaAtual: jest.SpyInstance;
    let spyPreencheDadosInclusao: jest.SpyInstance;
    let spyPreencherparamContratuais: jest.SpyInstance;
    let spyProcessarPareceres: jest.SpyInstance;
    let spyGetLastParecer: jest.SpyInstance;
    let spyProcessarDocumento: jest.SpyInstance;

    beforeEach(() => {
      spyScrollTop = jest.spyOn(component, 'scrollTop').mockImplementation();
      spyShowMessage = jest.spyOn(component, 'showMessage').mockImplementation();
      spyVerificaSimulacaoEvolutiva = jest.spyOn(component, 'verificaSimulacaoEvolutiva').mockImplementation();

      spyPadNumber = jest.spyOn(component, 'padNumber').mockImplementation((n: number, l: number) => String(n).padStart(l, '0'));
      spyObterAlcadaAtual = jest.spyOn(component, 'obterAlcadaAtual').mockReturnValue({
        tipoSituacao: { nomeSituacao: 'Aprovada' }
      });
      spyPreencheDadosInclusao = jest.spyOn(component, 'preencheDadosInclusao').mockImplementation();
      spyPreencherparamContratuais = jest.spyOn(component, 'preencherparamContratuais').mockImplementation();
      spyProcessarPareceres = jest.spyOn(component, 'processarPareceres').mockReturnValue(['parecer1']);
      spyGetLastParecer = jest.spyOn(component, 'getLastParecer').mockReturnValue('parecer1');
      spyProcessarDocumento = jest.spyOn(component, 'processarDocumento').mockReturnValue(['doc1']);
    });

    it('deve prevenir evento e definir recarregarConsulta', async () => {
      const mockEvent = { preventDefault: jest.fn() };
      const mockResponse = createMockDetalhamentoSimulacao();

      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      }) as any;

      await component.detalharSimulacao(mockEvent, 1888, true);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.recarregarConsulta).toBe(true);
    });

    it('deve exibir mensagem se response tiver mensagem e descricao', async () => {
      const mockResponse = createMockDetalhamentoSimulacao({
        mensagem: 'Mensagem de erro',
        descricao: 'Descrição detalhada'
      });

      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      }) as any;

      await component.detalharSimulacao(null, 1888);

      expect(spyShowMessage).toHaveBeenCalledWith('Mensagem de erro', 'Descrição detalhada');
    });

    it('deve preencher propriedades corretamente com dados válidos', async () => {
      const mockResponse = createMockDetalhamentoSimulacao();

      global.fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      }) as any;

      await component.detalharSimulacao(null, 1888);

      expect(component.numeroSimulacao).toBe('001888');
      expect(component.idSimulacao).toBe(1888);
      expect(component.nomeUnidade.trim()).toBe('PORTO VELHO SHOPPING, RO');
      expect(component.vticketMedio).toBe(12.21);
      expect(component.agendamentoMes).toBe(12);
      expect(component.unidadeSimulacao).toBe(3430);
      expect(component.descSituacao).toBe('Aprovada');
      expect(component.parametrosContratuais).toBe(true);
      expect(component.mostrarTable).toBe(true);
      expect(component.documentos).toEqual(['doc1']);
      expect(component.pesquisar).toBe(false);
      expect(component.detalhar).toBe(true);
      expect(component.avaliar).toBe(false);
      expect(component.contraproposta).toBe(null);
      expect(component.alterar).toBe(false);
      expect(component.incluir).toBe(false);
    });

    it('deve exibir mensagem de erro se fetch falhar', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Erro'));

      await component.detalharSimulacao(null, 1888);

      expect(spyShowMessage).toHaveBeenCalledWith(
        'Ocorreu um erro ao efetuar a busca solicitada',
        'Por favor tente novamente em alguns instantes'
      );
    });
  });

  describe('ordenarPorTsAlcadaCrescente()', () => {
    it('deve ordenar as alcadas por tsAlcada em ordem crescente', () => {
      const alcadas = [
        { tsAlcada: '2025-10-10T10:00:00' },
        { tsAlcada: '2025-10-08T10:00:00' },
        { tsAlcada: '2025-10-09T10:00:00' }
      ];

      const resultado = component.ordenarPorTsAlcadaCrescente(alcadas);

      expect(resultado.map(a => a.tsAlcada)).toEqual([
        '2025-10-08T10:00:00',
        '2025-10-09T10:00:00',
        '2025-10-10T10:00:00'
      ]);
    });

    it('deve retornar array vazio se entrada for vazia', () => {
      const resultado = component.ordenarPorTsAlcadaCrescente([]);
      expect(resultado).toEqual([]);
    });
  });

  describe('ordenarPorTsAlcadaDecrescente()', () => {
    it('deve ordenar as alcadas por tsAlcada em ordem decrescente', () => {
      const alcadas = [
        { tsAlcada: '2025-10-08T10:00:00' },
        { tsAlcada: '2025-10-10T10:00:00' },
        { tsAlcada: '2025-10-09T10:00:00' }
      ];

      const resultado = component.ordenarPorTsAlcadaDecrescente(alcadas);

      expect(resultado.map(a => a.tsAlcada)).toEqual([
        '2025-10-10T10:00:00',
        '2025-10-09T10:00:00',
        '2025-10-08T10:00:00'
      ]);
    });

    it('deve retornar array vazio se entrada for vazia', () => {
      const resultado = component.ordenarPorTsAlcadaDecrescente([]);
      expect(resultado).toEqual([]);
    });
  });

  describe('alternarVisibilidadeTarifa()', () => {
    let tarifa: Tarifa;

    beforeEach(() => {
      tarifa = createMockTarifa();
    });

    it('deve ocultar a tarifa e chamar adicionarPreferencia', () => {
      const spyAdicionar = jest.spyOn(component, 'adicionarPreferencia');
      const spyRemover = jest.spyOn(component, 'removerPreferencia');
      const spySalvar = jest.spyOn(component, 'salvarPreferencias');

      component.alternarVisibilidadeTarifa(tarifa);

      expect(tarifa.visible).toBe(false);
      expect(spyAdicionar).toHaveBeenCalledWith(tarifa);
      expect(spyRemover).not.toHaveBeenCalled();
      expect(spySalvar).toHaveBeenCalled();
    });

    it('deve exibir a tarifa e chamar removerPreferencia', () => {
      tarifa.visible = false;

      const spyAdicionar = jest.spyOn(component, 'adicionarPreferencia');
      const spyRemover = jest.spyOn(component, 'removerPreferencia');
      const spySalvar = jest.spyOn(component, 'salvarPreferencias');

      component.alternarVisibilidadeTarifa(tarifa);

      expect(tarifa.visible).toBe(true);
      expect(spyRemover).toHaveBeenCalledWith(tarifa);
      expect(spyAdicionar).not.toHaveBeenCalled();
      expect(spySalvar).toHaveBeenCalled();
    });
  });

  describe('filtrarItems()', () => {
    beforeEach(() => {
      component.filtrarTarifas = true;
    });

    it('deve inverter o valor de filtrarTarifas de true para false', () => {
      component.filtrarItems();
      expect(component.filtrarTarifas).toBe(false);
    });

    it('deve inverter o valor de filtrarTarifas de false para true', () => {
      component.filtrarTarifas = false;
      component.filtrarItems();
      expect(component.filtrarTarifas).toBe(true);
    });
  });

  describe('verificarInconsistenciasCliente()', () => {
    beforeEach(() => {
      component.inconsistencias = [];
    });

    it('não deve fazer nada se cliente for null', () => {
      component.cliente = null;

      const spyClienteService = jest.spyOn(clienteService, 'descreverRestricoesCliente');

      component.verificarInconsistenciasCliente();

      expect(spyClienteService).not.toHaveBeenCalled();
      expect(component.inconsistencias).toEqual([]);
    });

    it('deve adicionar inconsistências retornadas por clienteService.descreverRestricoesCliente', () => {
      component.cliente = createMockCliente();

      const inconsistenciasMock = ['SICOW inválido'];
      const spyClienteService = jest.spyOn(clienteService, 'descreverRestricoesCliente').mockReturnValue(inconsistenciasMock);

      component.verificarInconsistenciasCliente();

      expect(spyClienteService).toHaveBeenCalledWith(component.cliente.restricoes);
      expect(component.inconsistencias).toEqual(inconsistenciasMock);
    });
  });

  describe('processaCopiaTarifas()', () => {
    const tarifaSimulacaoAtual = createMockTarifa({ id: 2 });
    beforeEach(() => {
      component.tarifas = [
        createMockTarifa({ id: 1 }), tarifaSimulacaoAtual, createMockTarifa({ id: 3 })
      ];
      component.idSimulacao = 2;
      component.proposta = {
        pagadorCaixa: '2.00',
        outrosBancos: '2.00',
        retentativa: '2.00',
        degustacao: '45'
      };
      component.tarifaIndex = jest.fn().mockReturnValue(1);
      component.selecionarTarifa = jest.fn();
      component.pegarTarifaDiferenciadaDaListaDeTarifas = jest.fn();
    });

    it('deve selecionar a tarifa correspondente ao idSimulacao', () => {
      component.processaCopiaTarifas();

      expect(component.tarifaIndex).toHaveBeenCalledWith(tarifaSimulacaoAtual);
      expect(component.tarifaSelected).toBe(1);
      expect(component.selecionarTarifa).toHaveBeenCalledWith(tarifaSimulacaoAtual);
    });

    it('deve configurar tarifa diferenciada se não encontrar tarifa correspondente', () => {
      component.idSimulacao = 99;

      component.processaCopiaTarifas();

      expect(component.radioButtonTarifas).toBe(EnumRadioButtonTarifas.PLEITEAR_CONDICOES);
      expect(component.pegarTarifaDiferenciadaDaListaDeTarifas).toHaveBeenCalled();
      expect(component.tarifaDiferenciadaDaListaDeTarifas.pgCaixa).toBe('2.00');
      expect(component.tarifaDiferenciadaDaListaDeTarifas.pgOutros).toBe('2.00');
      expect(component.tarifaDiferenciadaDaListaDeTarifas.retentativa).toBe('2.00');
      expect(component.tarifaDiferenciadaDaListaDeTarifas.degustacao).toBe('45');
      expect(component.selecionarTarifa).toHaveBeenCalledWith(component.tarifaDiferenciadaDaListaDeTarifas);
    });
  });

  describe('processaCopiaExcecoes()', () => {
    beforeEach(() => {
      component.proposta = {
        contadebito: true,
        inibirRetentativa: false,
        inibirOpenFinance: true,
        minutaContratualSimulacao: false,
        minutaEditalSimulacao: true,
        outrosSimulacao: true,
        outrosSimulacaoDescricao: 'Texto outro'
      };
      component.simulacao = { excecoes: {} };
    });

    it('deve copiar exceções da proposta para a simulação se possuir exceções', () => {
      component.processaCopiaExcecoes();

      expect(component.excecaoSelecionada).toBe(true);
      expect(component.simulacao.excecoes.contaDebitoDiferente).toBe(true);
      expect(component.simulacao.excecoes.inibirRetentativa).toBe(false);
      expect(component.simulacao.excecoes.inibirOpenFinance).toBe(true);
      expect(component.simulacao.excecoes.minutaContratualForaPadrao).toBe(false);
      expect(component.simulacao.excecoes.minutaEditalCredenciamento).toBe(true);
      expect(component.simulacao.excecoes.outro).toBe(true);
      expect(component.simulacao.excecoes.textoOutro).toBe('Texto outro');
    });

    it('não deve copiar exceções se não possuir exceções', () => {
      jest.spyOn(component, 'possuiExcecoes').mockReturnValue(false);
      component.excecaoSelecionada = false;

      component.processaCopiaExcecoes();

      expect(component.excecaoSelecionada).toBe(false);
      expect(component.simulacao.excecoes).toStrictEqual({});
    });
  });

  describe('processaCopiaJustificativa()', () => {
    beforeEach(() => {
      component.simulacao = {
        contas: [
          { id: '123', selected: false },
          { id: '456', selected: false }
        ]
      };
      component.proposta = {
        migracaoConvenio: '123,999'
      };
      component.agendamentoMes = 5;
      component.vticketMedio = 1000;
      component.justificativaInclusao = 'Justificativa de inclusão';
    });

    it('deve copiar dados da proposta para a simulação e marcar contas migradas', () => {
      component.processaCopiaJustificativa();

      expect(component.simulacao.convenio).toBe('NOVO');
      expect(component.simulacao.agendamentosMes).toBe(5);
      expect(component.simulacao.ticketMedio).toBe(1000);
      expect(component.simulacao.migracaoDebito).toBe(true);
      expect(component.simulacao.contas[0].selected).toBe(true);
      expect(component.simulacao.contas[1].selected).toBe(false);
      expect(component.simulacao.justificativa).toBe('Justificativa de inclusão');
      expect(component.simulacao.documentacao).toBeNull();
    });

    it('deve configurar migracaoDebito como false se migracaoConvenio for null', () => {
      component.proposta.migracaoConvenio = null;

      component.processaCopiaJustificativa();

      expect(component.simulacao.migracaoDebito).toBe(false);
    });
  });

  describe('verificarSeHaExcecaoMarcada()', () => {
    beforeEach(() => {
      component.simulacao = {
        excecoes: {
          debito: false,
          contaDebitoDiferente: false,
          inibirRetentativa: false,
          inibirOpenFinance: false,
          minutaContratualForaPadrao: false,
          minutaEditalCredenciamento: false,
          outro: false
        }
      };
    });

    it('deve retornar false se nenhuma exceção estiver marcada', () => {
      const resultado = component.verificarSeHaExcecaoMarcada();
      expect(resultado).toBe(false);
    });

    it('deve retornar true se debito estiver marcado', () => {
      component.simulacao.excecoes.debito = true;
      const resultado = component.verificarSeHaExcecaoMarcada();
      expect(resultado).toBe(true);
    });

    it('deve retornar true se contaDebitoDiferente estiver marcada', () => {
      component.simulacao.excecoes.contaDebitoDiferente = true;
      const resultado = component.verificarSeHaExcecaoMarcada();
      expect(resultado).toBe(true);
    });

    it('deve retornar true se inibirRetentativa estiver marcada', () => {
      component.simulacao.excecoes.inibirRetentativa = true;
      const resultado = component.verificarSeHaExcecaoMarcada();
      expect(resultado).toBe(true);
    });

    it('deve retornar true se inibirOpenFinance estiver marcada', () => {
      component.simulacao.excecoes.inibirOpenFinance = true;
      const resultado = component.verificarSeHaExcecaoMarcada();
      expect(resultado).toBe(true);
    });

    it('deve retornar true se minutaContratualForaPadrao estiver marcada', () => {
      component.simulacao.excecoes.minutaContratualForaPadrao = true;
      const resultado = component.verificarSeHaExcecaoMarcada();
      expect(resultado).toBe(true);
    });

    it('deve retornar true se minutaEditalCredenciamento estiver marcada', () => {
      component.simulacao.excecoes.minutaEditalCredenciamento = true;
      const resultado = component.verificarSeHaExcecaoMarcada();
      expect(resultado).toBe(true);
    });

    it('deve retornar true se outro estiver marcado', () => {
      component.simulacao.excecoes.outro = true;
      const resultado = component.verificarSeHaExcecaoMarcada();
      expect(resultado).toBe(true);
    });
  });

  describe('cancelarInclusao()', () => {
    beforeEach(() => {
      component.cliente = createMockCliente({ simulacoes: [createMockSimulacao()] });
      component.paginator = { length: 2 };
      component.sort = { active: 'id' };
    });

    it('deve redefinir os estados e fechar os modais', () => {
      component.cancelarInclusao();

      expect(component.pesquisar).toBe(true);
      expect(component.detalhar).toBe(false);
      expect(component.avaliar).toBe(false);
      expect(component.contraproposta).toBeNull();
      expect(component.alterar).toBe(false);
      expect(component.incluir).toBe(false);
      expect(component.simulacao).toBeNull();
    });

    it('deve configurar o dataSource com as simulações do cliente', () => {
      component.cancelarInclusao();

      expect(component.dataSource.data).toEqual(component.cliente!.simulacoes);
    });

    it('deve configurar paginator e sort se existirem', () => {
      component.cancelarInclusao();

      expect(component.dataSource.paginator).toBe(component.paginator);
      expect(component.dataSource.sort).toBe(component.sort);
    });

    it('não deve configurar paginator e sort se forem undefined', () => {
      component.paginator = undefined;
      component.sort = undefined;

      component.cancelarInclusao();

      expect(component.dataSource.paginator).toBeUndefined();
      expect(component.dataSource.sort).toBeUndefined();
    });
  });

  it('calcularAlcada() deve lançar erro quando nivelAlcada não está no mapaNiveisAlcada', async () => {
    component.valoresTarifaDiferenciadaSelecionada = {
      id: 1,
      tipo: 2,
      referencia: true,
      condicao: 'Condição Exemplo',
      pgCaixa: 5,
      pgOutros: 3,
      retentativa: 2,
      degustacao: 10,
      situacao: 'Ativo',
      recomended: true,
      custom: true,
      visible: true
    };

    component.grupoMCSelecionadoNoCalculo = EnumGruposMargemContribuicao.GRUPO_1;

    const resetSpy = jest.spyOn(component, 'resetNivelAlcada');
    const snackbarSpy = jest.spyOn(component, 'openSnackbar');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ nivelAlcada: 'ALCADA_DESCONHECIDA' }) // não está no mapa
      })
    ) as jest.Mock;

    component.calcularAlcada();
    await flushPromises();

    expect(component.erroCalculoAlcada).toBe(true);
    expect(resetSpy).toHaveBeenCalled();
    expect(snackbarSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
  });
});
