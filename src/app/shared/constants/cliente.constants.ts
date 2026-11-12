import { StatusRestricaoCliente } from "../enums/status-restricao-cliente.enum";
import { RestricoesCliente } from "../models/convenio/convenio.model";

export const DESCRICOES_ICONES_RESTRICOES: Record<keyof RestricoesCliente, Record<StatusRestricaoCliente, string>> = {
  sicow: {
    [StatusRestricaoCliente.Valido]: 'Sem restrição no SICOW',
    [StatusRestricaoCliente.Invalido]: 'Com restrição no SICOW',
    [StatusRestricaoCliente.Indefinido]: 'Erro ao consultar o SICOW.',
  },
  contaPJ: {
    [StatusRestricaoCliente.Valido]: 'Possui Conta PJ ativa',
    [StatusRestricaoCliente.Invalido]: 'Não possui Conta PJ ativa',
    [StatusRestricaoCliente.Indefinido]: 'Erro ao consultar as contas.',
  },
  cadastro: {
    [StatusRestricaoCliente.Valido]: 'Cadastro atualizado. (Cliente sem registro de marca DOI)',
    [StatusRestricaoCliente.Invalido]: 'Cadastro desatualizado. (Cliente com registro de marca DOI)',
    [StatusRestricaoCliente.Indefinido]: 'Erro ao consultar o cadastro.',
  },
  dataConstituicao: {
    [StatusRestricaoCliente.Valido]: 'Data de constituição atende aos critérios',
    [StatusRestricaoCliente.Invalido]: 'Data de constituição inferior a seis meses',
    [StatusRestricaoCliente.Indefinido]: 'Erro ao consultar o cadastro.',
  },
  fraude: {
    [StatusRestricaoCliente.Valido]: 'Não há registros de fraudes vinculados ao CNPJ',
    [StatusRestricaoCliente.Invalido]: 'Existe pelo menos um registro de fraude vinculado ao CNPJ',
    [StatusRestricaoCliente.Indefinido]: 'Erro ao consultar o DICT',
  },

};

export const MENSAGENS_RESTRICOES_INVALIDAS: Partial<Record<keyof RestricoesCliente, string>> = {
  sicow: 'Restrição no SICOW',
  contaPJ: 'Não possui Conta PJ ativa',
  cadastro: 'Cadastro desatualizado (Cliente com registro de marca DOI)',
  dataConstituicao: 'CNPJ com data de constituição inferior a 6 meses',
  fraude: 'Existe pelo menos um registro de fraude vinculado ao CNPJ'
};

export const RESTRICOES_INDEFINIDAS: RestricoesCliente = {
  sicow: StatusRestricaoCliente.Indefinido,
  contaPJ: StatusRestricaoCliente.Indefinido,
  cadastro: StatusRestricaoCliente.Indefinido,
  dataConstituicao: StatusRestricaoCliente.Indefinido,
  fraude: StatusRestricaoCliente.Indefinido,
};
