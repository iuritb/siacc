import { PaginacaoLoteCobr } from '../../../domain/lote-agendamentos.model';

export const MENSAGENS_DETALHAMENTO_LOTE = {
  idLoteNaoInformado: 'Não foi possível detalhar o lote, ID do lote não foi informado.',
  convenioNaoInformado: 'Não foi possível detalhar o lote, convênio não foi informado.',
  erroDetalhamento: 'Não foi possível obter os detalhes do lote, tente novamente mais tarde.',
  tituloResponseVazia: 'Detalhamento de lote sem dados',
  descricaoResponseVazia: 'A API retornou uma resposta vazia para o lote selecionado.'
} as const;

export const PAGE_SIZE_OPTIONS_DETALHAMENTO_LOTE: number[] = [10, 15, 30];

export const PAGINACAO_INICIAL_DETALHAMENTO_LOTE: PaginacaoLoteCobr = {
  paginaAtual: 0,
  itensPorPagina: 10,
  totalPaginas: 0,
  totalRegistros: 0
};
