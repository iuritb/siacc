import { TipoAssinante, TipoFormaRepasse, TipoPrazoConvenio } from "../../app/interfaces";
import { AssinaturasAgrupadas, Contato, Convenio, DadosGerais, DadosPixAutomatico, Endereco } from "../../app/shared/models/convenio/convenio-pendente.model";
import { CampoCompararAlteracao, ConvenioResponse, EnumStatusConvenio, EnumStatusSolicitacaoAlteracao, EnumTipoAssinatura, EnumTrocaInformacao, MudancasConvenio } from "../../app/shared/models/convenio/convenio.model";
import { mockContaAlterada, mockContaOriginal } from "./mockAlterarConvenio";

export const mockConvenioResponse: ConvenioResponse = {
  // Identificação e dados cadastrais
  numeroConvenio: 123456,
  nomeFantasia: 'Loja Exemplo',
  razaoSocial: 'Loja Exemplo LTDA',
  apelido: 'Loja XPTO',
  cnae: '4711301',
  nincho: 'Varejo',
  naturezaJuridica: 'Sociedade Limitada',
  segmento: 'Comércio',
  convenioInternoCaixa: true,
  idSituacao: EnumStatusConvenio.PENDENTE_CONFORMIDADE,
  descricaoSituacao: 'Ativo',

  // Prazo
  comPrazoIndeterminadoComAtualizacao: true,
  comPrazoIndeterminadoSemAtualizacao: false,
  diasDegustacao: 30,

  // Endereço
  cep: '50000-000',
  logradouro: 'Rua das Flores',
  numero: '123',
  bairro: 'Centro',
  cidade: 'Recife',
  uf: 'PE',
  complemeto: 'Sala 101',

  // Contato
  email: 'contato@lojaexemplo.com',
  telefone1: '81999999999',
  telefone2: '81988888888',
  chavePixCadastrada: 'cnpj@lojaexemplo.com',

  // Conta de repasse
  formaRepasse: 'Repasse Consolidado',
  contaRepasse: '12345678',
  agenciaContaRepasse: '1234',
  digitoContaRepasse: '9',
  operacaoContaRepasse: '001',

  // Conta de débito de tarifa
  contaDebitoTarifa: '87654321',
  agenciaContaDebitoTarifa: '4321',
  digitoContaDebitoTarifa: '0',
  operacaoContaDebitoTarifa: '002',

  // Pagadores
  pagadoresCaixa: 1.5,
  pagadoresOutrosBancos: 2.5,

  // Configurações
  inibirRetentativa: false,
  tarifaRetentativa: 3.75,
  indiceReajusteTarifa: 'IPCA',
  iniciadoraCaixa: 1,
  tipoAssinatura: EnumTipoAssinatura.FISICA_MANUAL,

  // Assinaturas e troca de informações
  assinaturas: [
    {
      nome: 'João da Silva',
      cpf: '12345678900',
      email: 'joao@empresa.com',
      telefone: '81999990000',
      tipoAssinante: TipoAssinante.SOCIO,
      vinculo: 'Sócio',
      matricula: '001'
    }
  ],
  trocaInformacoes: [
    {
      id: EnumTrocaInformacao.API,
      nome: 'Via API',
      complemento: null
    }
  ],

  // Metadados
  idTermo: 'TERM123',
  unidadeVinculacao: 1001,

  // Exceções
  unidadeVinculacaoIgual: true,
  excecaoContaDebitoDiferente: false,
  excecaoMinutaContratualForaPadrao: false,
  excecaoMinutaEditalCredenciamento: false,
  excecaoOutro: false,
  justificativaCancelamento: null,
  detalhamentoResponse: null,
  situacaoAlteracaoConvenioAtual: EnumStatusSolicitacaoAlteracao.APROVADO,
  houveInclusaoRepresentante: false,
  //Campos novos
  apelidoVan: "HUB789",
  diaTarifaMensal: 10,
  empresaPublica: true,
  tarifaMensal: true,
  tarifaMensalManual: true
};

export const mockDadosGerais: DadosGerais = {
  cnae: '4711301',
  descricaoSituacao: 'Ativo',
  naturezaJuridica: 'Sociedade Limitada',
  razaoSocial: 'Loja Exemplo LTDA',
  segmento: 'Comércio',
  nomeFantasia: 'Loja Exemplo',
  empresaPublica: {
    valorAtual: 'PJ Pública',
    valorNovo: 'PJ Pública',
    checkbox: true,
    label: 'Natureza Empresa',
    name: 'empresaPublica'
  },
  apelido: {
    valorAtual: 'Loja XPTO',
    valorNovo: 'Loja XPTO',
    checkbox: true,
    label: 'Apelido',
    name: 'apelido'
  },
  nincho: 'Varejo',
  convenioInternoCaixa: 'Sim',
  numeroConvenio: '123456',
};

export const mockEndereco: Endereco = {
  bairro: 'Centro',
  cep: '50000-000',
  logradouro: 'Rua das Flores',
  numero: '123',
  cidadeUF: 'Recife/PE',
  complemeto: 'Sala 101'
};

export const mockContato: Contato = {
  email: 'contato@lojaexemplo.com',
  telefone1: '(81) 9 9999-9999',
  telefone2: '(81) 9 8888-8888'
};

export const mockDadosPixAutomatico: DadosPixAutomatico = {
  tarifaMensal: {
    valorAtual: "Mensal",
    valorNovo: "Mensal",
    checkbox: true,
    label: 'Periodicidade Tarifa',
    name: 'tarifaMensal',
  },
  tarifaMensalManual: {
    valorAtual: "Manual",
    valorNovo: "Manual",
    checkbox: true,
    label: 'Modalidade de cobrança',
    name: 'tarifaMensalManual',
  },
  diaTarifaMensal: {
    valorAtual: "10",
    valorNovo: "10",
    checkbox: true,
    label: 'Dia da Cobrança',
    name: 'diaTarifaMensal',
  },
  prazoAtualizacao: {
    valorAtual: "Indeterminado COM atualização automática de tarifa",
    valorNovo: "Indeterminado COM atualização automática de tarifa",
    checkbox: true,
    label: 'Prazo do Convênio',
    name: 'tipoPrazoConvenio',
  },

  contaRepasse: {
    valorAtual: '1234 001 12345678 - 9',
    valorNovo: '1234 001 12345678 - 9',
    label: 'Conta de Repasse',
    name: 'contaRepasse',
    checkbox: true,
  },
  contaDebitoTarifa: {
    valorAtual: '4321 002 87654321 - 0',
    valorNovo: '4321 002 87654321 - 0',
    checkbox: true,
    label: 'Conta Débito Tarifa',
    name: 'contaTarifa'
  },
  formaRepasse: {
    valorAtual: 'Repasse Consolidado',
    valorNovo: 'Repasse Consolidado',
    checkbox: true,
    label: 'Forma de Repasse',
    name: 'formaRepasse'
  },
  indiceReajusteTarifa: {
    valorAtual: 'IPCA',
    valorNovo: 'IPCA',
    checkbox: true,
    label: 'Índice de Tarifas',
    name: 'indice'
  },
  inibirRetentativa: false,
  iniciadoraCaixa: 1,
  tarifas: {
    degustacao: 30,
    pgCaixa: {
      valorAtual: 'R$\u00A01,50',
      valorNovo: 'R$\u00A01,50',
      checkbox: true,
      label: 'Pagadores Caixa',
      name: 'tarifaPagadoresCaixa'
    },
    pgOutros: {
      valorAtual: 'R$\u00A02,50',
      valorNovo: 'R$\u00A02,50',
      checkbox: true,
      label: 'Pagadores Outros',
      name: 'tarifaPagadoresOutros'
    },
    retentativa: {
      valorAtual: 'R$\u00A03,75',
      valorNovo: 'R$\u00A03,75',
      checkbox: true,
      label: 'Retentativa',
      name: 'tarifaRetentativa'
    }
  },
  trocaInformacoes: [
    {
      valorAtual: 'Via API',
      valorNovo: 'Via API',
      label: 'Via API',
      name: 'trocaInformacoesApi',
      checkbox: true,
    },
  ],
  idTermo: {
    valorAtual: 'TERM123',
    valorNovo: 'TERM123',
    label: 'Termo de Adesão',
    name: 'idTermo',
    checkbox: true,
  }
};

export const mockDadosPixAutomaticoComAlteracao: DadosPixAutomatico = {

  prazoAtualizacao: {
    valorAtual: "Indeterminado COM atualização automática de tarifa",
    valorNovo: "Indeterminado SEM atualização automática de tarifa",
    checkbox: true,
    label: 'Prazo do Convênio', // vem do campoConvenioConfig.tipoPrazoConvenio
    name: 'tipoPrazoConvenio'
  },
  contaRepasse: {
    valorAtual: '1234 001 12345678 - 9',
    valorNovo: '1234 001 12345678 - 9',
    label: 'Conta de Repasse',
    name: 'contaRepasse',
    checkbox: true,
  },
  tarifaMensal: {
    valorAtual: "Mensal",
    valorNovo: "Mensal",
    checkbox: true,
    label: 'Periodicidade Tarifa',
    name: 'tarifaMensal',
  },
  tarifaMensalManual: {
    valorAtual: "Manual",
    valorNovo: "Manual",
    checkbox: true,
    label: 'Modalidade de cobrança',
    name: 'tarifaMensalManual',
  },
  diaTarifaMensal: {
    valorAtual: "10",
    valorNovo: "12",
    checkbox: true,
    label: 'Dia da Cobrança',
    name: 'diaTarifaMensal',
  },
  contaDebitoTarifa: {
    valorAtual: '4321 002 87654321 - 0',
    valorNovo: '4567 12 77888 - 9',
    checkbox: true,
    label: 'Conta Débito Tarifa',
    name: 'contaTarifa'
  },
  formaRepasse: {
    valorAtual: 'Repasse Consolidado',
    valorNovo: 'Repasse por Transação',
    checkbox: true,
    label: 'Forma de Repasse',
    name: 'formaRepasse'
  },
  indiceReajusteTarifa: {
    valorAtual: 'IPCA',
    valorNovo: 'IBB',
    checkbox: true,
    label: 'Índice de Tarifas',
    name: 'indice'
  },
  inibirRetentativa: false,
  iniciadoraCaixa: 1,
  tarifas: {
    degustacao: 30,
    pgCaixa: {
      valorAtual: 'R$\u00A01,50',
      valorNovo: 'R$\u00A03,50',
      checkbox: true,
      label: 'Pagadores Caixa',
      name: 'tarifaPagadoresCaixa'
    },
    pgOutros: {
      valorAtual: 'R$\u00A02,50',
      valorNovo: 'R$\u00A02,50',
      checkbox: true,
      label: 'Pagadores Outros',
      name: 'tarifaPagadoresOutros'
    },
    retentativa: {
      valorAtual: 'R$\u00A03,75',
      valorNovo: 'R$\u00A03,75',
      checkbox: true,
      label: 'Retentativa',
      name: 'tarifaRetentativa'
    }
  },
  trocaInformacoes: [
    {
      valorAtual: 'Via API',
      valorNovo: 'Via API',
      label: 'Via API',
      name: 'trocaInformacoesApi',
      checkbox: true,
    },
  ],
  idTermo: {
    valorAtual: 'TERM123',
    valorNovo: 'TERM123',
    label: 'Termo de Adesão',
    name: 'idTermo',
    checkbox: true,
  }
};

export const mockAssinaturasAgrupadas: AssinaturasAgrupadas = {
  LEGAL: [
    {
      nome: 'João da Silva',
      cpf: '12345678900',
      email: 'joao@empresa.com',
      telefone: '81999990000',
      tipoAssinante: TipoAssinante.SOCIO,
      vinculo: 'Sócio',
      matricula: '001'
    }
  ],
  CAIXA: [],
  TESTEMUNHA: []
};

export const mockDadosFormatados: Convenio = {
  dadosGerais: mockDadosGerais,
  endereco: mockEndereco,
  contato: mockContato,
  dadosPixAutomatico: mockDadosPixAutomatico,
  tipoAssinatura: 'Assinatura Física (Manual)',
  assinaturasAgrupadas: mockAssinaturasAgrupadas
};

export const mockMudancasDadosPixAutomatico: MudancasConvenio[] = [
  { campo: 'tarifaPagadoresCaixa', original: mockConvenioResponse.pagadoresCaixa, solicitado: 3.5 },
  { campo: 'tipoPrazoConvenio', original: TipoPrazoConvenio.INDETERMINADO_COM_ATUALIZACAO, solicitado: TipoPrazoConvenio.INDETERMINADO_SEM_ATUALIZACAO },
  { campo: 'contaTarifa', original: mockContaOriginal, solicitado: mockContaAlterada },
  { campo: 'formaRepasse', original: TipoFormaRepasse.CONSOLIDADO, solicitado: TipoFormaRepasse.TRANSACAO },
  { campo: 'indice', original: 'IPCA', solicitado: 'IBB' },
  { campo: 'tarifaMensal', original: 10, solicitado: 12 },
];

export const mockDadosFormatadosComAlteracao: Convenio = {
  dadosGerais: mockDadosGerais,
  endereco: mockEndereco,
  contato: mockContato,
  tipoAssinatura: 'Assinatura Física (Manual)',
  assinaturasAgrupadas: mockAssinaturasAgrupadas,
  dadosPixAutomatico: mockDadosPixAutomaticoComAlteracao
}

export const mockConvenioResponseComAlteracao: ConvenioResponse = {
  // Identificação e dados cadastrais
  numeroConvenio: 123456,
  nomeFantasia: 'Loja Exemplo',
  razaoSocial: 'Loja Exemplo LTDA',
  apelido: 'Loja XPTO',
  cnae: '4711301',
  nincho: 'Varejo',
  naturezaJuridica: 'Sociedade Limitada',
  segmento: 'Comércio',
  convenioInternoCaixa: true,
  idSituacao: EnumStatusConvenio.ATIVO,
  descricaoSituacao: 'Ativo',

  // Prazo
  comPrazoIndeterminadoComAtualizacao: true,
  comPrazoIndeterminadoSemAtualizacao: false,
  diasDegustacao: 30,

  // Endereço
  cep: '50000-000',
  logradouro: 'Rua das Flores',
  numero: '123',
  bairro: 'Centro',
  cidade: 'Recife',
  uf: 'PE',
  complemeto: 'Sala 101',

  // Contato
  email: 'contato@lojaexemplo.com',
  telefone1: '81999999999',
  telefone2: '81988888888',
  chavePixCadastrada: 'cnpj@lojaexemplo.com',

  // Conta de repasse
  formaRepasse: 'Repasse Consolidado',
  contaRepasse: '12345678',
  empresaPublica: true,
  tarifaMensal: true,
  tarifaMensalManual: true,
  agenciaContaRepasse: '1234',
  digitoContaRepasse: '9',
  operacaoContaRepasse: '001',

  // Conta de débito de tarifa
  contaDebitoTarifa: '87654321',
  agenciaContaDebitoTarifa: '4321',
  digitoContaDebitoTarifa: '0',
  operacaoContaDebitoTarifa: '002',

  // Pagadores
  pagadoresCaixa: 1.5,
  pagadoresOutrosBancos: 2.5,

  // Configurações
  inibirRetentativa: false,
  tarifaRetentativa: 3.75,
  indiceReajusteTarifa: 'IPCA',
  iniciadoraCaixa: 1,
  tipoAssinatura: EnumTipoAssinatura.FISICA_MANUAL,

  // Assinaturas e troca de informações
  assinaturas: [
    {
      nome: 'João da Silva',
      cpf: '12345678900',
      email: 'joao@empresa.com',
      telefone: '81999990000',
      tipoAssinante: TipoAssinante.SOCIO,
      vinculo: 'Sócio',
      matricula: '001'
    }
  ],
  trocaInformacoes: [
    {
      id: EnumTrocaInformacao.API,
      nome: 'Via API',
      complemento: null
    }
  ],

  // Metadados
  idTermo: 'TERM123',
  unidadeVinculacao: 1001,

  // Exceções
  unidadeVinculacaoIgual: true,
  excecaoContaDebitoDiferente: false,
  excecaoMinutaContratualForaPadrao: false,
  excecaoMinutaEditalCredenciamento: false,
  excecaoOutro: false,
  justificativaCancelamento: null,
  detalhamentoResponse: { itemAlteradoComparacaoConvenio: mockMudancasDadosPixAutomatico },
  situacaoAlteracaoConvenioAtual: EnumStatusSolicitacaoAlteracao.PENDENTE,
  houveInclusaoRepresentante: false,
  diaTarifaMensal: 10,
  apelidoVan: "HUB789"
};

export const mockConvenioResponseComInclusaoDeRepresentante: ConvenioResponse = {
  // Identificação e dados cadastrais
  numeroConvenio: 123456,
  nomeFantasia: 'Loja Exemplo',
  razaoSocial: 'Loja Exemplo LTDA',
  apelido: 'Loja XPTO',
  apelidoVan: "HUB775",
  cnae: '4711301',
  nincho: 'Varejo',
  naturezaJuridica: 'Sociedade Limitada',
  segmento: 'Comércio',
  convenioInternoCaixa: true,
  idSituacao: EnumStatusConvenio.PENDENTE_CONFORMIDADE,
  descricaoSituacao: 'Ativo',

  // Prazo
  comPrazoIndeterminadoComAtualizacao: true,
  comPrazoIndeterminadoSemAtualizacao: false,
  diasDegustacao: 30,

  // Endereço
  cep: '50000-000',
  logradouro: 'Rua das Flores',
  numero: '123',
  bairro: 'Centro',
  cidade: 'Recife',
  uf: 'PE',
  complemeto: 'Sala 101',

  // Contato
  email: 'contato@lojaexemplo.com',
  telefone1: '81999999999',
  telefone2: '81988888888',
  chavePixCadastrada: 'cnpj@lojaexemplo.com',

  // Conta de repasse
  formaRepasse: 'Repasse Consolidado',
  contaRepasse: '12345678',
  empresaPublica: true,
  tarifaMensal: true,
  tarifaMensalManual: true,
  diaTarifaMensal: 10,
  agenciaContaRepasse: '1234',
  digitoContaRepasse: '9',
  operacaoContaRepasse: '001',

  // Conta de débito de tarifa
  contaDebitoTarifa: '87654321',
  agenciaContaDebitoTarifa: '4321',
  digitoContaDebitoTarifa: '0',
  operacaoContaDebitoTarifa: '002',

  // Pagadores
  pagadoresCaixa: 1.5,
  pagadoresOutrosBancos: 2.5,

  // Configurações
  inibirRetentativa: false,
  tarifaRetentativa: 3.75,
  indiceReajusteTarifa: 'IPCA',
  iniciadoraCaixa: 1,
  tipoAssinatura: EnumTipoAssinatura.FISICA_MANUAL,

  // Assinaturas e troca de informações
  assinaturas: [
    {
      nome: 'João da Silva',
      cpf: '12345678900',
      email: 'joao@empresa.com',
      telefone: '81999990000',
      tipoAssinante: TipoAssinante.SOCIO,
      vinculo: 'Sócio',
      matricula: '001'
    }
  ],
  trocaInformacoes: [
    {
      id: EnumTrocaInformacao.API,
      nome: 'Via API',
      complemento: null
    }
  ],

  // Metadados
  idTermo: 'TERM123',
  unidadeVinculacao: 1001,

  // Exceções
  unidadeVinculacaoIgual: true,
  excecaoContaDebitoDiferente: false,
  excecaoMinutaContratualForaPadrao: false,
  excecaoMinutaEditalCredenciamento: false,
  excecaoOutro: false,
  justificativaCancelamento: null,
  detalhamentoResponse: null,
  situacaoAlteracaoConvenioAtual: EnumStatusSolicitacaoAlteracao.APROVADO,
  houveInclusaoRepresentante: true
};

export const mockCamposComparados: CampoCompararAlteracao[] = [
  {
    checkbox: true,
    label: 'Label',
    name: 'name',
    valorAtual: 'X',
    valorNovo: 'Y'
  }
]
