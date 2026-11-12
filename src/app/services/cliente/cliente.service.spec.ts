
import { TestBed } from '@angular/core/testing';
import { ClienteService } from './cliente.service';
import { RestricoesClienteService } from '../restricoes-cliente/restricoes-cliente.service';
import { StatusRestricaoCliente } from '../../shared/enums/status-restricao-cliente.enum';
import { ContasPJResponse, RestricaoFraudeResponse, RestricoesCliente } from '../../shared/models/convenio/convenio.model';
import { DESCRICOES_ICONES_RESTRICOES } from '../../shared/constants/cliente.constants';
import { EnumTexto } from '../../interfaces';
import { DadosEmpresaConvenioResponse, EnumOrigemConsulta } from '../../shared/models/cliente.model';
import { mockDadosCadastrais } from '../../../test-helpers/convenio/mockDadosCadastrais';
import { ConvenioService } from '../convenio/convenio.service';

describe('ClienteService', () => {
  let service: ClienteService;
  let convenioService: ConvenioService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClienteService, RestricoesClienteService, ConvenioService]
    });
    service = TestBed.inject(ClienteService);
    convenioService = TestBed.inject(ConvenioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --------------------------------------
  // processaDadosCliente()
  // --------------------------------------
  describe('processaDadosCliente()', () => {
    it('deve retornar Cliente com restrições vindas de restricoesPai e cnpj/nome obtidos dos dados', () => {
      const dados = {
        cnpj: '123',
        razaoSocial: 'Empresa'
      };

      // Como o método copia as restrições de restricoesPai, definimos exatamente o que esperamos
      const restricoesPai: RestricoesCliente = {
        sicow: StatusRestricaoCliente.Invalido,
        contaPJ: StatusRestricaoCliente.Invalido,
        cadastro: StatusRestricaoCliente.Valido,
        dataConstituicao: StatusRestricaoCliente.Invalido,
        fraude: StatusRestricaoCliente.Valido
      };

      const cliente = service.processaDadosCliente(dados, restricoesPai);

      // restrições devem refletir o objeto restricoesPai
      expect(cliente.restricoes.sicow).toBe(StatusRestricaoCliente.Invalido);
      expect(cliente.restricoes.contaPJ).toBe(StatusRestricaoCliente.Invalido);
      expect(cliente.restricoes.cadastro).toBe(StatusRestricaoCliente.Valido);
      expect(cliente.restricoes.dataConstituicao).toBe(StatusRestricaoCliente.Invalido);

      // cnpj/nome obtidos via getters do serviço
      expect(cliente.cnpj).toBe('123');
      expect(cliente.nome).toBe('Empresa');

      // demais campos
      expect(cliente.simulacoes).toEqual([]);
      expect(cliente.convenios).toEqual([]);
    });
  });

  // --------------------------------------
  // processaDadosCliente() - Campo SICOW
  // --------------------------------------
  describe('processaDadosCliente() - Campo SICOW', () => {
    const casos: Array<{ esperado: StatusRestricaoCliente }> = [
      { esperado: StatusRestricaoCliente.Valido },
      { esperado: StatusRestricaoCliente.Invalido },
      { esperado: StatusRestricaoCliente.Indefinido },
    ];

    it.each(casos)('deve refletir em cliente.restricoes.sicow o valor vindo de restricoesPai: $esperado', ({ esperado }) => {
      const dados = {
        cnpj: '123',
        razaoSocial: 'Empresa do teste'
      };

      const restricoesPai: RestricoesCliente = {
        sicow: esperado,
        contaPJ: StatusRestricaoCliente.Valido,
        cadastro: StatusRestricaoCliente.Valido,
        dataConstituicao: StatusRestricaoCliente.Valido,
        fraude: StatusRestricaoCliente.Valido
      };

      const cliente = service.processaDadosCliente(dados, restricoesPai);

      expect(cliente.restricoes.sicow).toBe(esperado);
      expect(cliente.cnpj).toBe(dados.cnpj);
      expect(cliente.nome).toBe(dados.razaoSocial);
      expect(cliente.simulacoes).toEqual([]);
      expect(cliente.convenios).toEqual([]);
    });
  });

  // --------------------------------------
  // processaDadosCliente() - Campo dataConstituicao
  // --------------------------------------
  describe('processaDadosCliente() - Campo dataConstituicao', () => {
    const casos: Array<{ entrada: StatusRestricaoCliente; esperado: StatusRestricaoCliente }> = [
      { entrada: StatusRestricaoCliente.Valido, esperado: StatusRestricaoCliente.Valido },
      { entrada: StatusRestricaoCliente.Invalido, esperado: StatusRestricaoCliente.Invalido },
      { entrada: StatusRestricaoCliente.Indefinido, esperado: StatusRestricaoCliente.Indefinido },
    ];

    it.each(casos)('deve refletir em cliente.restricoes.dataConstituicao o valor vindo de restricoesPai: $esperado', ({ entrada, esperado }) => {
      const dados = {
        cnpj: '123',
        razaoSocial: 'Empresa do teste'
      };

      const restricoesPai: RestricoesCliente = {
        sicow: StatusRestricaoCliente.Valido,
        contaPJ: StatusRestricaoCliente.Valido,
        cadastro: StatusRestricaoCliente.Valido,
        dataConstituicao: entrada,
        fraude: StatusRestricaoCliente.Valido
      };

      const cliente = service.processaDadosCliente(dados, restricoesPai);

      expect(cliente.restricoes.dataConstituicao).toBe(esperado);
      expect(cliente.cnpj).toBe(dados.cnpj);
      expect(cliente.nome).toBe(dados.razaoSocial);
      expect(cliente.simulacoes).toEqual([]);
      expect(cliente.convenios).toEqual([]);
    });
  });

  // --------------------------------------
  // descreverRestricoesCliente()
  // --------------------------------------
  describe('descreverRestricoesCliente()', () => {
    it('deve retornar descrições apenas das restrições inválidas', () => {
      const restricoes = {
        sicow: StatusRestricaoCliente.Invalido,
        contaPJ: StatusRestricaoCliente.Valido,
        cadastro: StatusRestricaoCliente.Invalido,
        dataConstituicao: StatusRestricaoCliente.Invalido,
        fraude: StatusRestricaoCliente.Valido
      };

      const resultado = service.descreverRestricoesCliente(restricoes);

      expect(resultado).toEqual([
        'Restrição no SICOW',
        'Cadastro desatualizado (Cliente com registro de marca DOI)',
        'CNPJ com data de constituição inferior a 6 meses'
      ]);
    });

    it('deve retornar array vazio se não houver restrições inválidas', () => {
      const restricoes = {
        sicow: StatusRestricaoCliente.Valido,
        contaPJ: StatusRestricaoCliente.Valido,
        cadastro: StatusRestricaoCliente.Valido,
        dataConstituicao: StatusRestricaoCliente.Valido,
        fraude: StatusRestricaoCliente.Valido
      };

      expect(service.descreverRestricoesCliente(restricoes)).toEqual([]);
    });
  });

  // --------------------------------------
  // obterDescricaoIconeRestricaoCliente()
  // --------------------------------------
  describe('obterDescricaoIconeRestricaoCliente()', () => {
    it('deve retornar a descrição correta para cada status (campo sicow)', () => {
      expect(service.obterDescricaoIconeRestricaoCliente('sicow', StatusRestricaoCliente.Valido))
        .toBe(DESCRICOES_ICONES_RESTRICOES.sicow.VALIDO);
      expect(service.obterDescricaoIconeRestricaoCliente('sicow', StatusRestricaoCliente.Invalido))
        .toBe(DESCRICOES_ICONES_RESTRICOES.sicow.INVALIDO);
      expect(service.obterDescricaoIconeRestricaoCliente('sicow', StatusRestricaoCliente.Indefinido))
        .toBe(DESCRICOES_ICONES_RESTRICOES.sicow.INDEFINIDO);
    });
  });

  // --------------------------------------
  // obterClasseEstiloIconeRestricaoCliente()
  // --------------------------------------
  describe('obterClasseEstiloIconeRestricaoCliente()', () => {
    it('deve retornar "client-warning" para status inválido', () => {
      expect(service.obterClasseEstiloIconeRestricaoCliente(StatusRestricaoCliente.Invalido)).toBe('client-warning');
    });

    it('deve retornar "client-ok" para status válido', () => {
      expect(service.obterClasseEstiloIconeRestricaoCliente(StatusRestricaoCliente.Valido)).toBe('client-ok');
    });

    it('deve retornar "client-disabled" para status indefinido', () => {
      expect(service.obterClasseEstiloIconeRestricaoCliente(StatusRestricaoCliente.Indefinido)).toBe('client-disabled');
    });
  });

  // --------------------------------------
  // verificarRestricaoValida()
  // --------------------------------------
  describe('verificarRestricaoValida()', () => {
    it('deve retornar true se a restrição for válida', () => {
      const result = service.verificarRestricaoValida(StatusRestricaoCliente.Valido);
      expect(result).toBe(true);
    });

    it('deve retornar false se a restrição não for válida', () => {
      const result = service.verificarRestricaoValida(StatusRestricaoCliente.Invalido);
      expect(result).toBe(false);

      const resultIndefinido = service.verificarRestricaoValida(StatusRestricaoCliente.Indefinido);
      expect(resultIndefinido).toBe(false);
    });
  });

  // --------------------------------------
  // verificarClientePossuiRestricaoInvalida()
  // --------------------------------------
  describe('verificarClientePossuiRestricaoInvalida()', () => {
    const campos: (keyof RestricoesCliente)[] = [
      'sicow',
      'contaPJ',
      'cadastro',
      'dataConstituicao',
      'fraude'
    ];

    it.each(campos)('deve retornar true se %s estiver como Invalido', (campo) => {
      const restricoes: RestricoesCliente = {
        sicow: StatusRestricaoCliente.Valido,
        contaPJ: StatusRestricaoCliente.Valido,
        cadastro: StatusRestricaoCliente.Valido,
        dataConstituicao: StatusRestricaoCliente.Valido,
        fraude: StatusRestricaoCliente.Valido
      };

      restricoes[campo] = StatusRestricaoCliente.Invalido;

      expect(service.verificarClientePossuiRestricaoNaoValido(restricoes)).toBe(true);
    });

    it('deve retornar false se não houver restrição inválida', () => {
      const mockRestricoes: RestricoesCliente = {
        sicow: StatusRestricaoCliente.Valido,
        contaPJ: StatusRestricaoCliente.Valido,
        cadastro: StatusRestricaoCliente.Valido,
        dataConstituicao: StatusRestricaoCliente.Valido,
        fraude: StatusRestricaoCliente.Valido
      };
      const result = service.verificarClientePossuiRestricaoNaoValido(mockRestricoes);
      expect(result).toBe(false);
    });

    it('deve retornar false se não houver restrição inválida e fraude for indefinido', () => {
      const mockRestricoes: RestricoesCliente = {
        sicow: StatusRestricaoCliente.Valido,
        contaPJ: StatusRestricaoCliente.Valido,
        cadastro: StatusRestricaoCliente.Valido,
        dataConstituicao: StatusRestricaoCliente.Valido,
        fraude: StatusRestricaoCliente.Indefinido
      };
      const result = service.verificarClientePossuiRestricaoNaoValido(mockRestricoes);
      expect(result).toBe(false);
    });
  });

  // --------------------------------------
  // obterRazaoSocial()
  // --------------------------------------
  describe('obterRazaoSocial()', () => {
    it('deve retornar a razão social diretamente dos dados', () => {
      const dados = { razaoSocial: 'Empresa Direta' };
      const resultado = service.obterRazaoSocial(dados);
      expect(resultado).toBe('Empresa Direta');
    });

    it('deve retornar a razão social dos dadosGeraisSicli se não houver diretamente', () => {
      const dados = {
        dadosGeraisSicli: {
          dadosBasicos: {
            razaoSocial: 'Empresa Sicli'
          }
        }
      };
      const resultado = service.obterRazaoSocial(dados);
      expect(resultado).toBe('Empresa Sicli');
    });

    it('deve retornar a razão social da primeira simulação se não houver nos anteriores', () => {
      const dados = {
        simulacoes: [
          { razaoSocial: 'Empresa Simulada' }
        ]
      };
      const resultado = service.obterRazaoSocial(dados);
      expect(resultado).toBe('Empresa Simulada');
    });

    it('deve retornar DESCRICAO_INDEFINIDO se não houver razão social em nenhum lugar', () => {
      const dados = {};
      const resultado = service.obterRazaoSocial(dados);
      expect(resultado).toBe(EnumTexto.DESCRICAO_INDEFINIDO);
    });
  });

  // --------------------------------------
  // obterCNPJ()
  // --------------------------------------
  describe('obterCNPJ()', () => {
    it('deve retornar o CNPJ diretamente dos dados', () => {
      const dados = { cnpj: '12345678000199' };
      const resultado = service.obterCNPJ(dados);
      expect(resultado).toBe('12345678000199');
    });

    it('deve retornar o CNPJ dos dadosGeraisSicli se não houver diretamente', () => {
      const dados = {
        dadosGeraisSicli: {
          cnpj: '98765432000188'
        }
      };
      const resultado = service.obterCNPJ(dados);
      expect(resultado).toBe('98765432000188');
    });

    it('deve retornar o CNPJ da primeira simulação se não houver nos anteriores', () => {
      const dados = {
        simulacoes: [
          { cnpj: '11223344000155' }
        ]
      };
      const resultado = service.obterCNPJ(dados);
      expect(resultado).toBe('11223344000155');
    });

    it('deve retornar DESCRICAO_INDEFINIDO se não houver CNPJ em nenhum lugar', () => {
      const dados = {};
      const resultado = service.obterCNPJ(dados);
      expect(resultado).toBe(EnumTexto.DESCRICAO_INDEFINIDO);
    });
  });

  describe('obterRestricaoDadosEmpresa', () => {
    let mockResponse: DadosEmpresaConvenioResponse;
    let spyRestricaoDadosCadastrais: any;

    beforeEach(() => {
      mockResponse = {
        cadastroAtualizado: 'N',
        cnpj: '123',
        razaoSocial: 'Mock Razao Social',
        dadosCadastrais: mockDadosCadastrais,
        dataConstituicaoValida: true
      };
      spyRestricaoDadosCadastrais = jest.spyOn(convenioService, 'obterRestricaoDadosCadastrais')
        .mockResolvedValue(mockResponse);
    });

    it('deve chamar convenioService.obterRestricaoDadosCadastrais para origem SIMULADOR', async () => {
      const result = await service.obterRestricaoDadosEmpresa(EnumOrigemConsulta.SIMULADOR, '123');

      expect(spyRestricaoDadosCadastrais).toHaveBeenCalledWith('123', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('deve chamar convenioService.obterRestricaoDadosCadastrais para origem CONVENIO', async () => {
      const result = await service.obterRestricaoDadosEmpresa(EnumOrigemConsulta.CONVENIO, '123');

      expect(spyRestricaoDadosCadastrais).toHaveBeenCalledWith('123', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('deve lançar erro para origem não suportada', async () => {
      await expect(service.obterRestricaoDadosEmpresa('ORIGEM_INVALIDA' as EnumOrigemConsulta, '123'))
        .rejects
        .toThrow('Origem de consulta não suportada: ORIGEM_INVALIDA');
    });
  });

  describe('obterRestricaoSICOW', () => {
    it('deve chamar convenioService.obterRestricaoSICOW para origem CONVENIO', async () => {
      const mockResponse = ['restricao1', 'restricao2'];
      const spyObterRestricaoSICOW = jest.spyOn(convenioService, 'obterRestricaoSICOW')
        .mockResolvedValue(mockResponse);

      const result = await service.obterRestricaoSICOW(EnumOrigemConsulta.CONVENIO, '456');

      expect(spyObterRestricaoSICOW).toHaveBeenCalledWith('456', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('deve chamar convenioService.obterRestricaoSICOW para origem SIMULADOR', async () => {
      const mockResponse = ['restricao1', 'restricao2'];
      const spyObterRestricaoSICOW = jest.spyOn(convenioService, 'obterRestricaoSICOW')
        .mockResolvedValue(mockResponse);

      const result = await service.obterRestricaoSICOW(EnumOrigemConsulta.SIMULADOR, '456');

      expect(spyObterRestricaoSICOW).toHaveBeenCalledWith('456', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('deve lançar erro para origem não suportada', async () => {
      await expect(service.obterRestricaoSICOW('ORIGEM_INVALIDA' as EnumOrigemConsulta, '456'))
        .rejects
        .toThrow('Origem de consulta não suportada: ORIGEM_INVALIDA');
    });
  });

  describe('obterRestricaoContasPj', () => {
    let mockResponse: ContasPJResponse;
    let spyObterContasPj: any;

    beforeEach(() => {
      mockResponse = {
        contas: [{
          id: 0,
          codigoOperacao: 'o',
          dbConta: '2',
          numeroAgencia: '123',
          numeroConta: '1223456789',
          produto: '0000'
        }]
      };

      spyObterContasPj = jest.spyOn(convenioService, 'obterContasPj').mockResolvedValue(mockResponse);
    });

    it('deve chamar convenioService.obterContasPj para origem SIMULADOR', async () => {
      const result = await service.obterRestricaoContasPj(EnumOrigemConsulta.SIMULADOR, '789');

      expect(spyObterContasPj).toHaveBeenCalledWith('789', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('deve chamar convenioService.obterContasPj para origem CONVENIO', async () => {
      const result = await service.obterRestricaoContasPj(EnumOrigemConsulta.CONVENIO, '789');

      expect(spyObterContasPj).toHaveBeenCalledWith('789', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('deve lançar erro para origem não suportada', async () => {
      await expect(service.obterRestricaoContasPj('ORIGEM_INVALIDA' as EnumOrigemConsulta, '789'))
        .rejects
        .toThrow('Origem de consulta não suportada: ORIGEM_INVALIDA');
    });
  });

  describe('obterRestricaoFraude', () => {
    let mockResponse: RestricaoFraudeResponse;
    let spyObterContasPj: any;

    beforeEach(() => {
      mockResponse = { "fraudeRegistrada": true };
      spyObterContasPj = jest.spyOn(convenioService, 'obterRestricaoFraude').mockResolvedValue(mockResponse);
    });

    it('deve chamar convenioService.obterRestricaoFraude para origem SIMULADOR', async () => {
      const result = await service.obterRestricaoFraude(EnumOrigemConsulta.SIMULADOR, '010');

      expect(spyObterContasPj).toHaveBeenCalledWith('010', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('deve chamar convenioService.obterRestricaoFraude para origem CONVENIO', async () => {
      const result = await service.obterRestricaoFraude(EnumOrigemConsulta.CONVENIO, '010');

      expect(spyObterContasPj).toHaveBeenCalledWith('010', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('deve lançar erro para origem não suportada', async () => {
      await expect(service.obterRestricaoFraude('ORIGEM_INVALIDA' as EnumOrigemConsulta, '010'))
        .rejects
        .toThrow('Origem de consulta não suportada: ORIGEM_INVALIDA');
    });
  });
});
