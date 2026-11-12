import { EnumSituacaoCobrancaLote } from '../domain/lote-agendamentos.enum';
import { LoteAgendamentosStore } from './lote-agendamentos.store';

describe('LoteAgendamentosStore', () => {
  let store: LoteAgendamentosStore;

  beforeEach(() => {
    store = new LoteAgendamentosStore();
  });

  it('inicia exibindo lista de lotes', () => {
    expect(store.exibirListaLotes()).toBe(true);
    expect(store.exibirDetalheLote()).toBe(false);
    expect(store.exibirDetalheAgendamento()).toBe(false);
  });

  it('deve ir para detalhe do lote ao selecionar lote', () => {
    store.selecionarLote({ idLote: 10, convenio: 1234 });

    expect(store.exibirListaLotes()).toBe(false);
    expect(store.exibirDetalheLote()).toBe(true);
    expect(store.loteSelecionado()).toEqual({ idLote: 10, convenio: 1234 });
  });

  it('deve ir para detalhe de agendamento ao selecionar cobranca', () => {
    const cob = {
      txid: 'txid-1',
      situacao: EnumSituacaoCobrancaLote.SUCESSO,
      integracao: []
    } as any;

    store.selecionarAgendamento(cob, true);

    expect(store.exibirDetalheAgendamento()).toBe(true);
    expect(store.agendamentoSelecionado()?.cobSelecionada).toBe(cob);
    expect(store.agendamentoSelecionado()?.deveConsultarApi).toBe(true);
  });

  it('deve voltar para detalhe lote e limpar agendamento selecionado', () => {
    const cob = { txid: 'txid-1', situacao: EnumSituacaoCobrancaLote.SUCESSO, integracao: [] } as any;

    store.selecionarLote({ idLote: 1, convenio: 2 });
    store.selecionarAgendamento(cob, false);
    store.voltarParaDetalheLote();

    expect(store.exibirDetalheLote()).toBe(true);
    expect(store.agendamentoSelecionado()).toBeNull();
  });

  it('deve voltar para lista e limpar selecoes', () => {
    const cob = { txid: 'txid-1', situacao: EnumSituacaoCobrancaLote.SUCESSO, integracao: [] } as any;

    store.selecionarLote({ idLote: 1, convenio: 2 });
    store.selecionarAgendamento(cob, false);
    store.voltarParaListaLotes();

    expect(store.exibirListaLotes()).toBe(true);
    expect(store.loteSelecionado()).toBeNull();
    expect(store.agendamentoSelecionado()).toBeNull();
  });
});
