import { Tarifa, TipoTarifa, TipoTarifaSimulador } from "../app/interfaces";

let tarifaIdCounter = 1;

export function createMockTarifa(overrides: Partial<Tarifa> = {}): Tarifa {
  return {
    id: tarifaIdCounter++,
    tipo: TipoTarifaSimulador.BALCAO,
    visible: true,
    custom: false,
    referencia: false,
    condicao: `Condicao ${tarifaIdCounter}`,
    pgCaixa: 50,
    pgOutros: 75,
    retentativa: 1,
    degustacao: 2,
    situacao: 'ATIVA',
    recomended: true,
    ...overrides
  };
}

export function createMockObterTarifasConvenioResponse(): any[] {
  return [
    {
      "tipo": TipoTarifa.BALCAO,
      "id": null,
      "nome": "Balcão",
      "tarifaPagadoresCaixa": 4.95,
      "tarifaPagadoresOutras": 4.95,
      "tarifaRetentativa": 5,
      "diasDegustacao": 90,
      "excecaoContaDebitoDiferente": null,
      "excecaoInibirRetentativa": null,
      "excecaoInibirIniciadoraOpenFinance": null,
      "excecaoMinutaEditalCredenciamento": null
    },
    {
      "tipo": TipoTarifa.SIMULACAO,
      "id": null,
      "nome": "Balcão2",
      "tarifaPagadoresCaixa": 1.95,
      "tarifaPagadoresOutras": 1.95,
      "tarifaRetentativa": 2,
      "diasDegustacao": 90,
      "excecaoContaDebitoDiferente": null,
      "excecaoInibirRetentativa": null,
      "excecaoInibirIniciadoraOpenFinance": null,
      "excecaoMinutaEditalCredenciamento": null
    }
  ];
}

export function createMockObterTarifasConvenioProcessadas(): Tarifa[] {
  return [
    {
      "tipo": TipoTarifa.BALCAO,
      "id": null,
      "condicao": "Balcão",
      "pgCaixa": 4.95,
      "pgOutros": 4.95,
      "retentativa": 5,
      "degustacao": 90,
      "excecaoContaDebitoDiferente": false,
      "excecaoInibirRetentativa": false,
      "excecaoInibirIniciadoraOpenFinance": false,
      "excecaoMinutaEditalCredenciamento": false,
      "situacao": "Aprovado",
      "recomended": true,
      "custom": false,
      "referencia": true,
      "visible": true
    },
    {
      "tipo": TipoTarifa.SIMULACAO,
      "id": null,
      "condicao": "Balcão2",
      "pgCaixa": 1.95,
      "pgOutros": 1.95,
      "retentativa": 2,
      "degustacao": 90,
      "excecaoContaDebitoDiferente": false,
      "excecaoInibirRetentativa": false,
      "excecaoInibirIniciadoraOpenFinance": false,
      "excecaoMinutaEditalCredenciamento": false,
      "situacao": "Aprovado",
      "recomended": false,
      "custom": false,
      "referencia": false,
      "visible": true
    }
  ];
}
