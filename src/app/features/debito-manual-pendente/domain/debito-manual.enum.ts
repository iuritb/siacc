export enum EnumSituacaoDebitoManual {
  PROCESSANDO = "PROCESSANDO",
  FATAL = "FATAL",
  AGUARDANDO_APROVACAO = "AGUARDANDO_APROVACAO",
  INADIMPLENTE = "INADIMPLENTE",
  SUCESSO = "SUCESSO",
  OUTROS = "OUTROS",
  ACERTO_MANUAL = "ACERTO_MANUAL",
  NAO_APLICAVEL = "NAO_APLICAVEL",//Criado aqui no frontend para controle interno
};

export enum EnumTipoDebitoManual {
  OUTROS = "OUTROS",
  CAIXA = "CAIXA",
  RETENTATIVA = "RETENTATIVA",
};

export enum EnumDestinoDebitoManual {
  DEBITO_MANUAL_TODOS = "DEBITO_MANUAL_TODOS",
};

export enum EnumModoConsultaDebitoManualPendente {
  PENDENTES = 'PENDENTES',
  SUCESSO = 'SUCESSO'
}
