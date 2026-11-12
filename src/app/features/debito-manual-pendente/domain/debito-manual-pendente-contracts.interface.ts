import { FeedbackGenerico } from "../../../shared/models/formatador-utils.model";
import { DebitoManualPendenteFormatado } from "./debito-manual-pendente.model";

export type ModalResultContract =
  | { ok: true; feedback: FeedbackGenerico }
  | { ok: false; isFeedback: false; mensagem: string }
  | { ok: false; isFeedback: true; feedback: FeedbackGenerico }

export type DebitoManualPendenteGatewayResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: unknown; abort?: boolean };

export interface IModalAcaoDebitoPendenteStore {
  // Estado exposto
  readonly debitoFormatado: () => DebitoManualPendenteFormatado;
  readonly isSending: () => boolean;
  readonly cobrancaFoiAtualizada: () => boolean;

  // Ações obrigatórias
  inicializar(debitoFormatado: DebitoManualPendenteFormatado): void;
  cancelarRequisicaoAtual(): void;
}

