import { EnumTexto } from '../../../../interfaces';
import { EnumStatusCobR, EnumTipoConta } from '../../../../shared/models/autorizacao-agendamento/cobr.enum';
import { CobRDoLote } from '../../domain/lote-agendamentos.model';
import { EnumSituacaoCobrancaLote, EnumStatusLoteCobr, EnumTipoLoteCobr } from '../../domain/lote-agendamentos.enum';
import {
  definirClasseStatusCobrDoLote,
  deveConsultarApiNoDetalheLote,
  formatarCobsrDoLoteParaHtml,
  formatarDadosCancelamentoDeCobDoLote,
  obterTooltipCancelamentoDoLote,
  parametroPrimarioHeaderDetalhamentoLote,
  parametroSecundarioHeaderDetalhamentoLote,
  podeCancelarCobrancaDoLote,
} from './detalhamento-lote.helpers';

describe('detalhamento-lote.helpers', () => {
  const criarCobBase = (overrides: Partial<CobRDoLote> = {}): CobRDoLote => ({
    txid: 'txid-1',
    recebedor: {
      conta: '12345',
      tipoConta: EnumTipoConta.CORRENTE,
      agencia: '0001',
    },
    situacao: EnumSituacaoCobrancaLote.SUCESSO,
    dataHoraSituacao: '2024-01-10T12:00:00.000Z',
    integracao: [],
    ...overrides,
  });

  describe('formatarCobsrDoLoteParaHtml', () => {
    it('formata cob com dados completos e usa ultima atualizacao valida', () => {
      const cobsr: CobRDoLote[] = [
        criarCobBase({
          status: EnumStatusCobR.ATIVA,
          devedor: { nome: 'Maria', cpf: '12345678901' },
          vinculo: { contrato: 'contrato-01' },
          valor: { original: '145.88' },
          calendario: { criacao: '2024-01-01T10:00:00.000Z', dataDeVencimento: '2024-02-01' },
          integracao: [
            { codigo: 1, dataHora: '2024-01-01T09:00:00.000Z' },
            { codigo: 2, dataHora: '2024-01-02T09:00:00.000Z', retorno: { detail: 'ok' } },
          ],
          atualizacao: [
            { status: EnumStatusCobR.CRIADA, data: 'invalid-date' },
            { status: EnumStatusCobR.CONCLUIDA, data: '2024-01-03T12:00:00.000Z' },
            { status: EnumStatusCobR.ATIVA, data: '2024-01-04T12:00:00.000Z' },
          ],
        }),
      ];

      const resultado = formatarCobsrDoLoteParaHtml(cobsr);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].statusFormatado).toBe('Ativa');
      expect(resultado[0].documentoFormatado).toBe('123.456.789-01');
      expect(resultado[0].nomeFormatado).toBe('Maria');
      expect(resultado[0].contratoVinculoFormatado).toBe('contrato-01');
      expect(resultado[0].valorOriginalFormatado).toContain('R$');
      expect(resultado[0].dataVencimentoFormatada).toBe('01/02/2024');
      expect(resultado[0].dataHoraStatusFormatada).toContain('/');
      expect(resultado[0].recebedorTipoContaFormatado).toBe('Corrente');
      expect(resultado[0].recebedorContaFormatada).toBe('12345');
      expect(resultado[0].recebedorAgenciaFormatada).toBe('0001');
      expect(resultado[0].ultimaIntegracao?.codigo).toBe(2);
    });

    it('aplica fallback quando campos opcionais estiverem ausentes', () => {
      const cobsr: CobRDoLote[] = [
        criarCobBase({
          situacao: EnumSituacaoCobrancaLote.ERRO,
          status: undefined,
          devedor: undefined,
          vinculo: undefined,
          valor: undefined,
          calendario: undefined,
          recebedor: { conta: '', tipoConta: undefined as any, agencia: '' } as any,
          atualizacao: undefined,
          integracao: [],
        }),
      ];

      const resultado = formatarCobsrDoLoteParaHtml(cobsr);

      expect(resultado[0].statusFormatado).toBe('Erro');
      expect(resultado[0].documentoFormatado).toBe(EnumTexto.HIFEN);
      expect(resultado[0].nomeFormatado).toBe(EnumTexto.HIFEN);
      expect(resultado[0].contratoVinculoFormatado).toBe(EnumTexto.HIFEN);
      expect(resultado[0].valorOriginalFormatado).toBe(EnumTexto.HIFEN);
      expect(resultado[0].dataVencimentoFormatada).toBe(EnumTexto.HIFEN);
      expect(resultado[0].dataHoraStatusFormatada).toContain('/');
      expect(resultado[0].recebedorTipoContaFormatado).toBe(EnumTexto.HIFEN);
      expect(resultado[0].recebedorContaFormatada).toBe(EnumTexto.HIFEN);
      expect(resultado[0].recebedorAgenciaFormatada).toBe(EnumTexto.HIFEN);
      expect(resultado[0].ultimaIntegracao).toBeUndefined();
    });

    it('usa cnpj e hifen quando documento nao estiver disponivel', () => {
      const cobsr: CobRDoLote[] = [
        criarCobBase({ devedor: { nome: 'Empresa', cnpj: '12345678000199' } }),
        criarCobBase({ txid: 'txid-2', devedor: { nome: 'Sem Documento' } }),
      ];

      const resultado = formatarCobsrDoLoteParaHtml(cobsr);

      expect(resultado[0].documentoFormatado).toBe('12.345.678/0001-99');
      expect(resultado[1].documentoFormatado).toBe(EnumTexto.HIFEN);
    });
  });

  describe('parametroPrimarioHeaderDetalhamentoLote', () => {
    it('retorna id e nome quando resposta existir', () => {
      const resultado = parametroPrimarioHeaderDetalhamentoLote({
        parametros: {
          id: 987,
          convenio: 123,
          nome: 'Lote Teste',
          tipo: EnumTipoLoteCobr.INCLUSAO,
          situacao: EnumStatusLoteCobr.CRIADO,
          calendario: { criacao: '2024-01-01T10:00:00.000Z' },
          paginacao: { paginaAtual: 0, totalPaginas: 1, totalRegistros: 1, itensPorPagina: 10 },
        },
        cobsr: [],
      });

      expect(resultado).toEqual({ titulo: 'Id do Lote', valor: '987', nome: 'Lote Teste' });
    });

    it('retorna fallback quando resposta for nula', () => {
      const resultado = parametroPrimarioHeaderDetalhamentoLote(null);

      expect(resultado).toEqual({ titulo: 'Id do Lote', valor: EnumTexto.HIFEN, nome: '' });
    });
  });

  describe('definirClasseStatusCobrDoLote', () => {
    it('retorna classe esperada para cada situacao', () => {
      expect(definirClasseStatusCobrDoLote(EnumSituacaoCobrancaLote.PENDENTE)).toBe('status-pendente');
      expect(definirClasseStatusCobrDoLote(EnumSituacaoCobrancaLote.SUCESSO)).toBe('status-sucesso');
      expect(definirClasseStatusCobrDoLote(EnumSituacaoCobrancaLote.ERRO)).toBe('status-erro');
      expect(definirClasseStatusCobrDoLote('INEXISTENTE' as any)).toBe('');
    });
  });

  describe('parametroSecundarioHeaderDetalhamentoLote', () => {
    it('monta os campos do cabecalho secundario', () => {
      const resultado = parametroSecundarioHeaderDetalhamentoLote({
        parametros: {
          id: 99,
          convenio: 12345,
          nome: 'Teste',
          tipo: EnumTipoLoteCobr.INCLUSAO,
          situacao: EnumStatusLoteCobr.PROCESSADO,
          calendario: { criacao: '2024-02-01T10:00:00.000Z' },
          paginacao: { paginaAtual: 0, totalPaginas: 1, totalRegistros: 1, itensPorPagina: 10 },
        },
        cobsr: [],
      });

      expect(resultado['Convênio']['0']).toBe('12345');
      expect(resultado['Tipo']['0']).toBe('Inclusão');
      expect(resultado['Situação']['0']).toBe('Processado');
      expect(resultado['Data de envio']['0']).toContain('/');
    });

    it('aplica fallback quando parametros nao existirem', () => {
      const resultado = parametroSecundarioHeaderDetalhamentoLote(null);

      expect(resultado['Convênio']['0']).toBe(EnumTexto.HIFEN);
      expect(resultado['Tipo']['0']).toBe(EnumTexto.NAO_INFORMADO);
      expect(resultado['Situação']['0']).toBe(EnumTexto.NAO_INFORMADO);
      expect(resultado['Data de envio']['0']).toBe(EnumTexto.DATA_INVALIDA);
    });
  });

  describe('cancelamento e tooltip', () => {
    const cobBaseHtml = formatarCobsrDoLoteParaHtml([
      criarCobBase({ status: EnumStatusCobR.ATIVA, situacao: EnumSituacaoCobrancaLote.SUCESSO }),
    ])[0];

    it('valida regra de podeCancelarCobrancaDoLote', () => {
      expect(podeCancelarCobrancaDoLote(cobBaseHtml)).toBe(true);
      expect(podeCancelarCobrancaDoLote({ ...cobBaseHtml, status: EnumStatusCobR.CANCELADA })).toBe(false);
      expect(podeCancelarCobrancaDoLote({ ...cobBaseHtml, status: undefined as any })).toBe(false);
      expect(podeCancelarCobrancaDoLote({ ...cobBaseHtml, situacao: EnumSituacaoCobrancaLote.ERRO })).toBe(false);
    });

    it('valida regra de deveConsultarApiNoDetalheLote', () => {
      expect(deveConsultarApiNoDetalheLote(cobBaseHtml)).toBe(true);
      expect(deveConsultarApiNoDetalheLote({ ...cobBaseHtml, status: undefined as any })).toBe(false);
      expect(deveConsultarApiNoDetalheLote({ ...cobBaseHtml, situacao: EnumSituacaoCobrancaLote.ERRO })).toBe(false);
    });

    it('retorna tooltip correto para cada cenario', () => {
      expect(obterTooltipCancelamentoDoLote(cobBaseHtml)).toBe('Cancelar Agendamento Futuro');
      expect(obterTooltipCancelamentoDoLote({ ...cobBaseHtml, status: undefined as any }))
        .toBe('Cancelamento disponível apenas quando o agendamento possuir status.');
      expect(obterTooltipCancelamentoDoLote({ ...cobBaseHtml, status: EnumStatusCobR.CANCELADA }))
        .toBe('Agendamento futuro já está cancelado.');
      expect(obterTooltipCancelamentoDoLote({ ...cobBaseHtml, situacao: EnumSituacaoCobrancaLote.ERRO }))
        .toBe('Cancelamento disponível apenas para agendamentos com situação de sucesso.');
      expect(obterTooltipCancelamentoDoLote({ ...cobBaseHtml, status: '' as any }))
        .toBe('Cancelamento disponível apenas quando o agendamento possuir status.');
    });
  });

  describe('formatarDadosCancelamentoDeCobDoLote', () => {
    it('retorna payload formatado para cancelamento', () => {
      const cob = formatarCobsrDoLoteParaHtml([
        criarCobBase({
          txid: 'txid-cancelamento',
          status: EnumStatusCobR.ATIVA,
          calendario: { criacao: '2024-03-01T10:00:00.000Z', dataDeVencimento: '2024-03-15' },
        }),
      ])[0];

      const resultado = formatarDadosCancelamentoDeCobDoLote(cob, 123456);

      expect(resultado.txid).toBe('txid-cancelamento');
      expect(resultado.convenio).toBe('123456');
      expect(resultado.status).toBe(EnumStatusCobR.ATIVA);
      expect(resultado.dataCriacao).toBe('2024-03-01T10:00:00.000Z');
      expect(resultado.dataCriacaoFormatada).toContain('/');
      expect(resultado.dataVencimento).toBe('2024-03-15');
      expect(resultado.dataVencimentoFormatada).toBe('15/03/2024');
    });

    it('aplica fallback de data de criacao quando calendario estiver ausente', () => {
      const cob = formatarCobsrDoLoteParaHtml([
        criarCobBase({ status: EnumStatusCobR.ATIVA, calendario: undefined }),
      ])[0];

      const resultado = formatarDadosCancelamentoDeCobDoLote(cob, 77);

      expect(resultado.dataCriacao).toBe(EnumTexto.HIFEN);
      expect(resultado.dataCriacaoFormatada).toBe(EnumTexto.HIFEN);
    });

    it('lanca erro quando status nao for informado', () => {
      const cob = formatarCobsrDoLoteParaHtml([
        criarCobBase({ status: undefined }),
      ])[0];

      expect(() => formatarDadosCancelamentoDeCobDoLote(cob, 1))
        .toThrow('Status da cobrança não informado para cancelamento.');
    });
  });
});
