import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DscButtonComponent } from 'sidsc-components/dsc-button';
import { DscTooltipModule } from 'sidsc-components/dsc-tooltip';
import { DscInputComponent } from 'sidsc-components/dsc-input';
import { DscInputCurrencyComponent } from 'sidsc-components/dsc-input-currency';
import { DscInputFileComponent } from 'sidsc-components/dsc-input-file';
import { DscCheckboxComponent } from 'sidsc-components/dsc-checkbox';
import { DscRadioButtonComponent } from 'sidsc-components/dsc-radio-button';
import { DscDatepickerComponent } from 'sidsc-components/dsc-datepicker';
import { DscSelectComponent } from 'sidsc-components/dsc-select';
import { DscTableComponent } from 'sidsc-components/dsc-table';
import { DscTextareaComponent } from 'sidsc-components/dsc-textarea';
import { DscTabGroupComponent, DscTabComponent } from 'sidsc-components/dsc-tab-group';
import { DscBreadcrumbComponent } from "sidsc-components/dsc-breadcrumb";
import { DscAlertComponent } from 'sidsc-components/dsc-alert';
import { DscProgressSpinnerComponent } from 'sidsc-components/dsc-progress-spinner';
import { DscDialogModule } from 'sidsc-components/dsc-dialog';
import { AppRoutingModule } from "./app-routing.module";
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DscProgressBarComponent } from 'sidsc-components/dsc-progress-bar';
import { DscPaginatorComponent } from 'sidsc-components/dsc-paginator';

import { AppComponent } from "./app.component";
import { SimuladorComponent } from "./pages/simulador/simulador.component";
import { ConvenioComponent } from './pages/convenio/convenio.component';
import { ParametrosGeraisComponent } from "./pages/parametros-gerais/parametros-gerais.component";
import { ParametrosTextoComponent } from "./pages/parametros-texto/parametros-texto.component";
import { ParametrosTarifaComponent } from "./pages/parametros-tarifa/parametros-tarifa.component";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { ParcelModule } from 'single-spa-angular/parcel';
import { MatPaginatorIntl, MatPaginatorModule } from "@angular/material/paginator";
import { AngularEditorModule } from '@wfpena/angular-wysiwyg';
import { DscSwitchComponent } from 'sidsc-components/dsc-switch';
import { RelatorioRepasseComponent } from "./pages/relatoriorepasse/relatoriorepasse.component";
import { RelatorioRemessaComponent } from "./pages/relatorioremessa/relatorioremessa.component";
import { RelatorioLoteCobrComponent } from "./pages/relatoriolotecobr/relatoriolotecobr.component";
import { DetalhamentoComponent } from './shared/detalhamento/detalhamento.component';
import { TabelaBaseComponent } from './shared/tabelas/tabela-base/tabela-base.component';
import { TabelaComumDetalheComponent } from './shared/tabelas/tabela-comum-detalhe/tabela-comum-detalhe.component';
import { TabelaIconeComponent } from './shared/tabelas/tabela-icone/tabela-icone.component';
import { CancelarAutorizacaoComponent } from './shared/autorizacao/cancelar-autorizacao/cancelar-autorizacao.component';
import { HeaderComponent } from './shared/header/header.component';
import { FiltroRelatorioMovimentacaoComponent } from './shared/filtro-relatorio-movimentacao/filtro-relatorio-movimentacao.component';
import { RelatoriosMovimentacaoComponent } from './pages/relatorios-movimentacao/relatorios-movimentacao.component';
import { ListaAgendamentoComponent } from './shared/agendamento/lista-agendamento/lista-agendamento.component';
import { TabelaResumoAgendamentoComponent } from './shared/tabelas/tabela-resumo-agendamento/tabela-resumo-agendamento.component';
import { TabelaDetalhamentoAgendamentoComponent } from './shared/tabelas/tabela-detalhamento-agendamento/tabela-detalhamento-agendamento.component';
import { CancelarAgendamentoComponent } from "./shared/agendamento/cancelar-agendamento/cancelar-agendamento.component";
import { TabelaAutorizacaoComponent } from "./shared/autorizacao/tabela-autorizacao/tabela-autorizacao.component";
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DscSnackbarModule } from 'sidsc-components/dsc-snackbar';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatMomentDateModule, MomentDateAdapter } from '@angular/material-moment-adapter';
import { TabelaExibeIconesComponent } from './shared/tabelas/tabela-exibe-icones/tabela-exibe-icones.component';
import { IndiceTarifasComponent } from "./shared/parametros-tarifa/indice-tarifas/indice-tarifas.component";
import { FiltroDinamicoComponent } from "./shared/filtro-dinamico/filtro-dinamico.component";
import { RelatoriosComponent } from "./pages/relatorios/relatorios.component";
import { ResumoSimulacaoComponent } from "./shared/modal/resumo-simulacao/resumo-simulacao.component";
import { DescontoAlcadaComponent } from "./shared/parametros-tarifa/desconto-alcada/desconto-alcada.component";
import { SimulacoesPendentesComponent } from './pages/simulacoes-pendentes/simulacoes-pendentes.component';
import { SimulacaoPendenteComponent } from "./shared/modal/simulacao-pendente/simulacao-pendente.component";
import { AvaliarSimulacaoComponent } from "./shared/modal/avaliar-simulacao/avaliar-simulacao.component";
import { ConveniosPendentesComponent } from "./pages/convenios-pendentes/convenios-pendentes.component";
import { ConvenioPendenteComponent } from "./shared/modal/convenio-pendente/convenio-pendente.component";
import { DscAccordionComponent } from "sidsc-components/dsc-accordion";
import { AvaliarConvenioComponent } from "./shared/modal/avaliar-convenio/avaliar-convenio.component";
import { FeedbackGenericoComponent } from "./shared/modal/feedback-generico/feedback-generico.component";
import { FormularioAlterarConvenioComponent } from "./shared/convenio/alterar/formulario-alterar-convenio/formulario-alterar-convenio.component";
import { ConfirmarAlteracaoConvenioComponent } from "./shared/modal/confirmar-alteracao-convenio/confirmar-alteracao-convenio.component";
import { CancelarGenericoComponent } from "./shared/modal/cancelar-generico/cancelar-generico.component";
import { HistoricoAlteracaoConvenioComponent } from "./shared/historico-alteracoes-convenio/historico-alteracoes-convenio.component";
import { CompararAlteracaoComponent } from "./shared/comparar-alteracao/comparar-alteracao.component";
import { DetalhamentoAlteracaoConvenioComponent } from "./shared/modal/detalhamento-alteracao-convenio/detalhamento-alteracao-convenio.component";
import { CampoAlteravelComponent } from "./shared/campo-alteravel/campo-alteravel.component";
import { AvaliarAlteracaoConvenioComponent } from "./shared/modal/avaliar-alteracao-convenio/avaliar-alteracao-convenio.component";
import { DscStepperComponent } from 'sidsc-components/dsc-stepper';
import { CardTarifasComponent as CardTarifasAlterarConvenio } from "./shared/convenio/alterar/card-tarifas/card-tarifas.component";
import { FeedbackAlteracaoConvenioComponent } from "./shared/modal/feedback-alteracao-convenio/feedback-alteracao-convenio.component";
import { CardIconesRestricaoComponent } from "./shared/card-icones-restricao/card-icones-restricao.component";
import { NotificacaoEmailComponent } from "./shared/parametros-gerais/notificacao-email/notificacao-email.component";
import { ExcluirEmailNotificacaoComponent } from "./shared/parametros-gerais/excluir-email-notificacao/excluir-email-notificacao.component";
import { IncluirEmailNotificacaoComponent } from "./shared/parametros-gerais/incluir-email-notificacao/incluir-email-notificacao.component";
import { ConsultaApelidoVanComponent } from "./shared/consulta-apelido-van/consulta-apelido-van.component";
import { ManutencaoVanComponent } from './pages/manutencao-van/manutencao-van.component';
import { ListaVanComponent } from "./shared/lista-van/lista-van.component";
import { CardVanComponent } from "./shared/card-van/card-van.component";
import { FormularioIncluirVanComponent } from "./shared/modal/formulario-incluir-van/formulario-incluir-van.component";
import { HabilitarDesabilitarVanComponent } from "./shared/modal/habilitar-desabilitar-van/habilitar-desabilitar-van.component";
import { ResumoVanComponent } from "./shared/resumo-van/resumo-van.component";
import { ExcluirVanComponent } from "./shared/modal/excluir-van/excluir-van.component";
import { CardTarifasComponent as CardTarifasIncluirConvenio } from "./shared/convenio/incluir/card-tarifas/card-tarifas.component"
import { CardAssinaturasGeralComponent } from "./shared/convenio/incluir/card-assinaturas-geral/card-assinaturas-geral.component";
import { CardDadosCadastraisComponent } from "./shared/convenio/incluir/card-dados-cadastrais/card-dados-cadastrais.component";
import { CardParametrosComponent } from "./shared/convenio/incluir/card-parametros/card-parametros.component";
import { IncluirConvenioComponent } from "./shared/convenio/incluir/incluir-convenio/incluir-convenio.component";
import { CardDetalhesComponent as CardDetalhesComponentAlterarConvenio } from "./shared/convenio/alterar/card-detalhes/card-detalhes.component";
import { ContratoConvenioComponent } from "./shared/convenio/contrato/contrato-convenio/contrato-convenio.component";
import { DirecionarSimuladorComponent } from "./shared/convenio/incluir/modal/direcionar-simulador/direcionar-simulador.component";
import { IncluirAssinanteComponent } from "./shared/convenio/incluir/modal/incluir-assinante/incluir-assinante.component";
import { ConfirmarInclusaoConvenioComponent } from "./shared/convenio/incluir/modal/confirmar-inclusao-convenio/confirmar-inclusao-convenio.component";
import { CardConsultaComponent } from "./shared/convenio/consultar/card-consulta/card-consulta.component";
import { TabelaConveniosComponent } from "./shared/convenio/consultar/tabela-convenios/tabela-convenios.component";
import { DetalharConvenioComponent } from "./shared/convenio/detalhar/detalhar-convenio/detalhar-convenio.component";
import { CardInfoGeralComponent } from "./shared/convenio/detalhar/card-info-geral/card-info-geral.component";
import { CardEnderecoComponent } from "./shared/convenio/detalhar/card-endereco/card-endereco.component";
import { CardContatoComponent } from "./shared/convenio/detalhar/card-contato/card-contato.component";
import { CardDadosPixAutomaticoComponent } from "./shared/convenio/detalhar/card-dados-pix-automatico/card-dados-pix-automatico.component";
import { CardDadosAssinaturasComponent } from "./shared/convenio/detalhar/card-dados-assinaturas/card-dados-assinaturas.component";
import { RelatoriosRemessaComponent } from './pages/relatorios-remessa/relatorios-remessa.component';
import { DayPickerComponent } from "./shared/day-picker/day-picker.component";
import { ModalConfirmacaoDesbloquearConvenioComponent } from "./shared/convenio/detalhar/components/modal-confirmacao-desbloquear-convenio/modal-confirmacao-desbloquear-convenio.component";
import { FiltroDataMesAnoComponent } from "./shared/filtro-data-mes-ano/filtro-data-mes-ano.component";
import { MatRadioModule } from "@angular/material/radio";
import { DetalhamentoAutorizacaoComponent } from "./shared/autorizacao/detalhamento-autorizacao/detalhamento-autorizacao.component";
import { DetalhamentoAgendamentoComponent } from "./shared/agendamento/detalhamento-agendamento/detalhamento-agendamento.component";
import { DebitoManualPendenteComponent } from "./features/debito-manual-pendente/debito-manual-pendente.component";
import { CardDebitoPendenteComponent } from "./features/debito-manual-pendente/presentation/card-debito-pendente/card-debito-pendente.component";
import { ModalAutorizarDebitoComponent } from "./features/debito-manual-pendente/presentation/modal-autorizar-debito/modal-autorizar-debito.component";
import { ModalAcertoManualDebitoComponent } from "./features/debito-manual-pendente/presentation/modal-acerto-manual-debito/modal-acerto-manual-debito.component";
import { ModalRetentarDebitoComponent } from './features/debito-manual-pendente/presentation/modal-retentar-debito/modal-retentar-debito.component';
import { AutorizacoesAgendamentosComponent } from "./features/autorizacoes-agendamentos/autorizacoes-agendamentos.component";
import { LoteAgendamentosShellComponent } from './features/lote-agendamentos/lote-agendamentos-shell.component';
import { TabelaLoteComponent } from './features/lote-agendamentos/subfeatures/tabela-lote/tabela-lote.component';
import { DetalhamentoLoteComponent } from './features/lote-agendamentos/subfeatures/detalhamento-lote/detalhamento-lote.component';
import { DetalhamentoAgendamentoLoteComponent } from './features/lote-agendamentos/subfeatures/detalhamento-agendamento-lote/detalhamento-agendamento-lote.component';

export const MY_DATE_FORMAT = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};

@NgModule({
  declarations: [
    AppComponent,
    SimuladorComponent,
    ConvenioComponent,
    ParametrosGeraisComponent,
    ParametrosTextoComponent,
    ParametrosTarifaComponent,
    RelatorioRepasseComponent,
    RelatorioRemessaComponent,
    RelatorioLoteCobrComponent,
    DetalhamentoComponent,
    TabelaBaseComponent,
    TabelaComumDetalheComponent,
    TabelaIconeComponent,
    CancelarAutorizacaoComponent,
    HeaderComponent,
    RelatoriosMovimentacaoComponent,
    ListaAgendamentoComponent,
    TabelaResumoAgendamentoComponent,
    TabelaDetalhamentoAgendamentoComponent,
    CancelarAgendamentoComponent,
    TabelaAutorizacaoComponent,
    FiltroRelatorioMovimentacaoComponent,
    AutorizacoesAgendamentosComponent,
    TabelaExibeIconesComponent,
    IndiceTarifasComponent,
    FiltroDinamicoComponent,
    RelatoriosComponent,
    ResumoSimulacaoComponent,
    DescontoAlcadaComponent,
    SimulacoesPendentesComponent,
    SimulacaoPendenteComponent,
    AvaliarSimulacaoComponent,
    ConveniosPendentesComponent,
    ConvenioPendenteComponent,
    AvaliarConvenioComponent,
    FeedbackGenericoComponent,
    FormularioAlterarConvenioComponent,
    ConfirmarAlteracaoConvenioComponent,
    CancelarGenericoComponent,
    HistoricoAlteracaoConvenioComponent,
    CompararAlteracaoComponent,
    DetalhamentoAlteracaoConvenioComponent,
    CampoAlteravelComponent,
    AvaliarAlteracaoConvenioComponent,
    CancelarGenericoComponent,
    CompararAlteracaoComponent,
    CardTarifasAlterarConvenio,
    CardDetalhesComponentAlterarConvenio,
    FeedbackAlteracaoConvenioComponent,
    FiltroDataMesAnoComponent,
    RelatoriosRemessaComponent,
    CardIconesRestricaoComponent,
    NotificacaoEmailComponent,
    ExcluirEmailNotificacaoComponent,
    IncluirEmailNotificacaoComponent,
    ConsultaApelidoVanComponent,
    ManutencaoVanComponent,
    ListaVanComponent,
    CardVanComponent,
    FormularioIncluirVanComponent,
    HabilitarDesabilitarVanComponent,
    ResumoVanComponent,
    ExcluirVanComponent,
    CardTarifasIncluirConvenio,
    CardAssinaturasGeralComponent,
    CardDadosCadastraisComponent,
    CardParametrosComponent,
    IncluirConvenioComponent,
    ContratoConvenioComponent,
    DirecionarSimuladorComponent,
    IncluirAssinanteComponent,
    ConfirmarInclusaoConvenioComponent,
    CardConsultaComponent,
    TabelaConveniosComponent,
    DetalharConvenioComponent,
    CardInfoGeralComponent,
    CardEnderecoComponent,
    CardContatoComponent,
    CardDadosPixAutomaticoComponent,
    CardDadosAssinaturasComponent,
    ExcluirVanComponent,
    DayPickerComponent,
    ModalConfirmacaoDesbloquearConvenioComponent,
    DetalhamentoAutorizacaoComponent,
    DetalhamentoAgendamentoComponent,
    DebitoManualPendenteComponent,
    CardDebitoPendenteComponent,
    ModalAcertoManualDebitoComponent,
    ModalRetentarDebitoComponent,
    ModalAutorizarDebitoComponent,
    LoteAgendamentosShellComponent,
    TabelaLoteComponent,
    DetalhamentoLoteComponent,
    DetalhamentoAgendamentoLoteComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatIconModule,
    DscButtonComponent,
    DscTooltipModule,
    DscInputComponent,
    DscInputCurrencyComponent,
    DscInputFileComponent,
    DscDatepickerComponent,
    DscCheckboxComponent,
    DscRadioButtonComponent,
    DscSelectComponent,
    DscTableComponent,
    DscTextareaComponent,
    DscBreadcrumbComponent,
    DscTabGroupComponent,
    DscTabComponent,
    DscDialogModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatRadioModule,
    ParcelModule,
    NgbModule,
    AngularEditorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    DscSwitchComponent,
    ReactiveFormsModule,
    DscAlertComponent,
    DscProgressSpinnerComponent,
    DscProgressBarComponent,
    DscPaginatorComponent,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    DscSnackbarModule,
    MatMomentDateModule,
    HttpClientModule,
    DscProgressBarComponent,
    DscAccordionComponent,
    DscStepperComponent
  ],
  providers: [
    {
      provide: MatPaginatorIntl,
      useValue: getPortuguesePaginatorIntl()
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'pt-BR',
    },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


const portugueseRangeLabel = (page: number, pageSize: number, length: number) => {
  if (length === 0 || pageSize === 0) { return `0 de ${length}`; }

  length = Math.max(length, 0);

  const startIndex = page * pageSize;

  const endIndex = startIndex < length ?
    Math.min(startIndex + pageSize, length) :
    startIndex + pageSize;

  return `${startIndex + 1} - ${endIndex} de ${length}`;
};



export function getPortuguesePaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) { return `0 de ${length}`; }

    length = Math.max(length, 0);

    const startIndex = page * pageSize;

    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;

    return `${startIndex + 1} - ${endIndex} de ${length}`;
  };


  return paginatorIntl;
}
