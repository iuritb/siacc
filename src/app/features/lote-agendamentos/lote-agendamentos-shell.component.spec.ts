import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LoteAgendamentosShellComponent } from './lote-agendamentos-shell.component';
import { LoteAgendamentosStore } from './application/lote-agendamentos.store';
import { EnumSituacaoCobrancaLote } from './domain/lote-agendamentos.enum';
import { ScrollService } from '../../services/scroll/scroll.service';

describe('LoteAgendamentosShellComponent', () => {
  let component: LoteAgendamentosShellComponent;
  let fixture: ComponentFixture<LoteAgendamentosShellComponent>;
  let store: LoteAgendamentosStore;
  let scrollServiceMock: { scrollTop: jest.Mock };

  beforeEach(async () => {
    scrollServiceMock = { scrollTop: jest.fn() };

    await TestBed.configureTestingModule({
      declarations: [LoteAgendamentosShellComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        LoteAgendamentosStore,
        { provide: ScrollService, useValue: scrollServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoteAgendamentosShellComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(LoteAgendamentosStore);
  });

  it('deve criar componente shell', () => {
    expect(component).toBeTruthy();
  });

  it('deve emitir voltar filtro e resetar estado', () => {
    const emitSpy = jest.spyOn(component.onVoltarFiltro, 'emit');

    store.selecionarLote({ idLote: 99, convenio: 88 });
    component.voltarParaFiltro();

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(store.exibirListaLotes()).toBe(true);
    expect(scrollServiceMock.scrollTop).toHaveBeenCalledTimes(1);
  });

  it('deve selecionar lote no store', () => {
    component.selecionarLote({ idLote: 10, convenio: 20 });

    expect(store.exibirDetalheLote()).toBe(true);
    expect(store.loteSelecionado()).toEqual({ idLote: 10, convenio: 20 });
    expect(scrollServiceMock.scrollTop).toHaveBeenCalledTimes(1);
  });

  it('deve selecionar agendamento no store com regra de consulta', () => {
    const cob = {
      txid: 'txid-1',
      situacao: EnumSituacaoCobrancaLote.SUCESSO,
      status: 'ATIVA',
      integracao: []
    } as any;

    component.detalharAgendamento(cob);

    expect(store.exibirDetalheAgendamento()).toBe(true);
    expect(store.agendamentoSelecionado()?.deveConsultarApi).toBe(true);
    expect(scrollServiceMock.scrollTop).toHaveBeenCalledTimes(1);
  });

  it('deve selecionar agendamento sem consulta quando status nao existir', () => {
    const cob = {
      txid: 'txid-2',
      situacao: EnumSituacaoCobrancaLote.SUCESSO,
      status: undefined,
      integracao: []
    } as any;

    component.detalharAgendamento(cob);

    expect(store.agendamentoSelecionado()?.deveConsultarApi).toBe(false);
    expect(scrollServiceMock.scrollTop).toHaveBeenCalledTimes(1);
  });

  it('deve voltar para lista de lotes', () => {
    store.selecionarLote({ idLote: 1, convenio: 2 });

    component.voltarParaListaLotes();

    expect(store.exibirListaLotes()).toBe(true);
    expect(store.loteSelecionado()).toBeNull();
    expect(scrollServiceMock.scrollTop).toHaveBeenCalledTimes(1);
  });

  it('deve voltar para detalhe do lote', () => {
    store.selecionarLote({ idLote: 1, convenio: 2 });
    component.detalharAgendamento({
      txid: 'txid-3',
      situacao: EnumSituacaoCobrancaLote.SUCESSO,
      status: 'ATIVA',
      integracao: []
    } as any);

    component.voltarParaDetalheLote();

    expect(store.exibirDetalheLote()).toBe(true);
    expect(store.agendamentoSelecionado()).toBeNull();
    expect(scrollServiceMock.scrollTop).toHaveBeenCalledTimes(2);
  });
});
