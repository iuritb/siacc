import { SimpleChange } from '@angular/core';
import { DetalhamentoTipo } from '../../../../shared/models';
import { DetalhamentoAgendamentoLoteComponent } from './detalhamento-agendamento-lote.component';

describe('DetalhamentoAgendamentoLoteComponent', () => {
  let component: DetalhamentoAgendamentoLoteComponent;
  let storeMock: {
    isLoading: () => boolean;
    dadoDetalhado: () => unknown;
    mensagemErro: () => unknown;
    inicializarContexto: jest.Mock;
    cancelarConsultaAtual: jest.Mock;
  };

  beforeEach(() => {
    storeMock = {
      isLoading: () => false,
      dadoDetalhado: () => null,
      mensagemErro: () => null,
      inicializarContexto: jest.fn(),
      cancelarConsultaAtual: jest.fn()
    };

    component = new DetalhamentoAgendamentoLoteComponent(storeMock as any);
  });

  it('deve criar componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve emitir evento ao voltar para tabela', () => {
    const emitSpy = jest.spyOn(component.onVoltarTabela, 'emit');

    component.voltarTabela();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('deve expor enum de tipo de detalhamento', () => {
    expect(component.detalhamentoTipoEnum).toBe(DetalhamentoTipo);
  });

  it('deve delegar inicializacao ao store em mudanca de input', () => {
    const cobSelecionada = {
      txid: 'txid-1',
      recebedor: { conta: '1234', tipoConta: 'CORRENTE', agencia: '0001' },
      situacao: 'SUCESSO',
      dataHoraSituacao: '2026-05-20T11:30:00Z',
      integracao: []
    } as any;

    component.cobSelecionada = cobSelecionada;
    component.deveConsultarApi = true;

    component.ngOnChanges({
      cobSelecionada: new SimpleChange(undefined, cobSelecionada, true),
      deveConsultarApi: new SimpleChange(undefined, true, true)
    });

    expect(storeMock.inicializarContexto).toHaveBeenCalledWith(cobSelecionada, true);
  });

  it('não deve inicializar contexto quando mudanças não forem dos inputs monitorados', () => {
    component.ngOnChanges({
      qualquerOutroCampo: new SimpleChange(undefined, 'valor', true)
    });

    expect(storeMock.inicializarContexto).not.toHaveBeenCalled();
  });

  it('deve cancelar consulta ao destruir componente', () => {
    component.ngOnDestroy();

    expect(storeMock.cancelarConsultaAtual).toHaveBeenCalledTimes(1);
  });
});
