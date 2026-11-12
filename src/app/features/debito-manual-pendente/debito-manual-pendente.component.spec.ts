import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';

import { DebitoManualPendenteComponent } from './debito-manual-pendente.component';
import { DebitoManualPendenteStore } from './application/store/debito-manual-pendente.store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { EnumModoConsultaDebitoManualPendente } from './domain/debito-manual.enum';
import { Subject } from 'rxjs';

describe('DebitoManualPendenteComponent', () => {
  let component: DebitoManualPendenteComponent;
  let fixture: ComponentFixture<DebitoManualPendenteComponent>;
  let storeMock: jest.Mocked<DebitoManualPendenteStore>;
  let modalMock: jest.Mocked<NgbModal>;

  beforeEach(async () => {

    storeMock = {
      podeMostrarTabela: signal(true),
      isLoading: signal(false),
      debitosFiltradosPaginados: signal([]),
      totalItensFiltrados: signal(0),
      mensagemErro: signal(null),
      paginacaoAtual: signal({ pageIndex: 0 }),
      pageSizeOptions: [10, 20],

      atualizarPaginacao: jest.fn(),
      setTermoFiltro: jest.fn(),
      orquestrarModoDeConsulta: jest.fn(),
      atualizarDebitoManualPendente: jest.fn(),
    } as any;

    modalMock = {
      open: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [DebitoManualPendenteComponent],
      providers: [
        { provide: DebitoManualPendenteStore, useValue: storeMock },
        { provide: NgbModal, useValue: modalMock },
      ],
    }).overrideComponent(DebitoManualPendenteComponent, {
      set: {
        template: '',
        providers: [
          { provide: DebitoManualPendenteStore, useValue: storeMock }
        ]
      }
    }).compileComponents();

    fixture = TestBed.createComponent(DebitoManualPendenteComponent);
    component = fixture.componentInstance;
  });

  it('deve inicializar corretamente', () => {
    const spyFiltro = jest.spyOn<any, any>(component, 'inscreverInputFiltros');
    const spyModo = jest.spyOn<any, any>(component, 'inscreverModoDeConsulta');
    const spyAccordion = jest.spyOn<any, any>(component, 'prepararAccordionItems');

    fixture.detectChanges();

    expect(spyFiltro).toHaveBeenCalled();
    expect(spyModo).toHaveBeenCalled();
    expect(spyAccordion).toHaveBeenCalled();

    expect(storeMock.orquestrarModoDeConsulta)
      .toHaveBeenCalledWith(EnumModoConsultaDebitoManualPendente.PENDENTES);
  });

  it('deve exibir filtro avançado quando modo for SUCESSO', () => {
    component.consultaModeForm.controls.modoConsulta.setValue(
      EnumModoConsultaDebitoManualPendente.SUCESSO
    );

    expect(component.exibirFiltroAvancado).toBe(true);
  });

  it('não deve exibir filtro quando modo for PENDENTES', () => {
    component.consultaModeForm.controls.modoConsulta.setValue(
      EnumModoConsultaDebitoManualPendente.PENDENTES
    );

    expect(component.exibirFiltroAvancado).toBe(false);
  });

  it('deve chamar store com filtros', () => {
    fixture.detectChanges();

    const filtros = { convenio: '123' };

    component.onQueryParams(filtros);

    expect(storeMock.orquestrarModoDeConsulta)
      .toHaveBeenCalledWith(EnumModoConsultaDebitoManualPendente.SUCESSO, filtros);
  });

  it('deve gerar chave correta no trackBy', () => {
    const debito = { convenioId: 1, periodo: '2026-05' } as any;

    expect(component.trackByConvenioPeriodo(0, debito))
      .toBe('1-2026-05');
  });

  it('deve atualizar paginação', () => {
    fixture.detectChanges();

    const event = { pageIndex: 1 } as any;

    component.onPageChange(event);

    expect(storeMock.atualizarPaginacao).toHaveBeenCalledWith(event);
  });

  it('deve debounciar envio de filtro', fakeAsync(() => {
    fixture.detectChanges();

    component.inputFiltro.setValue('teste');

    tick(300);

    expect(storeMock.setTermoFiltro).toHaveBeenCalledWith('teste');
  }));

  it('deve reagir mudança de modoConsulta', () => {
    fixture.detectChanges();

    component.consultaModeForm.controls.modoConsulta.setValue(
      EnumModoConsultaDebitoManualPendente.SUCESSO
    );

    expect(storeMock.orquestrarModoDeConsulta).toHaveBeenCalled();
  });

  it('deve preparar accordion', () => {
    component['prepararAccordionItems']();

    expect(component.accordionItems).toEqual([
      expect.objectContaining({
        title: 'Filtro específico',
        expanded: true
      })
    ]);
  });

  it('deve abrir modal e atualizar store ao fechar com valor', () => {
    fixture.detectChanges();

    const debito = { id: 1 } as any;
    const closed$ = new Subject<any>();

    modalMock.open.mockReturnValue({
      componentInstance: {},
      closed: closed$.asObservable(),
    } as any);

    component.abrirModalAutorizar(debito);

    closed$.next(debito);

    expect(storeMock.atualizarDebitoManualPendente)
      .toHaveBeenCalledWith(debito);
  });

  it('não deve atualizar store se modal retornar null', () => {
    fixture.detectChanges();

    const debito = { id: 1 } as any;
    const closed$ = new Subject<any>();

    modalMock.open.mockReturnValue({
      componentInstance: {},
      closed: closed$.asObservable(),
    } as any);

    component.abrirModalAutorizar(debito);

    closed$.next(null);

    expect(storeMock.atualizarDebitoManualPendente).not.toHaveBeenCalled();
  });

  it('deve desabilitar modoConsulta quando loading = true', () => {
    component['toggleModoConsultaDisabled'](true);

    expect(component.consultaModeForm.controls.modoConsulta.disabled).toBe(true);
  });

  it('deve habilitar modoConsulta quando loading = false', () => {
    component['toggleModoConsultaDisabled'](false);

    expect(component.consultaModeForm.controls.modoConsulta.enabled).toBe(true);
  });
});
