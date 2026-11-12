import {
  formatarDebitoManualPendente,
  formatarDadosDasCobrancas,
  atualizarDebitoManualPendenteComCobrancasEPermissoes,
  matchDebito,
  calcularPermissaoAcao,
  prepararQueryParams
} from './debito-manual-pendente.helpers';

import * as documentoUtils from '../../shared/utils/documento/documento.utils';
import * as dataUtils from '../../shared/utils/data/data.utils';
import * as stringUtils from '../../shared/utils/string/string.utils';

import {
  EnumSituacaoDebitoManual,
  EnumTipoDebitoManual
} from './domain/debito-manual.enum';

import { ErroGenericoInterno } from '../../shared/errors/erro-generico-interno';
import { DebitoManualPendenteResponse } from './domain/debito-manual-pendente.model';

describe('debito-manual-pendente.utils', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===============================
  //  formatarDebitoManualPendente
  // ===============================
  describe('formatarDebitoManualPendente', () => {

    it('deve formatar corretamente os dados', () => {
      jest.spyOn(documentoUtils, 'formatarDocumento').mockReturnValue('CNPJ_FORMATADO');
      jest.spyOn(stringUtils, 'formatarValor').mockReturnValue('R$ 100,00');
      jest.spyOn(documentoUtils, 'verificarUsuario').mockReturnValue(true);

      const input: DebitoManualPendenteResponse = [{
        cnpj: '123',
        razaoSocial: 'Empresa',
        convenioId: 1,
        unidadeVinculacao: 'UV',
        periodo: '2024-01',
        valorApurado: 100,
        dataPrevista: '2024-01-01',
        cobrancas: []
      }];

      const result = formatarDebitoManualPendente(input);

      expect(result[0].cnpj).toBe('CNPJ_FORMATADO');
      expect(result[0].valorApurado).toBe('R$ 100,00');
      expect(result[0].descricaoMesReferencia).toContain('2024');
      expect(result[0].periodoFormatado).toBe('01/2024');
      expect(result[0].dataPrevistaFormatada).toBe('01/01/2024');
    });

    it('deve retornar array vazio', () => {
      expect(formatarDebitoManualPendente([])).toEqual([]);
    });

  });

  // ===============================
  //  formatarDadosDasCobrancas
  // ===============================
  describe('formatarDadosDasCobrancas', () => {

    it('deve formatar e ordenar por tipo', () => {
      jest.spyOn(stringUtils, 'formatarValor').mockReturnValue('R$ 50');
      jest.spyOn(dataUtils, 'formatarDataHoraPtBr').mockReturnValue('01/01/2024');

      const cobrancas: any = [
        { tipo: EnumTipoDebitoManual.OUTROS, valor: 50, situacao: 1, dataSituacao: '2024-01-01' },
        { tipo: EnumTipoDebitoManual.CAIXA, valor: 50, situacao: 1, dataSituacao: '2024-01-01' }
      ];

      const result = formatarDadosDasCobrancas(cobrancas);

      expect(result.length).toBe(2);
      expect(result[0].tipo).toBe(EnumTipoDebitoManual.CAIXA); // ordem
    });

  });

  // ===============================
  //  atualizarDebitoManual
  // ===============================
  describe('atualizarDebitoManualPendenteComCobrancasEPermissoes', () => {

    it('deve atualizar cobrancas e permissoes', () => {
      const debito: any = {
        cobrancasFormatadas: [{ tipo: 1, repasseId: 1 }]
      };

      const cobrancasAtualizadas: any = [
        { tipo: 1, repasseId: 1, valor: 100 }
      ];

      const result = atualizarDebitoManualPendenteComCobrancasEPermissoes(
        debito,
        cobrancasAtualizadas
      );

      expect(result.cobrancasFormatadas.length).toBe(1);
    });

    it('deve retornar debito original se inválido', () => {
      const result = atualizarDebitoManualPendenteComCobrancasEPermissoes(null as any, []);
      expect(result).toBeNull();
    });

  });

  // ===============================
  //  matchDebito
  // ===============================
  describe('matchDebito', () => {

    it('deve encontrar termo ignorando maiúsculas e acentos', () => {
      const debito: any = {
        cnpj: '123',
        razaoSocial: 'Empresa Ágil',
        convenioId: 1,
        periodo: '2024-01',
        periodoFormatado: '01/2024',
        descricaoMesReferencia: 'Janeiro de 2024',
        valorApurado: '100'
      };

      expect(matchDebito(debito, 'agil')).toBe(true);
    });

    it('deve retornar false quando não encontrar', () => {
      const debito: any = { razaoSocial: 'XPTO' };

      expect(matchDebito(debito, 'teste')).toBe(false);
    });

  });

  // ===============================
  //  calcularPermissaoAcao
  // ===============================
  describe('calcularPermissaoAcao', () => {

    it('deve negar permissões sem perfil', () => {
      jest.spyOn(documentoUtils, 'verificarUsuario').mockReturnValue(false);

      const result = calcularPermissaoAcao([]);

      expect(result).toEqual({
        podeAutorizar: false,
        podeRetentar: false,
        podeAcertoManual: false
      });
    });

    it('deve permitir ações conforme situação', () => {
      jest.spyOn(documentoUtils, 'verificarUsuario').mockReturnValue(true);

      const result = calcularPermissaoAcao([
        { situacao: EnumSituacaoDebitoManual.FATAL }
      ] as any);

      expect(result.podeRetentar).toBe(true);
      expect(result.podeAcertoManual).toBe(true);
    });

  });

  // ===============================
  //  prepararQueryParams
  // ===============================
  describe('prepararQueryParams', () => {

    it('deve retornar default quando vazio', () => {
      const result = prepararQueryParams();

      expect(result).toEqual([{ titulo: 'pendente', valor: "true" }]);
    });

    it('deve montar parâmetros corretamente', () => {
      jest.spyOn(dataUtils, 'formatarAnoEMes').mockReturnValue('202401');

      const result = prepararQueryParams({
        convenio: '123',
        periodo: '2024-01'
      });

      expect(result).toEqual([
        { titulo: 'numeroConvenio', valor: '123' },
        { titulo: 'mesReferencia', valor: '202401' },
        { titulo: 'pendente', valor: "false" }
      ]);
    });

    it('deve lançar erro se filtros inválidos', () => {
      expect(() =>
        prepararQueryParams({ convenio: '' })
      ).toThrow(ErroGenericoInterno);
    });

  });

});
