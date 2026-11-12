import { Injectable, computed, signal } from '@angular/core';
import { DebitoManualPendenteFormatado } from '../../domain/debito-manual-pendente.model';
import { calcularPermissaoAcao, formatarDadosDasCobrancas } from '../../debito-manual-pendente.helpers';
import { FormatadorFeedbackService } from '../../../../services/formatador-feedback/formatador-feedback.service';
import { MENSAGENS_MODAL_AUTORIZAR_DEBITO } from '../../domain/debito-manual-pendente.constants';
import { FeedbackGenerico } from '../../../../shared/models/formatador-utils.model';
import { IModalAcaoDebitoPendenteStore, ModalResultContract } from '../../domain/debito-manual-pendente-contracts.interface';
import { EnumSituacaoDebitoManual } from '../../domain/debito-manual.enum';
import { DebitoManualPendenteGateway } from '../query/debito-manual-pendente-query.service';

@Injectable({
  providedIn: null
})
export class ModalAutorizarDebitoStore implements IModalAcaoDebitoPendenteStore {
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
  readonly cobrancasParaAutorizar = computed(() => {
    const debito = this._debitoFormatado();
    return debito?.cobrancasFormatadas.filter((cobranca) => this.deveMostrarCobranca(cobranca.situacao)) ?? [];
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

  public async autorizarDebito(convenioId: number, periodo: string): Promise<ModalResultContract> {
    const controller = this.iniciarRequisicao();
    if (!controller) {
      return { ok: false, isFeedback: false, mensagem: MENSAGENS_MODAL_AUTORIZAR_DEBITO.requisicaoEmAndamento };
    }

    try {
      const resultado = await this.gateway.autorizarDebitoManualPendente(
        convenioId,
        periodo,
        controller
      );

      if (resultado.ok) {
        this._cobrancaFoiAtualizada.set(true);
        this._debitoFormatado.update((current) => ({
          ...current,
          cobrancasFormatadas: formatarDadosDasCobrancas(resultado.data),
          ...calcularPermissaoAcao(resultado.data)
        }));
        return { ok: true, feedback: this.formatarFeedbackSucesso() };
      }

      if (resultado.abort) {
        return {
          ok: false, isFeedback: false, mensagem: MENSAGENS_MODAL_AUTORIZAR_DEBITO.requisicaoCancelada
        };
      }

      const feedbackErro = this.formatadorFeedbackService.formatarFeedbackErro(
        resultado.error,
        MENSAGENS_MODAL_AUTORIZAR_DEBITO.titulo,
        MENSAGENS_MODAL_AUTORIZAR_DEBITO.subTituloErro,
        null
      );
      return { ok: false, isFeedback: true, feedback: feedbackErro };
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

  private deveMostrarCobranca(situacao: EnumSituacaoDebitoManual): boolean {
    return situacao === EnumSituacaoDebitoManual.AGUARDANDO_APROVACAO || situacao === EnumSituacaoDebitoManual.INADIMPLENTE;
  }

  private formatarFeedbackSucesso(): FeedbackGenerico {
    return {
      titulo: MENSAGENS_MODAL_AUTORIZAR_DEBITO.titulo,
      mensagem: MENSAGENS_MODAL_AUTORIZAR_DEBITO.mensagemSucesso,
      descricao: MENSAGENS_MODAL_AUTORIZAR_DEBITO.descricaoSucesso,
      variant: 'success'
    }
  }
}
