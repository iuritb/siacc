import { DadosPrimarioHeader, EnumTexto } from '../../../../interfaces';
import { formatarData, formatarDataPtBr } from '../../../../shared/utils/data/data.utils';
import { formatarStatusLote } from '../../../../shared/utils/string/string.utils';
import { LoteCobr, LotesCobrResponse } from '../../domain/lote-agendamentos.model';
import { LoteCobrHtml } from './domain/tabela-lote.model';

/**
 * Ordena lotes por data de criação decrescente.
 *
 * Limitação conhecida: sort realizado no browser porque a API backendBatchRemessa
 * não suporta parâmetro de ordenação server-side. Se a API passar a suportar
 * (ex: ordenacao=criacao:desc), remover esta função e delegar ao backend.
 */
export function ordenarLotesPorDataDescendente(lotes: LoteCobr[]): LoteCobr[] {
  return [...lotes].sort((a, b) => {
    return new Date(b.calendario?.criacao).getTime() - new Date(a.calendario?.criacao).getTime();
  });
}

export function formatarLotesParaHtml(lotes: LoteCobr[]): LoteCobrHtml[] {
  return ordenarLotesPorDataDescendente(lotes).map(transformarLoteParaHtml);
}

function transformarLoteParaHtml(lote: LoteCobr): LoteCobrHtml {
  return {
    ...lote,
    dataEnvioFormatada: formatarDataEnvio(lote.calendario?.criacao),
    situacaoFormatada: formatarStatusLote(lote.situacao)
  };
}

function formatarDataEnvio(dataCriacao?: string): string {
  const data = new Date(dataCriacao ?? '');
  if (isNaN(data.getTime())) {
    return EnumTexto.DATA_INVALIDA;
  }

  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');
  return `${formatarDataPtBr(data)} ${hora}:${minuto}`;
}

/**
 * Retorna o dado primário para o app-header
 * @param retornoAPI
 * @returns DadosPrimarioHeader com título "Convênio" e valor do convênio ou "Não Informado" se ausente. O nome do convênio é retornado no campo 'nome' para possível uso em tooltip ou similar.
 */
export function parametroPrimarioHeaderLote(retornoAPI: LotesCobrResponse): DadosPrimarioHeader {
  const convenio = retornoAPI?.parametros?.convenio ?? EnumTexto.NAO_INFORMADO;
  const nome = retornoAPI?.parametros?.nome ?? '';
  return {
    titulo: 'Convênio',
    valor: convenio,
    nome: nome
  };
}

/**
 * Retorna um objeto para o dado secundário do app-header, contendo informações formatadas para exibição. O campo "Intervalo de Tempo" é sempre incluído, formatando as datas de início e fim. Os campos "CNPJ", "Nome", "Tipo" e "Situação" são incluídos apenas se estiverem presentes no retorno da API. Cada campo é estruturado como um objeto com chave '0' para compatibilidade com o formato esperado pelo app-header.
 * @param retornoAPI
 * @returns  Um objeto onde cada chave é um título de seção (ex: "Intervalo de Tempo", "CNPJ", "Nome", "Tipo", "Situação") e o valor é outro objeto com chave '0' e valor formatado para exibição. O intervalo de tempo é formatado como "dataInicio até dataFim" usando a função formatarData. Os outros campos são incluídos apenas se estiverem presentes no retorno da API.
 */
export function parametroSecundarioHeaderLote(retornoAPI: LotesCobrResponse): Record<string, Record<string, string>> {
  const params = retornoAPI?.parametros;
  const dataInicio = params?.dataInicio ? formatarData(params.dataInicio) : EnumTexto.NAO_INFORMADO;
  const dataFim = params?.dataFim ? formatarData(params.dataFim) : EnumTexto.NAO_INFORMADO;
  const cnpj = params?.cnpj ?? '';
  const nome = params?.nome ?? '';
  const tipo = params?.tipo ?? '';
  const situacao = params?.situacao ?? '';

  const secundario: Record<string, Record<string, string>> = {
    'Intervalo de Tempo': {
      '0': `${dataInicio} até ${dataFim}`
    }
  };
  if (cnpj) {
    secundario['CNPJ'] = { '0': cnpj };
  }
  if (nome) {
    secundario['Nome'] = { '0': nome };
  }
  if (tipo) {
    secundario['Tipo'] = { '0': tipo };
  }
  if (situacao) {
    secundario['Situação'] = { '0': situacao };
  }
  return secundario;
}

