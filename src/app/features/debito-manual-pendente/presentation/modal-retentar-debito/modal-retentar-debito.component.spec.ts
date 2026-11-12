import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DscSnackbarService } from 'sidsc-components/dsc-snackbar';
import { ModalRetentarDebitoComponent } from './modal-retentar-debito.component';
import { ModalRetentarDebitoStore } from '../../application/store/modal-retentar-debito.store';
import { EnumSituacaoDebitoManual } from '../../domain/debito-manual.enum';
import { FeedbackGenericoComponent } from '../../../../shared/modal/feedback-generico/feedback-generico.component';
import { createMockDebitoManualPendenteFormatado } from '../../../../../test-helpers/createMockDebitoManualPendente';

const mockDebitoFormatado = createMockDebitoManualPendenteFormatado();

describe('ModalRetentarDebitoComponent', () => {
  let component: ModalRetentarDebitoComponent;
  let fixture: ComponentFixture<ModalRetentarDebitoComponent>;

  let activeModalMock: { close: jest.Mock; dismiss: jest.Mock };
  let modalServiceMock: { open: jest.Mock };
  let snackbarServiceMock: { add: jest.Mock };
  let storeMock: {
    inicializar: jest.Mock;
    cancelarRequisicaoAtual: jest.Mock;
    retentarDebito: jest.Mock;
    isSending: jest.Mock;
    debitoFormatado: jest.Mock;
    cobrancaFoiAtualizada: jest.Mock;
    cobrancasParaRetentativa: jest.Mock;
    valorApuradoRetentativa: jest.Mock;
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
      retentarDebito: jest.fn(),
      isSending: jest.fn(() => false),
      debitoFormatado: jest.fn(() => mockDebitoFormatado),
      cobrancaFoiAtualizada: jest.fn(() => false),
      cobrancasParaRetentativa: jest.fn(() => []),
      valorApuradoRetentativa: jest.fn(() => 'R$ 100,00'),
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, NoopAnimationsModule],
      declarations: [ModalRetentarDebitoComponent],
      providers: [
        { provide: NgbActiveModal, useValue: activeModalMock },
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: DscSnackbarService, useValue: snackbarServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(ModalRetentarDebitoComponent, {
        set: {
          providers: [
            { provide: ModalRetentarDebitoStore, useValue: storeMock }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ModalRetentarDebitoComponent);
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

  it('deve retentar débito, fechar o modal e abrir o feedback quando houver sucesso', async () => {
    const feedback = {
      titulo: 'Sucesso',
      mensagem: 'Retentado',
      descricao: 'Tudo certo',
      variant: 'success' as const,
    };
    const debitoAtualizado = {
      ...mockDebitoFormatado,
      valorApurado: 'R$ 900,00'
    };

    storeMock.cobrancaFoiAtualizada.mockReturnValue(true);
    storeMock.debitoFormatado.mockReturnValue(debitoAtualizado);
    storeMock.retentarDebito.mockResolvedValue({ ok: true, feedback });

    await component.onRetentar();

    expect(storeMock.retentarDebito).toHaveBeenCalledWith(mockDebitoFormatado.convenioId, mockDebitoFormatado.periodo);
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
      mensagem: 'Falha na retentativa',
      descricao: 'Verifique os dados',
      variant: 'danger' as const,
    };

    storeMock.retentarDebito.mockResolvedValue({ ok: false, isFeedback: true, feedback });

    await component.onRetentar();

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
    storeMock.retentarDebito.mockResolvedValue({ ok: false, isFeedback: false, mensagem: 'Erro inesperado' });

    await component.onRetentar();

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

  it('deve expor as variáveis de estado do componente corretamente', () => {
    expect(component.isSending).toBeDefined();
    expect(component.debito).toBeDefined();
    expect(component.cobrancasParaRetentativa).toBeDefined();
    expect(component.cobrancaFoiAtualizada).toBeDefined();
    expect(component.valorApuradoRetentativa).toBeDefined();
    expect(component.EnumSituacaoDebitoManual).toBe(EnumSituacaoDebitoManual);
  });
});
