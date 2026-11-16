export const mockDetalhamentoSimulacao = {
  "numeroSimulacao": 1666,
  "numeroSimulacaoOriginal": null,
  "inibirRetentativa": true,
  "inibirOpenFinance": false,
  "estimativaMensal": 40,
  "migracaoConvenio": null,
  "pagadoresCaixa": null,
  "pagadoresOutrosBancos": null,
  "tarifaRetentativa": null,
  "cnpj": "57885220000167",
  "razaoSocial": "ELAZA VAREJISTA LTDA",
  "restricaoSicow": [],
  "necessarioContaPj": null,
  "cadastroAtualizado": true,
  "clienteFidelizado": true,
  "chavePixCadastrada": true,
  "nomeUnidade": "PORTO VELHO SHOPPING, RO",
  "grupoMargemContribuicao": "GRUPO_3",
  "simulacoesAlcada": [
    {
      "id": 1666,
      "razaoSocial": "ELAZA VAREJISTA LTDA",
      "tipo_servico": {
        "id": 1,
        "enum": 1,
        "nomeTipoServico": "PIX AUTOMATICO",
        "tipoServicoAtivo": "S",
        "inicioVigenciaTipoServico": "2024-10-11",
        "fimVigenciaTipoServico": null
      },
      "cnpj": "57885220000167",
      "unidade_relacionamento": 3430,
      "qt_dias_isencao_tarifas": 0,
      "qt_tentativas_efetivacao": 1,
      "valor_medio_transacao": 40,
      "qt_agendamento_mes": 40,
      "vencimento_simulacao": "2025-10-24",
      "flag_iniciadora_pagamento": "N",
      "nro_convenio_iniciador_pgto": null,
      "simulacaoOriginal": null,
      "simulacoesAlcada": [
        {
          "alcada": {
            "id": 1,
            "nivel": 1,
            "nomeAlcada": "Agência",
            "alcadaAtiva": "S"
          },
          "tipoSituacao": {
            "id": 1,
            "enum": 1,
            "nomeSituacao": "Incluída",
            "descricaoSituacao": "Simulação Incluída",
            "flagSituacaoAtiva": "S",
            "dataInicioVigenciaTipoSituacao": "2024-05-25",
            "dataFimVigenciaTipoSituacao": null
          },
          "unidadeAlcada": 3430,
          "tsAlcada": "2025-09-24T15:36:03.576519",
          "coUsuarioAlcada": "c897100",
          "parecer": "Comentario documento 40 40 40",
          "documentos": []
        },
        {
          "alcada": {
            "id": 2,
            "nivel": 2,
            "nomeAlcada": "Superior Regional",
            "alcadaAtiva": "S"
          },
          "tipoSituacao": {
            "id": 2,
            "enum": 2,
            "nomeSituacao": "Pendente",
            "descricaoSituacao": "Simulação Pendente",
            "flagSituacaoAtiva": "S",
            "dataInicioVigenciaTipoSituacao": "2024-05-25",
            "dataFimVigenciaTipoSituacao": null
          },
          "unidadeAlcada": 2627,
          "tsAlcada": "2025-09-25T15:36:03.656462",
          "coUsuarioAlcada": null,
          "parecer": null,
          "documentos": []
        },
        {
          "alcada": {
            "id": 3,
            "nivel": 3,
            "nomeAlcada": "Acima Superior Regional",
            "alcadaAtiva": "S"
          },
          "tipoSituacao": {
            "id": 10,
            "enum": 10,
            "nomeSituacao": "Prevista",
            "descricaoSituacao": "Simulação Avaliação Prevista",
            "flagSituacaoAtiva": "S",
            "dataInicioVigenciaTipoSituacao": "2024-05-25",
            "dataFimVigenciaTipoSituacao": null
          },
          "unidadeAlcada": 5879,
          "tsAlcada": "2025-09-26T15:36:03.689368",
          "coUsuarioAlcada": null,
          "parecer": null,
          "documentos": []
        },
        {
          "alcada": {
            "id": 4,
            "nivel": 4,
            "nomeAlcada": "Matriz",
            "alcadaAtiva": "S"
          },
          "tipoSituacao": {
            "id": 10,
            "enum": 10,
            "nomeSituacao": "Prevista",
            "descricaoSituacao": "Simulação Avaliação Prevista",
            "flagSituacaoAtiva": "S",
            "dataInicioVigenciaTipoSituacao": "2024-05-25",
            "dataFimVigenciaTipoSituacao": null
          },
          "unidadeAlcada": 5002,
          "tsAlcada": "2025-09-27T15:36:03.690217",
          "coUsuarioAlcada": null,
          "parecer": null,
          "documentos": []
        },
        {
          "alcada": {
            "id": 5,
            "nivel": 5,
            "nomeAlcada": "Cliente",
            "alcadaAtiva": "S"
          },
          "tipoSituacao": {
            "id": 10,
            "enum": 10,
            "nomeSituacao": "Prevista",
            "descricaoSituacao": "Simulação Avaliação Prevista",
            "flagSituacaoAtiva": "S",
            "dataInicioVigenciaTipoSituacao": "2024-05-25",
            "dataFimVigenciaTipoSituacao": null
          },
          "unidadeAlcada": 3430,
          "tsAlcada": "2025-09-28T15:36:03.690817",
          "coUsuarioAlcada": null,
          "parecer": null,
          "documentos": []
        }
      ],
      "simulacoesItem": [
        {
          "itemSimulacao": {
            "id": 30,
            "enum": 30,
            "tipoItemSimulacao": {
              "id": 3,
              "enum": 3,
              "descricaoTipoItemSimulacao": "Tarifas Condições Diferenciadas"
            },
            "nomeItemSimulacao": "Grupo de Margem de Contribuição",
            "situacaoItem": "S",
            "dataInicioVigencia": "2024-08-20"
          },
          "dataSimulacaoItem": "2025-09-24T15:36:03.572099",
          "descricaoSimulacaoItem": "GRUPO_3",
          "coUsuarioSimulacaoItem": "c897100",
          "simulacaoItemAtivo": "S"
        },
        {
          "itemSimulacao": {
            "id": 25,
            "enum": 25,
            "tipoItemSimulacao": {
              "id": 3,
              "enum": 3,
              "descricaoTipoItemSimulacao": "Tarifas Condições Diferenciadas"
            },
            "nomeItemSimulacao": "Tarifa Diferenciada Pagadores CAIXA",
            "situacaoItem": "S",
            "dataInicioVigencia": "2024-07-15"
          },
          "valorSimulacaoItem": 0.45,
          "dataSimulacaoItem": "2025-09-24T15:36:03.573236",
          "coUsuarioSimulacaoItem": "c897100",
          "simulacaoItemAtivo": "S"
        },
        {
          "itemSimulacao": {
            "id": 26,
            "enum": 26,
            "tipoItemSimulacao": {
              "id": 3,
              "enum": 3,
              "descricaoTipoItemSimulacao": "Tarifas Condições Diferenciadas"
            },
            "nomeItemSimulacao": "Tarifa Diferenciada Pagadores Outros Bancos",
            "situacaoItem": "S",
            "dataInicioVigencia": "2024-07-15"
          },
          "valorSimulacaoItem": 0.45,
          "dataSimulacaoItem": "2025-09-24T15:36:03.574081",
          "coUsuarioSimulacaoItem": "c897100",
          "simulacaoItemAtivo": "S"
        },
        {
          "itemSimulacao": {
            "id": 27,
            "enum": 27,
            "tipoItemSimulacao": {
              "id": 3,
              "enum": 3,
              "descricaoTipoItemSimulacao": "Tarifas Condições Diferenciadas"
            },
            "nomeItemSimulacao": "Tarifa Diferenciada Retentativa",
            "situacaoItem": "S",
            "dataInicioVigencia": "2024-07-15"
          },
          "valorSimulacaoItem": 0.45,
          "dataSimulacaoItem": "2025-09-24T15:36:03.574809",
          "coUsuarioSimulacaoItem": "c897100",
          "simulacaoItemAtivo": "S"
        },
        {
          "itemSimulacao": {
            "id": 28,
            "enum": 28,
            "tipoItemSimulacao": {
              "id": 3,
              "enum": 3,
              "descricaoTipoItemSimulacao": "Tarifas Condições Diferenciadas"
            },
            "nomeItemSimulacao": "Dias Diferenciada Degustação",
            "situacaoItem": "S",
            "dataInicioVigencia": "2024-07-15"
          },
          "qtdSimulacaoItem": 45,
          "dataSimulacaoItem": "2025-09-24T15:36:03.575583",
          "coUsuarioSimulacaoItem": "c897100",
          "simulacaoItemAtivo": "S"
        }
      ],
      "diferenciais": "Tarifa"
    }
  ],
  "indicadoresSimulacao": {
    "simulacaoEmAlgumConvenio": false,
    "simulacaoCancelada": false,
    "simulacaoUnidadeDivergenteOuMatriz": false
  },
  "dadosInclusao": {
    "dataInclusao": "2025-09-24T15:36:03.576519",
    "responsavel": "c897100",
    "justificativa": "Comentario documento 40 40 40"
  }

}
