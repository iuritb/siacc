import { PaginacaoLoteCobr } from "../../../domain/lote-agendamentos.model";

export const MENSAGENS_TABELA_LOTE = {
  atualizandoDados: 'Atualizando dados...',
  dadosAtualizadosComSucesso: 'Dados atualizados com sucesso.',
  buscaAbortada: 'Busca cancelada pelo usuário.',
  erroConsulta: 'Não foi possível realizar a consulta, tente novamente mais tarde.',
  tituloFeedback: 'Lote de Agendamentos',
  erroListarAgendamentosIdInexistente: 'Não foi possível listar os agendamentos, ID do lote não fornecido.',
  erroListarAgendamentosConvenioInexistente: 'Não foi possível listar os agendamentos, convênio do lote não fornecido.'
} as const;

export const PAGE_SIZE_OPTIONS_TABELA_LOTE: number[] = [10, 15, 30];

export const PAGINACAO_INICIAL_TABELA_LOTE: PaginacaoLoteCobr = {
  paginaAtual: 0,
  itensPorPagina: 10,
  totalPaginas: 0,
  totalRegistros: 0
};
