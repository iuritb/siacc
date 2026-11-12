import { CobrancaTarifa, DebitoManualPendenteResponse } from './debito-manual-pendente.model';
import { EnumSituacaoDebitoManual, EnumTipoDebitoManual } from './debito-manual.enum';

const DATA_SITUACAO_PADRAO = '2026-06-01T00:00:00';

export const MOCK_COBRANCAS_TARIFA: CobrancaTarifa[] = [
  {
    tipo: EnumTipoDebitoManual.CAIXA,
    valor: 5000.5,
    situacao: EnumSituacaoDebitoManual.FATAL,
    descricaoSituacao: 'Erro no NSGD',
    dataSituacao: DATA_SITUACAO_PADRAO,
    repasseId: 1,
  },
  {
    tipo: EnumTipoDebitoManual.OUTROS,
    valor: 10000,
    situacao: EnumSituacaoDebitoManual.SUCESSO,
    descricaoSituacao: null,
    dataSituacao: DATA_SITUACAO_PADRAO,
    repasseId: 2,
  },
];

export const MOCK_COBRANCAS_TARIFA_RETENTAR: CobrancaTarifa[] = [
  {
    tipo: EnumTipoDebitoManual.CAIXA,
    valor: 10000,
    situacao: EnumSituacaoDebitoManual.SUCESSO,
    descricaoSituacao: null,
    dataSituacao: DATA_SITUACAO_PADRAO,
    repasseId: 2,
  }
];


export const DEBITO_MANUAL_PENDENTE_MOCKS: DebitoManualPendenteResponse = [
  // 1. Aguardando Aprovacao - Habilita Autorizar (sem RETENTATIVA)
  {
    cnpj: 'P18RZW4V000160',
    razaoSocial: 'Nome da Empres Muito Grande Criado Agorinha A LTDA',
    unidadeVinculacao: '1563',
    convenioId: 1001,
    periodo: '2026-05',
    valorApurado: 15000.5,
    cobrancas: [
      {
        tipo: EnumTipoDebitoManual.CAIXA,
        repasseId: 1,
        valor: 5000.5,
        situacao: EnumSituacaoDebitoManual.AGUARDANDO_APROVACAO,
        descricaoSituacao: null,
        dataSituacao: DATA_SITUACAO_PADRAO,
      },
      {
        tipo: EnumTipoDebitoManual.OUTROS,
        repasseId: 2,
        valor: 10000,
        situacao: EnumSituacaoDebitoManual.AGUARDANDO_APROVACAO,
        descricaoSituacao: null,
        dataSituacao: DATA_SITUACAO_PADRAO,
      },
    ],
  },

  // 2. Inadimplente - Habilita Autorizar (sem OUTRAS_IF e RETENTATIVA)
  {
    cnpj: '23456789000180',
    razaoSocial: 'EMPRESA B EIRELI',
    unidadeVinculacao: '1563',
    convenioId: 1002,
    periodo: '2026-05',
    valorApurado: 8500.75,
    cobrancas: [
      {
        tipo: EnumTipoDebitoManual.CAIXA,
        repasseId: 3,
        valor: 2500.25,
        situacao: EnumSituacaoDebitoManual.INADIMPLENTE,
        descricaoSituacao: 'Cliente em atraso',
        dataSituacao: DATA_SITUACAO_PADRAO,
      },
    ],
  },

  // 3. Processando - sem botoes
  {
    cnpj: '34567890000170',
    razaoSocial: 'EMPRESA C SA',
    unidadeVinculacao: '0123',
    convenioId: 1003,
    periodo: '2026-05',
    valorApurado: 12000,
    cobrancas: [
      {
        tipo: EnumTipoDebitoManual.CAIXA,
        repasseId: 106,
        valor: 4000,
        situacao: EnumSituacaoDebitoManual.PROCESSANDO,
        descricaoSituacao: null,
        dataSituacao: DATA_SITUACAO_PADRAO,
      },
      {
        tipo: EnumTipoDebitoManual.OUTROS,
        repasseId: 107,
        valor: 4000,
        situacao: EnumSituacaoDebitoManual.PROCESSANDO,
        descricaoSituacao: null,
        dataSituacao: DATA_SITUACAO_PADRAO,
      },
      {
        tipo: EnumTipoDebitoManual.RETENTATIVA,
        repasseId: 108,
        valor: 4000,
        situacao: EnumSituacaoDebitoManual.PROCESSANDO,
        descricaoSituacao: 'Aguardando disponibilidade de saldo',
        dataSituacao: DATA_SITUACAO_PADRAO,
      },
    ],
  },
];
