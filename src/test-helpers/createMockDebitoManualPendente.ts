import { CobrancaTarifaFormatada, DebitoManualPendenteFormatado } from '../app/features/debito-manual-pendente/domain/debito-manual-pendente.model';
import { EnumSituacaoDebitoManual, EnumTipoDebitoManual } from '../app/features/debito-manual-pendente/domain/debito-manual.enum';

export function createMockCobrancaTarifaFormatada(overrides: Partial<CobrancaTarifaFormatada> = {}): CobrancaTarifaFormatada {
  return {
    tipo: EnumTipoDebitoManual.CAIXA,
    repasseId: 1,
    valor: 100.00,
    situacao: EnumSituacaoDebitoManual.PROCESSANDO,
    descricaoSituacao: 'Aguardando processamento',
    dataSituacao: '2026-06-01',
    valorFormatado: 'R$ 100,00',
    situacaoFormatada: 'Processando',
    dataSituacaoFormatada: '01/06/2026',
    tipoFormatado: 'Caixa',
    ...overrides
  };
}

export function createMockDebitoManualPendenteFormatado(overrides: Partial<DebitoManualPendenteFormatado> = {}): DebitoManualPendenteFormatado {
  return {
    cnpj: '12345678000199',
    dataPrevistaFormatada: '30/06/2026',
    razaoSocial: 'Empresa Teste',
    unidadeVinculacao: '1563',
    convenioId: 123,
    periodo: '2026-06',
    descricaoMesReferencia: 'Junho de 2026',
    periodoFormatado: '06/2026',
    valorApurado: 'R$ 1.000,00',
    cobrancasFormatadas: [
      createMockCobrancaTarifaFormatada({
        tipo: EnumTipoDebitoManual.CAIXA,
        valor: 600.00,
        situacao: EnumSituacaoDebitoManual.PROCESSANDO,
        descricaoSituacao: 'Aguardando processamento',
        dataSituacao: '2026-06-01',
        valorFormatado: 'R$ 600,00',
        situacaoFormatada: 'Processando',
        dataSituacaoFormatada: '01/06/2026',
        tipoFormatado: 'Caixa'
      }),
      createMockCobrancaTarifaFormatada({
        tipo: EnumTipoDebitoManual.OUTROS,
        repasseId: 2,
        valor: 300.00,
        situacao: EnumSituacaoDebitoManual.FATAL,
        descricaoSituacao: 'Falha crítica',
        dataSituacao: '2026-06-02',
        valorFormatado: 'R$ 300,00',
        situacaoFormatada: 'Fatal',
        dataSituacaoFormatada: '02/06/2026',
        tipoFormatado: 'Outras IF'
      }),
      createMockCobrancaTarifaFormatada({
        tipo: EnumTipoDebitoManual.RETENTATIVA,
        repasseId: 3,
        valor: 100.00,
        situacao: EnumSituacaoDebitoManual.SUCESSO,
        descricaoSituacao: 'Nova tentativa em andamento',
        dataSituacao: '2026-06-03',
        valorFormatado: 'R$ 100,00',
        situacaoFormatada: 'Sucesso',
        dataSituacaoFormatada: '03/06/2026',
        tipoFormatado: 'Retentativa'
      })
    ],
    podeAutorizar: true,
    podeRetentar: false,
    podeAcertoManual: true,
    ...overrides
  };
}
