import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardDebitoPendenteComponent } from './card-debito-pendente.component';
import { EnumSituacaoDebitoManual } from '../../domain/debito-manual.enum';
import { createMockDebitoManualPendenteFormatado } from '../../../../../test-helpers/createMockDebitoManualPendente';

const mockDebitoFormatado = createMockDebitoManualPendenteFormatado();

describe('CardDebitoPendenteComponent', () => {
  let component: CardDebitoPendenteComponent;
  let fixture: ComponentFixture<CardDebitoPendenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [CardDebitoPendenteComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CardDebitoPendenteComponent);
    component = fixture.componentInstance;
    component.debitoFormatado = mockDebitoFormatado;
    component.index = 3;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar os dados principais do débito', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('[data-qa="card-debito-pendente-convenio-valor-3"]')?.textContent).toContain('123');
    expect(elemento.querySelector('[data-qa="card-debito-pendente-cliente-razao-social-3"]')?.textContent).toContain('Empresa Teste');
    expect(elemento.querySelector('[data-qa="card-debito-pendente-mes-ref-valor-3"]')?.textContent).toContain('06/2026');
    expect(elemento.querySelector('[data-qa="card-debito-pendente-valor-apurado-valor-3"]')?.textContent).toContain('R$ 1.000,00');
  });

  it('deve alternar a exibição dos detalhes ao acionar onToggleDetalhes', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('[data-qa="card-debito-pendente-detalhes-expandido-3"]')).toBeNull();

    component.onToggleDetalhes();
    fixture.detectChanges();

    expect(elemento.querySelector('[data-qa="card-debito-pendente-detalhes-expandido-3"]')).not.toBeNull();
    const cobrancaCaixa = mockDebitoFormatado.cobrancasFormatadas.find(c => c.tipo === 'CAIXA');
    if (cobrancaCaixa) {
      expect(elemento.querySelector(`[data-qa="card-debito-pendente-detalhes-expandido-CAIXA-valor-3"]`)?.textContent).toContain(cobrancaCaixa.valorFormatado);
    }

    component.onToggleDetalhes();
    fixture.detectChanges();

    expect(elemento.querySelector('[data-qa="card-debito-pendente-detalhes-expandido-3"]')).toBeNull();
  });

  it('deve exibir os botões de ação conforme as permissões', () => {
    const elemento = fixture.nativeElement as HTMLElement;

    expect(elemento.querySelector('[data-qa="card-debito-pendente-acao-autorizar-3"]')).not.toBeNull();
    expect(elemento.querySelector('[data-qa="card-debito-pendente-acao-retentar-3"]')).toBeNull();
    expect(elemento.querySelector('[data-qa="card-debito-pendente-acao-acerto-manual-3"]')).not.toBeNull();
  });

  it('deve retornar a classe de status esperada', () => {
    expect(component.obterClasseStatusDebitoManual(EnumSituacaoDebitoManual.FATAL)).toBe('status-vermelho');
    expect(component.obterClasseStatusDebitoManual(EnumSituacaoDebitoManual.SUCESSO)).toBe('status-verde');
  });

  it('deve emitir o débito ao chamar onAutorizarDebito', () => {
    const spyEmit = jest.spyOn(component.acaoAutorizar, 'emit');

    component.onAutorizarDebito();

    expect(spyEmit).toHaveBeenCalledTimes(1);
    expect(spyEmit).toHaveBeenCalledWith(mockDebitoFormatado);
  });

  it('deve emitir o débito ao chamar onRetentarDebito', () => {
    const spyEmit = jest.spyOn(component.acaoRetentar, 'emit');

    component.onRetentarDebito();

    expect(spyEmit).toHaveBeenCalledTimes(1);
    expect(spyEmit).toHaveBeenCalledWith(mockDebitoFormatado);
  });

  it('deve emitir acerto manual com o débito atual', () => {
    const spyEmit = jest.spyOn(component.acaoAcertoManual, 'emit');

    component.onAcertoManual();

    expect(spyEmit).toHaveBeenCalledTimes(1);
    expect(spyEmit).toHaveBeenCalledWith(mockDebitoFormatado);
  });

  it('deve marcar detalhesExpandidos como true quando expandir e false quando recolher', () => {
    expect(component.detalhesExpandidos()).toBe(false);

    component.onToggleDetalhes();
    expect(component.detalhesExpandidos()).toBe(true);

    component.onToggleDetalhes();
    expect(component.detalhesExpandidos()).toBe(false);
  });
});
