import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DscSnackbarService } from 'sidsc-components/dsc-snackbar';
import { FeedbackGenericoComponent } from '../../../../shared/modal/feedback-generico/feedback-generico.component';
import { EnumSituacaoDebitoManual } from '../../domain/debito-manual.enum';
import { ModalAcertoManualDebitoStore } from '../../application/store/modal-acerto-manual-debito.store';
import { ModalAcertoManualDebitoComponent } from './modal-acerto-manual-debito.component';
import { DscTextareaComponent } from 'sidsc-components/dsc-textarea';
import { createMockDebitoManualPendenteFormatado } from '../../../../../test-helpers/createMockDebitoManualPendente';

const mockDebitoFormatado = createMockDebitoManualPendenteFormatado();

describe('ModalAcertoManualDebitoComponent', () => {
  let component: ModalAcertoManualDebitoComponent;
  let fixture: ComponentFixture<ModalAcertoManualDebitoComponent>;

  let activeModalMock: { close: jest.Mock; dismiss: jest.Mock };
  let modalServiceMock: { open: jest.Mock };
  let snackbarServiceMock: { add: jest.Mock };
  let storeMock: {
    inicializar: jest.Mock;
    cancelarRequisicaoAtual: jest.Mock;
    acertoManual: jest.Mock;
    isSending: jest.Mock;
    debitoFormatado: jest.Mock;
    cobrancaFoiAtualizada: jest.Mock;
    cobrancasParaAcertoManual: jest.Mock;
    valorApuradoAcerto: jest.Mock;
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
      acertoManual: jest.fn(),
      isSending: jest.fn(() => false),
      debitoFormatado: jest.fn(() => mockDebitoFormatado),
      cobrancaFoiAtualizada: jest.fn(() => false),
      valorApuradoAcerto: jest.fn(() => 'R$ 0,00'),
      cobrancasParaAcertoManual: jest.fn(() => []),
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, NoopAnimationsModule, DscTextareaComponent],
      declarations: [ModalAcertoManualDebitoComponent],
      providers: [
        { provide: NgbActiveModal, useValue: activeModalMock },
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: DscSnackbarService, useValue: snackbarServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(ModalAcertoManualDebitoComponent, {
        set: {
          providers: [
            { provide: ModalAcertoManualDebitoStore, useValue: storeMock }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ModalAcertoManualDebitoComponent);
    component = fixture.componentInstance;
    component.inputDebitoFormatado = mockDebitoFormatado;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar a store com o débito informado', () => {
    storeMock.inicializar.mockClear();

    component.ngOnInit();

    expect(storeMock.inicializar).toHaveBeenCalledTimes(1);
    expect(storeMock.inicializar).toHaveBeenCalledWith(mockDebitoFormatado);
  });

  it('deve fechar o modal sem débito atualizado quando não houver atualização', () => {
    component.fecharModal();

    expect(storeMock.cancelarRequisicaoAtual).toHaveBeenCalledTimes(1);
    expect(activeModalMock.close).toHaveBeenCalledWith(null);
  });

  it('deve fechar o modal com o débito atualizado quando houver atualização', () => {
    const debitoAtualizado = {
      ...mockDebitoFormatado,
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

  it('deve marcar o campo como tocado quando a observação estiver inválida', async () => {
    const spyMarkAsTouched = jest.spyOn(component.observacaoControl, 'markAsTouched');

    await component.onConfirmarAcertoManual();

    expect(spyMarkAsTouched).toHaveBeenCalledTimes(1);
    expect(storeMock.acertoManual).not.toHaveBeenCalled();
  });

  it('deve confirmar o acerto manual, fechar o modal e abrir o feedback quando houver sucesso', async () => {
    const feedback = {
      titulo: 'Sucesso',
      mensagem: 'Acerto manual realizado',
      descricao: 'Tudo certo',
      variant: 'success' as const,
    };
    const debitoAtualizado = {
      ...mockDebitoFormatado,
      valorApurado: 'R$ 900,00'
    };

    storeMock.cobrancaFoiAtualizada.mockReturnValue(true);
    storeMock.debitoFormatado.mockReturnValue(debitoAtualizado);
    storeMock.acertoManual.mockResolvedValue({ ok: true, feedback });
    component.observacaoControl.setValue('Observacao valida');

    await component.onConfirmarAcertoManual();

    expect(storeMock.acertoManual).toHaveBeenCalledWith(mockDebitoFormatado.convenioId, mockDebitoFormatado.periodo, 'Observacao valida');
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
      mensagem: 'Falha de validação',
      descricao: 'Verifique os dados',
      variant: 'danger' as const,
    };

    storeMock.acertoManual.mockResolvedValue({ ok: false, isFeedback: true, feedback });
    component.observacaoControl.setValue('Observacao valida');

    await component.onConfirmarAcertoManual();

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
    storeMock.acertoManual.mockResolvedValue({ ok: false, isFeedback: false, mensagem: 'Erro inesperado' });
    component.observacaoControl.setValue('Observacao valida');

    await component.onConfirmarAcertoManual();

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
