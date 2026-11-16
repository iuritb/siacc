export const simulacaoResponseMock = {
  numeroSimulacao: 123,
  numeroSimulacaoOriginal: null,
  inibirRetentativa: true,
  inibirOpenFinance: false,
  estimativaMensal: 45,
  migracaoConvenio: null,
  pagadoresCaixa: null,
  pagadoresOutrosBancos: null,
  tarifaRetentativa: null,
  cnpj: "00360305000104",
  razaoSocial: "CAIXA ECONOMICA FEDERAL",
  restricaoSicow: null,
  necessarioContaPj: null,
  cadastroAtualizado: false,
  clienteFidelizado: true,
  chavePixCadastrada: true,
  nomeUnidade: "PLANALTO, DF                       ",
  grupoMargemContribuicao: "INVALIDO",
  simulacoesAlcada: [
    {
      id: 123,
      razaoSocial: "CAIXA ECONOMICA FEDERAL",
      tipo_servico: {
        id: 1,
        enum: 1,
        nomeTipoServico: "PIX AUTOMATICO",
        tipoServicoAtivo: "S",
        inicioVigenciaTipoServico: "2024-10-11",
        fimVigenciaTipoServico: null
      },
      cnpj: "00360305000104",
      unidade_relacionamento: 2,
      qt_dias_isencao_tarifas: 0,
      qt_tentativas_efetivacao: 1,
      valor_medio_transacao: 0.32,
      qt_agendamento_mes: 45,
      vencimento_simulacao: "2025-03-19",
      flag_iniciadora_pagamento: "N",
      nro_convenio_iniciador_pgto: null,
      simulacaoOriginal: null,
      simulacoesAlcada: [
        {
          alcada: {
            id: 4,
            nivel: 4,
            nomeAlcada: 'Matriz',
            alcadaAtiva: 'S'
          },
          tipoSituacao: {
            id: 4,
            enum: 4,
            nomeSituacao: 'Aprovada',
            descricaoSituacao: 'Simulação Aprovada',
            flagSituacaoAtiva: 'S',
            dataInicioVigenciaTipoSituacao: '2024-05-25',
            dataFimVigenciaTipoSituacao: null
          },
          unidadeAlcada: 5637,
          tsAlcada: '2024-09-09T01:22:10.477032',
          coUsuarioAlcada: 'c999999',
          parecer: 'asdasd',
          documentos: []
        }
      ],
      simulacoesItem: [
        {
          itemSimulacao: {
            id: 21,
            enum: 21,
            tipoItemSimulacao: {
              id: 2,
              enum: 2,
              descricaoTipoItemSimulacao: 'Tarifas Balcão'
            },
            nomeItemSimulacao: 'Tarifa Balcão Pagadores CAIXA',
            situacaoItem: 'S',
            dataInicioVigencia: '2024-07-15'
          },
          valorSimulacaoItem: 2.99,
          dataSimulacaoItem: '2025-02-17T09:11:12.429976',
          coUsuarioSimulacaoItem: 'c891886',
          simulacaoItemAtivo: 'S'
        },
        {
          itemSimulacao: {
            id: 22,
            enum: 22,
            tipoItemSimulacao: {
              id: 2,
              enum: 2,
              descricaoTipoItemSimulacao: 'Tarifas Balcão'
            },
            nomeItemSimulacao: 'Tarifa Balcão Pagadores Outros Bancos',
            situacaoItem: 'S',
            dataInicioVigencia: '2024-07-15'
          },
          valorSimulacaoItem: 2.99,
          dataSimulacaoItem: '2025-02-17T09:11:12.461226',
          coUsuarioSimulacaoItem: 'c891886',
          simulacaoItemAtivo: 'S'
        },
        {
          itemSimulacao: {
            id: 23,
            enum: 23,
            tipoItemSimulacao: {
              id: 2,
              enum: 2,
              descricaoTipoItemSimulacao: 'Tarifas Balcão'
            },
            nomeItemSimulacao: 'Tarifa Balcão Retentativa',
            situacaoItem: 'S',
            dataInicioVigencia: '2024-07-15'
          },
          valorSimulacaoItem: 0.59,
          dataSimulacaoItem: '2025-02-17T09:11:12.508089',
          coUsuarioSimulacaoItem: 'c891886',
          simulacaoItemAtivo: 'S'
        },
        {
          itemSimulacao: {
            id: 24,
            enum: 24,
            tipoItemSimulacao: {
              id: 2,
              enum: 2,
              descricaoTipoItemSimulacao: 'Tarifas Balcão'
            },
            nomeItemSimulacao: 'Dias Balcão Degustação',
            situacaoItem: 'S',
            dataInicioVigencia: '2024-07-15'
          },
          qtdSimulacaoItem: 6,
          dataSimulacaoItem: '2025-02-17T09:11:12.539732',
          coUsuarioSimulacaoItem: 'c891886',
          simulacaoItemAtivo: 'S'
        },
        {
          itemSimulacao: {
            id: 11,
            enum: 11,
            tipoItemSimulacao: {
              id: 1,
              enum: 1,
              descricaoTipoItemSimulacao: 'Exceções'
            },
            nomeItemSimulacao: 'Conta para débito da tarifa diferente da conta de repasse',
            situacaoItem: 'S',
            dataInicioVigencia: '2024-07-11'
          },
          dataSimulacaoItem: '2025-02-17T09:11:12.570983',
          coUsuarioSimulacaoItem: 'c891886',
          simulacaoItemAtivo: 'S'
        },
        {
          itemSimulacao: {
            id: 25,
            enum: 25,
            tipoItemSimulacao: {
              id: 3,
              enum: 3,
              descricaoTipoItemSimulacao: 'Tarifas Condições Diferenciadas'
            },
            nomeItemSimulacao: 'Tarifa Diferenciada Pagadores CAIXA',
            situacaoItem: 'S',
            dataInicioVigencia: '2024-07-15'
          },
          valorSimulacaoItem: 0,
          dataSimulacaoItem: '2024-09-09T01:21:40.316776',
          coUsuarioSimulacaoItem: 'c891169',
          simulacaoItemAtivo: 'S'
        },
        {
          itemSimulacao: {
            id: 26,
            enum: 26,
            tipoItemSimulacao: {
              id: 3,
              enum: 3,
              descricaoTipoItemSimulacao: 'Tarifas Condições Diferenciadas'
            },
            nomeItemSimulacao: 'Tarifa Diferenciada Pagadores Outros Bancos',
            situacaoItem: 'S',
            dataInicioVigencia: '2024-07-15'
          },
          valorSimulacaoItem: 4.5,
          dataSimulacaoItem: '2024-09-09T01:21:40.349667',
          coUsuarioSimulacaoItem: 'c891169',
          simulacaoItemAtivo: 'S'
        },
        {
          itemSimulacao: {
            id: 27,
            enum: 27,
            tipoItemSimulacao: {
              id: 3,
              enum: 3,
              descricaoTipoItemSimulacao: 'Tarifas Condições Diferenciadas'
            },
            nomeItemSimulacao: 'Tarifa Diferenciada Retentativa',
            situacaoItem: 'S',
            dataInicioVigencia: '2024-07-15'
          },
          valorSimulacaoItem: 0.05,
          dataSimulacaoItem: '2024-09-09T01:21:40.382386',
          coUsuarioSimulacaoItem: 'c891169',
          simulacaoItemAtivo: 'S'
        },
        {
          itemSimulacao: {
            id: 28,
            enum: 28,
            tipoItemSimulacao: {
              id: 3,
              enum: 3,
              descricaoTipoItemSimulacao: 'Tarifas Condições Diferenciadas'
            },
            nomeItemSimulacao: 'Dias Diferenciada Degustação',
            situacaoItem: 'S',
            dataInicioVigencia: '2024-07-15'
          },
          qtdSimulacaoItem: 0,
          dataSimulacaoItem: '2024-09-09T01:21:40.414745',
          coUsuarioSimulacaoItem: 'c891169',
          simulacaoItemAtivo: 'S'
        }
      ],
    }
  ],
  indicadoresSimulacao: {
    simulacaoEmAlgumConvenio: false,
    simulacaoCancelada: false,
    simulacaoUnidadeDivergenteOuMatriz: false
  },
  dadosInclusao: {
    dataInclusao: "2025-02-17T09:11:12.602225",
    responsavel: "c000000",
    justificativa: "outro teste"
  }
}
