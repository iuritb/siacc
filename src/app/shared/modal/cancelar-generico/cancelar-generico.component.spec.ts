import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CancelarGenericoComponent } from './cancelar-generico.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CancelarGenerico, EnumTipoCancelamento } from '../../models/cancelar-generico.model';
import { SharedModule } from '../../shared.module';
import { ErroGenericoAPI } from '../../errors/erro-generico-api';

describe('CancelarGenericoComponent', () => {
  let component: CancelarGenericoComponent;
  let fixture: ComponentFixture<CancelarGenericoComponent>;

  const mockDados: CancelarGenerico = {
    titulo: "Mock cancelar",
    subtitulo: "Mock confirma o cancelamento ",
    tipo: EnumTipoCancelamento.SIMULACAO,
    numero: "1234",
    sucesso: "Mock sucesso!",
    descricao: "Nº do mock cancelado:"
  }

  const activeModalMock = {
    close: jest.fn(),
    dismiss: jest.fn(),
  };

  const modalServiceMock = {
    open: jest.fn().mockReturnValue({
      componentInstance: {
        feedback: null,
      },
    }),
  };


  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [CancelarGenericoComponent],
      providers: [
        { provide: NgbActiveModal, useValue: activeModalMock },
        { provide: NgbModal, useValue: modalServiceMock },
      ],
    }).compileComponents();


    fixture = TestBed.createComponent(CancelarGenericoComponent);
    component = fixture.componentInstance;
    component.parametros = mockDados;
    jest.useFakeTimers();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('deve atribuir idCancelamento com o valor de parametros.numero no ngOnInit', () => {

    component.ngOnInit();

    expect(component.idCancelamento).toBe('1234');

  });


  it('deve chamar cancelar() quando tipo for SIMULACAO', () => {
    component.parametros.tipo = EnumTipoCancelamento.SIMULACAO;
    const cancelarSpy = jest.spyOn(component, 'cancelar');

    component.processarCancelamento();

    expect(typeof component.opcaoCancelar).toBe('function');
    expect(cancelarSpy).toHaveBeenCalled;
  })

  it('deve chamar confirmarCancelarConvenio() quando tipo for CONVENIO', () => {
    component.parametros.tipo = EnumTipoCancelamento.CONVENIO;
    const cancelarSpy = jest.spyOn(component as any, 'confirmarCancelarConvenio');

    component.processarCancelamento();

    expect(typeof component.opcaoCancelar).toBe('function');
    expect(cancelarSpy).toHaveBeenCalled();
  })

  it('confirmarCancelarConvenio() deve fechar o modal atual e abrir o modal de confirmação de exclusão', () => {

    component.modalConfirmarExcluirConvenio = 'mockTemplateRef';

    (component as any).confirmarCancelarConvenio();

    expect(activeModalMock.close).toHaveBeenCalled();
    expect(modalServiceMock.open)
      .toHaveBeenCalledWith('mockTemplateRef', {
        size: 'lg',
        scrollable: false,
        windowClass: 'modal-large'
      });
    expect((component as any).modalConfirmacaoRef).toHaveProperty('componentInstance');

  })


  it('cancelar() deve cancelar com sucesso e abrir modal de feedback com sucesso', async () => {
    const feedbackSpy = jest.spyOn(component as any, 'abrirModalGenerico');

    const modalConfirmacaoRefMock = {
      close: jest.fn(),
    };

    (component as any).modalConfirmacaoRef = modalConfirmacaoRefMock;
    component.btnIsCancelando = false;
    component.idCancelamento = mockDados.numero;

    component.opcaoCancelar = jest.fn().mockResolvedValue(undefined);

    await component.cancelar();
    jest.runAllTimers();

    expect(modalConfirmacaoRefMock.close).toHaveBeenCalled();
    expect((component as any).modalConfirmacaoRef).toBeNull();
    expect(activeModalMock.close).toHaveBeenCalled();
    expect(component.btnIsCancelando).toBe(false);
    expect(component.opcaoCancelar).toHaveBeenCalled();

    expect(feedbackSpy).toHaveBeenCalledWith({
      titulo: 'Mock cancelar',
      mensagem: 'Mock sucesso!',
      descricao: 'Nº do mock cancelado: 1234',
      variant: 'success',
    });
  });

  it('cancelar() deve tratar erro conhecido e abrir modal de erro', async () => {
    const feedbackSpy = jest.spyOn(component as any, 'abrirModalGenerico');

    component.opcaoCancelar = jest.fn().mockRejectedValue(
      new ErroGenericoAPI('Erro ao cancelar', ['Simulação não encontrada'])
    );

    await component.cancelar();
    jest.runAllTimers();

    expect(feedbackSpy).toHaveBeenCalledWith({
      titulo: 'Mock cancelar',
      mensagem: 'Não foi possível concluir o cancelamento. Tente novamente mais tarde.',
      descricao: 'Erro ao cancelar',
      listaMensagem: ['Simulação não encontrada'],
      variant: 'danger',
    });
  });

  it('cancelar() deve tratar erro genérico e abrir modal de erro padrão', async () => {
    const feedbackSpy = jest.spyOn(component as any, 'abrirModalGenerico');

    component.opcaoCancelar = jest.fn().mockRejectedValue(new Error('Erro inesperado'));

    await component.cancelar();
    jest.runAllTimers();

    expect(feedbackSpy).toHaveBeenCalledWith({
      titulo: 'Mock cancelar',
      mensagem: 'Não foi possível concluir o cancelamento. Tente novamente mais tarde.',
      descricao: 'Erro interno ao tentar processar os dados.',
      listaMensagem: ['Tente novamente mais tarde.'],
      variant: 'danger',
    });
  });

});
