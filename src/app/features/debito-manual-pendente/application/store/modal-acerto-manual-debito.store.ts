import { Injectable, computed, signal } from '@angular/core';
import { CobrancaTarifa, DebitoManualPendenteFormatado } from '../../domain/debito-manual-pendente.model';
import { FormatadorFeedbackService } from '../../../../services/formatador-feedback/formatador-feedback.service';
import { MENSAGENS_MODAL_ACERTO_MANUAL_DEBITO } from '../../domain/debito-manual-pendente.constants';
import { IModalAcaoDebitoPendenteStore, ModalResultContract } from '../../domain/debito-manual-pendente-contracts.interface';
import { atualizarDebitoManualPendenteComCobrancasEPermissoes } from '../../debito-manual-pendente.helpers';
import { EnumSituacaoDebitoManual } from '../../domain/debito-manual.enum';
import { DebitoManualPendenteGateway } from '../query/debito-manual-pendente-query.service';
import { formatarValor } from '../../../../shared/utils/string/string.utils';

@Injectable({
  providedIn: null
})
export class ModalAcertoManualDebitoStore implements IModalAcaoDebitoPendenteStore {
  constructor(
    private readonly gateway: DebitoManualPendenteGateway,
    private readonly formatadorFeedbackService: FormatadorFeedbackService
  ) { }

  // Estado privado
  private readonly _debitoFormatado = signal<DebitoManualPendenteFormatado>(null as any);
  private readonly _isSending = signal(false);
  private readonly _cobrancaFoiAtualizada = signal<boolean>(false);
  private readonly _controller = signal<AbortController | null>(null);
  // Exposed (readonly)
  readonly debitoFormatado = this._debitoFormatado.asReadonly();
  readonly isSending = this._isSending.asReadonly();
  readonly cobrancaFoiAtualizada = this._cobrancaFoiAtualizada.asReadonly();
  readonly cobrancasParaAcertoManual = computed(() => {
    const debito = this._debitoFormatado();
    return debito?.cobrancasFormatadas.filter((cobranca) => cobranca.situacao === EnumSituacaoDebitoManual.FATAL) ?? [];
  });
  readonly valorApuradoAcerto = computed(() => {
    const debito = this._debitoFormatado();
    return this.calcularValorApuradoDoAcertoManual(debito.cobrancasFormatadas);
  });

  public inicializar(debitoFormatado: DebitoManualPendenteFormatado): void {
    this._debitoFormatado.set(debitoFormatado);
  }

  public cancelarRequisicaoAtual(): void {
    const controllerAtual = this._controller();
    if (controllerAtual) {
      controllerAtual.abort();
      this._controller.set(null);
    }
  }

  public async acertoManual(
    convenioId: number,
    periodo: string,
    observacao: string
  ): Promise<ModalResultContract> {
    const controller = this.iniciarRequisicao();
    if (!controller) {
      return { ok: false, isFeedback: false, mensagem: MENSAGENS_MODAL_ACERTO_MANUAL_DEBITO.requisicaoEmAndamento };
    }

    try {
      const resultado = await this.gateway.acertoManualDebitoManualPendente(
        convenioId,
        periodo,
        observacao,
        controller
      );

      if (resultado.ok) {
        this._cobrancaFoiAtualizada.set(true);
        this._debitoFormatado.update((current) => atualizarDebitoManualPendenteComCobrancasEPermissoes(current, resultado.data));

        return {
          ok: true,
          feedback: {
            titulo: MENSAGENS_MODAL_ACERTO_MANUAL_DEBITO.tituloAcertoManual,
            mensagem: MENSAGENS_MODAL_ACERTO_MANUAL_DEBITO.mensagemSucessoAcertoManual,
            descricao: MENSAGENS_MODAL_ACERTO_MANUAL_DEBITO.descricaoSucessoAcertoManual,
            variant: 'success'
          }
        };
      }

      if (resultado.abort) {
        return { ok: false, isFeedback: false, mensagem: MENSAGENS_MODAL_ACERTO_MANUAL_DEBITO.requisicaoCancelada };
      }

      return {
        ok: false,
        isFeedback: true,
        feedback: this.formatadorFeedbackService.formatarFeedbackErro(
          resultado.error,
          MENSAGENS_MODAL_ACERTO_MANUAL_DEBITO.tituloAcertoManual,
          MENSAGENS_MODAL_ACERTO_MANUAL_DEBITO.subTituloErroAcertoManual,
          null
        )
      };
    } finally {
      this.finalizarRequisicao();
    }
  }

  private iniciarRequisicao(): AbortController | null {
    if (this._isSending()) {
      return null;
    }

    const controller = new AbortController();
    this._controller.set(controller);
    this._isSending.set(true);
    return controller;
  }

  private finalizarRequisicao(): void {
    this._controller.set(null);
    this._isSending.set(false);
  }

  private calcularValorApuradoDoAcertoManual(cobrancas: CobrancaTarifa[]): string {
    const valor = cobrancas.reduce((total, cobranca) => {
      if (cobranca.situacao === EnumSituacaoDebitoManual.FATAL) {
        return total + cobranca.valor;
      }
      return total;
    }, 0);
    return formatarValor(valor);
  }
}
