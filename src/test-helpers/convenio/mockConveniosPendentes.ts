import { ConvenioPendenteResponse, EnumTipoPendencia } from "../../app/shared/models/convenio/convenio.model";

export const mockConveniosPendentes: ConvenioPendenteResponse = [
  {
    idConvenio: 1628,
    cnpj: "57885220000167",
    unidade: 3430,
    dataInclusao: "2025-11-12",
    tipoPendenciaConformidade: EnumTipoPendencia.ATIVACAO
  },
  {
    idConvenio: 1537,
    cnpj: "57885220000167",
    unidade: 5002,
    dataInclusao: "2025-10-22",
    tipoPendenciaConformidade: EnumTipoPendencia.ATIVACAO
  },
  {
    idConvenio: 1469,
    cnpj: "93816596000183",
    unidade: 5002,
    dataInclusao: "2025-10-14",
    tipoPendenciaConformidade: EnumTipoPendencia.ALTERACAO
  },
]
