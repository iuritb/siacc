export type CancelarGenerico = {
  titulo: string,
  subtitulo: string,
  tipo: EnumTipoCancelamento,
  numero: string | null,
  sucesso: string,
  descricao: string
}

export enum EnumTipoCancelamento {

  SIMULACAO = "SIMULACAO",
  CONVENIO = "CONVENIO"

}


export const PARAMETROS_CANCELAR_SIMULACAO: CancelarGenerico = {
  titulo: "Cancelar Simulação",
  subtitulo: "Confirma o cancelamento desta simulação?",
  tipo: EnumTipoCancelamento.SIMULACAO,
  numero: null,
  sucesso: "Simulação cancelada com sucesso!",
  descricao: "Nº da Simulação cancelada:"
}

export const PARAMETROS_CANCELAR_CONVENIO: CancelarGenerico = {
  titulo: "Excluir Convênio",
  subtitulo: "Deseja Excluir Convênio?",
  tipo: EnumTipoCancelamento.CONVENIO,
  numero: null,
  sucesso: "Convênio excluído com sucesso!",
  descricao: "Nº do Convênio Excluido:"
}
