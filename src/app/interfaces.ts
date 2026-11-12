import { Assinante, EnumTipoAssinatura, RestricoesCliente } from "./shared/models/convenio/convenio.model";

export interface Aplicacao {
  id: string;
  origem: string;
  nome: string;
  descricao: string;
  caminho: string;
  contexto: string;
  icone: string;
  perfil?: string;
  tipo: string;
  ordem: number;
  favorito: boolean;
  ajuda?: string[];
  servico?: Servico;
  funcionalidades?: Funcionalidade[]
}

export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  caminho: string;
  contexto: string;
  icone: string;
  collapse: boolean;
  aplicacoes: Aplicacao[];
  origem: string;
  perfil?: string;
  ordem: number;
  ajuda?: string[];
}

export interface Funcionalidade {
  id: string,
  nome: string,
  descricao: string,
  icone: string,
  tipos: string[]
}

export interface Componente {
  id: string;
  nome: string;
  descricao: string;
  caminho: string;
  origem: string;
}

export interface Host {
  id: string;
  servico: Servico;
  aplicacao: Aplicacao;
  origem: string;
  caminho: string;
  contexto: string;
  basehref: string;
  componentes: Componente[] | null;
}

export interface Preferences {
  favoritos: boolean;
  acessoRapido: boolean;
  sugestoesIA: boolean;
}

export interface Etapa {
  done: boolean | any;
  date?: string;
}

export interface Cliente {
  cnpj: string;
  nome: string;
  simulacoes: Simulacao[];
  convenios: Convenio[]
  restricoes: RestricoesCliente;
}

export enum TipoTarifa {
  BALCAO = "BALCAO",
  CAMPANHA = "CAMPANHA",
  SIMULACAO = "SIMULACAO",
  DIFERENCIADA = "DIFERENCIADA"
}

export enum TipoTarifaSimulador {
  BALCAO = 1,
  CAMPANHA = 2,
  SIMULACAO = 3,
  DIFERENCIADA = 4
}


export interface Tarifa {
  id: number | any;
  tipo: TipoTarifa | TipoTarifaSimulador;
  referencia: boolean;
  condicao: string;
  pgCaixa: string | any;
  pgOutros: string | any;
  retentativa: string | any;
  degustacao: string | any;
  situacao: string;
  recomended: boolean;
  custom: boolean;
  visible: boolean;
  excecaoContaDebitoDiferente?: boolean;
  excecaoMinutaEditalCredenciamento?: boolean;
  excecaoInibirRetentativa?: boolean;
  excecaoInibirIniciadoraOpenFinance?: boolean;
  grupoMargemContribuicao?: EnumGruposMargemContribuicao;
}

export interface Parametro {
  debito: boolean;
  inibirRetentativa: boolean;
  inibirOpenFinance: boolean;
  minutaContratual: boolean;
  outro: boolean;
}

export interface Contas {
  id: string;
  selected: boolean;
}

export interface Conta {
  agencia: string;
  conta: string;
  contadv: string;
  op: string;
}

export interface Contraproposta {
  id: string;
  tarifa: Tarifa;
  excecoes: Parametro;
  justificativa: string;
  documentacao?: FileList;
}

export interface Simulacao {
  id: string;
  unidade: string;
  etapa1: Etapa;
  etapa2: Etapa;
  etapa3: Etapa;
  etapa4: Etapa;
  etapa5: Etapa;
  tarifa: Tarifa;
  parametros: Parametro;
  convenio: string;
  contas: Contas[];
  agendamentoMes: string;
  tikectMedio: string;
  documentacao?: FileList;
}

export interface Convenio {
  id: string;
  situacao: TipoSituacao,
  unidade: string;
  tarifa: Tarifa;
  parametros: Parametro;
  convenio: string;
  conta: Conta;
  agendamentoMes: string;
  tikectMedio: string;
  documentacao?: FileList;
  chavePix: string;
  viaGerenciadorFinanceiro: boolean;
  viaAPI: boolean;
  viaVAN: boolean;
  van: any;
  indiceTarifas: any;
  formaRepasse: TipoFormaRepasse;
  contaRepasse: any;
  contaDebitoTarifa: any;
  prazoConvenio: TipoPrazoConvenio;
  prazoConvenioData: any;
  tipoConvenio: TipoFrequenciaConvenio;
  aditivoContratual: boolean;
  ajustarTarifa: boolean;
  renovacaoPrazoMaximo: any;
  prorrogavelPrazoMaximo: any;
  iniciadoraCaixa: any;
  razaoSocial: string;
  nomeFantasia: string;
  apelido: string;
  internoCaixa: boolean;
  bairro: string;
  logradouro: string;
  complemento: string;
  numero: string;
  cep: string;
  uf: string;
  cidade: string;
  email: string;
  telefone1: string;
  telefone2: string;
  cnae: string;
  nicho: string;
  naturezaJuridica: string;
  segmento: string;
  tipoAssinatura: EnumTipoAssinatura;
  assinantes: Assinante[];
  retentativa: boolean;
  openFinance: boolean;
  idTermo: string;
  justificativaCancelamento: string | null;
  houveInclusaoRepresentante?: boolean;
  empresaPublica?: boolean;
  cobrancaMensal?: boolean
}

export interface Campanha {
  nome: string;
  periodo: string;
  vantagens: string;
  publicoAlvo: string;
  descricao: string;
}

export interface Situacao {
  id: number;
  title: string;
}

export interface CondicaoSimulacaoDTO {
  tipo: number;
  id: number;
  nome: string;
  tarifaPagadoresCaixa: number;
  tarifaPagadoresOutras: number;
  tarifaRetentativa: number;
  diasDegustacao: number;
  grupoMargemContribuicao: EnumGruposMargemContribuicao | null //Null, pois as simulações do legado não tinham grupo
}

export interface ExcecoesSimulacaoDTO {
  contaDebitoDiferente: boolean;
  inibirRetentativa: boolean;
  inibirOpenFinance: boolean;
  minutaContratualForaPadrao: boolean;
  minutaEditalCredenciamento: boolean;
  outro: boolean;
  textoOutro: string;
}

export interface JustificativaSimulacaoDTO {
  novoConvenio: boolean;
  unidadeRelacionamentoConvenio: string;
  agendamentosPorMes: number;
  ticketMedio: number;
  migracaoDebitoAutomatico: boolean;
  contaPJDebitoAutomatico: string[];
  comentarios: string;
  documentos?: FileList;
}

export interface SimulacaoDTO {
  cnpj: string;
  condicao: CondicaoSimulacaoDTO;
  excecoes: ExcecoesSimulacaoDTO;
  justificativa: JustificativaSimulacaoDTO;
}


export interface TipoSimulacao {
  id: number;
  nomeSituacao: string;
  descricaoSituacao: string;
  flagSituacaoAtiva: string | null;
  dataInicioVigenciaTipoSituacao: string;
  dataFimVigenciaTipoSituacao: string;
}

export interface TipoConvenio {
  id: number;
  nomeSituacao: string;
  descricaoSituacao: string;
  flagSituacaoAtiva: string | null;
  dataInicioVigenciaTipoSituacao: string;
  dataFimVigenciaTipoSituacao: string;
}

export enum Operacao {
  CONSULTA,
  CONSULTA_AVANCADA,
  INCLUIR,
  CONTRATO,
  DETALHAR,
  ALTERAR,
}

export enum TipoAssinante {
  SOCIO = "LEGAL",
  CAIXA = "CAIXA",
  TESTEMUNHA = "TESTEMUNHA"
}

export enum TipoPrazoConvenio {
  INDETERMINADO_COM_ATUALIZACAO = "INDETERMINADO_COM_ATUALIZACAO",  // ANTES ERA INDETERMINADO
  INDETERMINADO_SEM_ATUALIZACAO = "INDETERMINADO_SEM_ATUALIZACAO"   // ANTES ERA DETERMINADO
}

export enum TipoFrequenciaConvenio {
  AUTOMATICO = 1,
  PRORROGAVEL = 2
}

export enum TipoFormaRepasse {
  TRANSACAO = "REPASSE_POR_TRANSACAO",
  CONSOLIDADO = "REPASSE_CONSOLIDADO"
}

export enum TipoSituacao {
  GERENCIADOR = 12,
  API = 13,
  VAN = 14
}

export enum TipoSituacaoConvenio {
  ATIVO = 11,
  PENDENTE = 12,
  CANCELADO = 13,
  INCLUIDO = 16
}


export enum EnumGrupoParametros {
  GERAL_PRAZO = "GERAL_PRAZO",
  GERAIS_CONTASPJ_PRODUTOS = "GERAIS_CONTASPJ_PRODUTOS",
  GERAIS_VANS_PRODUTOS = "GERAIS_VANS_PRODUTOS",
  GERAIS_EMAILS = 'GERAIS_EMAILS',
  TEXTO_UPLOAD = "TEXTO_UPLOAD",
  TEXTO_TEXTOS = "TEXTO_TEXTOS",
  TEXTO_EMAILS = "TEXTO_EMAILS",
  TARIFA_TARIFAS = "TARIFA_TARIFAS",
  TARIFA_ALCADAS = "TARIFA_ALCADAS",
  TARIFA_INDICES = "TARIFA_INDICES",
  TARIFA_MELHOR_OPCAO = "TARIFA_MELHOR"
}


export enum EnumParametros {
  TEXTO_TEXTOS_ABERTURA_SIMULACAO = "TEXTO_TEXTOS_ABERTURA_SIMULACAO",
  TEXTO_TEXTOS_ABERTURA_CONVENIO = "TEXTO_TEXTOS_ABERTURA_CONVENIO",
  TEXTO_TEXTOS_TARIFA_AGENDAMENTO = "TEXTO_TEXTOS_TARIFA_AGENDAMENTO",
  TEXTO_TEXTOS_TARIFA_RETENTATIVA = "TEXTO_TEXTOS_TARIFA_RETENTATIVA",
  TEXTO_TEXTOS_TARIFA_DEGUSTACAO = "TEXTO_TEXTOS_TARIFA_DEGUSTACAO",
  TEXTO_EMAILS_ANALISE_SIMULACAO_ASSUNTO = "TEXTO_EMAILS_ANALISE_SIMULACAO_ASSUNTO",
  TEXTO_EMAILS_ANALISE_SIMULACAO_CONTEUDO = "TEXTO_EMAILS_ANALISE_SIMULACAO_CONTEUDO",
  TEXTO_EMAILS_CONTRATO_UNICO_ASSUNTO = "TEXTO_EMAILS_CONTRATO_UNICO_ASSUNTO",
  TEXTO_EMAILS_CONTRATO_UNICO_CONTEUDO = "TEXTO_EMAILS_CONTRATO_UNICO_CONTEUDO",
  TEXTO_EMAILS_ADESAO_ASSUNTO = "TEXTO_EMAILS_ADESAO_ASSUNTO",
  TEXTO_EMAILS_ADESAO_CONTEUDO = "TEXTO_EMAILS_ADESAO_CONTEUDO",
  TEXTO_UPLOADS_PIX_AUTOMATICO = "TEXTO_UPLOADS_PIX_AUTOMATICO",
  TEXTO_UPLOADS_CONTRATO_UNICO = "TEXTO_UPLOADS_CONTRATO_UNICO",
  TEXTO_UPLOADS_REGRAS_TARIFA = "TEXTO_UPLOADS_REGRAS_TARIFA",
  TEXTO_UPLOADS_TEMPLATE_TERMO_ADESAO = "TEXTO_UPLOADS_TEMPLATE_TERMO_ADESAO",
  TARIFA_TARIFAS_AGENDAMENTO_CAIXA = "TARIFA_TARIFAS_AGENDAMENTO_CAIXA",
  TARIFA_TARIFAS_AGENDAMENTO_OUTROS = "TARIFA_TARIFAS_AGENDAMENTO_OUTROS",
  TARIFA_TARIFAS_RETENTATIVA = "TARIFA_TARIFAS_RETENTATIVA",
  TARIFA_TARIFAS_AGENDAMENTO_INICIADORA = "TARIFA_TARIFAS_AGENDAMENTO_INICIADORA",
  TARIFA_TARIFAS_RETENTATIVA_INICIADORA = "TARIFA_TARIFAS_RETENTATIVA_INICIADORA",
  TARIFA_TARIFAS_RETENTATIVA_MINIMA_INICIADORA = "TARIFA_TARIFAS_RETENTATIVA_MINIMA_INICIADORA",

  // Grupo 1
  TARIFA_ALCADAS_PRIMEIRO_NIVEL_PERCENTUAL_GRUPO_1 = 'TARIFA_ALCADAS_PRIMEIRO_NIVEL_PERCENTUAL_GRUPO_1',
  TARIFA_ALCADAS_PRIMEIRO_NIVEL_GRUPO_1 = 'TARIFA_ALCADAS_PRIMEIRO_NIVEL_GRUPO_1',
  TARIFA_ALCADAS_SEGUNDO_NIVEL_PERCENTUAL_GRUPO_1 = 'TARIFA_ALCADAS_SEGUNDO_NIVEL_PERCENTUAL_GRUPO_1',
  TARIFA_ALCADAS_SEGUNDO_NIVEL_GRUPO_1 = 'TARIFA_ALCADAS_SEGUNDO_NIVEL_GRUPO_1',
  TARIFA_ALCADAS_TERCEIRO_NIVEL_PERCENTUAL_GRUPO_1 = 'TARIFA_ALCADAS_TERCEIRO_NIVEL_PERCENTUAL_GRUPO_1',
  TARIFA_ALCADAS_TERCEIRO_NIVEL_GRUPO_1 = 'TARIFA_ALCADAS_TERCEIRO_NIVEL_GRUPO_1',
  TARIFA_ALCADAS_QUARTO_NIVEL_PERCENTUAL_GRUPO_1 = 'TARIFA_ALCADAS_QUARTO_NIVEL_PERCENTUAL_GRUPO_1',
  TARIFA_ALCADAS_QUARTO_NIVEL_GRUPO_1 = 'TARIFA_ALCADAS_QUARTO_NIVEL_GRUPO_1',

  // Grupo 2
  TARIFA_ALCADAS_PRIMEIRO_NIVEL_PERCENTUAL_GRUPO_2 = 'TARIFA_ALCADAS_PRIMEIRO_NIVEL_PERCENTUAL_GRUPO_2',
  TARIFA_ALCADAS_PRIMEIRO_NIVEL_GRUPO_2 = 'TARIFA_ALCADAS_PRIMEIRO_NIVEL_GRUPO_2',
  TARIFA_ALCADAS_SEGUNDO_NIVEL_PERCENTUAL_GRUPO_2 = 'TARIFA_ALCADAS_SEGUNDO_NIVEL_PERCENTUAL_GRUPO_2',
  TARIFA_ALCADAS_SEGUNDO_NIVEL_GRUPO_2 = 'TARIFA_ALCADAS_SEGUNDO_NIVEL_GRUPO_2',
  TARIFA_ALCADAS_TERCEIRO_NIVEL_PERCENTUAL_GRUPO_2 = 'TARIFA_ALCADAS_TERCEIRO_NIVEL_PERCENTUAL_GRUPO_2',
  TARIFA_ALCADAS_TERCEIRO_NIVEL_GRUPO_2 = 'TARIFA_ALCADAS_TERCEIRO_NIVEL_GRUPO_2',
  TARIFA_ALCADAS_QUARTO_NIVEL_PERCENTUAL_GRUPO_2 = 'TARIFA_ALCADAS_QUARTO_NIVEL_PERCENTUAL_GRUPO_2',
  TARIFA_ALCADAS_QUARTO_NIVEL_GRUPO_2 = 'TARIFA_ALCADAS_QUARTO_NIVEL_GRUPO_2',

  // Grupo 3
  TARIFA_ALCADAS_PRIMEIRO_NIVEL_PERCENTUAL_GRUPO_3 = 'TARIFA_ALCADAS_PRIMEIRO_NIVEL_PERCENTUAL_GRUPO_3',
  TARIFA_ALCADAS_PRIMEIRO_NIVEL_GRUPO_3 = 'TARIFA_ALCADAS_PRIMEIRO_NIVEL_GRUPO_3',
  TARIFA_ALCADAS_SEGUNDO_NIVEL_PERCENTUAL_GRUPO_3 = 'TARIFA_ALCADAS_SEGUNDO_NIVEL_PERCENTUAL_GRUPO_3',
  TARIFA_ALCADAS_SEGUNDO_NIVEL_GRUPO_3 = 'TARIFA_ALCADAS_SEGUNDO_NIVEL_GRUPO_3',
  TARIFA_ALCADAS_TERCEIRO_NIVEL_PERCENTUAL_GRUPO_3 = 'TARIFA_ALCADAS_TERCEIRO_NIVEL_PERCENTUAL_GRUPO_3',
  TARIFA_ALCADAS_TERCEIRO_NIVEL_GRUPO_3 = 'TARIFA_ALCADAS_TERCEIRO_NIVEL_GRUPO_3',
  TARIFA_ALCADAS_QUARTO_NIVEL_PERCENTUAL_GRUPO_3 = 'TARIFA_ALCADAS_QUARTO_NIVEL_PERCENTUAL_GRUPO_3',
  TARIFA_ALCADAS_QUARTO_NIVEL_GRUPO_3 = 'TARIFA_ALCADAS_QUARTO_NIVEL_GRUPO_3',

  // Grupo 4
  TARIFA_ALCADAS_PRIMEIRO_NIVEL_PERCENTUAL_GRUPO_4 = 'TARIFA_ALCADAS_PRIMEIRO_NIVEL_PERCENTUAL_GRUPO_4',
  TARIFA_ALCADAS_PRIMEIRO_NIVEL_GRUPO_4 = 'TARIFA_ALCADAS_PRIMEIRO_NIVEL_GRUPO_4',
  TARIFA_ALCADAS_SEGUNDO_NIVEL_PERCENTUAL_GRUPO_4 = 'TARIFA_ALCADAS_SEGUNDO_NIVEL_PERCENTUAL_GRUPO_4',
  TARIFA_ALCADAS_SEGUNDO_NIVEL_GRUPO_4 = 'TARIFA_ALCADAS_SEGUNDO_NIVEL_GRUPO_4',
  TARIFA_ALCADAS_TERCEIRO_NIVEL_PERCENTUAL_GRUPO_4 = 'TARIFA_ALCADAS_TERCEIRO_NIVEL_PERCENTUAL_GRUPO_4',
  TARIFA_ALCADAS_TERCEIRO_NIVEL_GRUPO_4 = 'TARIFA_ALCADAS_TERCEIRO_NIVEL_GRUPO_4',
  TARIFA_ALCADAS_QUARTO_NIVEL_PERCENTUAL_GRUPO_4 = 'TARIFA_ALCADAS_QUARTO_NIVEL_PERCENTUAL_GRUPO_4',
  TARIFA_ALCADAS_QUARTO_NIVEL_GRUPO_4 = 'TARIFA_ALCADAS_QUARTO_NIVEL_GRUPO_4',

  // Grupo 5
  TARIFA_ALCADAS_PRIMEIRO_NIVEL_PERCENTUAL_GRUPO_5 = 'TARIFA_ALCADAS_PRIMEIRO_NIVEL_PERCENTUAL_GRUPO_5',
  TARIFA_ALCADAS_PRIMEIRO_NIVEL_GRUPO_5 = 'TARIFA_ALCADAS_PRIMEIRO_NIVEL_GRUPO_5',
  TARIFA_ALCADAS_SEGUNDO_NIVEL_PERCENTUAL_GRUPO_5 = 'TARIFA_ALCADAS_SEGUNDO_NIVEL_PERCENTUAL_GRUPO_5',
  TARIFA_ALCADAS_SEGUNDO_NIVEL_GRUPO_5 = 'TARIFA_ALCADAS_SEGUNDO_NIVEL_GRUPO_5',
  TARIFA_ALCADAS_TERCEIRO_NIVEL_PERCENTUAL_GRUPO_5 = 'TARIFA_ALCADAS_TERCEIRO_NIVEL_PERCENTUAL_GRUPO_5',
  TARIFA_ALCADAS_TERCEIRO_NIVEL_GRUPO_5 = 'TARIFA_ALCADAS_TERCEIRO_NIVEL_GRUPO_5',
  TARIFA_ALCADAS_QUARTO_NIVEL_PERCENTUAL_GRUPO_5 = 'TARIFA_ALCADAS_QUARTO_NIVEL_PERCENTUAL_GRUPO_5',
  TARIFA_ALCADAS_QUARTO_NIVEL_GRUPO_5 = 'TARIFA_ALCADAS_QUARTO_NIVEL_GRUPO_5',

  TARIFA_INDICES_IGPM = "TARIFA_INDICES_IGPM",
  TARIFA_INDICES_INPC = "TARIFA_INDICES_INPC",
  TARIFA_INDICES_IPCA = "TARIFA_INDICES_IPCA",
  TARIFA_INDICES_FIPE = "TARIFA_INDICES_FIPE",
  TARIFA_MELHOR_OPCAO_PRIORIDADE_UM = "TARIFA_MELHOR_OPCAO_PRIORIDADE_UM",
  TARIFA_MELHOR_OPCAO_PRIORIDADE_DOIS = "TARIFA_MELHOR_OPCAO_PRIORIDADE_DOIS",
  TARIFA_MELHOR_OPCAO_PRIORIDADE_TRES = "TARIFA_MELHOR_OPCAO_PRIORIDADE_TRES",
  TARIFA_MELHOR_OPCAO_PRIORIDADE_QUATRO = "TARIFA_MELHOR_OPCAO_PRIORIDADE_QUATRO",
  GERAIS_PRAZO_VALIDADE = "GERAIS_PRAZO_VALIDADE",
  GERAIS_PRAZO_ANALISE_SEGUNDA_INSTANCIA = "GERAIS_PRAZO_ANALISE_SEGUNDA_INSTANCIA",
  GERAIS_PRAZO_ANALISE_TERCEIRA_INSTANCIA = "GERAIS_PRAZO_ANALISE_TERCEIRA_INSTANCIA",
  GERAIS_PRAZO_ANALISE_QUARTA_INSTANCIA = "GERAIS_PRAZO_ANALISE_QUARTA_INSTANCIA",
  GERAIS_PRAZO_ANALISE_CONTRAPROPOSTA = "GERAIS_PRAZO_ANALISE_CONTRAPROPOSTA",
  GERAIS_PRAZO_ASSINATURA_CONVENIO = "GERAIS_PRAZO_ASSINATURA_CONVENIO",
  GERAIS_CONTASPJ_PRODUTOS = "GERAIS_CONTASPJ_PRODUTOS",
  GERAIS_VANS_PRODUTOS = "GERAIS_VANS_PRODUTOS",
  GERAIS_PRAZO_DEGUSTACAO = "GERAIS_PRAZO_DEGUSTACAO",
  TEXTO_TEXTOS_TEMPLATE_CONTRATO_HTML = "TEXTO_TEXTOS_TEMPLATE_CONTRATO_HTML",
  GERAIS_EMAILS_NOTIFICACOES = "GERAIS_EMAILS_NOTIFICACOES"
}

export enum EnumTexto {
  NAO_INFORMADO = '(não informado)',
  HIFEN = '-',
  SOLICITANTE_DESCONHECIDO = 'Solicitante desconhecido',
  NAO_INFORMAR = 'Não informar',
  ABREVIACAO_NAO_INFORMAR = 'NI',
  DATA_INVALIDA = '(data inválida)',
  TODAS = 'Todas',
  DESCRICAO_INDEFINIDO = 'INDEFINIDO',
  VAZIO = '',
  TODAS_MAIUSCUOLAS = 'TODAS',
}

export interface Paginacao {
  quantidadeDePaginas?: number,
  quantidadeTotalDeItens?: number,
  itensPorPagina: number,
  paginaAtual: number
}

export interface DadosPrimarioHeader {
  titulo: string,
  valor: string,
  nome?: string
}

export interface HeaderRelatorioMovimentacao {
  convenio: string,
  dataInicio: string,
  dataFim: string
}

export interface IndiceTarifa {
  nome: string,
  chave: EnumParametros,
  valor: string,
  complemento: string
}

export interface Liquidacao {
  agenciaOriginal: string;
  cnpjRecebedorOriginal: string;
  contaOriginal: string;
  dataAtualizacao: string;
  dataInclusao: string;
  dataRepasse: string;
  degustacao: string;
  descricaoSituacao: string;
  documentoPagador: string | null;
  id: string;
  idConvenio: string;
  ispbPagadorOriginal: string;
  origemTarifa: string;
  situacaoLiquidacao: string;
  tipoRepasse: string;
  tipoTarifa: string;
  txidOriginal: string;
  valorPagamentoOriginal: number;
  valorTarifa: number;
}

export interface RetornoRepasse {
  liquidacoes: Liquidacao[];
  razaoSocial: string | null;
}

export enum EnumRadioButtonTarifas {
  SIMULACOES_REALIZADAS = 'SIMULACOES_REALIZADAS',
  PLEITEAR_CONDICOES = 'PLEITEAR_CONDICOES',
}

export enum EnumMensagemGrupo {
  GRUPO_1 = 'MC entre R$ 0 a R$ 300 mil',
  GRUPO_2 = 'MC acima de R$ 300 mil a R$ 500 mil',
  GRUPO_3 = 'MC acima de R$ 500 mil a R$ 800 mil',
  GRUPO_4 = 'MC acima de R$ 800 mil a R$ 1 milhão',
  GRUPO_5 = 'MC acima de R$ 1 milhão',
  INVALIDO = '',
}

export enum EnumGruposMargemContribuicao {
  GRUPO_1 = 'GRUPO_1',
  GRUPO_2 = 'GRUPO_2',
  GRUPO_3 = 'GRUPO_3',
  GRUPO_4 = 'GRUPO_4',
  GRUPO_5 = 'GRUPO_5',
  INVALIDO = 'INVALIDO',
}

export enum EnumLabelGruposMargemContribuicao {
  GRUPO_1 = 'Grupo 1',
  GRUPO_2 = 'Grupo 2',
  GRUPO_3 = 'Grupo 3',
  GRUPO_4 = 'Grupo 4',
  GRUPO_5 = 'Grupo 5',
  INVALIDO = '-',
}

export enum EnumAlcada {
  ALCADA_NAO_CALCULADA = "Não calculada",
  ALCADA_INDETERMNADA = "Indefinida",
  ALCADA_AGENCIA = "Alçada Agência",
  ALCADA_SUP = "Alçada Superior Regional",
  ALCADA_SN = "Alçada Acima Superior Regional",
  ALCADA_MATRIZ = "Alçada Matriz",
  ALCADA_CLIENTE = "Alçada Cliente"
}

export enum EnumNivelAlcada {
  ALCADA_INDETERMNADA = 0,
  NIVEL_ALCADA_AGENCIA = 1,
  NIVEL_ALCADA_SUP = 2,
  NIVEL_ALCADA_SN = 3,
  NIVEL_ALCADA_MATRIZ = 4,
  NIVEL_ALCADA_CLIENTE = 5,
}

export const mapaNiveisAlcada: Record<string, number> = {
  "Indefinida": 0,
  "Alçada Agência": EnumNivelAlcada.NIVEL_ALCADA_AGENCIA,
  "Alçada Superior Regional": EnumNivelAlcada.NIVEL_ALCADA_SUP,
  "Alçada Acima Superior Regional": EnumNivelAlcada.NIVEL_ALCADA_SN,
  "Alçada Matriz": EnumNivelAlcada.NIVEL_ALCADA_MATRIZ
};

export type VerticalPositionSnackbar = 'top' | 'bottom';
export type HorizontalPositionSnackbar = 'start' | 'center' | 'end' | 'left' | 'right';
export type DSCVariantComum = 'success' | 'danger' | 'warning' | 'info';

export interface Documentos {
  nome: string;
  tamanho: number;
}

export interface ResumoSimulacao {
  grupo: EnumLabelGruposMargemContribuicao;
  infoGrupo: EnumMensagemGrupo;
  tarifaPgCaixa: string;
  tarifaPgOutros: string;
  tarifaRetentativa: string;
  diasDegustacao: string;
  excecoes: ExcecoesSimulacaoDTO;
  agendamentosPorMes: number;
  ticketMedio: number;
  justificativa: string;
  documento: Documentos;
  labelBotaoConfirmar: string;
  ocorreuExcepcionalizacao: boolean;
  infoAlcadaAlert?: AlertInfoAlcadaModalResumoSimulacao;
}

export interface AlertInfoAlcadaModalResumoSimulacao {
  alcadaCalculada: string;
  varianteAlert: DSCVariantComum;
  mensagemAlert: string;
}
