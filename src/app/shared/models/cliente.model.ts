import { StatusRestricaoCliente } from "../enums/status-restricao-cliente.enum";
import { RestricoesCliente } from "./convenio/convenio.model";

export type DadosEmpresaConvenioResponse = {
  cadastroAtualizado: string;
  cnpj: string;
  razaoSocial: string;
  dadosCadastrais: DadosCadastrais;
  dataConstituicaoValida: boolean;
};

export type DadosCadastrais = {
  razaoSocial: string;
  nomeFantasia: string;
  bairro: string;
  logradouro: string;
  complemento: string;
  numero: string;
  cep: string;
  UF: string;
  cidade: string;
  email: string;
  telefone_1: string;
  telefone_2: string | null;
  cnae: string;
  nicho: string | null;
  naturezaJuridica: string;
  segmento: string;
};

export type DadosEmpresa = {
  cadastro: StatusRestricaoCliente;
  razaoSocial: string;
};

export type MensagensInconsistenciasCliente = {
  titulo: string;
  mensagens: string[];
};

export interface RestricoesInterface {
  obterRestricaoDadosCadastrais(cnpj: string, signal?: AbortSignal): Promise<DadosEmpresaConvenioResponse>;
  obterRestricaoSICOW(cnpj: string, signal?: AbortSignal): Promise<string[]>;
};


export enum EnumOrigemConsulta {
  SIMULADOR = 'SIMULADOR',
  CONVENIO = 'CONVENIO',
};

export const DADOS_EMPRESA_PADRAO: DadosEmpresa = {
  razaoSocial: 'Indefinido',
  cadastro: StatusRestricaoCliente.Indefinido,
};

export const RESTRICOES_CLIENTE_PADRAO: RestricoesCliente = {
  cadastro: StatusRestricaoCliente.Indefinido,
  contaPJ: StatusRestricaoCliente.Indefinido,
  dataConstituicao: StatusRestricaoCliente.Indefinido,
  sicow: StatusRestricaoCliente.Indefinido,
  fraude: StatusRestricaoCliente.Indefinido
}
