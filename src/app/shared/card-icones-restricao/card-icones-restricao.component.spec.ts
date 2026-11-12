
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../shared.module';
import { CardIconesRestricaoComponent } from './card-icones-restricao.component';
import { RestricoesClienteService } from '../../services/restricoes-cliente/restricoes-cliente.service';
import { FormatadorService } from '../../services/formatador/formatador.service';
import { ClienteService } from '../../services/cliente/cliente.service';
import { StatusRestricaoCliente } from '../enums/status-restricao-cliente.enum';
import { EnumOrigemConsulta } from '../models/cliente.model';
import { Conta } from '../models/convenio/convenio.model';
import { SimpleChange, SimpleChanges } from '@angular/core';

describe('CardIconesRestricaoComponent', () => {
  let component: CardIconesRestricaoComponent;
  let fixture: ComponentFixture<CardIconesRestricaoComponent>;

  // Mocks dos serviços
  const mockRestricoesClienteService: any = {
    mapBooleanToStatus: jest.fn(),
    mapArrayToStatus: jest.fn(),
    descreverRestricoesCliente: jest.fn(),
    obterDescricaoIconeRestricaoCliente: jest.fn(),
    obterClasseEstiloIconeRestricaoCliente: jest.fn(),
    mapExtraiArray: jest.fn(),
    tratandoRetornoContasPj: jest.fn(),
  };

  const mockFormatadorService: any = {
    formatarDocumento: jest.fn(),
  };

  const mockClienteService: any = {
    obterRestricaoDadosEmpresa: jest.fn(),
    obterRestricaoSICOW: jest.fn(),
    obterRestricaoContasPj: jest.fn(),
    obterDescricaoIconeRestricaoCliente: jest.fn(),
    obterClasseEstiloIconeRestricaoCliente: jest.fn(),
    obterRestricaoFraude: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CardIconesRestricaoComponent],
      imports: [SharedModule],
      providers: [
        { provide: RestricoesClienteService, useValue: mockRestricoesClienteService },
        { provide: FormatadorService, useValue: mockFormatadorService },
        { provide: ClienteService, useValue: mockClienteService },
      ],
    });

    fixture = TestBed.createComponent(CardIconesRestricaoComponent);
    component = fixture.componentInstance;

    // Inputs necessários
    component.cliente = { cnpj: '12345678000199' }; // válido (14 dígitos)
    component.origem = EnumOrigemConsulta.CONVENIO;

    // Defaults seguros para evitar `mensagens.length` undefined
    mockRestricoesClienteService.descreverRestricoesCliente.mockReturnValue([]);
    mockRestricoesClienteService.mapBooleanToStatus.mockImplementation((value: boolean | null | undefined) => {
      if (value === true) return StatusRestricaoCliente.Valido;
      if (value === false) return StatusRestricaoCliente.Invalido;
      return StatusRestricaoCliente.Indefinido;
    });
    mockRestricoesClienteService.mapArrayToStatus.mockImplementation((arr: any[] | null | undefined) => {
      if (arr === null || arr === undefined) return StatusRestricaoCliente.Indefinido;
      if (Array.isArray(arr) && arr.length > 0) return StatusRestricaoCliente.Invalido;
      return StatusRestricaoCliente.Valido;
    });
    mockRestricoesClienteService.tratandoRetornoContasPj.mockReturnValue({
      status: StatusRestricaoCliente.Indefinido,
      contasArray: [],
    });
    mockRestricoesClienteService.mapExtraiArray.mockReturnValue([]);

    mockFormatadorService.formatarDocumento.mockImplementation((doc: string) => doc);

    // Evitar `ngOnInit` automático: NÃO chamar fixture.detectChanges()
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ---------- ngOnChanges ----------
  it('ngOnChanges() deve disparar as quatro orquestrações', () => {
    const spyDados = jest.spyOn(component, 'orquestrarAPIObterDadosEmpresa').mockResolvedValue();
    const spySicow = jest.spyOn(component, 'orquestrarAPIObterSICOW').mockResolvedValue();
    const spyContas = jest.spyOn(component, 'orquestrarAPIObterContasPj').mockResolvedValue();
    const spyFraudes = jest.spyOn(component, 'orquestrarAPIFraude').mockResolvedValue();

    const changes: SimpleChanges = {
      cliente: new SimpleChange(null, component.cliente, true),
    };

    component.ngOnChanges(changes);

    expect(spyDados).toHaveBeenCalledTimes(1);
    expect(spySicow).toHaveBeenCalledTimes(1);
    expect(spyContas).toHaveBeenCalledTimes(1);
    expect(spyFraudes).toHaveBeenCalledTimes(1);
  });

  it('ngOnInit() deve chamar definirRestricoesIndefinido() caso CNPJ nao seja valido', () => {
    component.cliente = { cnpj: '123' }; // inválido
    const spyDefinirRestricoesIndefinido = jest.spyOn(component as any, 'definirRestricoesIndefinido').mockImplementation();

    const changes: SimpleChanges = {
      cliente: new SimpleChange(null, component.cliente, true),
    };
    component.ngOnChanges(changes);

    expect(spyDefinirRestricoesIndefinido).toHaveBeenCalledTimes(1);

  });

  // ---------- orquestrarAPIObterDadosEmpresa ----------
  describe('orquestrarAPIObterDadosEmpresa()', () => {
    it('deve setar dados e emitir contas quando API retorna sucesso', async () => {
      component.dadosCadastraisOutput = { emit: jest.fn() } as any;
      const dadosEmpresaMock = {
        marcaDoiDesatualizado: 'N',
        cnpj: '12345678000199',
        razaoSocial: 'Teste',
        dadosCadastrais: {},
        dataConstituicaoValida: true
      };

      mockClienteService.obterRestricaoDadosEmpresa.mockResolvedValue(dadosEmpresaMock);

      await component.orquestrarAPIObterDadosEmpresa('12345678000199');

      expect(mockClienteService.obterRestricaoDadosEmpresa).toHaveBeenCalledWith(component.origem, '12345678000199', expect.any(AbortSignal));
      expect(component.razaoSocial).toBe(dadosEmpresaMock.razaoSocial);
      expect(component.dataConstituicaoValidaSig()).toBe(StatusRestricaoCliente.Valido);
      expect(component.dadosCadastraisOutput.emit).toHaveBeenCalledWith(dadosEmpresaMock.dadosCadastrais);
    });

    it('deve setar "Indefinido" quando CNPJ inválido (<14) e não chamar serviço', async () => {
      mockClienteService.obterRestricaoDadosEmpresa.mockReset();

      component.cliente = { cnpj: '123' }; // inválido
      await component.orquestrarAPIObterDadosEmpresa(component.cliente.cnpj);

      expect(component.razaoSocial).toBe('Erro ao obter informações deste CNPJ');
      expect(component.cadastroSig()).toBe(StatusRestricaoCliente.Indefinido);
      expect(component.dataConstituicaoValidaSig()).toBe(StatusRestricaoCliente.Indefinido);
      expect(component.dadosEmpresaLoading).toBe(false);
    });

    it('deve setar "Indefinido" em erro e limpar controller', async () => {
      mockClienteService.obterRestricaoDadosEmpresa.mockReset();
      mockClienteService.obterRestricaoDadosEmpresa.mockRejectedValueOnce(new Error('Erro'));

      await component.orquestrarAPIObterDadosEmpresa(component.cliente.cnpj);

      expect(component.razaoSocial).toBe('Erro ao obter informações deste CNPJ');
      expect(component.cadastroSig()).toBe(StatusRestricaoCliente.Indefinido);
      expect(component.dataConstituicaoValidaSig()).toBe(StatusRestricaoCliente.Indefinido);
      expect(component.dadosEmpresaLoading).toBe(false);

      expect((component as any).abortControllers.has('cadastro')).toBe(false);
    });
  });

  // ---------- orquestrarAPIObterSICOW ----------
  describe('orquestrarAPIObterSICOW()', () => {
    it('deve setar "Indefinido" quando CNPJ inválido (<14) e não chamar serviço', async () => {
      mockClienteService.obterRestricaoSICOW.mockReset();

      component.cliente = { cnpj: '000' }; // inválido
      await component.orquestrarAPIObterSICOW(component.cliente.cnpj);

      expect(component.sicowSig()).toBe(StatusRestricaoCliente.Indefinido);
      expect(component.sicowLoading).toBe(false);
    });

    it('deve setar "Indefinido" em caso de erro', async () => {
      mockClienteService.obterRestricaoSICOW.mockReset();
      mockClienteService.obterRestricaoSICOW.mockRejectedValueOnce(new Error('Falha SICOW'));

      await component.orquestrarAPIObterSICOW(component.cliente.cnpj);

      expect(component.sicowSig()).toBe(StatusRestricaoCliente.Indefinido);
      expect(component.sicowLoading).toBe(false);
      expect((component as any).abortControllers.has('sicow')).toBe(false);
    });
  });

  // ---------- orquestrarAPIObterContasPj ----------
  describe('orquestrarAPIObterContasPj()', () => {

    it('deve definir status e emitir contas quando API retorna sucesso', async () => {
      component.contasAtivasOutput = { emit: jest.fn() } as any;
      const contasMock = [{ id: 1 }, { id: 2 }];
      mockClienteService.obterRestricaoContasPj.mockResolvedValue({ contas: contasMock });
      const spyDefinirStatus = jest.spyOn(component as any, 'definirStatusContaPj').mockReturnValue(StatusRestricaoCliente.Valido);


      await component.orquestrarAPIObterContasPj('12345678000199');

      expect(mockClienteService.obterRestricaoContasPj).toHaveBeenCalledWith(component.origem, '12345678000199', expect.any(AbortSignal));
      expect(spyDefinirStatus).toHaveBeenCalledWith(contasMock);
      expect(component.contaPjSig()).toBe(StatusRestricaoCliente.Valido);
      expect(component.contasAtivasOutput.emit).toHaveBeenCalledWith(contasMock);
    });

    it('deve setar "Indefinido" quando CNPJ inválido (<14) e não chamar serviço', async () => {
      mockClienteService.obterRestricaoContasPj.mockReset();

      component.cliente = { cnpj: '1111' }; // inválido
      await component.orquestrarAPIObterContasPj(component.cliente.cnpj);

      expect(component.contaPjSig()).toBe(StatusRestricaoCliente.Indefinido);
      expect(component.contaPjLoading).toBe(false);
    });

    it('deve setar "Indefinido" em caso de erro e logar o erro', async () => {
      mockClienteService.obterRestricaoContasPj.mockReset();
      mockClienteService.obterRestricaoContasPj.mockRejectedValueOnce(new Error('Falha Contas'));

      await component.orquestrarAPIObterContasPj(component.cliente.cnpj);

      expect(component.contaPjSig()).toBe(StatusRestricaoCliente.Indefinido);
      expect(component.contaPjLoading).toBe(false);
      expect((component as any).abortControllers.has('contaPJ')).toBe(false);
    });
  });

  describe('orquestrarAPIFraude()', () => {
    beforeEach(() => {
      mockClienteService.obterRestricaoFraude.mockReset();
    })

    it('deve setar fraudeSig coretamente em caso de fraude registrada', async () => {
      component.cliente = { cnpj: '12345678901234' };
      const mockFraudeResponse = { "fraudeRegistrada": true };

      mockClienteService.obterRestricaoFraude.mockResolvedValue(mockFraudeResponse);

      await component.orquestrarAPIFraude(component.cliente.cnpj);

      expect(component.fraudeSig()).toBe(StatusRestricaoCliente.Invalido);
    });

    it('deve setar fraudeSig coretamente em caso de fraude nao registrada', async () => {
      component.cliente = { cnpj: '12345678901234' };
      const mockFraudeResponse = { "fraudeRegistrada": false };

      mockClienteService.obterRestricaoFraude.mockResolvedValue(mockFraudeResponse);

      await component.orquestrarAPIFraude(component.cliente.cnpj);

      expect(component.fraudeSig()).toBe(StatusRestricaoCliente.Valido);
    });

    it('deve setar "Indefinido" quando CNPJ inválido (<14) e não chamar serviço', async () => {
      mockClienteService.obterRestricaoSICOW.mockReset();

      component.cliente = { cnpj: '000' }; // inválido
      await component.orquestrarAPIFraude(component.cliente.cnpj);

      expect(component.fraudeSig()).toBe(StatusRestricaoCliente.Indefinido);
      expect(component.fraudeLoading).toBe(false);
    });

    it('deve setar "Indefinido" em caso de erro', async () => {
      mockClienteService.obterRestricaoSICOW.mockReset();
      mockClienteService.obterRestricaoSICOW.mockRejectedValueOnce(new Error('Falha SICOW'));

      await component.orquestrarAPIFraude(component.cliente.cnpj);

      expect(component.fraudeSig()).toBe(StatusRestricaoCliente.Indefinido);
      expect(component.fraudeLoading).toBe(false);
      expect((component as any).abortControllers.has('fraude')).toBe(false);
    });
  });

  // ---------- Inconsistências (computed + getter) ----------
  describe('Inconsistências', () => {
    it('deve retornar título vazio quando não há mensagens', () => {
      mockRestricoesClienteService.descreverRestricoesCliente.mockReturnValueOnce([]);

      const inc = component.Inconsistencias;
      expect(inc?.mensagens).toEqual([]);
      expect(inc?.titulo).toBe('');
    });

    it('deve retornar título singular quando há 1 mensagem', () => {
      mockRestricoesClienteService.descreverRestricoesCliente.mockReturnValueOnce(['Uma restrição']);

      const inc = component.Inconsistencias;
      expect(inc?.mensagens).toEqual(['Uma restrição']);
      expect(inc?.titulo).toBe('Existe impedimento para inclusão de convênio');
    });

    it('deve retornar título plural quando há >1 mensagem', () => {
      mockRestricoesClienteService.descreverRestricoesCliente.mockReturnValueOnce(['R1', 'R2']);

      const inc = component.Inconsistencias;
      expect(inc?.mensagens).toEqual(['R1', 'R2']);
      expect(inc?.titulo).toBe('Existem impedimentos para inclusão de convênio');
    });
  });

  // ---------- formatação e descrições ----------
  describe('cnpjFormatado()', () => {
    it('deve delegar ao FormatadorService.formatarDocumento', () => {
      mockFormatadorService.formatarDocumento.mockReturnValueOnce('12.345.678/0001-99');

      const result = component.cnpjFormatado;

      expect(mockFormatadorService.formatarDocumento).toHaveBeenCalledWith(component.cliente.cnpj);
      expect(result).toBe('12.345.678/0001-99');
    });
  });

  describe('obterDescricaoIconeRestricaoCliente() e obterClasseIconeRestricoesCliente()', () => {
    it('obterDescricaoIconeRestricaoCliente deve delegar ao ClienteService', () => {
      mockClienteService.obterDescricaoIconeRestricaoCliente.mockReturnValueOnce('SICOW OK');

      const texto = component.obterDescricaoIconeRestricaoCliente('sicow', StatusRestricaoCliente.Valido);

      expect(mockClienteService.obterDescricaoIconeRestricaoCliente).toHaveBeenCalledWith('sicow', StatusRestricaoCliente.Valido);
      expect(texto).toBe('SICOW OK');
    });

    it('obterClasseIconeRestricoesCliente deve delegar ao ClienteService', () => {
      mockClienteService.obterClasseEstiloIconeRestricaoCliente.mockReturnValueOnce('client-ok');

      const classe = component.obterClasseIconeRestricoesCliente(StatusRestricaoCliente.Valido);

      expect(mockClienteService.obterClasseEstiloIconeRestricaoCliente).toHaveBeenCalledWith(StatusRestricaoCliente.Valido);
      expect(classe).toBe('client-ok');
    });
  });

  // ---------- ngOnDestroy ----------
  describe('ngOnDestroy()', () => {
    it('deve abortar todos os controllers e limpar o mapa', () => {
      const ctrlCadastro = new AbortController();
      const ctrlSicow = new AbortController();
      const ctrlContaPJ = new AbortController();

      const abort1 = jest.spyOn(ctrlCadastro, 'abort');
      const abort2 = jest.spyOn(ctrlSicow, 'abort');
      const abort3 = jest.spyOn(ctrlContaPJ, 'abort');

      (component as any).abortControllers.set('cadastro', ctrlCadastro);
      (component as any).abortControllers.set('sicow', ctrlSicow);
      (component as any).abortControllers.set('contaPJ', ctrlContaPJ);

      component.ngOnDestroy();

      expect(abort1).toHaveBeenCalled();
      expect(abort2).toHaveBeenCalled();
      expect(abort3).toHaveBeenCalled();
      expect((component as any).abortControllers.size).toBe(0);
    });
  });

  describe('definirRestricoesIndefinido()', () => {
    it('deve setar as variaveis corretamente', () => {
      (component as any).definirRestricoesIndefinido();

      expect(component.razaoSocial).toBe("Indefinido");
      expect(component.contaPjSig()).toBe(StatusRestricaoCliente.Indefinido);
      expect(component.sicowSig()).toBe(StatusRestricaoCliente.Indefinido);
      expect(component.dataConstituicaoValidaSig()).toBe(StatusRestricaoCliente.Indefinido);
      expect(component.cadastroSig()).toBe(StatusRestricaoCliente.Indefinido);

    });
  });

  describe('definirStatusContaPj()', () => {
    it('deve retornar Invalido caso contas seja null', () => {
      const contas = null;

      const retorno = (component as any).definirStatusContaPj(contas);

      expect(retorno).toBe(StatusRestricaoCliente.Invalido);

    });

    it('deve retornar Invalido caso nao obtenha contas', () => {
      const contas: Conta[] = [];

      const retorno = (component as any).definirStatusContaPj(contas);

      expect(retorno).toBe(StatusRestricaoCliente.Invalido);

    });

    it('deve retornar Valido caso obtenha contas', () => {
      const contas = [{
        id: 1,
        codigoOperacao: '1',
        dbConta: 'Teste',
        numeroAgencia: '1',
        numeroConta: '1',
        produto: 'Teste'
      }];

      const retorno = (component as any).definirStatusContaPj(contas);

      expect(retorno).toBe(StatusRestricaoCliente.Valido);

    });
  });
});
