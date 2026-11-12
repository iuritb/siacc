import { TipoTarifa, TipoTarifaSimulador } from "../../interfaces";

export enum EnumAvaliacaoSimulacao {
  APROVADA = 'APROVADA',
  REPROVADA = 'REPROVADA',
  CONTRAPROPOSTA = 'CONTRAPROPOSTA'
}

export interface IndicadoresSimulacao {
  simulacaoEmAlgumConvenio: boolean;
  simulacaoCancelada: boolean;
  simulacaoUnidadeDivergenteOuMatriz: boolean;
}

export interface PreferenciaFiltro {
  id: number;
  tipo: TipoTarifa | TipoTarifaSimulador;
}
