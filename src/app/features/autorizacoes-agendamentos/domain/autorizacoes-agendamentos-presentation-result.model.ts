import { FeedbackGenerico } from '../../../shared/models/formatador-utils.model';

export const MENSAGEM_REQUISICAO_CANCELADA = 'Requisição foi cancelada.';

export type ConsultaPresentationResult =
  | { kind: 'success' }
  | { kind: 'modal-error'; feedback: FeedbackGenerico }
  | { kind: 'snackbar-info'; message: string };
