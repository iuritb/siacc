import { ClasseStatusDebitoManual, PaginacaoEditavelDebitoManual } from "./debito-manual-pendente.model";
import { EnumSituacaoDebitoManual } from "./debito-manual.enum";

export const PAGE_SIZE_OPTIONS_TABELA_DEBITO_MANUAL_PENDENTE = [5, 10, 25];

export const PAGINACAO_INICIAL_TABELA_DEBITO_MANUAL_PENDENTE: PaginacaoEditavelDebitoManual = {
  paginaAtual: 0,
  itensPorPagina: 5,
};

export const MENSAGENS_TABELA_DEBITO_MANUAL_PENDENTE = {
  erroCarregarDebitos: 'Não foi possível processar os débitos manuais. Por favor, tente novamente mais tarde.',
} as const;

export const MENSAGENS_MODAL_AUTORIZAR_DEBITO = {
  titulo: 'Autorizar Débito Manual Pendente',
  mensagemSucesso: 'Débitos manuais pendentes autorizados com sucesso.',
  descricaoSucesso: 'Analise as situações para verificar se tudo ocorreu como esperado.',
  subTituloErro: 'Ocorreu um erro ao autorizar os débitos manuais pendentes. Por favor, tente novamente mais tarde.',
  requisicaoEmAndamento: 'Uma requisição já está em andamento. Por favor, aguarde.',
  requisicaoCancelada: 'A requisição foi cancelada.'
} as const;

export const MENSAGENS_MODAL_RETENTAR_DEBITO = {
  titulo: 'Retentar Débito Manual Pendente',
  descricaoSucesso: 'Analise as situações para verificar se tudo ocorreu como esperado.',
  mensagemSucesso: 'Débitos manuais pendentes reprocessados com sucesso.',
  subTituloErro: 'Ocorreu um erro ao tentar novamente os débitos manuais pendentes. Por favor, tente novamente mais tarde.',
  requisicaoEmAndamento: 'Uma requisição já está em andamento. Por favor, aguarde.',
  requisicaoCancelada: 'A requisição foi cancelada.'
} as const;

export const MENSAGENS_MODAL_ACERTO_MANUAL_DEBITO = {
  tituloAcertoManual: 'Acerto Manual de Débito Pendente',
  mensagemSucessoAcertoManual: 'Acerto manual realizado com sucesso.',
  descricaoSucessoAcertoManual: 'Analise as situações para verificar se tudo ocorreu como esperado.',
  subTituloErroAcertoManual: 'Ocorreu um erro ao realizar o acerto manual. Por favor, tente novamente mais tarde.',
  mensagemObservacaoObrigatoria: 'A observação é obrigatória para confirmar o acerto manual.',
  requisicaoEmAndamento: 'Uma requisição já está em andamento. Por favor, aguarde.',
  requisicaoCancelada: 'A requisição foi cancelada.'
} as const;

export const MESES: { [key: string]: string } = {
  "01": "Janeiro",
  "02": "Fevereiro",
  "03": "Março",
  "04": "Abril",
  "05": "Maio",
  "06": "Junho",
  "07": "Julho",
  "08": "Agosto",
  "09": "Setembro",
  "10": "Outubro",
  "11": "Novembro",
  "12": "Dezembro"
};

export const MAPA_LABEL_ENUM_SITUACAO_DEBITO: Record<EnumSituacaoDebitoManual, string> = {
  [EnumSituacaoDebitoManual.PROCESSANDO]: "Em processamento",
  [EnumSituacaoDebitoManual.FATAL]: "Fatal",
  [EnumSituacaoDebitoManual.AGUARDANDO_APROVACAO]: "Aguardando aprovação",
  [EnumSituacaoDebitoManual.INADIMPLENTE]: "Inadimplente",
  [EnumSituacaoDebitoManual.NAO_APLICAVEL]: "Não aplicável",
  [EnumSituacaoDebitoManual.SUCESSO]: "Sucesso",
  [EnumSituacaoDebitoManual.ACERTO_MANUAL]: "Acerto Manual",
  [EnumSituacaoDebitoManual.OUTROS]: "Outros",
};

export const MAPA_CLASSE_STATUS_DEBITO_MANUAL: Record<EnumSituacaoDebitoManual, ClasseStatusDebitoManual> = {
  // Sucesso / sem pendencia para acao.
  [EnumSituacaoDebitoManual.NAO_APLICAVEL]: "status-cinza",
  [EnumSituacaoDebitoManual.OUTROS]: "status-cinza",

  // Em andamento ou aguardando tratativa.
  [EnumSituacaoDebitoManual.PROCESSANDO]: "status-amarelo",
  [EnumSituacaoDebitoManual.AGUARDANDO_APROVACAO]: "status-amarelo",

  // Falha/impedimento operacional.
  [EnumSituacaoDebitoManual.FATAL]: "status-vermelho",
  [EnumSituacaoDebitoManual.INADIMPLENTE]: "status-vermelho",
  // Sucesso
  [EnumSituacaoDebitoManual.SUCESSO]: "status-verde",
  [EnumSituacaoDebitoManual.ACERTO_MANUAL]: "status-verde",
};
