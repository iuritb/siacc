import { StatusRestricaoCliente } from "../app/shared/enums/status-restricao-cliente.enum";
import { SimulacaoDTO, CondicaoSimulacaoDTO, EnumGruposMargemContribuicao, ExcecoesSimulacaoDTO, JustificativaSimulacaoDTO, TipoSimulacao, Cliente, Simulacao, Conta, Convenio, Tarifa, TipoFormaRepasse, TipoFrequenciaConvenio, TipoPrazoConvenio, TipoSituacao, EnumNivelAlcada } from "../app/interfaces";
import { createMockTarifa } from "./createMockTarifa";
import { SimulacaoPendente } from "../app/shared/models/simulacoes-pendentes.model";
import { EnumTipoAssinatura } from "../app/shared/models/convenio/convenio.model";

export function createMockSimulacaoDTO(overrides: Partial<SimulacaoDTO> = {}): SimulacaoDTO {
  return {
    cnpj: '12345678000199',
    condicao: createMockCondicaoSimulacao(overrides.condicao),
    excecoes: createMockExcecoesSimulacao(overrides.excecoes),
    justificativa: createMockJustificativaSimulacao(overrides.justificativa),
    ...overrides
  };
}

export function createMockExcecoesSimulacao(overrides: Partial<ExcecoesSimulacaoDTO> = {}): ExcecoesSimulacaoDTO {
  return {
    contaDebitoDiferente: false,
    inibirRetentativa: false,
    minutaContratualForaPadrao: false,
    minutaEditalCredenciamento: false,
    inibirOpenFinance: false,
    outro: false,
    textoOutro: '',
    ...overrides
  };
};

export function createMockJustificativaSimulacao(overrides: Partial<JustificativaSimulacaoDTO> = {}): JustificativaSimulacaoDTO {
  return {
    novoConvenio: true,
    unidadeRelacionamentoConvenio: 'Agência Teste',
    agendamentosPorMes: 10,
    ticketMedio: 500,
    migracaoDebitoAutomatico: false,
    contaPJDebitoAutomatico: ['1234'],
    comentarios: 'Comentário padrão',
    documentos: undefined,
    ...overrides
  };
};

let condicaoIdCounter = 1;
export function createMockCondicaoSimulacao(overrides: Partial<CondicaoSimulacaoDTO> = {}): CondicaoSimulacaoDTO {
  return {
    tipo: 1,
    id: condicaoIdCounter++,
    nome: 'Condição Padrão',
    tarifaPagadoresCaixa: 1.5,
    tarifaPagadoresOutras: 2.5,
    tarifaRetentativa: 0.5,
    diasDegustacao: 30,
    grupoMargemContribuicao: EnumGruposMargemContribuicao.GRUPO_1,
    ...overrides
  };
};

export function mockSessionStorage() {
  let store: Record<string, string> = {};

  const mock = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };

  Object.defineProperty(window, 'sessionStorage', {
    value: mock,
    writable: true,
  });

  return mock;
}

export function createMockTipoSimulacao(overrides: Partial<TipoSimulacao> = {}): TipoSimulacao {
  return {
    id: 0,
    nomeSituacao: 'pendente',
    descricaoSituacao: 'situação em pendência',
    flagSituacaoAtiva: 'S',
    dataInicioVigenciaTipoSituacao: '12/08/2024 00:00:00',
    dataFimVigenciaTipoSituacao: '12/08/9999 23:59:59',
    ...overrides
  };
}

export function createMockCliente(overrides: Partial<Cliente> = {}): Cliente {
  return {
    cnpj: '00.000.000/0001-00',
    nome: 'Cliente Exemplo',
    simulacoes: [],
    convenios: [],
    restricoes: {
      sicow: StatusRestricaoCliente.Valido,
      contaPJ: StatusRestricaoCliente.Valido,
      cadastro: StatusRestricaoCliente.Valido,
      dataConstituicao: StatusRestricaoCliente.Indefinido,
      fraude: StatusRestricaoCliente.Indefinido,
    },
    ...overrides
  };
}

export function createMockConvenio(overrides: Partial<Convenio> = {}): Convenio {
  return {
    id: 'conv-001',
    situacao: TipoSituacao.GERENCIADOR,
    unidade: 'Unidade Exemplo',
    tarifa: { /* preencher conforme tipo Tarifa */ } as Tarifa,
    parametros: {
      debito: false,
      inibirRetentativa: false,
      inibirOpenFinance: false,
      minutaContratual: false,
      outro: false
    },
    convenio: 'conv-001',
    conta: {} as Conta,
    agendamentoMes: '10/2025',
    tikectMedio: '10000',
    documentacao: undefined,
    chavePix: 'chave@pix.com',
    viaGerenciadorFinanceiro: true,
    viaAPI: false,
    viaVAN: false,
    van: {},
    indiceTarifas: {},
    formaRepasse: TipoFormaRepasse.TRANSACAO,
    contaRepasse: {},
    contaDebitoTarifa: {},
    prazoConvenio: TipoPrazoConvenio.INDETERMINADO_COM_ATUALIZACAO,
    prazoConvenioData: {},
    tipoConvenio: TipoFrequenciaConvenio.AUTOMATICO,
    aditivoContratual: false,
    ajustarTarifa: false,
    renovacaoPrazoMaximo: {},
    prorrogavelPrazoMaximo: {},
    iniciadoraCaixa: {},
    razaoSocial: 'Razão Social Exemplo',
    nomeFantasia: 'Nome Fantasia Exemplo',
    apelido: 'Apelido Exemplo',
    internoCaixa: false,
    bairro: 'Bairro Exemplo',
    logradouro: 'Rua Exemplo',
    complemento: 'Complemento',
    numero: '123',
    cep: '00000-000',
    uf: 'PE',
    cidade: 'Recife',
    email: 'email@exemplo.com',
    telefone1: '(81) 99999-9999',
    telefone2: '(81) 98888-8888',
    cnae: '1234567',
    nicho: 'Nicho Exemplo',
    naturezaJuridica: 'Natureza Jurídica Exemplo',
    segmento: 'Segmento Exemplo',
    tipoAssinatura: EnumTipoAssinatura.FISICA_MANUAL,
    assinantes: [],
    retentativa: false,
    openFinance: false,
    idTermo: 'termo-001',
    justificativaCancelamento: null,
    ...overrides
  };
}

export function createMockSimulacao(overrides: Partial<Simulacao> = {}): Simulacao {
  return {
    id: 'sim-001',
    unidade: 'Unidade Exemplo',
    etapa1: { done: false },
    etapa2: { done: false },
    etapa3: { done: false },
    etapa4: { done: false },
    etapa5: { done: false },
    tarifa: createMockTarifa(),
    parametros: {
      debito: false,
      inibirRetentativa: false,
      inibirOpenFinance: false,
      minutaContratual: false,
      outro: false
    },
    convenio: 'conv-001',
    contas: [],
    agendamentoMes: '10/2025',
    tikectMedio: '10000',
    documentacao: undefined,
    ...overrides
  };
}

export function createMockDetalhamentoSimulacao(overrides: Partial<any> = {}): any {
  return {
    numeroSimulacao: 1888,
    numeroSimulacaoOriginal: null,
    inibirRetentativa: true,
    inibirOpenFinance: false,
    estimativaMensal: 12,
    migracaoConvenio: null,
    pagadoresCaixa: null,
    pagadoresOutrosBancos: null,
    tarifaRetentativa: null,
    cnpj: "16247426000184",
    razaoSocial: "LUIZ E IAGO LIMPEZA LTDA",
    restricaoSicow: [],
    necessarioContaPj: null,
    cadastroAtualizado: true,
    clienteFidelizado: true,
    chavePixCadastrada: true,
    nomeUnidade: "PORTO VELHO SHOPPING, RO           ",
    grupoMargemContribuicao: "GRUPO_1",
    simulacoesAlcada: [
      {
        id: 1888,
        razaoSocial: "LUIZ E IAGO LIMPEZA LTDA",
        tipo_servico: {
          id: 1,
          enum: 1,
          nomeTipoServico: "PIX AUTOMATICO",
          tipoServicoAtivo: "S",
          inicioVigenciaTipoServico: "2024-10-11",
          fimVigenciaTipoServico: null
        },
        cnpj: "16247426000184",
        unidade_relacionamento: 3430,
        qt_dias_isencao_tarifas: 0,
        qt_tentativas_efetivacao: 1,
        valor_medio_transacao: 12.21,
        qt_agendamento_mes: 12,
        vencimento_simulacao: "2025-11-08",
        flag_iniciadora_pagamento: "N",
        nro_convenio_iniciador_pgto: null,
        simulacaoOriginal: null,
        simulacoesAlcada: [
          {
            alcada: {
              id: 4,
              nivel: 4,
              nomeAlcada: "Matriz",
              alcadaAtiva: "S"
            },
            tipoSituacao: {
              id: 4,
              enum: 4,
              nomeSituacao: "Aprovada",
              descricaoSituacao: "Simulação Aprovada",
              flagSituacaoAtiva: "S",
              dataInicioVigenciaTipoSituacao: "2024-05-25",
              dataFimVigenciaTipoSituacao: null
            },
            unidadeAlcada: 5002,
            tsAlcada: "2025-10-09T15:16:35.666106",
            coUsuarioAlcada: "c891918",
            parecer: "muito bom",
            documentos: []
          },
          {
            alcada: {
              id: 5,
              nivel: 5,
              nomeAlcada: "Cliente",
              alcadaAtiva: "S"
            },
            tipoSituacao: {
              id: 4,
              enum: 4,
              nomeSituacao: "Aprovada",
              descricaoSituacao: "Simulação Aprovada",
              flagSituacaoAtiva: "S",
              dataInicioVigenciaTipoSituacao: "2024-05-25",
              dataFimVigenciaTipoSituacao: null
            },
            unidadeAlcada: 3430,
            tsAlcada: "2025-10-09T15:16:35.67159",
            coUsuarioAlcada: "c891918",
            parecer: null,
            documentos: []
          },
          {
            alcada: {
              id: 1,
              nivel: 1,
              nomeAlcada: "Agência",
              alcadaAtiva: "S"
            },
            tipoSituacao: {
              id: 1,
              enum: 1,
              nomeSituacao: "Incluída",
              descricaoSituacao: "Simulação Incluída",
              flagSituacaoAtiva: "S",
              dataInicioVigenciaTipoSituacao: "2024-05-25",
              dataFimVigenciaTipoSituacao: null
            },
            unidadeAlcada: 3430,
            tsAlcada: "2025-10-09T15:15:04.123167",
            coUsuarioAlcada: "c897100",
            parecer: "teste",
            documentos: []
          }
        ],
        simulacoesItem: [
          {
            itemSimulacao: {
              id: 30,
              enum: 30,
              tipoItemSimulacao: {
                id: 3,
                enum: 3,
                descricaoTipoItemSimulacao: "Tarifas Condições Diferenciadas"
              },
              nomeItemSimulacao: "Grupo de Margem de Contribuição",
              situacaoItem: "S",
              dataInicioVigencia: "2024-08-20"
            },
            dataSimulacaoItem: "2025-10-09T15:15:03.116625",
            descricaoSimulacaoItem: "GRUPO_1",
            coUsuarioSimulacaoItem: "c897100",
            simulacaoItemAtivo: "S"
          },
          {
            itemSimulacao: {
              id: 21,
              enum: 21,
              tipoItemSimulacao: {
                id: 2,
                enum: 2,
                descricaoTipoItemSimulacao: "Tarifas Balcão"
              },
              nomeItemSimulacao: "Tarifa Balcão Pagadores CAIXA",
              situacaoItem: "S",
              dataInicioVigencia: "2024-07-15"
            },
            valorSimulacaoItem: 5,
            dataSimulacaoItem: "2025-10-09T15:15:03.117805",
            coUsuarioSimulacaoItem: "c897100",
            simulacaoItemAtivo: "S"
          },
          {
            itemSimulacao: {
              id: 22,
              enum: 22,
              tipoItemSimulacao: {
                id: 2,
                enum: 2,
                descricaoTipoItemSimulacao: "Tarifas Balcão"
              },
              nomeItemSimulacao: "Tarifa Balcão Pagadores Outros Bancos",
              situacaoItem: "S",
              dataInicioVigencia: "2024-07-15"
            },
            valorSimulacaoItem: 5,
            dataSimulacaoItem: "2025-10-09T15:15:03.118829",
            coUsuarioSimulacaoItem: "c897100",
            simulacaoItemAtivo: "S"
          },
          {
            itemSimulacao: {
              id: 23,
              enum: 23,
              tipoItemSimulacao: {
                id: 2,
                enum: 2,
                descricaoTipoItemSimulacao: "Tarifas Balcão"
              },
              nomeItemSimulacao: "Tarifa Balcão Retentativa",
              situacaoItem: "S",
              dataInicioVigencia: "2024-07-15"
            },
            valorSimulacaoItem: 5,
            dataSimulacaoItem: "2025-10-09T15:15:03.119748",
            coUsuarioSimulacaoItem: "c897100",
            simulacaoItemAtivo: "S"
          },
          {
            itemSimulacao: {
              id: 24,
              enum: 24,
              tipoItemSimulacao: {
                id: 2,
                enum: 2,
                descricaoTipoItemSimulacao: "Tarifas Balcão"
              },
              nomeItemSimulacao: "Dias Balcão Degustação",
              situacaoItem: "S",
              dataInicioVigencia: "2024-07-15"
            },
            qtdSimulacaoItem: 90,
            dataSimulacaoItem: "2025-10-09T15:15:03.120623",
            coUsuarioSimulacaoItem: "c897100",
            simulacaoItemAtivo: "S"
          },
          {
            itemSimulacao: {
              id: 11,
              enum: 11,
              tipoItemSimulacao: {
                id: 1,
                enum: 1,
                descricaoTipoItemSimulacao: "Exceções"
              },
              nomeItemSimulacao: "Conta para débito da tarifa diferente da conta de repasse",
              situacaoItem: "S",
              dataInicioVigencia: "2024-07-11"
            },
            dataSimulacaoItem: "2025-10-09T15:15:03.122073",
            coUsuarioSimulacaoItem: "c897100",
            simulacaoItemAtivo: "S"
          }
        ],
        diferenciais: "Tarifa e Exceções"
      }
    ],
    indicadoresSimulacao: {
      simulacaoEmAlgumConvenio: true,
      simulacaoCancelada: false,
      simulacaoUnidadeDivergenteOuMatriz: false
    },
    dadosInclusao: {
      dataInclusao: "2025-10-09T15:15:04.123167",
      responsavel: "c897100",
      justificativa: "teste"
    },
    ...overrides
  };
};

export function createMockSimulacoesPendentes(
  overrides: Partial<SimulacaoPendente> = {}
): SimulacaoPendente {
  return {
    id: 1651,
    cnpj: '00989983000130',
    unidadeRelacionamento: 3430,
    nivelAlcadaAvaliadoraSimulacao: EnumNivelAlcada.NIVEL_ALCADA_SUP,
    dataInclusao: '2025-09-23',
    grupo: EnumGruposMargemContribuicao.GRUPO_1,
    tarifaCaixa: '0.03',
    tarifaOutrosBancos: '3',
    tarifaRetentativa: '3',
    diasDegustacao: '30',
    ...overrides
  };
}
