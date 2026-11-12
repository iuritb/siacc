import { Validators } from "@angular/forms";
import { BtnConfig, EnumInputTipos, FiltroConfig, FiltroGrupoConfig, RelatorioOpcao } from "../../shared/models/utils/filtro-dinamico.model";
import { Option } from "sidsc-components/dsc-select";
import { CustomValidatorsService } from "../../services/custom-validators/custom-validators.service";
import { CnpjValidatorService } from "../../services/validators/cnpj/cnpj-validator.service";
import { EnumStatusRec } from "../../shared/models/autorizacao-agendamento/rec.enum";
import { EnumOpcoesAutorizacaoAgendamento, EnumTiposDevedor } from "../../shared/models/autorizacao-agendamento/utils.enum";
import { EnumStatusCobR } from "../../shared/models/autorizacao-agendamento/cobr.enum";
import { EnumTexto } from "../../interfaces";

//Configuracoes
const btnConsultar: BtnConfig = {
  label: "Consultar",
  size: "small",
  icon: "search",
  variant: "secondary"
};

const opcoesDevedor: Option[] = [
  {
    label: "CPF Devedor",
    value: EnumTiposDevedor.CPF
  },
  {
    label: "CNPJ Devedor",
    value: EnumTiposDevedor.CNPJ
  },
  {
    label: "Não Informar",
    value: EnumTiposDevedor.NAO_INFORMAR
  }
];

const opcoesStatusRec: Option[] = [
  { value: EnumStatusRec.CRIADA, label: "Criada" },
  { value: EnumStatusRec.APROVADA, label: "Aprovada" },
  { value: EnumStatusRec.CANCELADA, label: "Cancelada" },
  { value: EnumStatusRec.REJEITADA, label: "Rejeitada" },
  { value: EnumStatusRec.EXPIRADA, label: "Expirada" },
  { value: EnumTexto.TODAS, label: "Todas" }
]

const opcoesStatusCobr: Option[] = [
  { value: EnumStatusCobR.CRIADA, label: "Criada" },
  { value: EnumStatusCobR.ATIVA, label: "Ativa" },
  { value: EnumStatusCobR.CONCLUIDA, label: "Concluída" },
  { value: EnumStatusCobR.REJEITADA, label: "Rejeitada" },
  { value: EnumStatusCobR.EXPIRADA, label: "Expirada" },
  { value: EnumStatusCobR.CANCELADA, label: "Cancelada" },
  { value: EnumTexto.TODAS, label: "Todas" }
]

//Filtro Intervalo Datas
const filtrosIntervaloData: FiltroConfig[] = [
  {
    tipo: EnumInputTipos.DATE,
    queryParam: true,
    validadores: [Validators.required],
    inputConfig: {
      label: "Início",
      name: "inicio",
      placeholder: "DD/MM/AAAA",
      size: 'small',
      required: true
    }
  },
  {
    tipo: EnumInputTipos.DATE,
    validadores: [Validators.required],
    queryParam: true,
    inputConfig: {
      label: "Fim",
      name: "fim",
      placeholder: "DD/MM/AAAA",
      size: 'small',
      required: true
    }
  }
];


//Filtro "Convênio" (input direto, obrigatório)
const filtroEspecificoConvenio: FiltroConfig = {
  tipo: EnumInputTipos.INPUT,
  queryParam: true,
  validadores: [Validators.required, Validators.maxLength(12)],
  inputConfig: {
    label: "Nº do Convênio",
    name: "convenio",
    placeholder: "Digite o Convênio",
    mask: "000000000000",
    size: 'small',
    required: true
  }
};

//Filtro "Tipo Devedor"
const filtroEspecificoDevedor: FiltroConfig = {
  tipo: EnumInputTipos.SELECT,
  queryParam: true,
  validadores: [Validators.required],
  children: [
    {
      tipo: EnumInputTipos.INPUT,
      condicao(form) {
        return form.get("tipoDevedor")?.value === EnumTiposDevedor.CPF
      },
      queryParam: true,
      validadores: [
        CustomValidatorsService.validaCampoCondicional("tipoDevedor", EnumTiposDevedor.CPF, Validators.required),
        CustomValidatorsService.validaCampoCondicional("tipoDevedor", EnumTiposDevedor.CPF, CustomValidatorsService.validarCPF)
      ],
      inputConfig: {
        label: "CPF do Devedor",
        name: EnumTiposDevedor.CPF,
        placeholder: "Digite o CPF",
        mask: "000.000.000-00",
        size: 'small',
        required: true
      },
    },
    {
      tipo: EnumInputTipos.INPUT,
      condicao(form) {
        return form.get("tipoDevedor")?.value === EnumTiposDevedor.CNPJ
      },
      queryParam: true,
      validadores: [
        CustomValidatorsService.validaCampoCondicional("tipoDevedor", EnumTiposDevedor.CNPJ, Validators.required),
        CustomValidatorsService.validaCampoCondicional("tipoDevedor", EnumTiposDevedor.CNPJ, CnpjValidatorService.validarControlCNPJ)
      ],
      inputConfig: {
        label: "CNPJ do Devedor",
        name: EnumTiposDevedor.CNPJ,
        placeholder: "Digite o CNPJ",
        mask: "AA.AAA.AAA/AAAA-AA",
        size: 'small',
        required: true
      },
    }
  ],
  inputConfig: {
    label: "Devedor",
    name: "tipoDevedor",
    placeholder: "Selecione",
    size: 'small',
    required: true,
    opcoes: opcoesDevedor
  },
  defaultValue: EnumTiposDevedor.NAO_INFORMAR
};

//Filtro "Status da Recorrência"
const filtroEspecificoStatusRecorrencia: FiltroConfig = {
  tipo: EnumInputTipos.SELECT,
  queryParam: true,
  validadores: [],
  inputConfig: {
    label: "Status da Recorrência",
    name: "statusRecorrencia",
    placeholder: "Selecione",
    size: 'small',
    required: false,
    opcoes: opcoesStatusRec
  },
  defaultValue: EnumTexto.TODAS
};

// Filtro "Status do Agendamento"
const filtroEspecificoStatusCobr: FiltroConfig = {
  tipo: EnumInputTipos.SELECT,
  queryParam: true,
  validadores: [],
  inputConfig: {
    label: "Status do Agendamento",
    name: "statusAgendamento",
    placeholder: "Selecione",
    size: "small",
    required: false,
    opcoes: opcoesStatusCobr
  },
  defaultValue: EnumTexto.TODAS
}

const filtroEspecificoIdLote: FiltroConfig = {
  tipo: EnumInputTipos.INPUT,
  queryParam: true,
  validadores: [Validators.maxLength(100)],
  inputConfig: {
    label: "ID do Lote",
    name: "id",
    placeholder: "Digite o ID do lote",
    size: 'small',
    required: false
  }
};

//Filtros Especificos

export const filtrosEspecificos: FiltroConfig[] = [
  filtroEspecificoConvenio,
  filtroEspecificoDevedor,
  filtroEspecificoStatusRecorrencia
];


export const filtrosEspecificosCobr: FiltroConfig[] = [
  filtroEspecificoConvenio,
  filtroEspecificoDevedor,
  filtroEspecificoStatusCobr
];



// Para lote, convênio sempre obrigatório (constante)
export const filtrosEspecificosLote: FiltroConfig[] = [
  {
    tipo: EnumInputTipos.INPUT,
    queryParam: true,
    validadores: [Validators.required, Validators.maxLength(12)],
    inputConfig: {
      label: "Nº do Convênio",
      name: "convenio",
      placeholder: "Digite o Convênio",
      mask: "000000000000",
      size: 'small',
      required: true
    }
  },
  filtroEspecificoIdLote
];

//Filtros Gerais
const configIntervaloData: FiltroGrupoConfig = {
  titulo: "Selecione o intervalo de tempo",
  tooltip: "O filtro irá buscar os dados nesse intervalo de tempo.",
  filtros: filtrosIntervaloData,
  validadoresDoGrupo: [
    {
      camposAfetados: ["fim"],
      erro: "dataFimMenor",
      erroMensagem: "Data Fim deve ser maior que a data início.",
      validador: CustomValidatorsService.validarIntervaloDatas("inicio", "fim", "dataFimMenor")
    }
  ]
};

//Filtros Gerais
const configsFiltrosEspecificosRec: FiltroGrupoConfig[] = [
  configIntervaloData,
  {
    titulo: "Selecione os filtros",
    tooltip: "Selecione os filtros para ter uma pesquisa mais precisa.",
    filtros: filtrosEspecificos
  }
];

const configsFiltrosEspecificosCobr: FiltroGrupoConfig[] = [
  configIntervaloData,
  {
    titulo: "Selecione os filtros",
    tooltip: "Selecione os filtros para ter uma pesquisa mais precisa.",
    filtros: filtrosEspecificosCobr
  }
];



export const configsFiltrosEspecificosLote: FiltroGrupoConfig[] = [
  configIntervaloData,
  {
    titulo: "Busca por Convênio e ID do lote",
    tooltip: "Preencha os campos opcionais para refinar a busca por lotes.",
    filtros: filtrosEspecificosLote
  }
];


//Opcao Rec -> Autorizacao
const autorizacaoConsulta: RelatorioOpcao<EnumOpcoesAutorizacaoAgendamento> = {
  btnConfig: btnConsultar,
  destino: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO,
  configs: configsFiltrosEspecificosRec,
  icon: "assignment",
  label: "Autorizações"
};

//Opcao Cobr -> Agendamento
const agendamentoConsulta: RelatorioOpcao<EnumOpcoesAutorizacaoAgendamento> = {
  btnConfig: btnConsultar,
  destino: EnumOpcoesAutorizacaoAgendamento.AGENDAMENTO,
  configs: configsFiltrosEspecificosCobr,
  icon: "calendar_month",
  label: "Agendamentos"
}



export const loteConsulta: RelatorioOpcao<EnumOpcoesAutorizacaoAgendamento> = {
  btnConfig: btnConsultar,
  destino: EnumOpcoesAutorizacaoAgendamento.LOTE,
  configs: configsFiltrosEspecificosLote,
  icon: "inventory_2",
  label: "Lote de Agendamentos"
};

//Todas Opcoes


export const criarOpcoesDeConsulta = (): RelatorioOpcao<EnumOpcoesAutorizacaoAgendamento>[] => [
  autorizacaoConsulta,
  agendamentoConsulta,
  loteConsulta
];
