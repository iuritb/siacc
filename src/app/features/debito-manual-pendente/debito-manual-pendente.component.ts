import { ViewChild, TemplateRef, Component, DestroyRef, OnInit, ChangeDetectionStrategy, effect, Type } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DebitoManualPendenteFormatado } from './domain/debito-manual-pendente.model';
import { PageEvent } from '@angular/material/paginator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalAcertoManualDebitoComponent } from './presentation/modal-acerto-manual-debito/modal-acerto-manual-debito.component';
import { EnumModoConsultaDebitoManualPendente } from './domain/debito-manual.enum';
import { filtrosAvancadosConfigs } from './domain/filtros-avancados-debito-manual';
import { DebitoManualPendenteStore } from './application/store/debito-manual-pendente.store';
import { DscAccordionItem } from 'sidsc-components/dsc-accordion';
import { ModalAutorizarDebitoComponent } from './presentation/modal-autorizar-debito/modal-autorizar-debito.component';
import { ModalRetentarDebitoComponent } from './presentation/modal-retentar-debito/modal-retentar-debito.component';

@Component({
  selector: 'app-debito-manual-pendente',
  templateUrl: './debito-manual-pendente.component.html',
  styleUrls: ['./debito-manual-pendente.component.scss'],
  providers: [DebitoManualPendenteStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DebitoManualPendenteComponent implements OnInit {

  @ViewChild('filtroDinamico', { static: true }) filtroDinamico!: TemplateRef<any>;


  readonly inputFiltro = new FormControl<string>('', { nonNullable: true });
  readonly consultaModeForm = new FormGroup({
    modoConsulta: new FormControl<EnumModoConsultaDebitoManualPendente>(EnumModoConsultaDebitoManualPendente.PENDENTES, {
      nonNullable: true,
    })
  });

  readonly filtroAvancado = filtrosAvancadosConfigs;
  readonly EnumModoConsultaDebitoManualPendente = EnumModoConsultaDebitoManualPendente;

  readonly podeMostrarTabela = this.store.podeMostrarTabela;
  readonly isLoading = this.store.isLoading;
  readonly debitosFormatadosFiltrados = this.store.debitosFiltradosPaginados;
  readonly totalItensFiltrados = this.store.totalItensFiltrados;
  readonly mensagemErro = this.store.mensagemErro;
  readonly paginacao = this.store.paginacaoAtual;
  readonly pageSizeOptions = this.store.pageSizeOptions;
  accordionItems!: DscAccordionItem[];

  constructor(
    private readonly store: DebitoManualPendenteStore,
    private readonly destroyRef: DestroyRef,
    private readonly modalService: NgbModal,
  ) {
    effect(() => this.toggleModoConsultaDisabled(this.isLoading()));
  }

  ngOnInit(): void {
    this.prepararAccordionItems();
    this.inscreverInputFiltros();
    this.inscreverModoDeConsulta();
    this.store.orquestrarModoDeConsulta(EnumModoConsultaDebitoManualPendente.PENDENTES);
  }

  public get exibirFiltroAvancado(): boolean {
    return this.consultaModeForm.controls.modoConsulta.value === EnumModoConsultaDebitoManualPendente.SUCESSO;
  }

  public onQueryParams(filtros: Record<string, string>): void {
    this.store.orquestrarModoDeConsulta(EnumModoConsultaDebitoManualPendente.SUCESSO, filtros);
  }

  public trackByConvenioPeriodo(index: number, debito: DebitoManualPendenteFormatado): string {
    return `${debito.convenioId}-${debito.periodo}`;
  }

  public onPageChange(event: PageEvent): void {
    this.store.atualizarPaginacao(event);
  }


  abrirModalAutorizar(debito: DebitoManualPendenteFormatado) {
    this.abrirModal(ModalAutorizarDebitoComponent, debito);
  }

  abrirModalRetentar(debito: DebitoManualPendenteFormatado) {
    this.abrirModal(ModalRetentarDebitoComponent, debito);
  }

  abrirModalAcertoManual(debito: DebitoManualPendenteFormatado) {
    this.abrirModal(ModalAcertoManualDebitoComponent, debito);
  }

  private abrirModal<T>(component: Type<T>, debito: DebitoManualPendenteFormatado): void {
    const modalRef = this.modalService.open(component, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: true
    });

    modalRef.componentInstance.inputDebitoFormatado = debito;

    modalRef.closed
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((debitoAtualizado: DebitoManualPendenteFormatado | null) => {
        if (debitoAtualizado) {
          this.store.atualizarDebitoManualPendente(debitoAtualizado);
        }
      });
  }

  private inscreverInputFiltros(): void {
    this.inputFiltro.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((termo) => this.store.setTermoFiltro(termo));
  }

  private inscreverModoDeConsulta(): void {
    this.consultaModeForm.controls.modoConsulta.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((valor) => this.store.orquestrarModoDeConsulta(valor));
  }

  private prepararAccordionItems(): void {
    this.accordionItems = [
      {
        title: 'Filtro específico',
        template: this.filtroDinamico,
        expanded: true,
      }
    ]
  }

  private toggleModoConsultaDisabled(isLoading: boolean): void {
    const control = this.consultaModeForm.controls.modoConsulta;

    isLoading
      ? control.disable({ emitEvent: false })
      : control.enable({ emitEvent: false });
  }
}
