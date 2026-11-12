import { DadosPrimarioHeader, EnumTexto } from '../../../../interfaces';
import { Atualizacao, CobrancaRecorrenteFormatada } from '../../../../shared/models/autorizacao-agendamento/cobr.model';
import { EnumStatusCobR } from '../../../../shared/models/autorizacao-agendamento/cobr.enum';
import { DetalhamentoLoteCobrResponse } from '../../../../shared/models/autorizacao-agendamento/lote-cobr.model';
import { formatarData, formatarDataHora } from '../../../../shared/utils/data/data.utils';
import { formatarPrimeiraMaiuscula, formatarStatusLote, formatarTipoLote, formatarValor } from '../../../../shared/utils/string/string.utils';
import { ErroGenericoInterno } from '../../../../shared/errors/erro-generico-interno';
import { formatarDocumento } from '../../../../shared/utils/documento/documento.utils';
import { CobRDoLoteHtml } from './domain/detalhamento-lote.model';
import { EnumSituacaoCobrancaLote } from '../../domain/lote-agendamentos.enum';
import { CobRDoLote, VinculoCobrLote, DevedorCobrLote } from '../../domain/lote-agendamentos.model';

export const formatarCobsrDoLoteParaHtml = (cobsr: CobRDoLote[]): CobRDoLoteHtml[] => {
  return cobsr.map((cob) => {
    const ultimoStatus = definirUltimoStatusCobR(cob.atualizacao);
    const situacaoFormatada = formatarPrimeiraMaiuscula(cob.situacao) ?? EnumTexto.HIFEN;
    return {
      ...cob,
      ...definirDocumentoDevedor(cob.devedor),
      ...definirDadosVinculo(cob.vinculo),
      statusFormatado: ultimoStatus.statusFormatado ?? situacaoFormatada,
      valorOriginalFormatado: cob.valor?.original ? formatarValor(cob.valor.original) : EnumTexto.HIFEN,
      dataVencimentoFormatada: cob.calendario?.dataDeVencimento
        ? formatarData(cob.calendario.dataDeVencimento)
        : EnumTexto.HIFEN,
      dataHoraStatusFormatada: ultimoStatus.dataFormatada ?? formatarDataHora(cob.dataHoraSituacao),
      recebedorTipoContaFormatado: formatarPrimeiraMaiuscula(cob.recebedor?.tipoConta) ?? EnumTexto.HIFEN,
      recebedorContaFormatada: cob.recebedor?.conta || EnumTexto.HIFEN,
      recebedorAgenciaFormatada: cob.recebedor?.agencia || EnumTexto.HIFEN,
      ultimaIntegracao: cob.integracao.length > 0 ? cob.integracao[cob.integracao.length - 1] : undefined,
    };
  });
};

export const parametroPrimarioHeaderDetalhamentoLote = (retornoAPI: DetalhamentoLoteCobrResponse | null): DadosPrimarioHeader => {
  const parametros = retornoAPI?.parametros;
  const idLote = parametros?.id ?? EnumTexto.HIFEN;
  const nome = parametros?.nome ?? '';

  return {
    titulo: 'Id do Lote',
    valor: String(idLote),
    nome
  };
};

export const definirClasseStatusCobrDoLote = (situacao: EnumSituacaoCobrancaLote): string => {
  switch (situacao) {
    case EnumSituacaoCobrancaLote.PENDENTE:
      return 'status-pendente';
    case EnumSituacaoCobrancaLote.SUCESSO:
      return 'status-sucesso';
    case EnumSituacaoCobrancaLote.ERRO:
      return 'status-erro';
    default:
      return '';
  }
};

export const parametroSecundarioHeaderDetalhamentoLote = (retornoAPI: DetalhamentoLoteCobrResponse | null): Record<string, Record<string, string>> => {
  const parametros = retornoAPI?.parametros;
  const convenio = parametros?.convenio ?? EnumTexto.HIFEN;
  const tipo = formatarTipoLote(parametros?.tipo);
  const situacao = formatarStatusLote(parametros?.situacao);
  const dataCriacao = formatarDataHora(parametros?.calendario?.criacao);

  return {
    'Convênio': { '0': `${convenio}` },
    'Data de envio': { '0': dataCriacao },
    'Tipo': { '0': `${tipo}` },
    'Situação': { '0': situacao },
  };
};

const definirDadosVinculo = (vinculo?: VinculoCobrLote): {
  contratoVinculoFormatado: string;
} => {
  return {
    contratoVinculoFormatado: vinculo?.contrato || EnumTexto.HIFEN,
  };
};

const definirDocumentoDevedor = (devedor?: DevedorCobrLote): { nomeFormatado: string; documentoFormatado: string } => {
  if (!devedor) {
    return { nomeFormatado: EnumTexto.HIFEN, documentoFormatado: EnumTexto.HIFEN };
  }
  let documento = devedor.cpf;
  if (!documento) documento = devedor.cnpj;
  if (!documento) documento = EnumTexto.HIFEN;
  return { nomeFormatado: devedor.nome ?? EnumTexto.HIFEN, documentoFormatado: formatarDocumento(documento) };
}

const definirUltimoStatusCobR = (atualizacao: Atualizacao[] | undefined): { statusFormatado: string | null; dataFormatada: string | null } => {
  if (!atualizacao || atualizacao.length === 0) {
    return { statusFormatado: null, dataFormatada: null };
  }

  const atualizacaoMaisRecente = atualizacao.reduce<Atualizacao | null>((maisRecente, itemAtual) => {
    if (!itemAtual?.data) {
      return maisRecente;
    }

    const dataAtual = new Date(itemAtual.data);
    if (isNaN(dataAtual.getTime())) {
      return maisRecente;
    }

    if (!maisRecente?.data) {
      return itemAtual;
    }

    const dataMaisRecente = new Date(maisRecente.data);
    if (isNaN(dataMaisRecente.getTime()) || dataAtual.getTime() > dataMaisRecente.getTime()) {
      return itemAtual;
    }

    return maisRecente;
  }, null);

  if (!atualizacaoMaisRecente) {
    return { statusFormatado: null, dataFormatada: null };
  }

  return {
    statusFormatado: formatarPrimeiraMaiuscula(atualizacaoMaisRecente.status),
    dataFormatada: formatarDataHora(atualizacaoMaisRecente.data) ?? null
  };
};

export const podeCancelarCobrancaDoLote = (cob: CobRDoLoteHtml): boolean => {
  const possuiStatus = Boolean(cob.status);
  return cob.situacao === EnumSituacaoCobrancaLote.SUCESSO
    && possuiStatus
    && cob.status !== EnumStatusCobR.CANCELADA;
};

export const deveConsultarApiNoDetalheLote = (cob: CobRDoLoteHtml): boolean => {
  return cob.situacao === EnumSituacaoCobrancaLote.SUCESSO && Boolean(cob.status);
};

export const obterTooltipCancelamentoDoLote = (cob: CobRDoLoteHtml): string => {
  if (podeCancelarCobrancaDoLote(cob)) {
    return 'Cancelar Agendamento Futuro';
  }

  if (!cob.status) {
    return 'Cancelamento disponível apenas quando o agendamento possuir status.';
  }

  if (cob.status === EnumStatusCobR.CANCELADA) {
    return 'Agendamento futuro já está cancelado.';
  }

  if (cob.situacao !== EnumSituacaoCobrancaLote.SUCESSO) {
    return 'Cancelamento disponível apenas para agendamentos com situação de sucesso.';
  }

  return 'Cancelamento indisponível para este agendamento.';
};

export const formatarDadosCancelamentoDeCobDoLote = (cob: CobRDoLoteHtml, convenio: number): CobrancaRecorrenteFormatada => {
  if (!cob.status) {
    throw new ErroGenericoInterno('Status da cobrança não informado para cancelamento.', null);
  }

  return {
    txid: cob.txid,
    convenio: String(convenio),
    status: cob.status ?? EnumTexto.HIFEN,
    statusFormatado: cob.status ? cob.statusFormatado : EnumTexto.HIFEN,
    recebedorConta: cob.recebedorContaFormatada,
    recebedorTipoContaFormatado: cob.recebedorTipoContaFormatado,
    recebedorAgencia: cob.recebedorAgenciaFormatada,
    valorOriginalFormatado: cob.valorOriginalFormatado,
    dataCriacao: cob.calendario?.criacao ?? EnumTexto.HIFEN,
    dataCriacaoFormatada: cob.calendario?.criacao ? formatarDataHora(cob.calendario.criacao) : EnumTexto.HIFEN,
    dataVencimento: cob.calendario?.dataDeVencimento,
    dataVencimentoFormatada: cob.dataVencimentoFormatada
  };
};
