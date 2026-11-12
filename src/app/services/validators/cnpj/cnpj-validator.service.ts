import { CNPJ_ZERADO, PESOS_DV, REGEX_CARACTERES_MASCARA, REGEX_CARACTERES_NAO_PERMITIDOS, REGEX_CNPJ, REGEX_CNPJ_SEM_DV, TAMANHO_CNPJ_SEM_DV, VALOR_BASE } from '../../../shared/constants/utils/cnpj.constants';
import { ErroGenericoInterno } from '../../../shared/errors/erro-generico-interno';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { removerMascaraCNPJ } from '../../../shared/utils/documento/documento.utils';

export class CnpjValidatorService {

  private static readonly tamanhoCNPJSemDV: number = TAMANHO_CNPJ_SEM_DV;
  private static readonly regexCNPJSemDV: RegExp = REGEX_CNPJ_SEM_DV;
  private static readonly regexCNPJ: RegExp = REGEX_CNPJ;
  private static readonly regexCaracteresMascara: RegExp = REGEX_CARACTERES_MASCARA;
  private static readonly regexCaracteresNaoPermitidos: RegExp = REGEX_CARACTERES_NAO_PERMITIDOS;
  private static readonly valorBase: number = VALOR_BASE;
  private static readonly pesosDV: number[] = PESOS_DV;
  private static readonly cnpjZerado: string = CNPJ_ZERADO;

  /*
    * Validador para ser utilizado diretamente em formulários reativos do Angular.
  */
  static validarControlCNPJ(control: AbstractControl): ValidationErrors | null {
    const cnpj = control.value;
    if (!cnpj) return null;
    if (!CnpjValidatorService.isValid(cnpj)) {
      return { cnpjInvalido: true };
    }
    return null;
  }

  /*
    * Método principal de validação de CNPJ. Retorna true se o CNPJ for válido, ou false caso contrário.
  */
  static isValid(cnpj: string): boolean {
    if (!this.regexCaracteresNaoPermitidos.test(cnpj)) {
      let cnpjSemMascara = removerMascaraCNPJ(cnpj);
      if (this.regexCNPJ.test(cnpjSemMascara) && cnpjSemMascara !== this.cnpjZerado) {
        const dvInformado = cnpjSemMascara.substring(this.tamanhoCNPJSemDV);
        const dvCalculado = this.calculaDV(cnpjSemMascara.substring(0, this.tamanhoCNPJSemDV));
        return dvInformado === dvCalculado;
      }
    }
    return false;
  }

  static calculaDV(cnpj: string): string {
    if (!this.regexCaracteresNaoPermitidos.test(cnpj)) {
      let cnpjSemMascara = removerMascaraCNPJ(cnpj);
      if (this.regexCNPJSemDV.test(cnpjSemMascara) && cnpjSemMascara !== this.cnpjZerado.substring(0, this.tamanhoCNPJSemDV)) {
        let somatorioDV1 = 0;
        let somatorioDV2 = 0;
        for (let i = 0; i < this.tamanhoCNPJSemDV; i++) {
          const asciiDigito = cnpjSemMascara.charCodeAt(i) - this.valorBase;
          somatorioDV1 += asciiDigito * this.pesosDV[i + 1];
          somatorioDV2 += asciiDigito * this.pesosDV[i];
        }
        const dv1 = somatorioDV1 % 11 < 2 ? 0 : 11 - (somatorioDV1 % 11);
        somatorioDV2 += dv1 * this.pesosDV[this.tamanhoCNPJSemDV];
        const dv2 = somatorioDV2 % 11 < 2 ? 0 : 11 - (somatorioDV2 % 11);
        return `${dv1}${dv2}`;
      }
    }
    throw new ErroGenericoInterno("CNPJ inválido", ["Não é possível calcular o DV pois o CNPJ fornecido é inválido"])
  }
}
