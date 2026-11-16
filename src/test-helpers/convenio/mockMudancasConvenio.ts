import { MudancasConvenio } from "../../app/shared/models/convenio/convenio.model";

export const mockMudancasConvenio: MudancasConvenio[] = [
  {
    "campo": "trocaInformacoesVan",
    "original": false,
    "solicitado": true
  },
  {
    "campo": "tipoPrazoConvenio",
    "original": "INDETERMINADO_COM_ATUALIZACAO",
    "solicitado": "INDETERMINADO_SEM_ATUALIZACAO"
  },
  {
    "campo": "formaRepasse",
    "original": "REPASSE_CONSOLIDADO",
    "solicitado": "REPASSE_POR_TRANSACAO"
  },
  {
    "campo": "trocaInformacoesVanOpcao",
    "original": null,
    "solicitado": "IBM"
  },
  {
    "campo": "tarifaPagadoresCaixa",
    "original": 3.00,
    "solicitado": 3.45
  },
  {
    "campo": "tarifaRetentativa",
    "original": 1.00,
    "solicitado": 1.30
  },
  {
    "campo": "indice",
    "original": "IPC-FIPE",
    "solicitado": "INPC"
  },
  {
    "campo": "apelido",
    "original": '',
    "solicitado": "XKGH11"
  },
  {
    "campo": "tarifaPagadoresOutros",
    "original": 4.30,
    "solicitado": 4.15
  },
  {
    "campo": "contaRepasse",
    "original": {
      codigoOperacao: '1292',
      numeroAgencia: '0002',
      numeroConta: '400009224',
      dvConta: '3'
    },
    "solicitado": {
      codigoOperacao: '1292',
      numeroAgencia: '1679',
      numeroConta: '597965088',
      dvConta: '8'
    }
  },
  {
    "campo": "contaTarifa",
    "original": {
      codigoOperacao: '1292',
      numeroAgencia: '1679',
      numeroConta: '597965118',
      dvConta: '3'
    },
    "solicitado": {
      codigoOperacao: '1292',
      numeroAgencia: '0002',
      numeroConta: '400009224',
      dvConta: '2'
    },
  },
  {
    "campo": "trocaInformacoesGerenciadorFinanceiro",
    "original": true,
    "solicitado": false
  },
  {
    "campo": "trocaInformacoesApi",
    "original": true,
    "solicitado": false
  },
  {
    "campo": "idTermo",
    "original": "TERM003",
    "solicitado": "TERM001"
  }
];
