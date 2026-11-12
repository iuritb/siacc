import { AutorizacoesAgendamentosErrorMapperService } from './autorizacoes-agendamentos-error-mapper.service';
import { EnumOpcoesAutorizacaoAgendamento } from '../../../shared/models/autorizacao-agendamento/utils.enum';
import { MENSAGENS_FILTRO_AUTORIZACAO } from './autorizacoes-agendamentos.constants';

describe('AutorizacoesAgendamentosErrorMapperService', () => {
  let service: AutorizacoesAgendamentosErrorMapperService;
  let feedbackMock: any;
  let agendamentoServiceMock: any;

  beforeEach(() => {
    feedbackMock = { formatarFeedbackErro: jest.fn() };
    agendamentoServiceMock = { formatarNomeDestino: jest.fn(() => 'Destino') };
    service = new AutorizacoesAgendamentosErrorMapperService(feedbackMock, agendamentoServiceMock);
  });

  it('deve retornar snackbar-info quando erro for AbortError', () => {
    const erroAbort = new Error('cancelada');
    erroAbort.name = 'AbortError';
    const result = { domain: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO, error: erroAbort } as any;

    const retorno = service.mapearErro(result, EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO);

    expect(feedbackMock.formatarFeedbackErro).not.toHaveBeenCalled();
    expect(retorno).toEqual({ kind: 'snackbar-info', message: 'Requisição foi cancelada.' });
  });

  it('deve retornar modal-error para erro de dominio AUTORIZACAO', () => {
    const feedback = { titulo: 'Erro', mensagem: 'Falha', descricao: 'Detalhe', variant: 'danger' };
    feedbackMock.formatarFeedbackErro.mockReturnValue(feedback);
    const result = { domain: EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO, error: 'erro' } as any;

    const retorno = service.mapearErro(result, EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO);

    expect(feedbackMock.formatarFeedbackErro).toHaveBeenCalledWith(
      'erro',
      MENSAGENS_FILTRO_AUTORIZACAO.tituloModal,
      MENSAGENS_FILTRO_AUTORIZACAO.subTituloModal,
      null
    );
    expect(retorno).toEqual({ kind: 'modal-error', feedback });
  });
});
