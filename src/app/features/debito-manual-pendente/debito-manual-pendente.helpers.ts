import { EnumTexto } from "../../interfaces";
import { ErroGenericoInterno } from "../../shared/errors/erro-generico-interno";
import { formatarAnoEMes, formatarData, formatarDataHoraPtBr } from "../../shared/utils/data/data.utils";
import { formatarDocumento, verificarUsuario } from "../../shared/utils/documento/documento.utils";
import { formatarValor } from "../../shared/utils/string/string.utils";
import { MAPA_LABEL_ENUM_SITUACAO_DEBITO, MESES } from "./domain/debito-manual-pendente.constants";
import { CobrancaTarifa, CobrancaTarifaFormatada, DebitoManualPendenteFormatado, DebitoManualPendenteResponse, PermissoesAcaoDebitoManual } from "./domain/debito-manual-pendente.model";
import { EnumSituacaoDebitoManual, EnumTipoDebitoManual } from "./domain/debito-manual.enum";

export const formatarDebitoManualPendente = (debitos: DebitoManualPendenteResponse): DebitoManualPendenteFormatado[] => {

  return debitos.map((debito) => {
    return {
      cnpj: formatarDocumento(debito.cnpj),
      razaoSocial: debito.razaoSocial,
      convenioId: debito.convenioId,
      unidadeVinculacao: debito.unidadeVinculacao,
      periodo: debito.periodo,
      descricaoMesReferencia: definirDescricaoMesReferencia(debito.periodo),
      periodoFormatado: definirMesReferencia(debito.periodo),
      valorApurado: formatarValor(debito.valorApurado),
      cobrancasFormatadas: formatarDadosDasCobrancas(debito.cobrancas),
      ...calcularPermissaoAcao(debito.cobrancas),
      dataPrevistaFormatada: formatarData(debito.dataPrevista)
    }
  });
}

export const formatarDadosDasCobrancas = (cobrancas: CobrancaTarifa[]): CobrancaTarifaFormatada[] => {
  const porTipo: Record<EnumTipoDebitoManual, CobrancaTarifaFormatada[]> = {
    [EnumTipoDebitoManual.CAIXA]: [],
    [EnumTipoDebitoManual.OUTROS]: [],
    [EnumTipoDebitoManual.RETENTATIVA]: []
  };
  const tiposNaoMapeados: CobrancaTarifaFormatada[] = [];

  for (const cobranca of cobrancas) {
    const cobrancaFormatada: CobrancaTarifaFormatada = {
      ...cobranca,
      valorFormatado: formatarValor(cobranca.valor),
      situacaoFormatada: formatarSituacaoDebito(cobranca.situacao),
      dataSituacaoFormatada: formatarDataSituacaoPtBr(cobranca.dataSituacao),
      tipoFormatado: formatarTipoDebito(cobranca.tipo)
    };

    if (cobranca.tipo in porTipo) {
      porTipo[cobranca.tipo].push(cobrancaFormatada);
    } else {
      tiposNaoMapeados.push(cobrancaFormatada);
    }
  }

  return [
    ...porTipo[EnumTipoDebitoManual.CAIXA],
    ...porTipo[EnumTipoDebitoManual.OUTROS],
    ...porTipo[EnumTipoDebitoManual.RETENTATIVA],
    ...tiposNaoMapeados
  ];
}

export const atualizarDebitoManualPendenteComCobrancasEPermissoes = (
  debitoAtual: DebitoManualPendenteFormatado,
  cobrancasAtualizadas: CobrancaTarifa[]
): DebitoManualPendenteFormatado => {

  if (!debitoAtual || !cobrancasAtualizadas?.length) {
    return debitoAtual;
  }

  const camposFormatados = formatarDadosDasCobrancas(cobrancasAtualizadas);

  const cobrancaMap = new Map(
    camposFormatados.map(c => [`${c.tipo}-${c.repasseId}`, c])
  );

  const cobrancasAtualizadasFinal = debitoAtual.cobrancasFormatadas.map(cobranca => {
    const key = `${cobranca.tipo}-${cobranca.repasseId}`;

    return cobrancaMap.get(key) ?? cobranca;
  });

  const permissoes = calcularPermissaoAcao(cobrancasAtualizadasFinal);

  return {
    ...debitoAtual,
    cobrancasFormatadas: cobrancasAtualizadasFinal,
    ...permissoes
  };
};

export const matchDebito = (debito: DebitoManualPendenteFormatado, termo: string): boolean => {
  const camposBusca = [
    debito.cnpj,
    debito.razaoSocial,
    debito.convenioId?.toString(),
    debito.periodo,
    debito.periodoFormatado,
    debito.descricaoMesReferencia,
    debito.valorApurado,
  ];

  return camposBusca.some((campo) => normalize(campo).includes(normalize(termo)));
}

export const calcularPermissaoAcao = (cobrancas: CobrancaTarifa[]): PermissoesAcaoDebitoManual => {
  const permissaoUsuario = verificarUsuario("ACC_MATRIZ") || verificarUsuario("ACC_OPE_CENTRAL");
  if (!permissaoUsuario) {
    return {
      podeAutorizar: false,
      podeRetentar: false,
      podeAcertoManual: false
    };
  }

  const podeAutorizar = cobrancas.some((cobranca) => {
    return cobranca.situacao === EnumSituacaoDebitoManual.AGUARDANDO_APROVACAO || cobranca.situacao === EnumSituacaoDebitoManual.INADIMPLENTE;
  });

  const podeRetentar = cobrancas.some((cobranca) => cobranca.situacao === EnumSituacaoDebitoManual.FATAL);
  const podeAcertoManual = podeRetentar; // Acerto manual é permitido nas mesmas condições de retentativa

  return {
    podeAutorizar,
    podeRetentar,
    podeAcertoManual
  };
}

export const prepararQueryParams = (filtros?: Record<string, string | any>): { titulo: string; valor: string }[] => {

  if (!filtros) return [{ titulo: 'pendente', valor: "true" }]
  if (!filtros['convenio'] || !filtros['periodo']) {
    throw new ErroGenericoInterno('Filtros obrigatórios não preenchidos', ['Os filtros de convênio e período são obrigatórios para realizar a busca. Por favor, preencha ambos os campos e tente novamente.']);
  }
  const periodoFormatado = formatarAnoEMes(filtros['periodo']);
  const parametros = [
    { titulo: 'numeroConvenio', valor: filtros['convenio'] },
    { titulo: 'mesReferencia', valor: periodoFormatado },
    { titulo: 'pendente', valor: "false" },
  ];

  return parametros;
}

const formatarTipoDebito = (tipo: EnumTipoDebitoManual): string => {
  switch (tipo) {
    case EnumTipoDebitoManual.CAIXA:
      return "Caixa";
    case EnumTipoDebitoManual.OUTROS:
      return "Outras IF";
    case EnumTipoDebitoManual.RETENTATIVA:
      return "Retentativa";
    default:
      return "Tipo desconhecido";
  }
}

const definirDescricaoMesReferencia = (mesReferencia: string): string => {
  const [ano, mes] = mesReferencia.split("-");
  const mesFormatado = MESES[mes] ?? "Mês desconhecido";
  return `${mesFormatado} de ${ano}`;
}

const definirMesReferencia = (mesReferencia: string): string => {
  const [ano, mes] = mesReferencia.split("-");
  return `${mes}/${ano}`;
}

const normalize = (value?: string): string => {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const formatarSituacaoDebito = (situacao: EnumSituacaoDebitoManual): string => {
  return MAPA_LABEL_ENUM_SITUACAO_DEBITO[situacao] ?? "Situação desconhecida";
}

const formatarDataSituacaoPtBr = (dataSituacao: string): string => {
  if (!dataSituacao?.trim()) {
    return EnumTexto.VAZIO;
  }

  return formatarDataHoraPtBr(new Date(dataSituacao));
}
