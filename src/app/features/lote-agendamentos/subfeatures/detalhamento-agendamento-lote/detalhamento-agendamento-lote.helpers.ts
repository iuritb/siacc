import { EnumTexto } from '../../../../interfaces';
import { ErroGenericoInterno } from '../../../../shared/errors/erro-generico-interno';
import { DetalhamentoAgendamentoLoteFallback } from '../../../../shared/models/autorizacao-agendamento/lote-cobr.model';
import { CobRDoLoteSelecionado } from '../../domain/lote-agendamentos.model';

export const montarDetalhamentoAgendamentoLoteFallback = (
  cob: CobRDoLoteSelecionado
): DetalhamentoAgendamentoLoteFallback => {
  try {

    return {
      idRec: cob.idRec ?? EnumTexto.NAO_INFORMADO,
      txid: cob.txid,
      infoAdicional: cob.infoAdicional,
      calendario: {
        criacao: cob.calendario?.criacao ?? EnumTexto.HIFEN,
        dataDeVencimento: cob.calendario?.dataDeVencimento ?? EnumTexto.HIFEN
      },
      valor: {
        original: cob.valor?.original ?? EnumTexto.HIFEN
      },
      ajusteDiaUtil: cob.ajusteDiaUtil ?? null,
      recebedor: {
        conta: cob.recebedor?.conta ?? EnumTexto.HIFEN,
        tipoConta: cob.recebedor?.tipoConta ?? EnumTexto.HIFEN,
        agencia: cob.recebedor?.agencia ?? EnumTexto.HIFEN
      },
      status: cob.status ?? EnumTexto.HIFEN,
      politicaRetentativa: cob.politicaRetentativa ?? EnumTexto.HIFEN,
      devedor: cob.devedor,
      atualizacao: cob.atualizacao ?? []
    };
  } catch (error) {
    throw new ErroGenericoInterno('Não foi possível montar o detalhamento do agendamento do lote. Tente novamente mais tarde.', ['Erro ao montar o detalhamento do agendamento do lote']);
  }
};
