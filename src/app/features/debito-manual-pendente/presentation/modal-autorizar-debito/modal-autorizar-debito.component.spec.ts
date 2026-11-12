import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DscSnackbarService } from 'sidsc-components/dsc-snackbar';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalAutorizarDebitoComponent } from './modal-autorizar-debito.component';
import { EnumSituacaoDebitoManual } from '../../domain/debito-manual.enum';
import { FeedbackGenericoComponent } from '../../../../shared/modal/feedback-generico/feedback-generico.component';
import { ModalAutorizarDebitoStore } from '../../application/store/modal-autorizar-debito.store';
import { createMockDebitoManualPendenteFormatado } from '../../../../../test-helpers/createMockDebitoManualPendente';

const mockDebito = createMockDebitoManualPendenteFormatado();

describe('ModalAutorizarDebitoComponent', () => {
  let component: ModalAutorizarDebitoComponent;
  let fixture: ComponentFixture<ModalAutorizarDebitoComponent>;

  let activeModalMock: { close: jest.Mock; dismiss: jest.Mock };
  let modalServiceMock: { open: jest.Mock };
  let snackbarServiceMock: { add: jest.Mock };
  let storeMock: {
    inicializar: jest.Mock;
    cancelarRequisicaoAtual: jest.Mock;
    autorizarDebito: jest.Mock;
    isSending: jest.Mock;
    debitoFormatado: jest.Mock;
    cobrancaFoiAtualizada: jest.Mock;
    cobrancasParaAutorizar: jest.Mock;
  };

  beforeEach(async () => {
    activeModalMock = {
      close: jest.fn(),
      dismiss: jest.fn(),
    };

    modalServiceMock = {
      open: jest.fn().mockReturnValue({
        componentInstance: { feedback: null }
      })
    };

    snackbarServiceMock = {
      add: jest.fn()
    };

    storeMock = {
      inicializar: jest.fn(),
      cancelarRequisicaoAtual: jest.fn(),
      autorizarDebito: jest.fn(),
      isSending: jest.fn(() => false),
      debitoFormatado: jest.fn(() => mockDebito),
      cobrancaFoiAtualizada: jest.fn(() => false),
      cobrancasParaAutorizar: jest.fn(() => []),
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, NoopAnimationsModule],
      declarations: [ModalAutorizarDebitoComponent],
      providers: [
        { provide: NgbActiveModal, useValue: activeModalMock },
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: DscSnackbarService, useValue: snackbarServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(ModalAutorizarDebitoComponent, {
        set: {
          providers: [
            { provide: ModalAutorizarDebitoStore, useValue: storeMock }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ModalAutorizarDebitoComponent);
    component = fixture.componentInstance;
    component.inputDebitoFormatado = mockDebito;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar a store com o débito informado', () => {
    storeMock.inicializar.mockClear();

    component.ngOnInit();

    expect(storeMock.inicializar).toHaveBeenCalledTimes(1);
    expect(storeMock.inicializar).toHaveBeenCalledWith(mockDebito);
  });

  it('deve fechar o modal sem débito atualizado quando não houver atualização', () => {
    component.fecharModal();

    expect(storeMock.cancelarRequisicaoAtual).toHaveBeenCalledTimes(1);
    expect(activeModalMock.close).toHaveBeenCalledWith(null);
  });

  it('deve fechar o modal com o débito atualizado quando houver atualização', () => {
    const debitoAtualizado = {
      ...mockDebito,
      valorApurado: 'R$ 900,00'
    };

    storeMock.cobrancaFoiAtualizada.mockReturnValue(true);
    storeMock.debitoFormatado.mockReturnValue(debitoAtualizado);

    component.fecharModal();

    expect(storeMock.cancelarRequisicaoAtual).toHaveBeenCalledTimes(1);
    expect(activeModalMock.close).toHaveBeenCalledWith(debitoAtualizado);
  });

  it('deve retornar a classe de status esperada', () => {
    expect(component.obterClasseStatusDebitoManual(EnumSituacaoDebitoManual.FATAL)).toBe('status-vermelho');
    expect(component.obterClasseStatusDebitoManual(EnumSituacaoDebitoManual.SUCESSO)).toBe('status-verde');
  });

  it('deve autorizar débito, fechar o modal e abrir o feedback quando houver sucesso', async () => {
    const feedback = {
      titulo: 'Sucesso',
      mensagem: 'Autorizado',
      descricao: 'Tudo certo',
      variant: 'success' as const,
    };
    const debitoAtualizado = {
      ...mockDebito,
      valorApurado: 'R$ 900,00'
    };

    storeMock.cobrancaFoiAtualizada.mockReturnValue(true);
    storeMock.debitoFormatado.mockReturnValue(debitoAtualizado);
    storeMock.autorizarDebito.mockResolvedValue({ ok: true, feedback });

    await component.onAutorizar();

    expect(storeMock.autorizarDebito).toHaveBeenCalledWith(mockDebito.convenioId, mockDebito.periodo);
    expect(activeModalMock.close).toHaveBeenCalledWith(debitoAtualizado);
    expect(modalServiceMock.open).toHaveBeenCalledWith(FeedbackGenericoComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: true,
      centered: true
    });
    expect((modalServiceMock.open).mock.results[0].value.componentInstance.feedback).toEqual(feedback);
  });

  it('deve abrir o feedback genérico quando a resposta vier com feedback de erro', async () => {
    const feedback = {
      titulo: 'Erro',
      mensagem: 'Falha na autorização',
      descricao: 'Verifique os dados',
      variant: 'danger' as const,
    };

    storeMock.autorizarDebito.mockResolvedValue({ ok: false, isFeedback: true, feedback });

    await component.onAutorizar();

    expect(modalServiceMock.open).toHaveBeenCalledWith(FeedbackGenericoComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: true,
      centered: true
    });
    expect((modalServiceMock.open).mock.results[0].value.componentInstance.feedback).toEqual(feedback);
    expect(snackbarServiceMock.add).not.toHaveBeenCalled();
  });

  it('deve exibir snackbar quando ocorrer erro sem feedback', async () => {
    storeMock.autorizarDebito.mockResolvedValue({ ok: false, isFeedback: false, mensagem: 'Erro inesperado' });

    await component.onAutorizar();

    expect(snackbarServiceMock.add).toHaveBeenCalledWith({
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      data: {
        variant: 'warning',
        message: 'Erro inesperado'
      }
    });
    expect(modalServiceMock.open).not.toHaveBeenCalled();
  });
});
