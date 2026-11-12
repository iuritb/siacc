import {
  formatarLotesParaHtml,
  ordenarLotesPorDataDescendente,
  parametroPrimarioHeaderLote,
  parametroSecundarioHeaderLote
} from './tabela-lote.helpers';
import { EnumTexto } from '../../../../interfaces';
import { LoteCobr, LotesCobrResponse } from '../../domain/lote-agendamentos.model';
import { EnumStatusLoteCobr, EnumTipoLoteCobr } from '../../domain/lote-agendamentos.enum';

describe('tabela-lote.helpers', () => {
  describe('ordenarLotesPorDataDescendente', () => {
    it('ordena lotes do mais recente para o mais antigo', () => {
      const lotes: LoteCobr[] = [
        { id: 1, convenio: 111, tipo: EnumTipoLoteCobr.INCLUSAO, situacao: EnumStatusLoteCobr.CRIADO, calendario: { criacao: '2024-01-01T10:00:00Z' }, totalSolicitacoes: 1 },
        { id: 2, convenio: 222, tipo: EnumTipoLoteCobr.RETENTATIVA, situacao: EnumStatusLoteCobr.PROCESSADO, calendario: { criacao: '2024-02-01T10:00:00Z' }, totalSolicitacoes: 2 },
        { id: 3, convenio: 333, tipo: EnumTipoLoteCobr.INCLUSAO, situacao: EnumStatusLoteCobr.CANCELADO, calendario: { criacao: '2023-12-01T10:00:00Z' }, totalSolicitacoes: 3 }
      ];
      const ordenados = ordenarLotesPorDataDescendente(lotes);
      expect(ordenados[0].id).toBe(2);
      expect(ordenados[1].id).toBe(1);
      expect(ordenados[2].id).toBe(3);
    });
  });

  describe('formatarLotesParaHtml', () => {
    it('deve formatar convenios, datas e status para exibição', () => {
      const lotes: LoteCobr[] = [{
        id: 10,
        convenio: 456,
        tipo: EnumTipoLoteCobr.INCLUSAO,
        situacao: EnumStatusLoteCobr.PROCESSADO,
        calendario: { criacao: '2024-01-10T12:30:00Z' },
        totalSolicitacoes: 4
      }];

      const resultado = formatarLotesParaHtml(lotes);
      expect(resultado[0].situacaoFormatada).toBe('Processado');
      expect(resultado[0].dataEnvioFormatada).toContain('/');
      expect(resultado[0].dataEnvioFormatada).toContain(':');
    });

    it('deve retornar data inválida quando criação for inválida', () => {
      const lotes: LoteCobr[] = [{
        id: 11,
        convenio: 456,
        tipo: EnumTipoLoteCobr.INCLUSAO,
        situacao: EnumStatusLoteCobr.PROCESSADO,
        calendario: { criacao: 'data-invalida' },
        totalSolicitacoes: 1
      }];

      const resultado = formatarLotesParaHtml(lotes);
      expect(resultado[0].dataEnvioFormatada).toBe(EnumTexto.DATA_INVALIDA);
    });
  });

  describe('parametroPrimarioHeaderLote', () => {
    it('retorna objeto primário padrão', () => {
      const response = {
        parametros: { convenio: '123', nome: 'Convenio Teste', dataInicio: '2024-01-01', dataFim: '2024-01-31', paginacao: { paginaAtual: 0, totalPaginas: 1, totalRegistros: 1, itensPorPagina: 10 } },
        lotesCobr: []
      } as LotesCobrResponse;
      const primario = parametroPrimarioHeaderLote(response);
      expect(primario).toEqual({ titulo: 'Convênio', valor: '123', nome: 'Convenio Teste' });
    });
    it('retorna NAO_INFORMADO se não houver convenio', () => {
      const response = { parametros: { dataInicio: '', dataFim: '', paginacao: { paginaAtual: 0, totalPaginas: 1, totalRegistros: 0, itensPorPagina: 10 } }, lotesCobr: [] } as LotesCobrResponse;
      const primario = parametroPrimarioHeaderLote(response);
      expect(primario.valor).toBe(EnumTexto.NAO_INFORMADO);
    });
  });

  describe('parametroSecundarioHeaderLote', () => {
    it('monta corretamente os grupos de parâmetros', () => {
      const response = {
        parametros: {
          dataInicio: '2024-01-01',
          dataFim: '2024-01-31',
          cnpj: '12345678000199',
          nome: 'Convenio Teste',
          tipo: EnumTipoLoteCobr.INCLUSAO,
          situacao: EnumStatusLoteCobr.PROCESSADO,
          paginacao: { paginaAtual: 0, totalPaginas: 1, totalRegistros: 1, itensPorPagina: 10 }
        },
        lotesCobr: []
      } as LotesCobrResponse;
      const secundario = parametroSecundarioHeaderLote(response);
      expect(secundario['Intervalo de Tempo']['0']).toBe('01/01/2024 até 31/01/2024');
      expect(secundario['CNPJ']['0']).toBe('12345678000199');
      expect(secundario['Nome']['0']).toBe('Convenio Teste');
      expect(secundario['Tipo']['0']).toBe(EnumTipoLoteCobr.INCLUSAO);
      expect(secundario['Situação']['0']).toBe(EnumStatusLoteCobr.PROCESSADO);
    });
    it('não inclui grupos vazios', () => {
      const response = { parametros: { dataInicio: '', dataFim: '', paginacao: { paginaAtual: 0, totalPaginas: 1, totalRegistros: 0, itensPorPagina: 10 } }, lotesCobr: [] } as LotesCobrResponse;
      const secundario = parametroSecundarioHeaderLote(response);
      expect(secundario['CNPJ']).toBeUndefined();
      expect(secundario['Nome']).toBeUndefined();
      expect(secundario['Tipo']).toBeUndefined();
      expect(secundario['Situação']).toBeUndefined();
    });
  });
});
