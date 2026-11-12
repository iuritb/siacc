import { Validators } from "@angular/forms";
import { EnumInputTipos, RelatorioOpcao } from "../../../shared/models/utils/filtro-dinamico.model";
import { EnumDestinoDebitoManual } from "./debito-manual.enum";

export const filtrosAvancadosConfigs: RelatorioOpcao<string> = {
  label: 'Débitos Manuais Pendentes',
  icon: 'handshake',
  destino: EnumDestinoDebitoManual.DEBITO_MANUAL_TODOS,
  btnConfig: {
    label: 'Filtrar',
    size: 'small',
    icon: 'search',
    variant: 'secondary'
  },
  configs: [
    {
      titulo: 'Filtros avançados',
      tooltip: 'Use estes filtros para consultar convênio e período de forma dinâmica.',
      filtros: [
        {
          tipo: EnumInputTipos.INPUT,
          queryParam: true,
          validadores: [Validators.required, Validators.maxLength(20)],
          inputConfig: {
            label: 'Convênio',
            name: 'convenio',
            placeholder: 'Informe o convênio',
            size: 'small',
            required: true,
            mask: '000000'
          }
        },
        {
          tipo: EnumInputTipos.DATE_MES_ANO,
          queryParam: true,
          validadores: [Validators.required],
          inputConfig: {
            label: 'Mês e ano',
            name: 'periodo',
            placeholder: 'MM/AAAA',
            size: 'small',
            required: true
          }
        }
      ]
    }
  ]
};
