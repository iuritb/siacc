import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Host, Preferences, Cliente, Simulacao, Campanha, Tarifa, TipoTarifaSimulador, Componente, SimulacaoDTO, ExcecoesSimulacaoDTO, JustificativaSimulacaoDTO, CondicaoSimulacaoDTO, TipoSimulacao, Contraproposta, Funcionalidade, TipoTarifa, EnumParametros, EnumRadioButtonTarifas, EnumTexto, EnumMensagemGrupo, VerticalPositionSnackbar, HorizontalPositionSnackbar, DSCVariantComum, EnumGruposMargemContribuicao, EnumNivelAlcada, EnumAlcada, mapaNiveisAlcada, EnumLabelGruposMargemContribuicao, ResumoSimulacao, AlertInfoAlcadaModalResumoSimulacao } from '../../interfaces';
import { environment } from '../../../environments/environment';
import { Option } from 'sidsc-components/dsc-select';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { mountRootParcel } from 'single-spa';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { versao } from '../../../version/version';
import { MensagemInconsistencia } from '../../shared/models';
import { DscSnackbarService } from 'sidsc-components/dsc-snackbar';
import { NgForm, NgModel } from '@angular/forms';
import { ResumoSimulacaoComponent } from '../../shared/modal/resumo-simulacao/resumo-simulacao.component';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { SimuladorService } from '../../services/simulador/simulador.service';
import { IndicadoresSimulacao, PreferenciaFiltro } from '../../shared/models/simulador.model';
import { DESCRICAO_INCLUIR_SIMULACAO, DESCRICAO_IR_PARA_CONTRATO, DESCRICAO_SOLICITAR_AUTORIZACAO } from '../../shared/constants/simulador.constants';
import { ClienteService } from '../../services/cliente/cliente.service';
import { EnumOrigemConsulta } from '../../shared/models/cliente.model';
import { CancelarGenericoComponent } from '../../shared/modal/cancelar-generico/cancelar-generico.component';
import { PARAMETROS_CANCELAR_SIMULACAO } from '../../shared/models/cancelar-generico.model';
import { DscAlertVariant } from 'sidsc-components/dsc-alert';
import { RESTRICOES_INDEFINIDAS } from '../../shared/constants/cliente.constants';
import { RestricoesCliente } from '../../shared/models/convenio/convenio.model';
import { CnpjValidatorService } from '../../services/validators/cnpj/cnpj-validator.service';



const SIM = "S";

const DATA_INCLUSAO = 0;
const DATA_APROVACAO = 1;

const INCLUIR = "INCLUIR";

const DATE_DMY = 0;
const DATE_YMD = 1;

const PREVISTO = 10;
const CONTRATADO = 9;
const VENCIDO = 15;
const REPROVADO = 7;
const CANCELADO = 6;
const CONTRAPRO = 5;
const APROVADO = 4;
const AVALIADO = 3;
const PENDENTE = 2;
const INCLUIDO = 1;

export interface PeriodicElementNovo {
  pagadorCaixa: string;
  outrosBancos: string;
  retentativa: string;
  degustacao: string;
}

const ELEMENT_DATA_SIMULACAO: PeriodicElementNovo[] = [
  {
    pagadorCaixa: '', outrosBancos: '', retentativa: '', degustacao: ''
  }
];

@Component({
  selector: 'app-root-simulador',
  templateUrl: './simulador.component.html',
  styleUrls: ['./simulador.component.scss']
})
export class SimuladorComponent implements OnInit {

  constructor(
    private changeDetector: ChangeDetectorRef,
    private modalService: NgbModal,
    private sanitizer: DomSanitizer,
    private router: Router,
    private _snackbarService: DscSnackbarService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private simuladorService: SimuladorService, // Chamadas externas para endpoints
    private clienteService: ClienteService // Processamento de dados do cliente
  ) { }

  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  @ViewChild(MatSort) sort: MatSort | any;
  @ViewChild('modalMessage') modalMessage: TemplateRef<any> | any;
  @ViewChild('modalConfirmInclusao') modalConfirmInclusao!: TemplateRef<any>;
  @ViewChild('modalInconsistencias') modalInconsistencias!: TemplateRef<any>;
  @ViewChild('modalInclusao') modalInclusao!: TemplateRef<any>;
  @ViewChild('pgCaixaInput') pgCaixaInput!: any;
  @ViewChild('pgOutrosInput') pgOutrosInput!: any;
  @ViewChild('pgRetentativaInput') pgRetentativaInput!: any;
  @ViewChild('pgDegustacaoInput') pgDegustacaoInput!: any;
  @ViewChild('formTarifa') formTarifa!: NgForm;
  @ViewChild('grupoTarifa') grupoTarifa!: NgModel;
  @ViewChild('loadingToast') loadingToast!: TemplateRef<any>;


  @Input() rows: number = 3;

  @Input()
  simuladorId: number | null = null;

  serviceTitle = "PIX-Automático";
  title = "Convênio";
  icon = "pix";

  readonly nivelAlcadaMatriz = EnumNivelAlcada.NIVEL_ALCADA_MATRIZ;
  readonly nivelAlcadaCliente = EnumNivelAlcada.NIVEL_ALCADA_CLIENTE;

  btnIsCancelandoSimulacao: boolean = false;

  ready: boolean = false;
  messageList: string[] | any = null;
  message: { title: string, description: string } | null = null;
  modalContent: any = null;
  irParaContrato: string = "off";

  btnIrParaContrato: boolean = true;
  btnIncluirSimulacao: boolean = false;
  labelBotaoIncluirSimulacao: string = "";
  controleIrParaConvenio: boolean = true;
  criouNovaSimulacao: string = "nao";
  criarSimulacaoSemIrParaConvenio: boolean = true;
  sppinerIsLoading: boolean = false;
  labelModalIncluir: string = "Incluir";
  alcadaCalculada: string = "";
  termoDigitado: string = "";

  host: Host | any = environment.host;
  backendUrl = environment.backendSimuladorUrl;
  mfeVersao = versao.simulador;
  favorite: boolean = false;
  preferences: Preferences | any = {
    favoritos: true,
    acessoRapido: true,
    sugestoesIA: true,
    pageSize: 5
  };

  funcionalidades: Funcionalidade[] | null = null;

  preferenciasFiltro: PreferenciaFiltro[] = [];

  alterarEnabled: boolean = false;

  alcadaAtual: number | any = null;
  nomeAlcadaAtual: string | any = null;

  mountRootParcel = mountRootParcel;
  parcelProps: any = null;
  maxPageSize: number = 20;
  mensageminibirRetentativa: string | any = null;
  mensageminibirOpenFinance: string | any = null;
  termoCampoConsulta: string | null = null;
  pesquisar: boolean = true;
  incluir: boolean = false;
  excluir: boolean = false;
  alterar: boolean = false;
  detalhar: boolean = false;
  avaliar: boolean = false;
  avaliacao: any = null;
  avaliacaoJustificativa: any = null;
  avaliacaoDocumento: any = null;
  contraproposta: Contraproposta | any = null;
  proposta: Contraproposta | any = null;
  novaproposta: Contraproposta | any = null;
  mostrarTable: boolean = false;
  procurarCNPJ: boolean = true;
  mostrarCNPJ: boolean = false;
  // mostrarPesquisa: boolean = true;
  parametrosContratuais: boolean = false;
  mostrarTarifa: boolean = false;
  dataSelecionadaDe: any = null;
  mensagem: string | any = null;
  pagadorCaixa: string | any = null;
  outrosBancos: string | any = null;
  retentativa: string | any = null;
  degustacao: string | any = null;
  simulacaocancelada: boolean = false;
  contadebito: string | any = null;
  inibirRetentativa: string | any = null;
  inibirOpenFinance: string | any = null;
  minutaContratualSimulacao: string | any = null;
  minutaEditalSimulacao: string | any = null;
  outrosSimulacao: string | any = null;
  outrosSimulacaoDescricao: string | any = null;
  textoOutroSimulacao: string | any = null;
  recarregarConsulta: boolean = false;

  idSimulacao: number | any = null;
  numeroSimulacao: string | any = null;
  numeroSimulacaoOriginal: string | any = null;
  pareceres: any[] = [];
  lastParecer: any = null;
  descSituacao: string | any = null;
  migracaoConvenio: string | any = null;
  vticketMedio: string | any = null;
  agendamentoMes: string | any = null;
  unidadeSimulacao: string | any = null;
  justificativaInclusao: string | any = null;
  nomeUnidade: string | any = null;
  datainclusaoSimulacao: string | any = null;
  grupoMargemContribuicaoDoDetalhamento: EnumGruposMargemContribuicao = EnumGruposMargemContribuicao.INVALIDO;
  labelGrupoMargemContribuicaoDoDetalhamento: EnumLabelGruposMargemContribuicao = EnumLabelGruposMargemContribuicao.INVALIDO;
  responsavel: string | any = null;
  descricaoSimulacao: string | any = null;
  cliente: Cliente | null = null;
  simulacao: Simulacao | any = null;
  tarifaSelected: string | any = null;
  alcadaTarifaDiferenciada: EnumAlcada = EnumAlcada.ALCADA_NAO_CALCULADA;
  nivelAlcadaTarifaDiferenciada: EnumNivelAlcada = EnumNivelAlcada.ALCADA_INDETERMNADA;
  lastNivelAlcadaTarifaDiferenciada: any = null;
  valoresTarifaDiferenciadaSelecionada!: Tarifa;
  isButtonDisabled: boolean = false;
  parametros: any = null;
  documentos: any[] | any = null;
  restricoesPai: RestricoesCliente = RESTRICOES_INDEFINIDAS;

  filtrarTarifas: boolean = true;

  simulacaoAnalisavel: boolean = false;
  simulacaoAvaliavel: boolean = false;
  simulacaoCancelavel: boolean = false;

  nivelAlcadaAtual: EnumNivelAlcada = EnumNivelAlcada.ALCADA_INDETERMNADA;
  nivelAlcadaReal: number = 0;
  nivelAlcadaCriadora: number = 0;
  inconsistencias: string[] = [];
  mensagensInconsistenciasCliente: MensagemInconsistencia | null = null;

  filtro = {
    id: null,
    cnpj: null,
    unidade: null,
    data: null,
    dataDe: null,
    dataAte: null,
    razaoSocial: null,
    nomeFantasia: null,
    alcada: null,
    situacao: null,
    conta: null
  };

  pageSizeOptions = [5, 10, 20, 30];

  EXIBICAO_INICIAL = ['id', 'cnpj', 'tiposituacao', 'unidade', 'dataInclusao', 'alcadas', 'statussituacao', 'comandos'];

  dataSourceSimulacao = new MatTableDataSource<PeriodicElementNovo>(ELEMENT_DATA_SIMULACAO);

  displayedColumns = ['tarifaPgCaixa', 'tarifaPgOutros', 'tarifaRetentativa', 'tarifaDegustacao'];

  opcoesExibicao: string[] | any = null;

  detalhamento: boolean = true;
  excecaoSelecionada: boolean = false;
  controlaAberturaDoCardExcecoes: boolean = false;
  tarifaCustomizadaSelecionada: boolean = false;

  campanhaColumns: string[] = ['campanhaNome', 'campanhaPeriodo', 'campanhaConcessao', 'campanhaPublicoAlvo', 'campanhaDescricao'];
  colunasConsultaPadrao: string[] = ['id', 'tiposituacao', 'unidade', 'dataInclusao', 'etapa1', 'etapa2', 'etapa3', 'etapa4', 'etapa5', 'statussituacao', 'comandos'];

  tarifasColumns: string[] = ['tarifaCondicao', 'tarifaPgCaixa', 'tarifaPgOutros', 'tarifaRetentativa', 'tarifaDegustacao', 'tarifaSituacao', 'preferencias'];
  tarifasContrapropostaColumns: string[] = ['tarifaPgCaixa', 'tarifaPgOutros', 'tarifaRetentativa', 'tarifaDegustacao'];

  tiposSituacao: any[] = [];
  listaTiposSituacao: Option[] = [];

  etapaStyles: any[] = [
    { id: INCLUIDO, icon: "edit", background: "progress-success" },
    { id: APROVADO, icon: "thumb_up", background: "progress-success" },
    //{id: AVALIADO, icon: "done", background: "progress-success"},
    { id: AVALIADO, icon: "thumb_up", background: "progress-success" },
    { id: CONTRATADO, icon: "handshake", background: "progress-success" },
    { id: CONTRAPRO, icon: "swap_horiz", background: "progress-orange" },
    { id: REPROVADO, icon: "close", background: "progress-error" },
    { id: CANCELADO, icon: "delete_forever", background: "progress-error" },
    { id: PENDENTE, icon: "priority_high", background: "progress-warning" },
    { id: VENCIDO, icon: "watch_off", background: "progress-error" },
    { id: PREVISTO, icon: "schedule", background: "" },
    // {id: PREVISTO, icon: "", background: ""},
  ]

  readonly HIFEN = EnumTexto.HIFEN;
  readonly SIMULACOES_REALIZADAS = EnumRadioButtonTarifas.SIMULACOES_REALIZADAS;
  readonly PLEITEAR_CONDICOES = EnumRadioButtonTarifas.PLEITEAR_CONDICOES;
  radioButtonTarifas: string = EnumRadioButtonTarifas.SIMULACOES_REALIZADAS;
  erroCalculoAlcada: boolean = false
  variantAlertResultadoCalculoAlcada: DSCVariantComum = 'info'
  mensagemAlertResultadoCalculoAlcada: string = ''
  tituloAlertResultadoCalculoAlcada: string = ''
  btnIsCalculando: boolean = false;
  controlaAberturaDoCardTarifas: boolean = true;
  grupoMCSelecionadoAtual: EnumGruposMargemContribuicao = EnumGruposMargemContribuicao.INVALIDO;
  grupoMCSelecionadoNoCalculo: EnumGruposMargemContribuicao = EnumGruposMargemContribuicao.INVALIDO;
  mensagemSnackBarLoading: string = 'Carregando os dados...';

  readonly descricaoIncluirSimulacao: string = DESCRICAO_INCLUIR_SIMULACAO;
  readonly descricaoSolicitarAutorizacao: string = DESCRICAO_SOLICITAR_AUTORIZACAO;
  readonly descricaoIrParaContrato: string = DESCRICAO_IR_PARA_CONTRATO;


  definirMensagemGrupoPertencimento(): string {
    return EnumMensagemGrupo[this.grupoMCSelecionadoAtual as keyof typeof EnumMensagemGrupo] || '';
  }

  tarifaDiferenciadaDaListaDeTarifas: Tarifa = {} as Tarifa;

  openSnackbar(
    verticalPosition: VerticalPositionSnackbar,
    horizontalPosition: HorizontalPositionSnackbar,
    variant: DSCVariantComum,
    mensagem: string
  ): void {
    this._snackbarService.add({
      verticalPosition: verticalPosition,
      horizontalPosition: horizontalPosition,
      data: {
        variant: variant,
        message: mensagem
      }
    });
  }

  deveMostrarAlertResultadoAlcada(): boolean {
    return this.alcadaTarifaDiferenciada != EnumAlcada.ALCADA_NAO_CALCULADA;
  }

  private configurarAlertDeExcecoes(): void {
    if (this.nivelAlcadaAtual == EnumNivelAlcada.NIVEL_ALCADA_MATRIZ) {
      this.variantAlertResultadoCalculoAlcada = 'success';
      this.mensagemAlertResultadoCalculoAlcada = 'Para essas condições a simulação está pré-aprovada!';
    } else {
      this.tituloAlertResultadoCalculoAlcada = 'Alçada calculada: Alçada Matriz';
      this.variantAlertResultadoCalculoAlcada = 'warning';
      this.mensagemAlertResultadoCalculoAlcada = 'Houve excepcionalização, será necessário análise pela Matriz.';
    }
  }

  private configurarAlertResultadoAlcada(): void {
    if (this.radioButtonTarifas == this.SIMULACOES_REALIZADAS) return;

    this.tituloAlertResultadoCalculoAlcada = `Alçada calculada: ${this.alcadaTarifaDiferenciada}`;

    if (this.erroCalculoAlcada) {
      this.variantAlertResultadoCalculoAlcada = 'danger';
      this.mensagemAlertResultadoCalculoAlcada = 'Não foi possível realizar o cálculo da alçada. Tente novamente!';
    } else if (this.verificarSeHaExcecaoMarcada()) {
      this.configurarAlertDeExcecoes();
    } else if (this.nivelAlcadaAtual >= this.nivelAlcadaTarifaDiferenciada) {
      this.variantAlertResultadoCalculoAlcada = 'success';
      this.mensagemAlertResultadoCalculoAlcada = 'Para essas condições a simulação está pré-aprovada!';
    } else if (this.nivelAlcadaAtual < this.nivelAlcadaTarifaDiferenciada) {
      this.variantAlertResultadoCalculoAlcada = 'warning';
      this.mensagemAlertResultadoCalculoAlcada = 'Para essas condições, será necessária aprovação de alçadas superiores.';
    } else {
      this.variantAlertResultadoCalculoAlcada = 'warning';
      this.mensagemAlertResultadoCalculoAlcada = 'Preencha os campos e calcule a alçada.';
    }
  }

  definirtextoTooltipCalcular(): string {
    return this.btnIsCalculando || !this.podeClicarBtnCalcularAlcada()
      ? 'O formulário está inválido.'
      : 'Calcular alçada com os valores inseridos.';
  }

  pegarTarifaDiferenciadaDaListaDeTarifas(): void {
    const tarifaTipo4 = this.tarifas.find(tarifa => tarifa.tipo === 4);

    if (tarifaTipo4) {
      this.tarifaDiferenciadaDaListaDeTarifas = tarifaTipo4;
    } else {
      this.openSnackbar('bottom', 'center', 'danger', "Erro ao tentar pleitear condições diferenciais. Tente novamente mais tarde.")
    }
  }

  onRadioTarifasChange(valorSelecionado: string): void {
    if (valorSelecionado === this.PLEITEAR_CONDICOES) {
      this.cdr.detectChanges();
      this.pegarTarifaDiferenciadaDaListaDeTarifas()
    }
  }

  onExcepcionalizarExcecao(): void {
    if (!this.excecaoSelecionada) {
      this.simulacao.excecoes.contaDebitoDiferente = false;
      this.simulacao.excecoes.inibirRetentativa = false;
      this.simulacao.excecoes.minutaContratualForaPadrao = false;
      this.simulacao.excecoes.minutaEditalCredenciamento = false;
      this.simulacao.excecoes.outro = false;
      this.simulacao.excecoes.textoOutro = "";
      this.controlaAberturaDoCardExcecoes = false;
    } else {
      this.controlaAberturaDoCardExcecoes = true;
    }
  }

  onClickEmQualquerExcecao(): void {
    if (this.isValidaAlcadaCalculada()) {
      this.configurarAlertResultadoAlcada();
    }
  }

  obterLabelGrupo(grupo: EnumGruposMargemContribuicao | undefined): string {
    if (grupo) {
      return EnumLabelGruposMargemContribuicao[grupo] ?? EnumLabelGruposMargemContribuicao.INVALIDO;
    }
    return EnumTexto.HIFEN;
  }

  opcoesGrupoTarifas: Option[] = [
    { value: EnumGruposMargemContribuicao.GRUPO_1, label: EnumLabelGruposMargemContribuicao.GRUPO_1 },
    { value: EnumGruposMargemContribuicao.GRUPO_2, label: EnumLabelGruposMargemContribuicao.GRUPO_2 },
    { value: EnumGruposMargemContribuicao.GRUPO_3, label: EnumLabelGruposMargemContribuicao.GRUPO_3 },
    { value: EnumGruposMargemContribuicao.GRUPO_4, label: EnumLabelGruposMargemContribuicao.GRUPO_4 },
    { value: EnumGruposMargemContribuicao.GRUPO_5, label: EnumLabelGruposMargemContribuicao.GRUPO_5 },
  ]

  tarifas: Tarifa[] = [];
  tarifaContraProposta: Tarifa[] = [];
  dataSource: any = null;


  // obter dinamicamente via API de campanhas
  campanhas: Campanha[] = [];
  public enumParametros = EnumParametros;
  cnpjOrigemConvenio: string | null = "";

  ngOnInit(): void {
    this.initialize();
    this.funcionalidades = this.obterPermissao();
    this.userAction("responda sempre de forma breve e direta");
    this.parametrosSimulacao();
    this.processFavorites();
    this.processPreferences();
    this.processFilterPreferences();
    this.carregarTiposSimulacao();
    this.carregarCampanhas();
    this.parcelProps = this.getParcelProps();
    if (this.simuladorId != null) {
      this.detalharSimulacao(null, this.simuladorId, true);
    }
    this.trataSolicitarCondicoesDiferenciadas();
  }

  trataSolicitarCondicoesDiferenciadas() {
    this.cnpjOrigemConvenio = sessionStorage.getItem('cnpjOrigemConvenio');
    if (!this.cnpjOrigemConvenio) return;
    this.consultar();
    sessionStorage.removeItem('cnpjOrigemConvenio');
  }

  ngDoCheck(): void {
    this.controlarBotoesTelaInclusaoSimulacao();
    if (this.inconsistencias.length > 0) {
      const mensagemImpedimento = this.inconsistencias.length == 1 ? "Existe impedimento para inclusão de convênio." : "Existem impedimentos para inclusão de convênio."
      this.atualizarInconsistenciasCliente(mensagemImpedimento, this.inconsistencias)
    }
  }

  public get TipoTarifaSimulador(): typeof TipoTarifaSimulador {
    return TipoTarifaSimulador;
  }

  public get EnumOrigemConsulta(): typeof EnumOrigemConsulta {
    return EnumOrigemConsulta;
  }

  initialize() {
    if (this.host && this.host.aplicacao) {
      if (this.host.aplicacao.icone) this.icon = this.host.aplicacao.icone;
      if (this.host.aplicacao.nome) this.title = this.host.aplicacao.nome;
    }
    if (this.host && this.host.servico) {
      if (this.host.servico.nome) this.serviceTitle = this.host.servico.nome;
    }
  }

  obterPermissao(): Funcionalidade[] | null {
    if (this.host == null || this.host.aplicacao == null || this.host.aplicacao.funcionalidades == null) {
      return null;
    }

    let result: Funcionalidade[] = this.host.aplicacao.funcionalidades;

    return result;
  }

  verificarFuncionalidade(acesso: string) {

    if (this.funcionalidades != null) {
      for (let funcionalidade of this.funcionalidades) {
        if (funcionalidade.id.toUpperCase() == acesso) return true;
      }
    }

    return false;
  }

  async ngconfig() {
    let host: Host | any = environment.host;
    if (host == null) return null;
    let componentes: Componente[] | any = host.componentes;
    if (componentes == null) return null;

    let componente: Componente | any = null;
    for (let current of componentes) {
      if (current.id == "parcel-sugest") {
        componente = current;
        break;
      }
    }
    if (componente == null) return null;

    return (window as any).System.import(componente.origem);
  }

  sanitize(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);  // NOSONAR
  }

  obterTextoAbertura(): SafeHtml | any {
    return this.sanitize(this.obterParametro(this.enumParametros.TEXTO_TEXTOS_ABERTURA_SIMULACAO));
  }

  getSituacaoById(id: number) {
    for (let item of this.listaTiposSituacao) {
      if (item.value == id) return item.label
    }
    return "desconhecida: " + id;
  }

  getComponente(id: string): Componente | null {
    if (this.host == null) return null;

    let componentes = this.host.componentes;
    if (componentes == null) return null;

    for (let componente of componentes) {
      if (componente.id == id) return componente;
    }
    return null;
  }

  getParcelProps() {
    let componente: Componente | null = this.getComponente("parcel-sugest");
    if (componente == null) return null;

    return { host: { caminho: componente.caminho, contexto: this.host.contexto } };
  }

  obterResponsavelIncluisao(simulacao: any) {
    for (let item of simulacao.simulacoesAlcada) {
      if (item.alcada && item.alcada.id == INCLUIDO) {
        return item.coUsuarioAlcada;
      }
    }

    for (let item of simulacao.simulacoesAlcada) {
      if (item.alcada && item.alcada.id == APROVADO) {
        return item.coUsuarioAlcada;
      }
    }

  }

  obterJustificativaInclusao(simulacoes: any) {
    if (!simulacoes) return null;

    for (const simulacao of simulacoes) {
      if (simulacao.tipoSituacao && simulacao.tipoSituacao.id === 1) {
        return simulacao.parecer;
      }
    }

    return null;
  }

  preencheDadosInclusao(dados: any) {

    this.datainclusaoSimulacao = this.formatDate(this.getDate(dados.dataInclusao));
    this.responsavel = dados.responsavel;
    this.justificativaInclusao = dados.justificativa;
  }

  simulacoesItemParaContraProposta(simulacoesItem: any[]): any {

    if (simulacoesItem == null) return null;

    let result: any = {};

    for (let item of simulacoesItem) {
      switch (item.itemSimulacao.id) {
        case 11:
          result.contadebito = item.itemSimulacao.nomeItemSimulacao;
          break;
        case 12:
          result.inibirRetentativa = item.itemSimulacao.nomeItemSimulacao;
          break;
        case 13:
          result.inibirOpenFinance = item.itemSimulacao.nomeItemSimulacao;
          break;
        case 14:
          result.minutaContratualSimulacao = item.itemSimulacao.nomeItemSimulacao;
          break;
        case 15:
          result.outrosSimulacao = item.itemSimulacao.nomeItemSimulacao;
          result.outrosSimulacaoDescricao = item.descricaoSimulacaoItem;
          break;
        case 16:
          result.minutaEditalSimulacao = item.itemSimulacao.nomeItemSimulacao;
          break;
        case 21:
          result.pagadorCaixa = item.valorSimulacaoItem;
          break;
        case 22:
          result.outrosBancos = item.valorSimulacaoItem;
          break;
        case 23:
          result.retentativa = item.valorSimulacaoItem;
          break;
        case 24:
          result.degustacao = item.qtdSimulacaoItem;
          break;
        case 25:
          result.pagadorCaixa = item.valorSimulacaoItem;
          break;
        case 26:
          result.outrosBancos = item.valorSimulacaoItem;
          break;
        case 27:
          result.retentativa = item.valorSimulacaoItem;
          break;
        case 28:
          result.degustacao = item.qtdSimulacaoItem;
          break;
        case 29:
          result.migracaoConvenio = item.descricaoSimulacaoItem;
          break;
      }
    }

    return result;
  }

  preencherparamContratuais(simulacao: any) {

    if (simulacao.simulacaoOriginal == null) {
      this.proposta = this.simulacoesItemParaContraProposta(simulacao.simulacoesItem);
      this.novaproposta = null;
    } else {
      this.proposta = this.simulacoesItemParaContraProposta(simulacao.simulacaoOriginal.simulacoesItem);
      this.novaproposta = this.simulacoesItemParaContraProposta(simulacao.simulacoesItem);
    }


  }

  processarCancelamentoInclusao(modal: any) {
    this.modalService.open(modal, { size: 'lg', scrollable: false, windowClass: 'my-class' });
    return true;
  }

  solicitarCancelamento() {
    if (!this.simulacaoCancelavel) return;
    const modalRef: NgbModalRef = this.modalService.open(CancelarGenericoComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.parametros = PARAMETROS_CANCELAR_SIMULACAO;
    modalRef.componentInstance.parametros.numero = this.numeroSimulacao;

    modalRef.componentInstance.sucessoCancelamento.subscribe((resultado: DscAlertVariant) => {
      if (resultado === 'success') {
        this.voltar(false, true);
      }
    })

    return true;

  }

  processConta(contadebito: any): string {

    let mensagem = '';
    if (contadebito != null) {
      mensagem = contadebito;
    }

    return mensagem;

  }
  processInibir(inibirRetentativa: any): string {

    let mensagem = '';
    if (inibirRetentativa != null) {
      mensagem = inibirRetentativa;
    }

    return mensagem;

  }

  verificaSimulacao(simulacao: any) {

    let descricao = simulacao.situacao;
    for (let current of simulacao.simulacoesAlcada) {
      for (let current2 of current.simulacoesAlcada) {
        if (current2.tipoSituacao.nomeSituacao == "Cancelada") {
          simulacao.situacao = "Cancelada";
          descricao = "Cancelada";
          break;
        }
      }

    }
    return descricao;
  }

  verificaSituacao() {
    return this.simulacaocancelada;
  }

  processOpen(inibirOpenFinance: any): string {

    let mensagem = '';
    if (inibirOpenFinance != null) {
      mensagem = inibirOpenFinance;
    }

    return mensagem;

  }
  procesMinuta(minutaSimulacao: any): string {

    let mensagem = '';
    if (minutaSimulacao != null) {
      mensagem = minutaSimulacao;
    }

    return mensagem;

  }
  procesOutros(outrosSimulacao: any): string {

    let mensagem = '';
    if (outrosSimulacao != null) {
      mensagem = outrosSimulacao;
    }

    return mensagem;

  }

  parametrosSimulacao() {
    let url = this.backendUrl + "/parametros/";

    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response) => {
        this.parametros = response;
        this.alcadaAtual = this.obterNivelAlcada(); // Esta variável não é alterada durante a execução do código e marca o nível da alçada do usuário logado
        this.nomeAlcadaAtual = this.obterNomeAlcada();
      })
      .catch(error => {
        console.error("Erro em chamada para OBTER parametros (endpoint /parametros)", error);
      }).finally(() => {
      });

  }

  obterParametro(nome: string): any {
    if (this.parametros == null) {
      return null;
    }
    return this.parametros[nome];
  }

  buscConsultaAPI() {
    let url = this.backendUrl + "/detalhamento/" + this.numeroSimulacao;

    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response) => {
        this.simulacao = response;
      });
  }
  ordenarPorTsAlcadaCrescente(alcadas: any[]): any[] {
    return [...alcadas].sort((a, b) => this.reduceDate(a.tsAlcada) < this.reduceDate(b.tsAlcada) ? -1 : 1);
  }
  ordenarPorTsAlcadaDecrescente(alcadas: any[]): any[] {
    return [...alcadas].sort((a, b) => this.reduceDate(b.tsAlcada) < this.reduceDate(a.tsAlcada) ? -1 : 1);
  }

  obterAlcadaAtual(alcadas: any[]) {
    if (alcadas != null && alcadas.length > 0) {
      for (let alcada of alcadas) {
        if (alcada.tipoSituacao.id == CANCELADO) return alcada;
      }
      for (let alcada of alcadas) {
        if (alcada.tipoSituacao.id == PENDENTE) return alcada;
      }
      let alcadasList: any[] = this.ordenarPorTsAlcadaDecrescente(alcadas);
      return alcadasList[0];
    }
    return null;
  }

  obterNivelAlcada() {
    let alcada = this.obterParametro("NIVEL_ALCADA");
    if (alcada != null) {
      return alcada;
    } else {
      return 0;
    }
  }

  obterNomeAlcada() {
    let alcada = this.obterParametro("NOME_ALCADA");
    if (alcada != null) {
      return alcada;
    } else {
      return 0;
    }
  }

  obterNivelAcadaCriadora(alcadas: any[]) {
    if (alcadas != null && alcadas.length > 0) {
      for (let alcada of alcadas) {
        if (alcada.tipoSituacao.id == INCLUIDO) return alcada.alcada.nivel;
      }
    }

    let alcadasList: any[] = this.ordenarPorTsAlcadaCrescente(alcadas);
    return alcadasList[0].alcada.nivel;
  }

  getSituacaoSimulacao(alcadas: any[]) {
    let result: any[] = [];
    for (let alcada of alcadas) {
      if (alcada.tipoSituacao.id != PREVISTO) result.push(alcada);
    }
    let alcadasList: any[] = this.ordenarPorTsAlcadaDecrescente(result);
    return alcadasList[0];
  }

  reduceDate(date: string): string {
    return date.replace(/[^\d]/g, '');
  }

  verificaSimulacaoEvolutiva(simulacoes: any) {
    let alcadaAtual = this.obterAlcadaAtual(simulacoes.simulacoesAlcada);
    let alcadaLogada = this.obterParametro("NIVEL_ALCADA");

    let tokenParsed = sessionStorage.getItem('tokenParsed');
    let jsonTokenParsed = tokenParsed != null ? JSON.parse(tokenParsed) : null;
    let nuLotacaoFisica = jsonTokenParsed['nu-lotacaofisica'];

    this.nivelAlcadaReal = alcadaAtual.alcada.nivel;

    this.nivelAlcadaCriadora = this.obterNivelAcadaCriadora(simulacoes.simulacoesAlcada);

    if (this.nivelAlcadaReal == EnumNivelAlcada.NIVEL_ALCADA_CLIENTE) {
      this.nivelAlcadaAtual = this.nivelAlcadaCriadora;
    } else {
      this.nivelAlcadaAtual = this.nivelAlcadaReal;
    }

    let situacaoAtual: any = this.getSituacaoSimulacao(simulacoes.simulacoesAlcada);

    if (alcadaAtual != null && this.nivelAlcadaAtual == alcadaLogada && situacaoAtual.tipoSituacao.id == PENDENTE && this.nivelAlcadaReal == EnumNivelAlcada.NIVEL_ALCADA_CLIENTE) {
      this.simulacaoAnalisavel = true;
    } else {
      this.simulacaoAnalisavel = false;
    }

    if (alcadaAtual != null && this.nivelAlcadaAtual == alcadaLogada && situacaoAtual.tipoSituacao.id == PENDENTE && this.nivelAlcadaReal != EnumNivelAlcada.NIVEL_ALCADA_CLIENTE && situacaoAtual.unidadeAlcada == nuLotacaoFisica) {
      this.simulacaoAvaliavel = true;
    } else {
      this.simulacaoAvaliavel = false;
    }
  }

  private verificarSimulacaoCancelavel(indicadoresSimulacao: IndicadoresSimulacao): boolean {
    return Object.values(indicadoresSimulacao).every(valor => !!valor === false)
  }

  detalharSimulacao(event: any, simulacaoId: number, recarregarConsulta: boolean = false) {
    this.recarregarConsulta = recarregarConsulta;

    if (event) event.preventDefault();
    let url = this.backendUrl + "/detalhamento/" + simulacaoId;

    this.numeroSimulacao = simulacaoId;
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response) => {

        this.scrollTop();

        this.grupoMargemContribuicaoDoDetalhamento = response.grupoMargemContribuicao;
        this.labelGrupoMargemContribuicaoDoDetalhamento = EnumLabelGruposMargemContribuicao[response.grupoMargemContribuicao as keyof typeof EnumLabelGruposMargemContribuicao] ?? EnumLabelGruposMargemContribuicao.INVALIDO;

        let simulacoes: any = response.simulacoesAlcada[0];
        let dadosInclusaoSimulacao: any = response.dadosInclusao;

        this.verificaSimulacaoEvolutiva(simulacoes);
        this.simulacaoCancelavel = this.verificarSimulacaoCancelavel(response.indicadoresSimulacao);

        this.idSimulacao = response.numeroSimulacao;
        this.numeroSimulacao = this.padNumber(response.numeroSimulacao, 6);
        this.numeroSimulacaoOriginal = response.numeroSimulacaoOriginal ? this.padNumber(response.numeroSimulacaoOriginal, 6) : null;
        this.nomeUnidade = response.nomeUnidade;
        this.vticketMedio = simulacoes.valor_medio_transacao;
        this.agendamentoMes = response.estimativaMensal;
        this.unidadeSimulacao = simulacoes.unidade_relacionamento;
        const alcadaAtual = this.obterAlcadaAtual(simulacoes.simulacoesAlcada);
        this.descSituacao = alcadaAtual.tipoSituacao.nomeSituacao;

        if (response && response.mensagem) {
          this.showMessage(response.mensagem, response.descricao);
          return;
        }

        this.preencheDadosInclusao(dadosInclusaoSimulacao);

        this.preencherparamContratuais(simulacoes);

        this.pareceres = this.processarPareceres(simulacoes.simulacoesAlcada);
        this.lastParecer = this.getLastParecer(this.pareceres);
        this.parametrosContratuais = true;
        this.mostrarTable = true;

        this.documentos = this.processarDocumento(simulacoes.simulacoesAlcada, INCLUIDO);

        this.pesquisar = false;
        this.detalhar = true;
        this.avaliar = false;
        this.contraproposta = null;
        this.alterar = false;
        this.incluir = false;
      })
      .catch(error => {
        console.error(error);
        this.showMessage("Ocorreu um erro ao efetuar a busca solicitada", "Por favor tente novamente em alguns instantes");
      });
  }

  getLastParecer(pareceres: any[]) {
    if (pareceres == null || pareceres.length == 0) return null;
    return pareceres[pareceres.length - 1];
  }

  processarPareceres(pareceres: any[]): any[] {
    for (let parecer of pareceres) {
      if (parecer && parecer.tipoSituacao.id == CANCELADO) {
        return [parecer];
      }
    }

    pareceres = pareceres.sort((a, b) => this.reduceDate(a.tsAlcada) < this.reduceDate(b.tsAlcada) ? -1 : 1);
    return pareceres;

  }

  processaIconeParecer(parecer: any) {
    if (parecer == null || parecer.tipoSituacao == null) {
      return "";
    } else if (parecer.tipoSituacao.id == 1) { //Incluida
      return "edit";
    } else if (parecer.tipoSituacao.id == 2) { //Pendente
      return "priority_high";
    } else if (parecer.tipoSituacao.id == 3) { //Avaliada
      return "done";
    } else if (parecer.tipoSituacao.id == 4) { //Aprovada
      return "thumb_up";
    } else if (parecer.tipoSituacao.id == 5) { //contra-proposta
      return "swap_horiz";
    } else if (parecer.tipoSituacao.id == 6) { //cancelada
      return "delete_forever";
    } else if (parecer.tipoSituacao.id == 7) { //reprovada
      return "close";
    } else if (parecer.tipoSituacao.id == 8) { //vencida
      return "clcalendar_clockose";
    } else if (parecer.tipoSituacao.id == 9) { //contratada
      return "handshake";
    } else if (parecer.tipoSituacao.id == 10) { //prevista
      return "schedule";
    } else {
      return "";
    }
  }

  processaColorParecer(parecer: any) {
    if (parecer == null || parecer.tipoSituacao == null) {
      return "";
    } else if (parecer.tipoSituacao.id == 1) { //Incluida
      return "icon-success";
    } else if (parecer.tipoSituacao.id == 2) { //Pendente
      return "icon-warning";
    } else if (parecer.tipoSituacao.id == 3) { //Avaliada
      return "icon-success";
    } else if (parecer.tipoSituacao.id == 4) { //Aprovada
      return "icon-success";
    } else if (parecer.tipoSituacao.id == 5) { //contra-proposta
      return "icon-orange";
    } else if (parecer.tipoSituacao.id == 6) { //cancelada
      return "icon-error";
    } else if (parecer.tipoSituacao.id == 7) { //reprovada
      return "icon-error";
    } else if (parecer.tipoSituacao.id == 8) { //vencida
      return "icon-error";
    } else if (parecer.tipoSituacao.id == 9) { //contratada
      return "icon-success";
    } else if (parecer.tipoSituacao.id == 10) { //prevista
      return "icon-gray";
    } else {
      return ""
    }
  }

  scrollTop() {
    setTimeout(function () {
      const element = document.getElementById('main-body');
      if (element) element.scrollTo(0, 0)
    }, 0);
    return true;
  }

  scrollDown(idElemento: string) {
    setTimeout(function () {
      const element = document.getElementById(idElemento);
      if (element) element.scrollTop = element.scrollHeight;
    }, 0);
    return true;
  }

  voltar(fecharTodosOsModais: boolean = false, refazerFetch: boolean = false) {

    if (fecharTodosOsModais) {
      this.modalService.dismissAll();
    }

    if (this.simulacao == null) {
      this.pesquisar = true;
      this.detalhar = false;
      this.avaliar = false;
      this.contraproposta = null;
      this.alterar = false;
      this.incluir = false;

      this.changeDetector.detectChanges();
      if (this.cliente) this.dataSource = new MatTableDataSource<any>(this.cliente.simulacoes);
      if (this.paginator) this.dataSource.paginator = this.paginator;
      if (this.sort) this.dataSource.sort = this.sort;

    } else {
      this.pesquisar = false;
      this.detalhar = false;
      this.avaliar = false;
      this.contraproposta = null;
      this.alterar = false;
      this.incluir = true;
    }

    if (this.recarregarConsulta) {
      this.consultar();
    }

    this.scrollTop();
    if (refazerFetch) this.consultar();
  }

  carregarTiposSimulacao() {

    let url = this.backendUrl + "/situacao";
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response) => {

        if (response && response.mensagem) {
          this.showMessage("Não foi possível inicializar esta aplicação", response.mensagem);
          return;
        }

        this.tiposSituacao = response;

        this.processaTiposSimulacao(this.tiposSituacao);
      })
      .catch(error => {
        this.showMessage("Ocorreu um erro ao inicializar esta aplicação", "Por favor tente novamente em alguns instantes");
        console.error(error);
      });

  }

  carregarTarifas(cnpj: string | any) {

    let url = this.backendUrl + "/tarifa?cnpj=" + cnpj;
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response) => {

        if (response && response.mensagem) {
          this.showMessage("Não foi possível inicializar esta aplicação", response.mensagem);
          return;
        }


        if (response && response.length > 0) {
          this.processaTarifasSimulacao(response);
        }

      })
      .catch(error => {
        this.showMessage("Ocorreu um erro ao inicializar esta aplicação", "Por favor tente novamente em alguns instantes");
        console.error(error);
      });

  }

  carregarCampanhas() {

    let url = this.backendUrl + "/campanha";
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response) => {

        if (response && response.length > 0) {
          this.campanhas = response;

        } else {
          this.showMessage("Não foi possível obter lista de campanhas", "Por favor tente novamente em alguns instantes");
          console.error("Falha ao obter lista de campanhas", response);
        }

      })
      .catch(error => {
        this.showMessage("Ocorreu um erro ao inicializar esta aplicação", "Por favor tente novamente em alguns instantes");
        console.error(error);
      });
  }

  processaTiposSimulacao(tiposSimulacao: TipoSimulacao[] | null) {
    let result: Option[] = [];
    if (tiposSimulacao == null) return;

    for (let item of tiposSimulacao) {

      if (item.flagSituacaoAtiva == null || item.flagSituacaoAtiva != SIM)
        continue;

      let tipo: Option = {
        value: item.id, label: item.nomeSituacao
      }
      result.push(tipo);
    }

    this.listaTiposSituacao = result;
    this.ready = true;

  }

  processaTarifasSimulacao(tarifas: any[]) {
    this.tarifas = [];

    for (let tarifa of tarifas) {
      let item: Tarifa = {
        tipo: tarifa.tipo,
        id: tarifa.id,
        condicao: tarifa.nome,
        pgCaixa: tarifa.tarifaPagadoresCaixa,
        pgOutros: tarifa.tarifaPagadoresOutras,
        retentativa: tarifa.tarifaRetentativa,
        degustacao: tarifa.diasDegustacao,
        situacao: "Aprovado",
        recomended: false,
        custom: false,
        referencia: false,
        visible: true,
        grupoMargemContribuicao: tarifa?.grupoMargemContribuicao
      }

      if (item.tipo == TipoTarifaSimulador.BALCAO) {
        item.recomended = true;
      }

      this.tarifas.push(item);
    }

    let tarifaCustomizada = { tipo: TipoTarifaSimulador.DIFERENCIADA, id: null, condicao: "Condições Diferenciadas", pgCaixa: null, pgOutros: null, retentativa: null, degustacao: null, situacao: "", recomended: false, custom: true, referencia: false, visible: true, grupo: null };
    this.tarifas.push(tarifaCustomizada);


    let tarifaPadrao = this.obterTarifaPadrao(this.tarifas);
    if (tarifaPadrao != null) {
      this.userAction("Calculo de Alçadas:");
      this.userAction("para os valores a seguir:");
      this.userAction("pagadoresContaCaixa: " + tarifaPadrao.pgCaixa);
      this.userAction("pagadoresOutrosBancos: " + tarifaPadrao.pgOutros);
      this.userAction("retentativa: " + tarifaPadrao.retentativa);
      this.userAction("degustacao: " + tarifaPadrao.degustacao + " dias");
      this.userAction("Sabendo que: ");
      this.userAction("a diferença de valor de até 40% é alçada AGENCIA,");
      this.userAction("a diferença de valor de até 60% é alçada EXECUTIVA,");
      this.userAction("a diferença de valor de até 99% é alçada GERENCIA");
      this.userAction("e diferença de valor de até 100% é alçada MATRIZ.");
      this.userAction("e indiferente da diferença de valor sempre que a degustacao for maior que a degustacao balcão é alçada MATRIZ.");
    }
    this.ready = true;
  }


  savePreferences($event: any) {
    this.preferences.pageSize = $event.pageSize;
    let rawpreferences = JSON.stringify(this.preferences);
    window.sessionStorage.setItem("preferences", rawpreferences);
  }


  processPreferences() {
    let rawpreferences = window.sessionStorage.getItem("preferences");
    if (rawpreferences != null) {

      let preferences = JSON.parse(rawpreferences);
      this.preferences = preferences;

    }

  }

  processFavorites() {

    let rawfavoritos = window.sessionStorage.getItem("favorites");
    if (rawfavoritos != null) {

      let favoritos = JSON.parse(rawfavoritos);

      if (favoritos.indexOf(this.host.id) >= 0) {
        this.favorite = true;
      }
    }
  }

  favoriteEvent() {
    this.favorite = !this.favorite;

    let data = {
      detail: {
        id: this.host.id,
        value: this.favorite
      }
    };
    let event = new CustomEvent("@caixa/favorite", data);
    dispatchEvent(event);
  }

  buscaCNPJ(cnpj: string) {
    this.userAction("usuário efetuou uma busca de simulacoes pelo cnpj " + cnpj);

    let url = this.backendUrl + "/simulacao/v2/consulta?cnpj=" + cnpj;

    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response) => {
        if (response && response.mensagem) {
          this.showMessage(response.mensagem, response.descricao);
          return;
        } else if (response == null || response.length == 0) {
          this.showMessage("CNPJ não localizado", "Tente busca avançada");
          return;
        }
        this.processaRetornoConsulta(response);
      })
      .catch(error => {
        console.error(error);
        this.showMessage("Ocorreu um erro ao efetuar a busca solicitada", "Por favor tente novamente em alguns instantes");
      });
  }

  buscaID(id: string) {
    this.userAction("usuário efetuou uma busca de simulacoes pela simulacao de numero " + id);
    let url = this.backendUrl + "/simulacao/v2/consulta?numeroSimulacao=" + id;
    fetch(url, { method: 'GET' })
      .then(response => response.json())
      .then((response) => {
        if (response && response.mensagem) {
          this.showMessage(response.mensagem, response.descricao);
          return;
        } else if (response == null || response.length == 0) {
          this.showMessage("Nº da Simulação não localizado", "Tente busca avançada");
          return;
        }
        this.processaRetornoConsulta(response);
      })
      .catch(error => {
        console.error(error);
        this.showMessage("Ocorreu um erro ao efetuar a busca solicitada", "Por favor tente novamente em alguns instantes");
      });
  }

  obterTarifaPadrao(tarifas: Tarifa[]): Tarifa | any {
    for (let tarifa of tarifas) {
      if (tarifa.referencia) return tarifa;
    }
    return null;
  }

  obterPercentual(valor: number, total: number) {
    return 100 - ((valor * 100) / total);
  }

  obterMaiorPercentual(tarifa: Tarifa, padrao: Tarifa): number {

    let percentualCaixa = this.obterPercentual(tarifa.pgCaixa, padrao.pgCaixa);

    let percentualOutros = this.obterPercentual(tarifa.pgOutros, padrao.pgOutros);

    let percentualRetentativa = this.obterPercentual(tarifa.retentativa, padrao.retentativa);

    if (percentualCaixa > percentualOutros && percentualCaixa > percentualRetentativa) return percentualCaixa;

    if (percentualOutros > percentualCaixa && percentualOutros > percentualRetentativa) return percentualOutros;

    return percentualRetentativa;
  }

  // Verifica se houve alterações nos inputs da tarifa diferenciada
  private verificarNivelAlcadaInalterado(): boolean {
    return this.lastNivelAlcadaTarifaDiferenciada != null &&
      this.lastNivelAlcadaTarifaDiferenciada.tarifaPagadoresCaixa == this.valoresTarifaDiferenciadaSelecionada.pgCaixa &&
      this.lastNivelAlcadaTarifaDiferenciada.tarifaPagadoresOutras == this.valoresTarifaDiferenciadaSelecionada.pgOutros &&
      this.lastNivelAlcadaTarifaDiferenciada.tarifaRetentativa == this.valoresTarifaDiferenciadaSelecionada.retentativa &&
      this.lastNivelAlcadaTarifaDiferenciada.diasDegustacao == this.valoresTarifaDiferenciadaSelecionada.degustacao &&
      this.grupoMCSelecionadoNoCalculo == this.grupoMCSelecionadoAtual
  }

  private permitirCalculoAlcada(): boolean {
    return this.tarifaCustomizadaSelecionada && !this.verificarNivelAlcadaInalterado() && this.allInputsTarifaDiferenciadaOk();
  }

  podeClicarBtnCalcularAlcada(): boolean | null {
    return this.formTarifa?.valid;
  }

  novoCalcularAlcada(): void {//Novo metodo de calcular alcada criado para não alterar a logica existente
    this.cdr.detectChanges();
    this.grupoTarifa?.control?.markAsTouched();
    this.selecionarTarifa(this.tarifaDiferenciadaDaListaDeTarifas);
  }

  calcularAlcada() {
    this.resetNivelAlcada();
    this.btnIsCalculando = true;

    const headers = {
      "Content-Type": "application/json"
    };

    const body = {
      "tarifaPagadoresCaixa": this.valoresTarifaDiferenciadaSelecionada.pgCaixa,
      "tarifaPagadoresOutras": this.valoresTarifaDiferenciadaSelecionada.pgOutros,
      "tarifaRetentativa": this.valoresTarifaDiferenciadaSelecionada.retentativa,
      "diasDegustacao": this.valoresTarifaDiferenciadaSelecionada.degustacao,
      "grupoMargemContribuicao": this.grupoMCSelecionadoNoCalculo
    }

    this.lastNivelAlcadaTarifaDiferenciada = body;

    let url = this.backendUrl + "/alcada";

    fetch(url, { method: 'POST', body: JSON.stringify(body), headers: headers })
      .then(response => response.json())
      .then((response) => {
        if (response && response.nivelAlcada) {
          this.alcadaTarifaDiferenciada = response.nivelAlcada;
          this.nivelAlcadaTarifaDiferenciada = mapaNiveisAlcada[this.alcadaTarifaDiferenciada] ?? EnumNivelAlcada.ALCADA_INDETERMNADA;
          if (this.nivelAlcadaTarifaDiferenciada === EnumNivelAlcada.ALCADA_INDETERMNADA) throw Error;
          this.erroCalculoAlcada = false;
        } else {
          console.error("O atributo nivelAlcada não veio na resposta. O nível alcada será resetado...", response);
          throw Error;
        }
      })
      .catch(error => {
        this.erroCalculoAlcada = true;
        this.resetNivelAlcada(EnumAlcada.ALCADA_INDETERMNADA);
        this.openSnackbar('top', 'center', 'danger', 'Erro ao calcular alçada. Tente novamente.');
        console.error("Erro em chamada para calcular ALCADA (endpoint /alcada). Resetando nível...", error);
      })
      .finally(() => {
        this.btnIsCalculando = false;
        this.configurarAlertResultadoAlcada();
      })
  }

  desabilitarBotaoIrParaSimulacao(): boolean {
    return !this.btnIncluirSimulacao;
  }

  desabilitarBotaoIrparaContrato(): boolean {
    if (this.inconsistencias.length > 0) return true;
    return !this.btnIrParaContrato;
  }

  controlarBotoesTelaInclusaoSimulacao(): void {
    // Caso tarifa diferenciada, porém calculado que alçada indefinida
    if (this.tarifaCustomizadaSelecionada && this.alcadaTarifaDiferenciada == EnumAlcada.ALCADA_INDETERMNADA) {
      this.btnIrParaContrato = false;
      this.btnIncluirSimulacao = false;
      return;
    }

    // Caso exceção selecionada
    if (this.excecaoSelecionada) {
      this.btnIrParaContrato = this.nomeAlcadaAtual === EnumAlcada.ALCADA_MATRIZ; // Pode ir para o contrato se logado com matriz
      this.btnIncluirSimulacao = true; // Permite inclusão de simulação
      this.labelBotaoIncluirSimulacao = this.nomeAlcadaAtual === EnumAlcada.ALCADA_MATRIZ ? this.descricaoIncluirSimulacao : this.descricaoSolicitarAutorizacao; // Caso matriz, texto será de inclusão
      return;
    }

    // Caso seja selecionado balcão ou alguma simulação
    if (!this.tarifaCustomizadaSelecionada) {
      this.btnIrParaContrato = true;
      this.btnIncluirSimulacao = true;
      this.labelBotaoIncluirSimulacao = this.descricaoIncluirSimulacao;
      return;
    }

    // Caso seja selecionado tarifa diferenciada, verificar qual alçada calculada e qual alçada logada
    // Em cada método é considerada a alcada calculada pelo caso da tarifa diferenciada (indefinida, agencia, superior, acima superior, matriz)
    switch (this.nomeAlcadaAtual) {
      case EnumAlcada.ALCADA_AGENCIA:
        this.logicaBotoesAlcadaAgencia();
        break;
      case EnumAlcada.ALCADA_SUP:
        this.logicaBotoesAlcadaExecutiva();
        break;
      case EnumAlcada.ALCADA_SN:
        this.logicaBotoesAlcadaGerencia();
        break;
      case EnumAlcada.ALCADA_MATRIZ:
        this.logicaBotoesAlcadaMatriz();
        break;
      default:
        break;
    }
  }

  private logicaBotoesAlcadaMatriz() {
    this.btnIrParaContrato = true;
    this.btnIncluirSimulacao = true;
    this.labelBotaoIncluirSimulacao = this.descricaoIncluirSimulacao;
  }

  private logicaBotoesAlcadaGerencia() {
    if ([EnumAlcada.ALCADA_AGENCIA, EnumAlcada.ALCADA_SUP, EnumAlcada.ALCADA_SN].includes(this.alcadaTarifaDiferenciada)) {
      this.btnIrParaContrato = true;
      this.btnIncluirSimulacao = true;
      this.labelBotaoIncluirSimulacao = this.descricaoIncluirSimulacao;
    } else {
      this.btnIrParaContrato = false;
      this.btnIncluirSimulacao = true;
      this.labelBotaoIncluirSimulacao = this.descricaoSolicitarAutorizacao;
    }
  }

  private logicaBotoesAlcadaExecutiva() {
    if ([EnumAlcada.ALCADA_AGENCIA, EnumAlcada.ALCADA_SUP].includes(this.alcadaTarifaDiferenciada)) {
      this.btnIrParaContrato = true;
      this.btnIncluirSimulacao = true;
      this.labelBotaoIncluirSimulacao = this.descricaoIncluirSimulacao;
    } else {
      this.btnIrParaContrato = false;
      this.btnIncluirSimulacao = true;
      this.labelBotaoIncluirSimulacao = this.descricaoSolicitarAutorizacao;
    }
  }

  private logicaBotoesAlcadaAgencia() {
    // Se alcada calculada for Agencia
    if (this.alcadaTarifaDiferenciada === EnumAlcada.ALCADA_AGENCIA) {
      this.btnIrParaContrato = true;
      this.btnIncluirSimulacao = true;
      this.labelBotaoIncluirSimulacao = this.descricaoIncluirSimulacao;
    } else {
      this.btnIrParaContrato = false;
      this.btnIncluirSimulacao = true;
      this.labelBotaoIncluirSimulacao = this.descricaoSolicitarAutorizacao;
    }
  }

  isEmpty(data: any[]) {
    if (data == null || data.length == 0) {
      return true;
    }
    return false;
  }

  processFilter(filter: any): string {
    let result: string = "";
    if (this.hasValue(filter.id)) result += "&numeroSimulacao=" + filter.id;
    if (this.hasValue(filter.cnpj)) result += "&cnpj=" + filter.cnpj;
    if (this.hasValue(filter.unidade)) result += "&unidadeRelacionamento=" + filter.unidade;

    if (filter.data != null) {
      if (filter.data == DATA_INCLUSAO) {
        result += this.processFilterInclusao(filter);

      } else if (filter.data == DATA_APROVACAO) {
        result += this.processFilterAprovacao(filter);

      }
    }

    if (this.hasValueArray(filter.situacao)) {
      result += "&tipoSituacaoId=" + filter.situacao;
    }

    return result;
  }

  processFilterInclusao(filter: any) {
    let result = "";
    if (this.hasValue(filter.dataAte)) result += "&dataInclusaoAte=" + this.formatDateUrl(this.getDate(filter.dataAte), DATE_YMD);
    if (this.hasValue(filter.dataDe)) result += "&dataInclusaoDe=" + this.formatDateUrl(this.getDate(filter.dataDe), DATE_YMD);
    return result;
  }

  processFilterAprovacao(filter: any) {
    let result = "";
    if (this.hasValue(filter.dataAte)) result += "&dataAprovacaoAte=" + this.formatDateUrl(this.getDate(filter.dataAte), DATE_YMD);
    if (this.hasValue(filter.dataDe)) result += "&dataAprovacaoDe=" + this.formatDateUrl(this.getDate(filter.dataDe), DATE_YMD);
    return result;
  }

  hasValue(value: any) {
    return (value != null && value.trim() != '');
  }

  hasValueArray(value: any[]) {
    return (value != null && value.length > 0);
  }


  consultar() {
    this.simulacao = null;
    this.limparInconsistenciasCliente();
    this.termoDigitado = this.cnpjOrigemConvenio ?? this.termoCampoConsulta?.trim() ?? "";
    this.userAction("usuário esta realizando uma busca normal por um cliente ou simulacao");

    if (this.termoDigitado === null || this.termoDigitado == "") {
      this.showMessage("Informe o Número de uma Simulação ou o CNPJ de um cliente", "");
      return;
    }

    this.termoDigitado = this.termoDigitado.replace(/[^a-zA-Z0-9]/g, '');

    if (this.termoDigitado.length <= 6) {
      if (!this.isNumeric(this.termoDigitado)) {
        this.showMessage("O valor informado não é válido", "Informe um número válido de simulação");
        return;
      }
      this.showMessage("Efetuando busca pelo Número da Simulação informada", "Aguarde alguns instantes...");
      this.buscaID(this.termoDigitado);
      return;
    }

    if (CnpjValidatorService.isValid(this.termoDigitado)) {
      this.showMessage("Efetuando busca pelo CNPJ do Cliente", "Aguarde alguns instantes...");
      this.buscaCNPJ(this.termoDigitado);
    } else {
      this.showMessage("O CNPJ informado não é válido", "Verifique o valor informado e tente novamente");
    }
  }

  processaRetornoConsulta(retornoConsulta: any) {

    let result: Cliente = this.clienteService.processaDadosCliente(retornoConsulta, this.restricoesPai);

    this.userAction("A busca realizada retornou os seguintes resultados:");

    let cnpj: string | any = null;

    for (let item of retornoConsulta.simulacoes) {
      let simulacao: any = {
        id: this.padNumber(item.id, 6),
        unidade: this.padNumber(item.unidade_relacionamento, 4),
        diferenciais: item.diferenciais ? item.diferenciais : "N/D",  //Tarifas e Exceções
        cnpjFormatted: this.formatCnpj(item.cnpj),
        simulacaoOriginal: item.simulacaoOriginal,
        nome: item.razaoSocial,
        etapa1: this.obterAlcadabyNivel(1, item.simulacoesAlcada),
        etapa2: this.obterAlcadabyNivel(2, item.simulacoesAlcada),
        etapa3: this.obterAlcadabyNivel(3, item.simulacoesAlcada),
        etapa4: this.obterAlcadabyNivel(4, item.simulacoesAlcada),
        etapa5: this.obterAlcadabyNivel(5, item.simulacoesAlcada)
      }
      simulacao.statusEtapa1 = simulacao.etapa1.status;
      simulacao.statusEtapa2 = simulacao.etapa2.status;
      simulacao.statusEtapa3 = simulacao.etapa3.status;
      simulacao.statusEtapa4 = simulacao.etapa4.status;
      simulacao.statusEtapa5 = simulacao.etapa5.status;

      if (simulacao.simulacaoOriginal) {
        simulacao.simulacaoOriginal.id = this.padNumber(simulacao.simulacaoOriginal.id, 6)
      }

      simulacao.situacao = this.getSituacaoAtual(simulacao)
      simulacao.dataInclusao = this.getDataInclusao(simulacao);
      simulacao.dataInclusaoFormatted = this.getDataInclusaoFormatted(simulacao);
      simulacao.datasituacao = this.getDataSituacao(simulacao);
      let alcadaFinal: any = this.getLastEtapa(simulacao);
      if (alcadaFinal != null) {
        alcadaFinal = " pela alçada " + alcadaFinal.nome;
      } else {
        alcadaFinal = "";
      }

      this.userAction("Simulação Número " + simulacao.id + ", do cliente  " + simulacao.nome + ", criada em " + simulacao.dataInclusao + " esta com a situacao " + simulacao.situacao + alcadaFinal);

      result.simulacoes.push(simulacao);

      if (cnpj == null) {
        cnpj = item.cnpj;
      }

    }

    this.carregarTarifas(cnpj);


    this.cliente = result;
    this.verificarInconsistenciasCliente();

    this.changeDetector.detectChanges();
    this.dataSource = new MatTableDataSource<any>(this.cliente.simulacoes);
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;
  }

  obterAlcadabyNivel(nivel: number, alcadas: any[]): any {
    for (let item of alcadas) {
      if (item && item.alcada && item.alcada.nivel == nivel && item.tipoSituacao) {
        return { status: item.tipoSituacao.id, date: item.tsAlcada, nivel: nivel, nome: item.alcada.nomeAlcada, unidade: item.unidadeAlcada }
      }
    }
    return { status: null, date: null };
  }

  padNumber(num: any, size: number) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
  }

  formatCnpj(value: string) {
    value = this.padNumber(value, 14);
    return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }

  isNumeric(value: string) {
    return /^-?\d+$/.test(value);
  }

  getNumeric(value: any): number | null {
    if (value == null || !this.isNumeric(value)) return null;

    return parseInt(value);
  }

  isNonNullNumeric(value: string) {
    if (value == null) return false;
    if (!/^-?\d+$/.test(value)) return false;
    if (Number(value) < 0) return false;
    return true;
  }

  isNonNullCurrency(value: string) {
    if (value == null) return false;
    if (!/^\d+\.?\d{0,2}$/.test(value)) return false;
    if (parseFloat(value) < 0) return false;
    return true;
  }

  isCNPJ(value: string) {
    return value != null && value.length > 9 && this.isNumeric(value);
  }

  getEtapaIcon(value: any) {
    if (value) {
      for (let style of this.etapaStyles) {
        if (style.id == value.status) return style.icon;
      }
    }
    return "";
  }

  getHiddenClass(etapa: any, simulacao: any) {
    if ((etapa != simulacao.etapa1 && simulacao && simulacao.etapa1.status == CANCELADO) ||
      (etapa != simulacao.etapa2 && simulacao && simulacao.etapa2.status == CANCELADO) ||
      (etapa != simulacao.etapa3 && simulacao && simulacao.etapa3.status == CANCELADO) ||
      (etapa != simulacao.etapa4 && simulacao && simulacao.etapa4.status == CANCELADO)) return true;
    return false;

  }

  getEtapaClass(etapa: any, simulacao: any) {
    if (this.getHiddenClass(etapa, simulacao)) return "hidden";

    if (etapa) {

      for (let style of this.etapaStyles) {
        if (style.id == etapa.status) return style.background;
      }

    }

    if (this.hideEtapa(etapa, simulacao)) return "hidden"

    return "";
  }

  hideEtapa(etapa: any, simulacao: any) {
    let etapa1: boolean = this.verificaEtapa(simulacao.etapa1);
    let etapa2: boolean = this.verificaEtapa(simulacao.etapa2);
    let etapa3: boolean = this.verificaEtapa(simulacao.etapa3);
    let etapa4: boolean = this.verificaEtapa(simulacao.etapa4);
    let etapa5: boolean = this.verificaEtapa(simulacao.etapa5);

    if (etapa == simulacao.etapa1 && !etapa1) return true;
    if (etapa == simulacao.etapa2 && !etapa2) return true;
    if (etapa == simulacao.etapa3 && !etapa3) return true;
    if (etapa == simulacao.etapa4 && !etapa4) return true;
    if (etapa == simulacao.etapa5 && !etapa5) return true;

    return false;

  }

  verificaEtapa(etapa: any) {
    return etapa && etapa.status != null;
  }

  getEtapaProgress(simulacao: any): string {
    if (simulacao.etapa5.status != null) return "progress-etapa5";
    if (simulacao.etapa4.status != null) return "progress-etapa4";
    if (simulacao.etapa3.status != null) return "progress-etapa3";
    if (simulacao.etapa2.status != null) return "progress-etapa2";
    return "progress-etapa1";
  }

  getProgressParte1(simulacao: any) {
    if (simulacao.etapa1.status == CANCELADO) return "hidden";

    if (simulacao.etapa1.status == INCLUIDO || simulacao.etapa1.status == AVALIADO || simulacao.etapa2.status == PREVISTO) return "";

    if (this.checkEtapa(simulacao.etapa1) && (this.checkEtapa(simulacao.etapa2) || this.checkEtapa(simulacao.etapa3) || this.checkEtapa(simulacao.etapa4) || this.checkEtapa(simulacao.etapa5))) return "";

    return "hidden";
  }

  getProgressParte2(simulacao: any) {
    if (simulacao.etapa1.status == CANCELADO || simulacao.etapa2.status == CANCELADO) return "hidden";

    if ((this.checkEtapa(simulacao.etapa1) || this.checkEtapa(simulacao.etapa2)) && (this.checkEtapa(simulacao.etapa3) || this.checkEtapa(simulacao.etapa4) || this.checkEtapa(simulacao.etapa5))) return "";

    return "hidden";
  }

  getProgressParte3(simulacao: any) {
    if (simulacao.etapa1.status == CANCELADO || simulacao.etapa2.status == CANCELADO || simulacao.etapa3.status == CANCELADO) return "hidden";

    if ((this.checkEtapa(simulacao.etapa1) || this.checkEtapa(simulacao.etapa2) || this.checkEtapa(simulacao.etapa3)) && (this.checkEtapa(simulacao.etapa4) || this.checkEtapa(simulacao.etapa5))) return "";

    return "hidden";
  }

  getProgressParte4(simulacao: any) {

    if (simulacao.etapa1.status == CANCELADO || simulacao.etapa2.status == CANCELADO || simulacao.etapa3.status == CANCELADO || simulacao.etapa4.status == CANCELADO) return "hidden";

    if ((this.checkEtapa(simulacao.etapa1) || this.checkEtapa(simulacao.etapa2) || this.checkEtapa(simulacao.etapa3) || this.checkEtapa(simulacao.etapa4)) && this.checkEtapa(simulacao.etapa5)) return "";

    return "hidden";
  }

  getEtapaStatus(value: any) {
    let situacao = this.getSituacaoById(value.status);
    let result = "Situação: " + situacao;
    if (value.date != null) result += "\nData: " + this.formatDate(this.getDate(value.date));
    if (value.unidade != null) result += "\nUnidade: " + value.unidade;
    return result;
  }

  checkEtapa(etapa: any) {
    return (etapa != null && etapa.status != null && etapa.status != PREVISTO);
  }

  evaluate(value: any) {
    if (value && value.etapa1.status == INCLUIDO && value.etapa2.status == PENDENTE) return false;
    if (value && value.etapa1.status == null && value.etapa2.status == INCLUIDO && value.etapa3.status == PENDENTE) return false;
    if (value && value.etapa2.status == null && value.etapa3.status == INCLUIDO && value.etapa4.status == PENDENTE) return false;
    return true;
  }

  getLast(from: any, to: any) {
    if (from == null || from.date == null || from.status == PREVISTO) return to;
    if (to == null || to.date == null || to.status == PREVISTO) return from;
    if (from.date && to.date && this.getDate(from.date) > this.getDate(to.date)) return from;
    return to;
  }

  getLastAtual(from: any, to: any) {
    if (from == null || from.date == null || (from.status == PREVISTO || from.status == PENDENTE)) return to;
    if (to == null || to.date == null || (to.status == PREVISTO || to.status == PENDENTE)) return from;
    if (from.date && to.date && this.getDate(from.date) > this.getDate(to.date)) return from;
    return to;
  }


  getLastEtapa(simulacao: Simulacao): any {
    let lastEtapa = simulacao.etapa5;

    lastEtapa = this.getLast(lastEtapa, simulacao.etapa4);
    lastEtapa = this.getLast(lastEtapa, simulacao.etapa3);
    lastEtapa = this.getLast(lastEtapa, simulacao.etapa2);
    lastEtapa = this.getLast(lastEtapa, simulacao.etapa1);

    return lastEtapa;
  }

  getLastEtapaAtual(simulacao: any): any {
    let lastEtapa = simulacao.etapa5;

    if (simulacao.etapa5.status != null && simulacao.etapa5.status != PREVISTO && simulacao.etapa5.status != PENDENTE) return simulacao.etapa5;
    if (simulacao.etapa4.status != null && simulacao.etapa4.status != PREVISTO && simulacao.etapa4.status != PENDENTE) return simulacao.etapa4;
    if (simulacao.etapa3.status != null && simulacao.etapa3.status != PREVISTO && simulacao.etapa3.status != PENDENTE) return simulacao.etapa3;
    if (simulacao.etapa2.status != null && simulacao.etapa2.status != PREVISTO && simulacao.etapa2.status != PENDENTE) return simulacao.etapa2;
    if (simulacao.etapa1.status != null && simulacao.etapa1.status != PREVISTO && simulacao.etapa1.status != PENDENTE) return simulacao.etapa1;

    return lastEtapa;
  }

  getNextEtapa(simulacao: any): any {
    if (simulacao == null) return null;
    if (simulacao.etapa2 != null && simulacao.etapa2.status == PREVISTO) return simulacao.etapa2;
    if (simulacao.etapa3 != null && simulacao.etapa3.status == PREVISTO) return simulacao.etapa3;
    if (simulacao.etapa4 != null && simulacao.etapa4.status == PREVISTO) return simulacao.etapa4;
    if (simulacao.etapa5 != null && simulacao.etapa5.status == PREVISTO) return simulacao.etapa5;
    return null;
  }

  getIncludedEtapa(simulacao: any): any {

    if (simulacao.etapa1.status == INCLUIDO || simulacao.etapa1.status == APROVADO || simulacao.etapa1.status == CANCELADO) return simulacao.etapa1;
    if (simulacao.etapa2.status == INCLUIDO || simulacao.etapa2.status == APROVADO || simulacao.etapa2.status == CANCELADO) return simulacao.etapa2;
    if (simulacao.etapa3.status == INCLUIDO || simulacao.etapa3.status == APROVADO || simulacao.etapa3.status == CANCELADO) return simulacao.etapa3;
    if (simulacao.etapa4.status == INCLUIDO || simulacao.etapa4.status == APROVADO || simulacao.etapa4.status == CANCELADO) return simulacao.etapa4;
    if (simulacao.etapa5.status == INCLUIDO || simulacao.etapa5.status == APROVADO || simulacao.etapa5.status == CANCELADO) return simulacao.etapa5;

    return null;
  }

  getSituacao(simulacao: Simulacao): string {

    let etapa = this.getLastEtapa(simulacao);

    if (etapa != null) return this.getSituacaoById(etapa.status);

    return "";
  }

  getSituacaoAtual(simulacao: any): string {

    if (simulacao && simulacao.etapa1.status == CANCELADO) return this.getSituacaoById(simulacao.etapa1.status);
    let etapa = this.getLastEtapa(simulacao);

    if (etapa != null) return this.getSituacaoById(etapa.status);

    return "";
  }

  limparConsulta() {
    this.userAction("usuário clicou em limpar consulta e retornou a tela inicial de simulacao");

    this.termoCampoConsulta = null;
    this.cliente = null;
    this.message = null;
  }

  limparTableSimulacao() {
    this.userAction("usuário limpou o filtro de tabela de simulação");
  }


  //Metodo que vai preparar a pagina de Incluir Simulacao
  //Chamado ao clicar no botão de Incluir Simulacao que aparece logo apos consultar por CNPJ/Simulacao
  incluirSimulacao() {
    if (!this.clientReadyInclude()) return;

    this.labelBotaoIncluirSimulacao = this.nomeAlcadaAtual == EnumAlcada.ALCADA_MATRIZ ? this.descricaoIncluirSimulacao : this.descricaoSolicitarAutorizacao;

    this.userAction("usuário clicou em incluir uma nova simulação e esta vendo o formulário de nova simulação");

    this.irParaContrato = "off";

    this.pesquisar = false;
    this.detalhar = false;
    this.avaliar = false;
    this.contraproposta = null;
    this.alterar = false;
    this.incluir = true;
    this.erroCalculoAlcada = false;
    this.alcadaTarifaDiferenciada = EnumAlcada.ALCADA_NAO_CALCULADA;
    this.grupoMCSelecionadoNoCalculo = EnumGruposMargemContribuicao.INVALIDO;
    this.grupoMCSelecionadoAtual = EnumGruposMargemContribuicao.INVALIDO;

    this.tarifaCustomizadaSelecionada = false;
    this.valoresTarifaDiferenciadaSelecionada = {} as Tarifa;
    this.tarifaDiferenciadaDaListaDeTarifas = {} as Tarifa;
    this.excecaoSelecionada = false;

    this.simulacao = {
      tarifa: true,
      excecoes: {
        contaDebitoDiferente: false,
        inibirRetentativa: false,
        inibirOpenFinance: false,
        minutaContratualForaPadrao: false,
        minutaEditalCredenciamento: false,
        outro: false,
        textoOutro: null
      },
      convenio: "NOVO",
      unidadeConvenino: null,
      contas: [
        { id: "001234.0011.0002", selected: false },
        { id: "004321.0011.0001", selected: false },
      ],
      agendamentosMes: null,
      ticketMedio: null,
      justificativa: null,
      documentacao: null
    };

    ////implementado para garantir que ao inciar o radio da tarifa balcao seja selected
    this.radioButtonTarifas = EnumRadioButtonTarifas.SIMULACOES_REALIZADAS;
    if (this.tarifas && this.tarifas.length > 0) {
      this.tarifaSelected = this.tarifaIndex(this.tarifas[0]);
    }

    this.resetNivelAlcada();

    this.preselecionarTarifa();
    this.inicializarTarifaCustomizada();

    this.scrollTop();
  }


  avaliarSimulacao() {
    if (!this.simulacaoAvaliavel) return;
    this.avaliar = true;
    this.avaliacao = null;
    this.avaliacaoJustificativa = null;
    this.avaliacaoDocumento = null;
  }

  retornarAvaliarSimulacao(recarregarConsulta: boolean = false) {
    this.modalService.dismissAll();
    this.avaliar = false;
    this.contraproposta = null;

  }


  alterarSimulacao() {

    if (!this.alterarEnabled) return;

    this.userAction("usuário clicou em alterar uma simulação e esta vendo o formulário de simulação");

    this.pesquisar = false;
    this.detalhar = false;
    this.avaliar = false;
    this.contraproposta = null;
    this.alterar = true;
    this.incluir = false;

    this.tarifaCustomizadaSelecionada = false;
    this.excecaoSelecionada = false;
    this.alcadaTarifaDiferenciada = EnumAlcada.ALCADA_NAO_CALCULADA;

    this.simulacao = {
      tarifa: true,
      excecoes: {
        contaDebitoDiferente: false,
        inibirRetentativa: false,
        inibirOpenFinance: false,
        minutaContratualForaPadrao: false,
        minutaEditalCredenciamento: false,
        outro: false,
        textoOutro: null
      },
      convenio: "NOVO",
      unidadeConvenino: null,
      contas: [
        { id: "001234.0011.0002", selected: false },
        { id: "004321.0011.0001", selected: false },
      ],
      agendamentosMes: null,
      ticketMedio: null,
      justificativa: null,
      documentacao: null

    };

    this.preselecionarTarifa();
    this.inicializarTarifaCustomizada();
  }

  tarifaIndex(tarifa: any) {
    return this.tarifas.indexOf(tarifa).toString();
  }

  inicializarTarifaCustomizada() {
    let tarifaPadrao = this.obterTarifaPadrao(this.tarifas);
    if (tarifaPadrao == null) return;


    // Procura no array de tarifas qual é a customizada (diferenciada)
    // Preenche o valor dos inputs com os valores da padrão (pq tem o bind com o ngModel)
    for (let tarifa of this.tarifas) {
      if (!tarifa.custom) continue;
      tarifa.pgCaixa = tarifaPadrao.pgCaixa;
      tarifa.pgOutros = tarifaPadrao.pgOutros;
      tarifa.retentativa = tarifaPadrao.retentativa;
      tarifa.degustacao = tarifaPadrao.degustacao;
    }
  }

  preselecionarTarifa() {
    for (let tarifa of this.tarifas) {
      if (tarifa.recomended) { // Seleciona a que estiver recomendada
        this.selecionarTarifa(tarifa);
        this.tarifaSelected = this.tarifaIndex(tarifa);
      }
    }
  }

  selecionarTarifa(tarifa: Tarifa) {
    this.nivelAlcadaAtual = mapaNiveisAlcada[this.nomeAlcadaAtual] ?? 0; // Settar a variável do nivel do usuario logado para o novo fluxo do simulador que utiliza o GrupoMC
    this.cdr.detectChanges();

    this.grupoTarifa?.control?.markAsTouched();

    this.simulacao.tarifa = tarifa;
    this.tarifaCustomizadaSelecionada = tarifa.custom;

    this.valoresTarifaDiferenciadaSelecionada = JSON.parse(JSON.stringify(this.tarifaDiferenciadaDaListaDeTarifas)); // Atualiza com os valores digitados nos inputs. Precisa desse metodo, pois se colocar a igualdade ele vai copiar a referência e não os valores
    if (this.radioButtonTarifas == this.SIMULACOES_REALIZADAS) return; // Verifica se escolheu tarifa diferenciada
    if (this.permitirCalculoAlcada() && this.grupoMCSelecionadoAtual != EnumGruposMargemContribuicao.INVALIDO) {
      this.grupoMCSelecionadoNoCalculo = this.grupoMCSelecionadoAtual;
      this.calcularAlcada();
    } else if (this.alcadaTarifaDiferenciada != EnumAlcada.ALCADA_NAO_CALCULADA) {
      this.openSnackbar('bottom', 'center', 'warning', "Cálculo já realizado para esses valores inseridos!")
    } else {
      this.openSnackbar('bottom', 'center', 'info', "Insira valores e selecione o grupo para realizar o cálculo!")
    }
  }

  verificaTarifasCustomizadas(): string[] {
    let result: string[] = [];

    if (this.simulacao == null) {
      result.push("Simulação inexistente");
      this.userAction("Simulação inexistente");
      return result;
    }
    if (this.simulacao.tarifa == null) {
      result.push("Nenhuma tarifa selecionada");
      this.userAction("Nenhuma tarifa selecionada");
      return result;
    }
    if (!this.isNonNullCurrency(this.simulacao.tarifa.pgCaixa)) {
      result.push("Tarifa do Pagador CAIXA não informado ou inválido");
      this.userAction("Tarifa do Pagador CAIXA não informado ou inválido");
    }
    if (!this.isNonNullCurrency(this.simulacao.tarifa.pgOutros)) {
      result.push("Tarifa do Pagados Outros Bancos não informado ou inválido");
      this.userAction("Tarifa do Pagados Outros Bancos não informado ou inválido");
    }
    if (!this.isNonNullCurrency(this.simulacao.tarifa.retentativa)) {
      result.push("Tarifa de Retentativa não informada ou inválida");
      this.userAction("Tarifa de Retentativa não informada ou inválida");
    }
    if (!this.isNonNullNumeric(this.simulacao.tarifa.degustacao)) {
      result.push("Quantidade de dias de Degustação não informado ou inválido");
      this.userAction("Quantidade de dias de Degustação não informado ou inválido");
    }

    return result;
  }

  formatCurrency(value: number) {
    try {
      if (value == null) return null;
      return (value).toFixed(2).replace(".", ",");
    } catch (error) {
      return value;
    }
  }

  verificarSeHaExcecaoMarcada(): boolean {
    const excecoes = this.simulacao.excecoes;

    return [
      excecoes.debito,
      excecoes.contaDebitoDiferente,
      excecoes.inibirRetentativa,
      excecoes.inibirOpenFinance,
      excecoes.minutaContratualForaPadrao,
      excecoes.minutaEditalCredenciamento,
      excecoes.outro
    ].some(Boolean);
  }

  verificaExcecoes(): string[] {
    let result: string[] = [];

    if (!this.verificarSeHaExcecaoMarcada()) {
      result.push("Selecione ao menos um parâmetro contratual");
      this.userAction("Selecione ao menos um parâmetro contratual");
    }
    if (this.simulacao.excecoes.outro) {
      if (!this.simulacao.excecoes.textoOutro || this.simulacao.excecoes.textoOutro.trim().length < 3) {
        result.push(`Para a exceção "Outro", descreva com no mínimo 3 caracteres`);
        this.userAction(`Para a exceção "Outro", descreva com no mínimo 3 caracteres`);
      }
    }
    return result;
  }

  private isValidaAlcadaCalculada(): boolean {
    const isRadioCorreto = this.radioButtonTarifas === this.PLEITEAR_CONDICOES;
    const isCalculoCorreto = ![
      EnumAlcada.ALCADA_INDETERMNADA,
      EnumAlcada.ALCADA_NAO_CALCULADA,
    ].includes(this.alcadaTarifaDiferenciada);

    if (!isRadioCorreto) {
      return true; // Se o Radio for Simulações Realizadas, já pode dar um early return true
    }

    return isCalculoCorreto;
  }

  validarSolicitarAutorizacao(): string[] {

    this.grupoTarifa?.control?.markAsTouched();

    let result: string[] = [];

    if (this.simulacao.tarifa == null) {
      result.push("Não foi selecionada uma Tarifa");
    }

    if (this.grupoMCSelecionadoAtual == EnumGruposMargemContribuicao.INVALIDO) {
      result.push("Selecione o Grupo da Tarifa pertencente ao cliente");
    }

    if (!this.isValidaAlcadaCalculada()) {
      result.push("Cálculo de alçada inválido para Condições Diferencias");
    }

    if (this.tarifaCustomizadaSelecionada) {
      result = result.concat(this.verificaTarifasCustomizadas());
    }

    if (this.excecaoSelecionada) {
      result = result.concat(this.verificaExcecoes());
    }

    if (this.simulacao.migracaoDebito) {
      result = result.concat(this.verificaMigracaoDebito());
    }

    if (!this.isNonNullNumeric(this.simulacao.agendamentosMes)) {
      result.push("Agendamentos Mês não informado ou inválido");
      this.userAction("Agendamentos Mês não informado ou inválido");
    }
    if (!this.isNonNullCurrency(this.simulacao.ticketMedio)) {
      result.push("Ticket médio não informado ou inválido");
      this.userAction("Ticket médio não informado ou inválido");
    }

    if (this.simulacao.justificativa == null || this.simulacao.justificativa.trim() == "") {
      result.push("Comentário da justificativa não informado");
      this.userAction("Comentário da justificativa não informado");
    }

    return result;
  }

  verificaMigracaoDebito(): string[] {
    let result: string[] = [];

    let found: boolean = false;
    for (let conta of this.simulacao.contas) {
      if (conta.selected) found = true;
    }
    if (!found) {
      result.push("Número do convênio do Débito Automático para migração não selecionada");
      this.userAction("Número do convênio do Débito Automático para migração não selecionada");
    }
    return result;
  }

  showModal(modal: any) {
    this.modalService.dismissAll();
    this.modalService.open(modal, { size: 'lg', scrollable: false, windowClass: 'modal-large' });
  }

  showModalCampanhas(modal: any) {
    if (this.hasValueArray(this.campanhas)) {
      this.showModal(modal);
    }
  }


  showMessage(title: any, details: any = null) {
    this.userAction("apresentada a mensagem: " + title + " ao usuario");

    this.message = {
      title: title,
      description: details
    }
    this.cliente = null;
  }

  showMessageDialog(title: any, details: any = null) {
    this.userAction("apresentada a mensagem: " + title + " ao usuario");

    this.modalContent = {
      title: title,
      description: details
    }

    this.modalService.dismissAll();
    this.modalService.open(this.modalMessage, { size: 'lg', scrollable: false, windowClass: 'modal-large' });
  }

  verificaContraProposta(): string[] {
    let tarifa = this.tarifas[0];

    let result: string[] = [];

    if (!this.isNonNullCurrency(tarifa.pgCaixa)) {
      result.push("Tarifa do Pagador CAIXA não informado ou inválido");
      this.userAction("Tarifa do Pagador CAIXA não informado ou inválido");
    }
    if (!this.isNonNullCurrency(tarifa.pgOutros)) {
      result.push("Tarifa do Pagados Outros Bancos não informado ou inválido");
      this.userAction("Tarifa do Pagados Outros Bancos não informado ou inválido");
    }
    if (!this.isNonNullCurrency(tarifa.retentativa)) {
      result.push("Tarifa de Retentativa não informada ou inválida");
      this.userAction("Tarifa de Retentativa não informada ou inválida");
    }
    if (!this.isNonNullNumeric(tarifa.degustacao)) {
      result.push("Quantidade de dias de Degustação não informado ou inválido");
      this.userAction("Quantidade de dias de Degustação não informado ou inválido");
    }

    return result;
  }


  enviarAvaliacao(modalConfirmContraProposta: any, modalConfirmAprovada: any, modalConfirmReprovada: any) {

    this.modalService.dismissAll();
    if (this.avaliacao == "CONTRAPROPOSTA") {

      this.modalService.open(modalConfirmContraProposta, { size: 'lg', scrollable: false, windowClass: 'my-class' });
    } else if (this.avaliacao == "APROVADA") {
      this.modalService.open(modalConfirmAprovada, { size: 'lg', scrollable: false, windowClass: 'my-class' });
    } else if (this.avaliacao == "REPROVADA") {
      this.modalService.open(modalConfirmReprovada, { size: 'lg', scrollable: false, windowClass: 'my-class' });
    }

  }

  confirmaNovaContraProposta(modalConfirm: any, modalInconsistencias: any) {

    this.messageList = this.verificaContraProposta();
    if (this.messageList.length > 0) {
      this.modalService.open(modalInconsistencias, { size: 'md', scrollable: false, windowClass: 'my-class' });
      return;
    }

    this.modalService.dismissAll();
    this.modalService.open(modalConfirm, { size: 'lg', scrollable: false, windowClass: 'my-class' });

  }


  //

  confirmarSolicitarAutorizacao(modalConfirm: any, modalInconsistencias: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.messageList = this.validarSolicitarAutorizacao();


        if (this.messageList.length > 0) {
          this.modalService.open(modalInconsistencias, { size: 'md', scrollable: false, windowClass: 'my-class' });
          resolve(); // Conclui a execução mesmo que haja inconsistências
          return;
        }

        this.modalService.dismissAll();

        const dadosResumoSimulacao: ResumoSimulacao = this.preencherDadosResumoSimulacao();
        this.abrirModalResumoSimulacao(dadosResumoSimulacao);
        resolve()

      } catch (error) {
        reject(error); // Rejeita a Promise em caso de erro
      }
    });
  }

  getDate(value: string): Date | any {
    try {
      if (value == null) return null;
      return new Date(value);
    } catch (error) {
      return null;
    }
  }

  formatDate(date: Date, formatId: number = DATE_DMY): string {
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);

    if (formatId == DATE_DMY) {
      return day + "/" + month + "/" + year;
    } else {
      return year + "/" + month + "/" + day;
    }
  }
  formatDateUrl(date: Date, formatId: number = DATE_DMY): string {
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);

    if (formatId == DATE_DMY) {
      return day + "-" + month + "-" + year;
    } else {
      return year + "-" + month + "-" + day;
    }
  }

  getDataInclusao(simulacao: any) {
    let etapa = this.getIncludedEtapa(simulacao);
    if (etapa != null) {
      return this.getDate(etapa.date);
    }
    return null;
  }

  getDataInclusaoFormatted(simulacao: any) {
    let etapa = this.getIncludedEtapa(simulacao);
    if (etapa != null) return this.formatDate(this.getDate(etapa.date));
    return null;
  }


  getDataSituacao(simulacao: Simulacao) {
    let result: any = null;
    if (simulacao.etapa5.date != null) result = simulacao.etapa5.date;
    else if (simulacao.etapa4.date != null) result = simulacao.etapa4.date;
    else if (simulacao.etapa3.date != null) result = simulacao.etapa3.date;
    else if (simulacao.etapa2.date != null) result = simulacao.etapa2.date;
    else if (simulacao.etapa1.date != null) result = simulacao.etapa1.date;

    return this.formatDate(this.getDate(result));
  }

  cancelarInclusao() {
    this.modalService.dismissAll();
    this.pesquisar = true;
    this.detalhar = false;
    this.avaliar = false;
    this.contraproposta = null;
    this.alterar = false;
    this.incluir = false;

    this.simulacao = null;

    this.changeDetector.detectChanges();
    this.dataSource = new MatTableDataSource<any>(this.cliente?.simulacoes ?? []);
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;
  }

  enviarContraProposta() {
    this.modalService.dismissAll();


    this.tarifaContraProposta = [];
    let tarifaCustomizada = { tipo: TipoTarifaSimulador.DIFERENCIADA, id: null, condicao: "Contraproposta", pgCaixa: this.proposta.pagadorCaixa, pgOutros: this.proposta.outrosBancos, retentativa: this.proposta.retentativa, degustacao: this.proposta.degustacao, situacao: "", recomended: false, custom: true, referencia: false, visible: true };
    this.tarifaContraProposta.push(tarifaCustomizada);

    this.avaliar = false;
    this.contraproposta = {
      id: 123456,
      tarifa: tarifaCustomizada,
      excecoes: {
        debito: this.contadebito,
        inibirRetentativa: this.inibirRetentativa,
        inibirOpenFinance: this.inibirOpenFinance,
        minutaContratualForaPadrao: this.minutaContratualSimulacao,
        minutaEditalCredenciamento: this.minutaEditalSimulacao,
        outro: this.outrosSimulacao
      }
    };

    this.changeDetector.detectChanges();

  }

  enviarNovaContraProposta(modal: any) {
    this.modalService.dismissAll();

    const formData: FormData = new FormData();
    formData.append('numeroSimulacao', this.idSimulacao);
    formData.append('condicaoTarifaPagadoresCaixa', this.tarifaContraProposta[0].pgCaixa);
    formData.append('condicaoTarifaPagadoresOutras', this.tarifaContraProposta[0].pgOutros);
    formData.append('condicaoTarifaRetentativa', this.tarifaContraProposta[0].retentativa);
    formData.append('condicaoDiasDegustacao', this.tarifaContraProposta[0].degustacao);
    formData.append('excecaoContaDebitoDiferente', this.contraproposta.excecoes.debito);
    formData.append('excecaoInibirRetentativa', this.contraproposta.excecoes.inibirRetentativa);
    formData.append('excecaoInibirOpenFinance', this.contraproposta.excecoes.inibirOpenFinance);
    formData.append('excecaoMinutaContratualForaPadrao', this.contraproposta.excecoes.minutaContratualForaPadrao);
    formData.append('excecaoMinutaEditalCredenciamento', this.contraproposta.excecoes.minutaEditalCredenciamento);
    formData.append('excecaoOutro', this.contraproposta.excecoes.outro);
    formData.append('excecaoTextoOutro', this.contraproposta.excecoes.textoOutro);
    formData.append('justificativaComentarios', this.avaliacaoJustificativa);

    const documentos: FileList = this.contraproposta.documentacao as FileList;

    if (documentos) {
      for (let documento of Array.from(documentos)) {
        formData.append('justificativaDocumentos', documento, documento.name);
      }
    }

    let requestOptions = {
      method: 'POST',
      body: formData
    };

    let url = this.backendUrl + "/simulacaoContraProposta";

    fetch(url, requestOptions)
      .then(response => response.json())
      .then((response) => {
        if (response && response.mensagem) {
          this.showMessageDialog(response.mensagem, response.descricao);
          return;
        }

        this.avaliar = false;
        this.contraproposta = false;
        this.detalharSimulacao(null, this.idSimulacao, true);


        this.modalService.open(modal, { size: 'lg', scrollable: false, windowClass: 'my-class' });

      })
      .catch(error => {
        this.showMessageDialog("Ocorreu um erro ao enviar contra proposta desta simulação", "Por favor tente novamente em alguns instantes");
        console.error(error);
      });
  }

  aprovarSimulacao(modal: any) {
    this.modalService.dismissAll();

    const formData: FormData = new FormData();
    formData.append('simulacaoAlcada.numeroSimulacaoNegocialConvenio', this.idSimulacao);
    formData.append('simulacaoAlcada.aprovada', "true");
    formData.append('simulacaoAlcada.parecer', this.avaliacaoJustificativa);

    const documentos: FileList = this.avaliacaoDocumento as FileList;

    if (documentos) {
      for (let documento of Array.from(documentos)) {
        formData.append('simulacaoAlcada.documentos', documento, documento.name);
      }
    }

    let requestOptions = {
      method: 'POST',
      body: formData
    };

    let url = this.backendUrl + "/simulacao/alcada";

    fetch(url, requestOptions)
      .then(response => response.json())
      .then((response) => {
        if (response && response.mensagem && !response.simulacaoAlcada) {
          this.showMessageDialog(response.mensagem, response.descricao);
          return;
        }

        this.avaliar = false;
        this.detalharSimulacao(null, this.idSimulacao, true);

        this.modalService.open(modal, { size: 'lg', scrollable: false, windowClass: 'my-class' });

      })
      .catch(error => {
        this.showMessageDialog("Ocorreu um erro ao aprovar esta simulação", "Por favor tente novamente em alguns instantes");
        console.error(error);
      });
  }

  reprovarSimulacao(modal: any) {
    this.modalService.dismissAll();

    const formData: FormData = new FormData();
    formData.append('simulacaoAlcada.numeroSimulacaoNegocialConvenio', this.idSimulacao);
    formData.append('simulacaoAlcada.aprovada', "false");
    formData.append('simulacaoAlcada.parecer', this.avaliacaoJustificativa);

    const documentos: FileList = this.avaliacaoDocumento as FileList;

    if (documentos) {
      for (let documento of Array.from(documentos)) {
        formData.append('simulacaoAlcada.documentos', documento, documento.name);
      }
    }

    let requestOptions = {
      method: 'POST',
      body: formData
    };

    let url = this.backendUrl + "/simulacao/alcada";

    fetch(url, requestOptions)
      .then(response => response.json())
      .then((response) => {
        if (response && response.mensagem && !response.simulacaoAlcada) {
          this.showMessageDialog(response.mensagem, response.descricao);
          return;
        }

        this.avaliar = false;
        this.detalharSimulacao(null, this.idSimulacao, true);

        this.modalService.open(modal, { size: 'lg', scrollable: false, windowClass: 'my-class' });
      })
      .catch(error => {
        this.showMessageDialog("Ocorreu um erro ao reprovar esta simulação", "Por favor tente novamente em alguns instantes");
        console.error(error);
      });
  }

  public botaoClicado: boolean = false;

  async solicitarAutorizacao(modal: any) {
    // Ativa o spinner e impede múltiplos cliques
    if (this.botaoClicado) {
      return;
    }
    this.botaoClicado = true;

    // Ativa o spinner
    this.sppinerIsLoading = true;
    this.labelModalIncluir = "Aguarde";

    try {
      // Adiciona um atraso de 3 segundos
      // await new Promise(resolve => setTimeout(resolve, 3000));

      // Continua o fluxo após o atraso
      let vm = this;
      this.processarInclusao(modal, function () {
        if (!vm.criarSimulacaoSemIrParaConvenio) {
          vm.direcionarParaConvenio();
        }
      });
    } finally {
      // Reseta o estado do botão clicado e desativa o spinner
      this.botaoClicado = false;
      this.sppinerIsLoading = false;
      this.labelModalIncluir = "Incluir";
    }
  }

  async irContrato(modalInconsistencias: any) {
    this.labelBotaoIncluirSimulacao = this.descricaoIrParaContrato; //Altera o label para ser exibido no modal, é resetada pelo ngDoCheck ao fechar o modal.
    this.messageList = this.validarSolicitarAutorizacao();
    if (this.messageList.length > 0) {
      this.modalService.open(modalInconsistencias, { size: 'md', scrollable: false, windowClass: 'my-class' });
      return;
    }

    this.criarSimulacaoSemIrParaConvenio = false;

    await this.confirmarSolicitarAutorizacao(this.modalConfirmInclusao, this.modalInconsistencias);
  }

  direcionarParaConvenio() {
    if (!environment.production) { // Se for local
      window.location.href = 'https://siacc-servicos-frontend-des.apps.nprd.caixa/pixautomatico/convenio?local=convenio';
      return;
    }

    // Se não for local (des, tqs, prod)
    this.router.navigate(['pixautomatico/convenio'], { skipLocationChange: false })
  }

  userAction(action: string) {
    if (action == null || action.trim() == "") return;
    let data = {
      detail: action
    };
    dispatchEvent(new CustomEvent("@caixa/action", data));
  }

  validarCNPJ(cnpj: string) {

    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj == '') return false;

    if (cnpj.length != 14)
      return false;

    // Elimina CNPJs invalidos conhecidos
    if (cnpj == "00000000000000" ||
      cnpj == "11111111111111" ||
      cnpj == "22222222222222" ||
      cnpj == "33333333333333" ||
      cnpj == "44444444444444" ||
      cnpj == "55555555555555" ||
      cnpj == "66666666666666" ||
      cnpj == "77777777777777" ||
      cnpj == "88888888888888" ||
      cnpj == "99999999999999")
      return false;

    // Valida DVs
    let tamanho: any = cnpj.length - 2
    let numeros: any = cnpj.substring(0, tamanho);
    let digitos: any = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
        pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0))
      return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
        pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1))
      return false;

    return true;

  }

  sortData(sort: Sort) {
    const data = this.dataSource.data.slice();

    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
    } else {
      this.dataSource.data = data.sort((a: any, b: any) => {
        const aValue = a[sort.active];
        const bValue = b[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  clone(value: any) {
    return JSON.parse(JSON.stringify(value));
  }

  getContasPJ(): string[] {
    let result = [];

    if (this.simulacao.contas) {
      for (let conta of this.simulacao.contas) {
        if (conta.selected) result.push(conta.id);
      }
    }

    return result;
  }

  processaTarifa(): CondicaoSimulacaoDTO {
    let condicao: CondicaoSimulacaoDTO | any = null;

    if (this.radioButtonTarifas == this.SIMULACOES_REALIZADAS) {
      let tarifa = this.tarifas[this.tarifaSelected];
      condicao = {
        id: tarifa.id,
        tipo: tarifa.tipo,
        nome: tarifa.condicao,
        tarifaPagadoresCaixa: tarifa.pgCaixa,
        tarifaPagadoresOutras: tarifa.pgOutros,
        tarifaRetentativa: tarifa.retentativa,
        diasDegustacao: tarifa.degustacao,
        grupoMargemContribuicao: this.grupoMCSelecionadoAtual //Tem que enviar o grupo selecionado, pois não haverá cálculo
      }
    } else if (this.radioButtonTarifas == this.PLEITEAR_CONDICOES) {
      if (this.tarifaDiferenciadaDaListaDeTarifas) {
        condicao = {
          id: this.tarifaDiferenciadaDaListaDeTarifas.id,
          tipo: this.tarifaDiferenciadaDaListaDeTarifas.tipo,
          nome: this.tarifaDiferenciadaDaListaDeTarifas.condicao,
          tarifaPagadoresCaixa: this.tarifaDiferenciadaDaListaDeTarifas.pgCaixa,
          tarifaPagadoresOutras: this.tarifaDiferenciadaDaListaDeTarifas.pgOutros,
          tarifaRetentativa: this.tarifaDiferenciadaDaListaDeTarifas.retentativa,
          diasDegustacao: this.tarifaDiferenciadaDaListaDeTarifas.degustacao,
          grupoMargemContribuicao: this.grupoMCSelecionadoNoCalculo //Tem que enviar o grupo realizado no cálculo
        }
      } else {
        this.openSnackbar('bottom', 'center', 'warning', "Nenhuma tarifa diferenciada foi selecionada");
      }
    }

    return condicao;
  }

  processaExcecoes(): ExcecoesSimulacaoDTO {

    return {
      contaDebitoDiferente: this.simulacao.excecoes.contaDebitoDiferente,
      inibirRetentativa: this.simulacao.excecoes.inibirRetentativa,
      inibirOpenFinance: this.simulacao.excecoes.inibirOpenFinance,
      minutaContratualForaPadrao: this.simulacao.excecoes.minutaContratualForaPadrao,
      minutaEditalCredenciamento: this.simulacao.excecoes.minutaEditalCredenciamento,
      outro: this.simulacao.excecoes.outro,
      textoOutro: this.simulacao.excecoes.textoOutro
    };
  }

  processaJustificativa(): JustificativaSimulacaoDTO | any {
    let justificativa: JustificativaSimulacaoDTO | any = null;
    justificativa = {
      novoConvenio: this.simulacao.convenio == "NOVO" ? true : false,
      unidadeRelacionamentoConvenio: this.simulacao.unidadeConvenino,
      agendamentosPorMes: this.simulacao.agendamentosMes,
      ticketMedio: this.simulacao.ticketMedio,
      migracaoDebitoAutomatico: this.simulacao.migracaoDebito,
      contaPJDebitoAutomatico: this.getContasPJ(),
      comentarios: this.simulacao.justificativa,
      documentos: this.simulacao.documentacao
    }

    return justificativa;
  }

  processarInclusao(modal: any, callback: any = null) {

    const snackBarRef: MatSnackBarRef<any> = this.abrirSnackBarCarregando("Enviando os dados...");

    let condicao: CondicaoSimulacaoDTO | any = this.processaTarifa();

    let excecoes: ExcecoesSimulacaoDTO = this.processaExcecoes();

    let justificativa: JustificativaSimulacaoDTO | any = this.processaJustificativa();

    condicao = this.transformaTipoTarifa(condicao);

    let body: SimulacaoDTO = {
      cnpj: this.cliente?.cnpj ?? "",
      condicao: condicao,
      excecoes: excecoes,
      justificativa: justificativa
    }

    let url = this.backendUrl + "/simulacao";

    let formDataBody = this.converterSimulacaoDTOToFormData(body);

    let requestOptions = {
      method: 'POST',
      body: formDataBody
    };

    fetch(url, requestOptions)
      .then(response => response.json())
      .then((response) => {

        if (response.mensagem) {
          this.showMessageDialog(response.mensagem, response.descricao);
          return;
        }

        const retorno = response

        if (response.id) {
          this.simulacao.id = this.padNumber(response.id, 6);
          this.modalService.open(modal, { size: 'lg', scrollable: false, windowClass: 'my-class' });
          this.numeroSimulacao = retorno.id

          this.criouNovaSimulacao = "sim";
          window.sessionStorage.setItem('CRIOUNOVASIMULACAO', this.criouNovaSimulacao);

          if (!this.criarSimulacaoSemIrParaConvenio) {
            let idSimulacao = this.numeroSimulacao;
            window.sessionStorage.setItem('ID', idSimulacao);
            let cnpjStorage = this.cliente?.cnpj ?? "";
            window.sessionStorage.setItem('CNPJ', cnpjStorage);
            this.irParaContrato = "on";
            window.sessionStorage.setItem('IRCONTRATO', this.irParaContrato);
          }
        }

        if (callback) callback();
      })
      .catch(error => {
        this.showMessageDialog("Ocorreu um erro ao processar esta simulação", "Por favor tente novamente em alguns instantes");
        console.error(error);
      })
      .finally(() => {
        snackBarRef.dismiss();
      });
  }

  // Metodo temporário até correção do enum tipo tarifa no backend:

  transformaTipoTarifa(condicao: any) {

    if (condicao.tipo == TipoTarifa.BALCAO) condicao.tipo = TipoTarifaSimulador.BALCAO;
    if (condicao.tipo == TipoTarifa.SIMULACAO) condicao.tipo = TipoTarifaSimulador.SIMULACAO;
    if (condicao.tipo == TipoTarifa.DIFERENCIADA) condicao.tipo = TipoTarifaSimulador.DIFERENCIADA;
    if (condicao.tipo == TipoTarifa.CAMPANHA) condicao.tipo = TipoTarifaSimulador.CAMPANHA

    return condicao;
  }

  formatarGrupoMCParaFormData(grupoMC: EnumGruposMargemContribuicao | null): string {
    if (grupoMC) {
      return grupoMC.toString();
    } else {
      return '';
    }
  }

  converterSimulacaoDTOToFormData(simulacao: SimulacaoDTO): FormData {

    const formData: FormData = new FormData();
    formData.append('cnpj', simulacao.cnpj);
    formData.set('excecoes.contaDebitoDiferente', simulacao.excecoes.contaDebitoDiferente?.toString());
    formData.set('excecoes.inibirRetentativa', simulacao.excecoes.inibirRetentativa.toString());
    formData.set('excecoes.minutaContratualForaPadrao', simulacao.excecoes.minutaContratualForaPadrao.toString());
    formData.set('excecoes.minutaEditalCredenciamento', simulacao.excecoes.minutaEditalCredenciamento.toString());
    formData.set('excecoes.inibirOpenFinance', simulacao.excecoes.inibirOpenFinance.toString());
    formData.set('excecoes.outro', simulacao.excecoes.outro.toString());
    formData.append('excecoes.textoOutro', simulacao.excecoes.textoOutro);

    formData.append('justificativa.novoConvenio', simulacao.justificativa.novoConvenio.toString());
    formData.append('justificativa.unidadeRelacionamentoConvenio', simulacao.justificativa.unidadeRelacionamentoConvenio);
    formData.append('justificativa.agendamentosPorMes', simulacao.justificativa.agendamentosPorMes.toString());
    formData.append('justificativa.ticketMedio', simulacao.justificativa.ticketMedio.toString());
    formData.set('justificativa.migracaoDebitoAutomatico', "false");
    formData.append('justificativa.contaPJDebitoAutomatico', simulacao.justificativa.contaPJDebitoAutomatico.toString());
    formData.append('justificativa.comentarios', simulacao.justificativa.comentarios);
    formData.append('condicoes.tipo', simulacao.condicao.tipo.toString());
    formData.append('condicoes.nome', simulacao.condicao.nome);
    formData.append('condicoes.tarifaPagadoresCaixa', simulacao.condicao.tarifaPagadoresCaixa.toString());
    formData.append('condicoes.tarifaPagadoresOutras', simulacao.condicao.tarifaPagadoresOutras.toString());
    formData.append('condicoes.tarifaRetentativa', simulacao.condicao.tarifaRetentativa.toString());
    formData.append('condicoes.diasDegustacao', simulacao.condicao.diasDegustacao.toString());
    formData.append('condicoes.grupoMargemContribuicao', this.formatarGrupoMCParaFormData(simulacao.condicao.grupoMargemContribuicao));

    const documentos: FileList = simulacao.justificativa.documentos as FileList;

    if (documentos) {
      for (let documento of Array.from(documentos)) {
        formData.append('justificativa.documentos', documento, documento.name);
      }
    }
    return formData;
  }


  retornar() {
    this.modalService.dismissAll();
    this.pesquisar = true;
    this.simulacao = null;
    this.detalhar = false;
    this.avaliar = false;
    this.contraproposta = false;
    this.incluir = false;

    this.consultar();

  }

  getTime() {
    let date = new Date();
    return "T" + this.padNumber(date.getHours(), 2) + ":" + this.padNumber(date.getMinutes(), 2) + ":" + this.padNumber(date.getSeconds(), 2) + "." + this.padNumber(date.getMilliseconds(), 5);
  }

  contraSimulacao(simulacao: any) {
    simulacao.options = false;

    let etapa = this.getLastEtapa(simulacao);

    let date = this.formatDate(new Date(), DATE_YMD);

    if (etapa == null || etapa.status == CONTRATADO || etapa.status == VENCIDO || etapa.status == CANCELADO || etapa.status == REPROVADO) return;

    if (etapa.status == PENDENTE) {

      if (etapa.nivel == 5) return;

      etapa.status = CONTRAPRO;
      etapa.date = date + this.getTime();

      if (etapa == simulacao.etapa2) {
        simulacao.etapa3 = { status: null, date: null };
        simulacao.etapa4 = { status: null, date: null };
      }
      if (etapa == simulacao.etapa3) {
        simulacao.etapa4 = { status: null, date: null };
      }


      let vm = this;
      setTimeout(function () {

        simulacao.etapa5.status = PENDENTE;
        simulacao.etapa5.date = date + vm.getTime();

        simulacao.situacao = vm.getSituacaoAtual(simulacao);
      }, 100);

    }
  }

  canAprove(simulacao: Simulacao) {
    let etapa = this.getLastEtapa(simulacao);
    return etapa.status != 'PENDENTE' ? 'DISABLED' : ''
  }

  clientReadyInclude() {

    if (!this.verificarFuncionalidade(INCLUIR)) return false;

    return true;
  }

  verificarInconsistenciasCliente() {
    if (!this.cliente) return;
    this.inconsistencias.push(...this.clienteService.descreverRestricoesCliente(this.cliente.restricoes))
  }

  atualizarInconsistenciasCliente(titulo: string, detalhes: string[]): void {
    this.mensagensInconsistenciasCliente = {
      titulo: titulo,
      descricao: detalhes
    }
  }

  limparInconsistenciasCliente(): void {
    this.inconsistencias = [];
    this.mensagensInconsistenciasCliente = null;
  }

  getVersao() {
    return versao.simulador;
  }

  filtrarItems() {
    this.filtrarTarifas = !this.filtrarTarifas;
  }

  alternarVisibilidadeTarifa(tarifa: Tarifa): void {
    tarifa.visible = !tarifa.visible;

    if (!tarifa.visible) {
      this.adicionarPreferencia(tarifa);
    } else {
      this.removerPreferencia(tarifa);
    }

    this.salvarPreferencias();
  }

  adicionarPreferencia(tarifa: Tarifa): void {
    const preferencia: PreferenciaFiltro = {
      tipo: tarifa.tipo,
      id: tarifa.id
    };

    this.preferenciasFiltro.push(preferencia);
  }

  removerPreferencia(tarifa: Tarifa): void {
    const index = this.preferenciasFiltro.findIndex(
      pref => pref.tipo === tarifa.tipo && pref.id === tarifa.id
    );

    if (index !== -1) {
      this.preferenciasFiltro.splice(index, 1);
    }
  }

  verifyTarifaPreference(tarifa: any) {
    for (let preference of this.preferenciasFiltro) {
      if (preference.tipo == tarifa.tipo && preference.id == tarifa.id) {
        tarifa.visible = false;
        break;
      }
    }
  }

  processarTarifas(tarifas: Tarifa[]) {

    let result: Tarifa[] = [];

    for (let tarifa of tarifas) {

      this.verifyTarifaPreference(tarifa);

      if (tarifa.visible && !tarifa.custom) {
        result.push(tarifa);
      }
    }

    if (!this.filtrarTarifas) return tarifas.filter(tarifa => tarifa.custom !== true);

    return result;

  }

  processFilterPreferences() {
    let rawpreferences = window.sessionStorage.getItem("filterPreferences");
    if (rawpreferences != null) {

      let preferences = JSON.parse(rawpreferences);
      this.preferenciasFiltro = preferences;

    }
  }

  salvarPreferencias() {
    const rawpreferences = JSON.stringify(this.preferenciasFiltro);
    window.sessionStorage.setItem("filterPreferences", rawpreferences);
  }

  confirmaCopiarSimulacao(modalConfirm: any) {
    this.modalService.dismissAll();
    this.modalService.open(modalConfirm, { size: 'lg', scrollable: false, windowClass: 'my-class' });
  }


  copiarSimulacao() {
    this.modalService.dismissAll();
    this.incluirSimulacao();

    this.grupoMCSelecionadoAtual = this.grupoMargemContribuicaoDoDetalhamento;

    this.processaCopiaTarifas();

    this.processaCopiaExcecoes();

    this.processaCopiaJustificativa();

  }

  processaCopiaTarifas() {
    const tarifaPreselecionada = this.tarifas.find((t) => {
      return t.id == this.idSimulacao;
    })

    if (tarifaPreselecionada) {
      this.tarifaSelected = this.tarifaIndex(tarifaPreselecionada);
      this.selecionarTarifa(tarifaPreselecionada);
    } else {
      this.radioButtonTarifas = this.PLEITEAR_CONDICOES;
      this.pegarTarifaDiferenciadaDaListaDeTarifas();
      this.tarifaDiferenciadaDaListaDeTarifas.pgCaixa = this.proposta.pagadorCaixa;
      this.tarifaDiferenciadaDaListaDeTarifas.pgOutros = this.proposta.outrosBancos;
      this.tarifaDiferenciadaDaListaDeTarifas.retentativa = this.proposta.retentativa;
      this.tarifaDiferenciadaDaListaDeTarifas.degustacao = this.proposta.degustacao;
      this.selecionarTarifa(this.tarifaDiferenciadaDaListaDeTarifas);
    }
  }

  processaCopiaExcecoes() {
    if (!this.possuiExcecoes()) return;
    this.excecaoSelecionada = true;
    this.simulacao.excecoes.contaDebitoDiferente = !!this.proposta.contadebito;
    this.simulacao.excecoes.inibirRetentativa = !!this.proposta.inibirRetentativa;
    this.simulacao.excecoes.inibirOpenFinance = !!this.proposta.inibirOpenFinance;
    this.simulacao.excecoes.minutaContratualForaPadrao = !!this.proposta.minutaContratualSimulacao;
    this.simulacao.excecoes.minutaEditalCredenciamento = !!this.proposta.minutaEditalSimulacao;
    this.simulacao.excecoes.outro = !!this.proposta.outrosSimulacao;
    this.simulacao.excecoes.textoOutro = this.proposta.outrosSimulacaoDescricao;
  }

  processaCopiaJustificativa() {
    this.simulacao.convenio = 'NOVO'; // : 'ALTERACAO';
    this.simulacao.agendamentosMes = this.agendamentoMes;
    this.simulacao.ticketMedio = this.vticketMedio;

    this.simulacao.migracaoDebito = this.proposta.migracaoConvenio != null;
    if (this.simulacao.migracaoDebito) {
      let contas = this.proposta.migracaoConvenio.split(",");
      for (let conta of contas) {
        for (let item of this.simulacao.contas) {
          if (item.id == conta) {
            item.selected = true;
          }
        }
      }
    }

    this.simulacao.justificativa = this.justificativaInclusao;
    this.simulacao.documentacao = null;
  }

  possuiExcecoes(): boolean {
    const camposExcecao = [
      this.proposta.contadebito,
      this.proposta.inibirRetentativa,
      this.proposta.inibirOpenFinance,
      this.proposta.minutaContratualSimulacao,
      this.proposta.minutaEditalSimulacao,
      this.proposta.outrosSimulacao
    ];

    return camposExcecao.some(Boolean);
  }

  recusarContraProposta(modal: any) {
    this.modalService.dismissAll();
    this.modalService.open(modal, { size: 'lg', scrollable: false, windowClass: 'my-class' });
  }

  aceitarContraProposta(modal: any) {
    this.modalService.dismissAll();
    this.modalService.open(modal, { size: 'lg', scrollable: false, windowClass: 'my-class' });
  }

  avaliarContraProposta(modal: any) {
    if (modal != null) {
      this.modalService.dismissAll();
      this.modalService.open(modal, { size: 'lg', scrollable: false, windowClass: 'my-class' });
    }
  }

  downloadFile(event: any, documento: any) {
    if (documento == null) {
      return;
    }
    const url = `${this.backendUrl}/simulacao/download/${encodeURIComponent(documento.caminhoDocumento)}/${encodeURIComponent(documento.nomeDocumento)}`;
    this.download(event, url, documento.nomeDocumento);
  }

  download(event: any, url: string, fileName: string | null = null) {
    if (event) event.preventDefault();
    this.showMessageDialog("Aguarde...", "Baixando o arquivo " + fileName);

    fetch(url, { method: 'GET' })
      .then((response: any) => {

        if (response && response.status != 200) {
          return response.json();
        }
        return response.blob();
      })
      .then((response) => {
        this.modalService.dismissAll();
        if (response instanceof Blob) {
          const data = URL.createObjectURL(response);
          const link = document.createElement("a");
          link.href = data;
          if (fileName) link.download = fileName;
          link.click();
        } else {
          this.showMessageDialog("Não foi possível efetuar o download", response.mensagem);
        }
      }).catch((err => {
        this.modalService.dismissAll();
        console.error(err);
      }));
  }

  processarDocumento(simulacoesAlcada: any, tipo: number) {

    if (simulacoesAlcada == null || simulacoesAlcada.length == 0) return null;

    for (let alcada of simulacoesAlcada) {

      if (alcada && !alcada.documentos) continue;

      for (let documento of alcada.documentos) {
        if (documento && documento.tipoSituacao && documento.tipoSituacao.id == tipo) return alcada.documentos;
      }
    }
    return null;
  }

  obterMaximoPermitidoTarifaDiferenciada(enumerador: EnumParametros): number {
    return parseFloat(this.obterParametro(enumerador));
  }

  allInputsTarifaDiferenciadaOk(): boolean {
    const inputTarifaDiferenciadaCaixaValido: boolean = !this.pgCaixaInput?.invalid && this.pgCaixaInput.value != null && this.pgCaixaInput.value <= this.obterMaximoPermitidoTarifaDiferenciada(this.enumParametros.TARIFA_TARIFAS_AGENDAMENTO_CAIXA);
    const inputTarifaDiferenciadaOutrosValido: boolean = !this.pgOutrosInput?.invalid && this.pgOutrosInput.value != null && this.pgOutrosInput.value <= this.obterMaximoPermitidoTarifaDiferenciada(this.enumParametros.TARIFA_TARIFAS_AGENDAMENTO_OUTROS);
    const inputTarifaDiferenciadaRetentativaValido: boolean = !this.pgRetentativaInput?.invalid && this.pgRetentativaInput.value != null && this.pgRetentativaInput.value <= this.obterMaximoPermitidoTarifaDiferenciada(this.enumParametros.TARIFA_TARIFAS_RETENTATIVA);
    const inputTarifaDiferenciadaDegustacaoValido: boolean = !this.pgDegustacaoInput?.invalid && this.pgDegustacaoInput.value != null;
    return inputTarifaDiferenciadaCaixaValido && inputTarifaDiferenciadaOutrosValido && inputTarifaDiferenciadaRetentativaValido && inputTarifaDiferenciadaDegustacaoValido;
  }

  resetNivelAlcada(alcadaParaReset: EnumAlcada = EnumAlcada.ALCADA_NAO_CALCULADA): void {
    this.alcadaTarifaDiferenciada = alcadaParaReset;
    this.lastNivelAlcadaTarifaDiferenciada = null;
  }

  inclusaoIcon(): string {
    if (this.sppinerIsLoading) return "refresh";
    return "add";
  }

  private abrirModalResumoSimulacao(dados: ResumoSimulacao): void {
    const modalRef = this.modalService.open(ResumoSimulacaoComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.dados = dados;

    modalRef.closed.subscribe((realizarInclusao: boolean) => {
      if (realizarInclusao) {
        this.solicitarAutorizacao(this.modalInclusao);
      }
    })
  }

  private definirInfoAlcadaAlertParaCondicoesDif(): AlertInfoAlcadaModalResumoSimulacao {
    const nivelNecessario = this.excecaoSelecionada
      ? EnumNivelAlcada.NIVEL_ALCADA_MATRIZ
      : this.nivelAlcadaTarifaDiferenciada;

    const alcadaAtual = this.nivelAlcadaAtual;
    let varianteAlert: DSCVariantComum;
    let mensagemAlert: string;

    if (alcadaAtual >= nivelNecessario) {
      varianteAlert = 'success';
      mensagemAlert = 'Para essas condições a simulação está pré-aprovada!';
    } else {
      varianteAlert = 'warning';
      mensagemAlert = this.excecaoSelecionada
        ? 'Houve excepcionalização, será necessário análise pela Matriz.'
        : 'Para essas condições, será necessária aprovação pelas alçadas superiores.';
    }

    return {
      alcadaCalculada: this.alcadaTarifaDiferenciada,
      varianteAlert,
      mensagemAlert
    };
  }

  private definirInfoAlcadaAlertParaSimulacoesRealizadas(): AlertInfoAlcadaModalResumoSimulacao | null {

    if (!this.excecaoSelecionada || this.nivelAlcadaAtual == EnumNivelAlcada.NIVEL_ALCADA_MATRIZ) return null;

    return {
      alcadaCalculada: EnumAlcada.ALCADA_MATRIZ,
      varianteAlert: 'warning',
      mensagemAlert: 'Houve excepcionalização, será necessário análise pela Matriz.'
    };
  }

  public preencherDadosResumoSimulacao(): ResumoSimulacao {
    const isPleitearCondicoes = this.radioButtonTarifas === this.PLEITEAR_CONDICOES;

    const tarifas = this.obterTarifas(isPleitearCondicoes);
    const grupoMC = this.obterGrupoMC(isPleitearCondicoes);
    const infoAlcadaAlert = this.obterInfoAlcadaAlert(isPleitearCondicoes);
    const excecoes = this.obterExcecoes();
    const documento = this.obterDocumento();

    return {
      grupo: EnumLabelGruposMargemContribuicao[grupoMC] ?? EnumLabelGruposMargemContribuicao.INVALIDO,
      infoGrupo: EnumMensagemGrupo[grupoMC] ?? EnumMensagemGrupo.INVALIDO,
      tarifaPgCaixa: tarifas.pgCaixa ?? "0",
      tarifaPgOutros: tarifas.pgOutros ?? "0",
      tarifaRetentativa: tarifas.retentativa ?? "0",
      diasDegustacao: tarifas.degustacao ?? "0",
      excecoes: excecoes,
      agendamentosPorMes: parseInt(this.simulacao.agendamentosMes) || 0,
      ticketMedio: this.simulacao.ticketMedio || 0,
      justificativa: this.simulacao.justificativa ?? "Sem justificativa",
      documento,
      labelBotaoConfirmar: this.labelBotaoIncluirSimulacao,
      ocorreuExcepcionalizacao: this.excecaoSelecionada,
      ...(infoAlcadaAlert && { infoAlcadaAlert }),
    };
  }

  private obterTarifas(isPleitearCondicoes: boolean) {
    return isPleitearCondicoes
      ? this.valoresTarifaDiferenciadaSelecionada
      : this.simulacao.tarifa;
  }

  private obterGrupoMC(isPleitearCondicoes: boolean) {
    return isPleitearCondicoes
      ? this.grupoMCSelecionadoNoCalculo
      : this.grupoMCSelecionadoAtual;
  }

  private obterInfoAlcadaAlert(isPleitearCondicoes: boolean) {
    return isPleitearCondicoes
      ? this.definirInfoAlcadaAlertParaCondicoesDif()
      : this.definirInfoAlcadaAlertParaSimulacoesRealizadas();
  }

  private obterExcecoes() {
    const excecoes = this.simulacao.excecoes ?? {};
    return {
      contaDebitoDiferente: excecoes.contaDebitoDiferente ?? false,
      inibirRetentativa: excecoes.inibirRetentativa ?? false,
      inibirOpenFinance: excecoes.inibirOpenFinance ?? false,
      minutaContratualForaPadrao: excecoes.minutaContratualForaPadrao ?? false,
      minutaEditalCredenciamento: excecoes.minutaEditalCredenciamento ?? false,
      outro: excecoes.outro ?? false,
      textoOutro: excecoes.textoOutro,
    };
  }

  private obterDocumento() {
    const doc = this.simulacao.documentacao?.[0];
    return doc
      ? { nome: doc.name, tamanho: doc.size }
      : { nome: "Sem documento", tamanho: 0 };
  }

  private abrirSnackBarCarregando(mensagem: string): MatSnackBarRef<any> {
    this.mensagemSnackBarLoading = mensagem;
    return this.snackBar.openFromTemplate(this.loadingToast, {
      duration: undefined,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  onRestricoes(restricoes: RestricoesCliente) {
    if (this.cliente) {
      this.cliente.restricoes = restricoes;
    }
    this.restricoesPai = restricoes;
  }
}
