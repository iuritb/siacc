import { EnumTipoAssinatura } from "../../app/shared/models/convenio/convenio.model";
import { TipoFormaRepasse, TipoPrazoConvenio } from "../../app/interfaces";
import { EnumTipoSimulacao, InputConfirmarInclusao, SimulacaoFormatada } from "../../app/shared/models/convenio/incluir-convenio.model";

export const mockDadosOutput: InputConfirmarInclusao = {
  assinaturas: {
    assinantes: {
      caixa: [],
      socio: [],
      testemunha: []
    },
    houveInclusaoManual: false,
    tipoAssinatura: EnumTipoAssinatura.FISICA_MANUAL
  },
  cnpj: "00000000000000",
  parametros: {
    empresaPublica: true,
    tarifaMensal: true,
    tarifaMensalManual: false,
    diaTarifaMensal: 10,
    contaRepasse: {
      codigoOperacao: "1292",
      dvConta: "1",
      numeroAgencia: "1233",
      numeroConta: "0123456"
    },
    contaTarifa: {
      codigoOperacao: "1292",
      dvConta: "1",
      numeroAgencia: "1233",
      numeroConta: "0123456"
    },
    formaRepasse: TipoFormaRepasse.CONSOLIDADO,
    indice: "IPE",
    trocaInformacoesApi: true,
    trocaInformacoesGerenciadorFinanceiro: true,
    trocaInformacoesVan: false,
    tipoPrazoConvenio: TipoPrazoConvenio.INDETERMINADO_COM_ATUALIZACAO,
    trocaInformacoesVanOpcao: undefined
  },
  dadosCadastrais: {
    apelido: null
  },
  simulacao: {
    simulacao: {
      id: 1,
      tipo: EnumTipoSimulacao.BALCAO,
      excecaoContaDebitoDiferente: false,
      excecaoInibirRetentativa: false,
    } as SimulacaoFormatada
  }
}
