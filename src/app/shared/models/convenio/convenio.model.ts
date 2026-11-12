import { DscAlertVariant } from "sidsc-components/dsc-alert";
import { TipoAssinante, TipoSituacaoConvenio } from "../../../interfaces";
import { StatusRestricaoCliente } from "../../enums/status-restricao-cliente.enum";
import { CardDetalhes, CardTarifas } from "../formularioAlterarConvenio.model";

export type ConvenioPendente = {
  id: number | string;
  cnpj: string;
  unidade: number | string;
  dataInclusao: string;
  tipoPendencia: EnumTipoPendencia;
};

export type ConvenioPendenteResponse = {
  idConvenio: number;
  cnpj: string;
  unidade: number;
  dataInclusao: string;
  tipoPendenciaConformidade: EnumTipoPendencia;
}[];

export enum EnumTipoPendencia {
  ATIVACAO = 'ATIVACAO',
  ALTERACAO = 'ALTERACAO',
  NAO_INFORMADO = 'NAO_INFORMADO'
}

export enum EnumAprovacaoConvenio {
  APROVAR = 'APROVAR',
  REJEITAR = 'REJEITAR',
};

export enum EnumTipoPesquisaParticipante {
  CLIENTE = 'CLIENTE',
  EMPREGADO = 'EMPREGADO'
}

export enum EnumTipoAssinatura {
  FISICA_MANUAL = "FISICA",
  CERTIFICADO_DIGITAL = "CERTIFICADO_DIGITAL",
  DIGITAL_NEOSIGNER = "DIGITAL_NEOSIGNER",
  ELETRONICA_IBC = "ELETRONICA_GERENCIADOR_FINANCEIRO",
  CONVENIO_INTERNO = "CONVENIO_INTERNO"
};

export const LabelTipoAssinaturaMap: Record<EnumTipoAssinatura, string> = {
  [EnumTipoAssinatura.FISICA_MANUAL]: "Assinatura Física (Manual)",
  [EnumTipoAssinatura.ELETRONICA_IBC]: "Assinatura Eletrônica (Gerenciador Caixa)",
  [EnumTipoAssinatura.CERTIFICADO_DIGITAL]: "Assinatura com Certificado Digital (PDF)",
  [EnumTipoAssinatura.DIGITAL_NEOSIGNER]: "Assinatura Digital via plataforma Neosigner",
  [EnumTipoAssinatura.CONVENIO_INTERNO]: "Convênio Interno",
};

export type Assinatura = {
  nome: string;
  cpf: string;
  email: string;
  telefone: string | null;
  tipoAssinante: TipoAssinante;
  vinculo: string | null;
  matricula: string | null;
};

export type TrocaInformacao = {
  id: number;
  nome: string;
  complemento: string | null;
};

export type ResumoTermoAdesao = {
  idConvenio: number;
  idTermo: string;
}

export type ConvenioResponse = {
  // Identificação e dados cadastrais
  numeroConvenio: number;
  nomeFantasia: string;
  razaoSocial: string;
  apelido: string;
  apelidoVan: string | null;
  cnae: string;
  nincho: string;
  naturezaJuridica: string;
  segmento: string;
  convenioInternoCaixa: boolean;
  idSituacao: EnumStatusConvenio;
  descricaoSituacao: string;
  // Prazo
  comPrazoIndeterminadoComAtualizacao: boolean | null;
  comPrazoIndeterminadoSemAtualizacao: boolean | null;
  diasDegustacao: number;
  // Endereço
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  complemeto: string;
  // Contato
  email: string;
  telefone1: string;
  telefone2: string;
  chavePixCadastrada: string;
  // Conta de repasse
  formaRepasse: string;
  contaRepasse: string;
  agenciaContaRepasse: string;
  digitoContaRepasse: string;
  operacaoContaRepasse: string;
  // Conta de débito de tarifa
  contaDebitoTarifa: string;
  agenciaContaDebitoTarifa: string;
  digitoContaDebitoTarifa: string;
  operacaoContaDebitoTarifa: string;
  // Pagadores
  pagadoresCaixa: number;
  pagadoresOutrosBancos: number;
  // Configurações
  inibirRetentativa: boolean;
  tarifaRetentativa: number;
  indiceReajusteTarifa: string;
  iniciadoraCaixa: number;
  tipoAssinatura: EnumTipoAssinatura;
  // Assinaturas e troca de informações
  assinaturas: Assinatura[];
  trocaInformacoes: TrocaInformacao[];
  // Metadados
  idTermo: string;
  unidadeVinculacao: number;
  //Excecao
  excecaoContaDebitoDiferente: boolean;
  excecaoMinutaContratualForaPadrao: boolean;
  excecaoMinutaEditalCredenciamento: boolean;
  excecaoOutro: boolean;
  //Cancelamento
  justificativaCancelamento: string | null;
  //Altercao do Convenio
  unidadeVinculacaoIgual: boolean;
  detalhamentoResponse: { itemAlteradoComparacaoConvenio: MudancasConvenio[] } | null;
  situacaoAlteracaoConvenioAtual: EnumStatusSolicitacaoAlteracao.APROVADO | EnumStatusSolicitacaoAlteracao.PENDENTE | null;
  houveInclusaoRepresentante: boolean;
  //Marcacao GOV
  empresaPublica: boolean,
  tarifaMensal: boolean,
  tarifaMensalManual: boolean,
  diaTarifaMensal: number | null,
}

export type Conta = {
  id: number;
  codigoOperacao: string;
  dbConta: string;
  numeroAgencia: string;
  numeroConta: string;
  produto: string;
};

export type ContaCorreta = {
  codigoOperacao: string; //Produto da Conta
  numeroAgencia: string;
  numeroConta: string;
  dvConta: string;//DBConta da Conta
};

export type FormularioAlterarConvenio = CardTarifas & CardDetalhes;

export type RetornoMudancasConvenio = FormularioAlterarConvenio & {
  idTermo: string;
}

export type MudancasConvenio = {
  campo: keyof RetornoMudancasConvenio;
  original: ValueOf<RetornoMudancasConvenio>;
  solicitado: ValueOf<RetornoMudancasConvenio>;
}

export interface ConfigCampo {
  label: string;
  formatar: (valor: any) => string;
};

export interface RestricoesCliente {
  sicow: StatusRestricaoCliente;
  contaPJ: StatusRestricaoCliente;
  cadastro: StatusRestricaoCliente;
  dataConstituicao: StatusRestricaoCliente;
  fraude: StatusRestricaoCliente
}

export type ParametroVan = {
  id: string;
  nome: string;
  mensagem?: string | null;
  excluido: boolean;
  situacao?: boolean;
};

export type ParametroItem = {
  id: number;
  nome: string;
  descricao: string;
  valor: string;
  complemento: any;
};

export type AlertContasCarregadas = {
  mensagem: string;
  variant: DscAlertVariant
};

export type ContaPreAlterar = {
  codigoOperacao: string;
  dvConta: string;
  numeroAgencia: string;
  numeroConta: string;
  produto: string;
};

export type PreAlterarConvenioResponse = {
  contas: ContaPreAlterar[] | null;
  parametros: ParametroItem[] | null;
};

export enum EnumStatusSolicitacaoAlteracao {
  PENDENTE = "PENDENTE",
  APROVADO = "APROVADO",
  REJEITADO = "REJEITADO",
  EFETIVADO = "EFETIVADO"
};

export const statusSolicitacaoAlteracaoLabels: Record<EnumStatusSolicitacaoAlteracao, string> = {
  [EnumStatusSolicitacaoAlteracao.PENDENTE]: 'Alteração pendente de avaliação',
  [EnumStatusSolicitacaoAlteracao.APROVADO]: 'Alteração aprovada',
  [EnumStatusSolicitacaoAlteracao.REJEITADO]: 'Rejeitado',
  [EnumStatusSolicitacaoAlteracao.EFETIVADO]: 'Efetivado',
};

export type HistoricoAlteracaoConvenioDTO = {
  idProtocolo: number;
  responsavelInclusao: string;
  dataInclusao: string;
  status: number;
  dataStatus: string;
  idTermoAdesao: string | null;
  justificativaRejeicao: string | null;
};

export type HistoricoAlteracaoConvenio = {
  idProtocolo: number;
  responsavelInclusao: string;
  dataInclusao: string;
  status: keyof typeof EnumStatusSolicitacaoAlteracao; // "PENDENTE" | "APROVADO" | ...
  dataStatus: string;
  idTermoAdesao: string | null;
  justificativaRejeicao: string | null;
};

export enum EnumTrocaInformacao {
  GERENCIADOR = 12,
  API = 13,
  VAN = 14
}

export type CampoCompararAlteracao = {
  valorAtual: string;
  valorNovo: string;
  label: string;
  name: string;
  checkbox: boolean
};


export type OutputCompararAlteracao = {
  name: string;
  opcaoCheckbox: boolean;
}

export type ValueOf<T> = T[keyof T];

export type AlterarConvenioResponse = {
  id: number;
  situacaoInicial: EnumStatusSolicitacaoAlteracao;
  dataSituacao: string; //aaaa-mm-ddT00:00:00
  idTermoCandidato: string | null;
}

export enum EnumStatusConvenio {
  ATIVO = 11, // Convênio Ativo
  PENDENTE_ASSINATURA = 12, // Convênio Pendente de Assinatura
  CANCELADO = 13, // Convênio Cancelado
  EXPIRADO = 14, // Convênio Expirado
  INCLUIDO = 16, // Convênio Incluído
  PENDENTE_CONFORMIDADE = 18, // Convênio Pendente Conformidade
  REJEITADO_CONFORMIDADE = 19, // Convênio Rejeitado Conformidade
  AGUARDANDO_VIGENCIA = 20, // Convênio Aguardando Vigência
  BLOQUEADO_FRAUDE = 21 // Convênio bloquedo por fraude
}

export const statusConvenioLabels: Record<EnumStatusConvenio, string> = {
  [EnumStatusConvenio.ATIVO]: 'Ativo',
  [EnumStatusConvenio.PENDENTE_ASSINATURA]: 'Pendente de Assinatura',
  [EnumStatusConvenio.CANCELADO]: 'Cancelado',
  [EnumStatusConvenio.EXPIRADO]: 'Expirado',
  [EnumStatusConvenio.INCLUIDO]: 'Incluído',
  [EnumStatusConvenio.PENDENTE_CONFORMIDADE]: 'Pendente Conformidade',
  [EnumStatusConvenio.REJEITADO_CONFORMIDADE]: 'Rejeitado Conformidade',
  [EnumStatusConvenio.AGUARDANDO_VIGENCIA]: 'Aguardando Vigência',
  [EnumStatusConvenio.BLOQUEADO_FRAUDE]: 'Bloqueado por Fraude'
};

export type Assinante = {
  mensagem?: string;
  nome?: string;
  cpf?: string;
  matricula?: string;
  email?: string;
  telefone?: string;
  vinculo?: string;
  tipoAssinante?: TipoAssinante;
  assinanteComRestricao?: boolean;
}

export type ContasPJResponse = {
  contas: Conta[];
};

export type RestricaoFraudeResponse = {
  fraudeRegistrada: boolean | null;
};

export type TipoServico = {
  id: number;
  enum: number;
  nomeTipoServico: string;
  tipoServicoAtivo: 'S' | 'N';
  inicioVigenciaTipoServico: string; //yyyy-mm-dd
  fimVigenciaTipoServico: string | null;
};

export type TipoSituacao = {
  id: number;
  enum: number;
  nomeSituacao: string;
  descricaoSituacao: string;
  flagSituacaoAtiva: 'S' | 'N';
  dataInicioVigenciaTipoSituacao: string; //yyyy-mm-dd
  dataFimVigenciaTipoSituacao: string | null;
};

export type ConvenioSituacao = {
  enumTipoSituacao: TipoSituacaoConvenio;
  tipoSituacao: TipoSituacao;
  tsSituacao: string; //yyyy-mm-ddTHH:MM:SS:MS
  coUsuarioAlcada: string;
}

export type ConvenioSimplificadoDTO = {
  id: number;
  apelido: string;
  tipo_servico: TipoServico;
  cnpj: string;
  unidade_relacionamento: string;
  convenioSituacao: ConvenioSituacao[];
};

export type ConsultaSimplificadaDTO = {
  cnpj: string;
  convenios: ConvenioSimplificadoDTO[]
};

export enum EnumTipoConsultaSimplificada {
  CNPJ = "cnpj",
  CONVENIO = "numeroConvenio",
};

export type VanCaracteristica = {
  nome: string;
  codigo: string;
};

export type ContratoConvenio = {
  idConvenio: string;
  idTermoAdesao: string;
  tipoAssinatura: EnumTipoAssinatura;
};

export type ConvenioFormatadoTabela = {
  id: number,
  enumSituacao: number;
  unidade: string,
  cnpjFormatado: string,
  apelido: string | null,
  situacao: string,
  dataInclusao: string,
};

export enum EnumDirecaoOrdenacao {
  ASC = 'asc',
  DESC = 'desc',
};

export enum EnumNaturezaEmpresa {
  PJ_PRIVADA = 'PJ_PRIVADA',
  PJ_PUBLICA = 'PJ_PUBLICA',
};

export enum EnumPeriodicidadeTarifa {
  MENSAL = 'MENSAL',
  DIARIA = 'DIARIA'
};

export enum EnumModalidadeCobranca {
  AUTOMATICA = 'AUTOMATICA',
  MANUAL = 'MANUAL'
};

export enum EnumTipoCampoConvenioConfig {
  EXIBICAO = 'EXIBICAO',
  COMPARACAO = 'COMPARACAO'
};

export interface CampoConvenioOptions {
  /** Resolve o rótulo da VAN a partir do código; pode consultar estado local (ex.: vansOption) */
  resolveVanOpcao?: (codigoVan: string | null | undefined) => string;
}

export type CampoModalidadeConvenio = {
  titulo: string,
  tooltip: string
}
