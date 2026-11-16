import { MensagemErro } from "../../app/shared/models/formatador-utils.model";
import { EnumParametros, TipoFormaRepasse, TipoPrazoConvenio } from "../../app/interfaces";
import { ContaCorreta, ConvenioResponse, EnumModalidadeCobranca, EnumStatusConvenio, EnumTipoAssinatura, ParametroVan, PreAlterarConvenioResponse, ResumoTermoAdesao } from "../../app/shared/models/convenio/convenio.model";

export function makeConvenioResponseMock(partial?: Partial<any>): ConvenioResponse {
  return {
    numeroConvenio: 123,
    nomeFantasia: 'Empresa X',
    razaoSocial: 'Empresa X LTDA',
    apelido: 'EmpX',
    apelidoVan: "HUB000",
    cnae: '1234-5/67',
    nincho: 'N/A',
    naturezaJuridica: 'LTDA',
    segmento: 'Serviços',
    convenioInternoCaixa: true,
    idSituacao: EnumStatusConvenio.ATIVO,
    descricaoSituacao: 'Ativo',

    comPrazoIndeterminadoComAtualizacao: null,
    comPrazoIndeterminadoSemAtualizacao: null,
    diasDegustacao: 0,

    cep: '70000-000',
    logradouro: 'Rua A',
    numero: '100',
    bairro: 'Centro',
    cidade: 'Brasília',
    uf: 'DF',
    complemeto: 'Sala 1',

    // Contato
    email: 'contato@empresax.com',
    telefone1: '(61) 99999-9999',
    telefone2: '(61) 98888-8888',
    chavePixCadastrada: 'email@pix.com',

    // Conta de repasse
    formaRepasse: TipoFormaRepasse.CONSOLIDADO,
    contaRepasse: '12345-6',
    agenciaContaRepasse: '1234',
    digitoContaRepasse: '7',
    operacaoContaRepasse: '001',

    // Conta de débito de tarifa
    contaDebitoTarifa: '65432-1',
    agenciaContaDebitoTarifa: '4321',
    digitoContaDebitoTarifa: '9',
    operacaoContaDebitoTarifa: '003',
    empresaPublica: true,
    tarifaMensal: true,
    tarifaMensalManual: false,
    diaTarifaMensal: 10,

    // Pagadores
    pagadoresCaixa: 10,
    pagadoresOutrosBancos: 5,

    // Configurações
    inibirRetentativa: false,
    tarifaRetentativa: 0,
    indiceReajusteTarifa: 'IPCA',
    iniciadoraCaixa: 0,
    tipoAssinatura: EnumTipoAssinatura.FISICA_MANUAL,

    // Assinaturas e troca de informações
    assinaturas: [],
    trocaInformacoes: [],

    // Metadados
    idTermo: 'TERM-001',
    unidadeVinculacao: 100,

    // Exceções
    excecaoContaDebitoDiferente: false,
    excecaoMinutaContratualForaPadrao: false,
    excecaoMinutaEditalCredenciamento: false,
    excecaoOutro: false,

    // Cancelamento
    justificativaCancelamento: null,

    // Alteração do Convênio
    unidadeVinculacaoIgual: true,
    detalhamentoResponse: null,
    situacaoAlteracaoConvenioAtual: null,
    houveInclusaoRepresentante: false,

    ...partial,
  };
};

export const mockVanAtiva: ParametroVan = {
  nome: 'Teste',
  id: '1',
  excluido: false,
  situacao: true
};

export const mockVanDesabilitada: ParametroVan = {
  nome: 'Teste 2',
  id: '2',
  excluido: false,
  situacao: false
};

export const mockVanExcluida: ParametroVan = {
  nome: 'Teste 3',
  id: '3',
  excluido: true,
  situacao: false
};


export function makeFormatadorMock() {
  return {
    formatarConta: jest.fn((c: ContaCorreta) => {
      // Retorno determinístico para facilitar o assert
      return `AG:${c.numeroAgencia}-CT:${c.numeroConta}-DV:${c.dvConta}-OP:${c.codigoOperacao}`;
    }),
    formatarValor: jest.fn((v: number) => `R$ ${v}`),
    formatarFormaRepasse: jest.fn((s: string) => `FR:${s}`),
    formatarPrazoConvenio: jest.fn((p: TipoPrazoConvenio) => `PRAZO:${p}`),
    preencherNumeroComZerosEsquerda: jest.fn((num: number, total: number) => {
      const s = String(num ?? '');
      return s.padStart(total, '0');
    }),
    formatarTituloDiaCobranca: jest.fn(
      (v: EnumModalidadeCobranca) => {
        if (v === EnumModalidadeCobranca.AUTOMATICA) return { titulo: "Dia da Cobrança" };
        if (v === EnumModalidadeCobranca.MANUAL) return { titulo: "Data Prevista para Retorno" };
        else return { titulo: '' };
      }
    )

  };
}

export function makeCacheMock() {
  let cache: ParametroVan[] | null = null;
  return {
    getVanCache: jest.fn(() => cache),
    setVanCache: jest.fn((vans: ParametroVan[]) => {
      cache = vans;
    }),
    clearVanCache: jest.fn(() => {
      cache = null;
    }),
  };
}

export function makeConvenioServiceMock() {
  return {
    buscarParametros: jest.fn(
      async (_body: any, _controller: AbortController): Promise<PreAlterarConvenioResponse> => {
        // default resolve; pode ser sobrescrito nos testes
        return {
          contas: [],
          parametros: [{ id: 1, complemento: null, nome: EnumParametros.GERAIS_VANS_PRODUTOS, descricao: EnumParametros.GERAIS_VANS_PRODUTOS, valor: JSON.stringify([mockVanAtiva, mockVanDesabilitada, mockVanExcluida]) }]
        };
      }
    ),
    detalharConvenio: jest.fn(),
    baixarTermoAdesao: jest.fn(async (_dados: ResumoTermoAdesao) => Promise.resolve()),
  };
}

export function makeFormatadorFeedbackServiceMock() {
  return {
    formatarMensagemErro: jest.fn((error: any, titulo: string): MensagemErro => ({
      titulo: titulo,
      listaMensagem: ["Erro interno ao tentar buscar os dados."],
      variant: 'danger',
    })),
  };
}


export type ModalOpenCall = { component: any; options?: any; ref: any };

export function makeNgbModalMock() {
  const openCalls: ModalOpenCall[] = [];
  const open = jest.fn((component: any, options?: any) => {
    const ref = {
      componentInstance: {},
      close: jest.fn(),
      dismiss: jest.fn(),
    };
    openCalls.push({ component, options, ref });
    return ref;
  });
  return { open, openCalls };
}

export function makeSnackbarMock() {
  return {
    add: jest.fn((_payload: any) => { }),
  };
}

export function makeScrollServiceMock() {
  return {
    scrollTop: jest.fn(),
  };
}
