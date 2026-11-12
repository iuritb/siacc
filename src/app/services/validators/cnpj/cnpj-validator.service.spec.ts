import { TestBed } from '@angular/core/testing';

import { CnpjValidatorService } from './cnpj-validator.service';
import { ErroGenericoInterno } from '../../../shared/errors/erro-generico-interno';

describe('CnpjValidatorService', () => {
  let service: CnpjValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    TestBed.configureTestingModule({
      providers: [CnpjValidatorService],
    });
    service = TestBed.inject(CnpjValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isValid', () => {

    it('deve retornar true para um CNPJ válido', () => {
      const validCnpj = '12.345.678/0001-95';
      expect(CnpjValidatorService.isValid(validCnpj)).toBe(true);
    });

    it('deve retornar false para um CNPJ inválido', () => {
      const invalidCnpj = '12.345.678/0001-00';
      expect(CnpjValidatorService.isValid(invalidCnpj)).toBe(false);
    });

    it('deve retornar false para um CNPJ com caracteres não permitidos', () => {
      const invalidCnpj = '12.345.678/0001-9A';
      expect(CnpjValidatorService.isValid(invalidCnpj)).toBe(false);
    });

    it('deve retornar false para um CNPJ zerado', () => {
      const cnpjZerado = '00.000.000/0000-00';
      expect(CnpjValidatorService.isValid(cnpjZerado)).toBe(false);
    });

    it('deve retornar false para um CNPJ com máscara incorreta', () => {
      const invalidCnpj = '12345678000195';
      expect(CnpjValidatorService.isValid(invalidCnpj)).toBe(true);
    });

    it('deve retornar false para um CNPJ vazio', () => {
      const emptyCnpj = '';
      expect(CnpjValidatorService.isValid(emptyCnpj)).toBe(false);
    });

    it('deve retornar false para um CNPJ com menos de 14 caracteres', () => {
      const shortCnpj = '12.345.678/0001';
      expect(CnpjValidatorService.isValid(shortCnpj)).toBe(false);
    });

    it('deve retornar false para um CNPJ com mais de 14 caracteres numéricos', () => {
      const longCnpj = '12.345.678/0001-950';
      expect(CnpjValidatorService.isValid(longCnpj)).toBe(false);
    });

    it('deve retornar false para CNPJ com caracteres especiais não permitidos', () => {
      const cnpjComCaracteresEspeciais = '12@345#678/0001-95';
      expect(CnpjValidatorService.isValid(cnpjComCaracteresEspeciais)).toBe(false);
    });
  });

  describe('validarControlCNPJ', () => {

    it('deve retornar null para um controle vazio', () => {
      const control = { value: '' } as any;
      expect(CnpjValidatorService.validarControlCNPJ(control)).toBeNull();
    });

    it('deve retornar null para um controle com CNPJ válido', () => {
      const control = { value: '12.345.678/0001-95' } as any;
      expect(CnpjValidatorService.validarControlCNPJ(control)).toBeNull();
    });

    it('deve retornar um erro para um controle com CNPJ inválido', () => {
      const control = { value: '12.345.678/0001-00' } as any;
      expect(CnpjValidatorService.validarControlCNPJ(control)).toEqual({ cnpjInvalido: true });
    });
  });

  describe('calculaDV', () => {
    it('deve calcular o DV corretamente para um CNPJ válido', () => {
      const cnpjSemDV = '123456780001';
      const dvCalculado = CnpjValidatorService.calculaDV(cnpjSemDV);
      expect(dvCalculado).toBe('95');
    });

    it('deve lançar um erro ao calcular o DV para um CNPJ inválido', () => {
      const invalidCnpjSemDV = '12345678';
      expect(() => CnpjValidatorService.calculaDV(invalidCnpjSemDV)).toThrowError("CNPJ inválido");
    });

    it('deve lançar erro ao calcular DV com CNPJ vazio', () => {
      expect(() => CnpjValidatorService.calculaDV('')).toThrow(ErroGenericoInterno);
    });

    it('deve calcular DV corretamente para diferentes CNPJs válidos', () => {
      const testCases = [
        { cnpj: '123456780001', expected: '95' },
        { cnpj: '000000000191', expected: '00' }
      ];
      testCases.forEach(testCase => {
        const result = CnpjValidatorService.calculaDV(testCase.cnpj);
        expect(result).toBe(testCase.expected);
      });
    });
  });
});
