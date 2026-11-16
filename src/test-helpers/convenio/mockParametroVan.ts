export interface ParametroBanco {
  id: number;
  nome: string;
  descricao: string | null;
  valor: string;              // vem como string JSON
  complemento: string | null;
}

export interface MockParametrosResponse {
  contas: unknown | null;
  parametros: ParametroBanco[];
}

export const mockParametrosResponse: MockParametrosResponse = {
  contas: null,
  parametros: [
    {
      id: 8,
      nome: "GERAIS_VANS_PRODUTOS",
      descricao: "VANs",
      valor:
        "[{\"id\":\"000\",\"nome\":\"ALEATÓRIO\",\"mensagem\":null,\"excluido\":true,\"situacao\":true},{\"id\":\"001\",\"nome\":\"EMBRATEL\",\"situacao\":true,\"excluido\":false},{\"id\":\"002\",\"nome\":\"TIVIT\",\"situacao\":false,\"excluido\":false},{\"id\":\"003\",\"nome\":\"PROCERGS\",\"situacao\":true,\"excluido\":true},{\"id\":\"004\",\"nome\":\"NETFLIX\",\"mensagem\":null,\"situacao\":true,\"excluido\":true},{\"id\":\"005\",\"nome\":\"SABESP\",\"mensagem\":null,\"situacao\":false,\"excluido\":true},{\"id\":\"006\",\"nome\":\"GXS - INTERCHANGE\",\"mensagem\":null,\"excluido\":false,\"situacao\":true},{\"id\":\"007\",\"nome\":\"DIRETA/PELICAN\",\"mensagem\":null,\"excluido\":false,\"situacao\":false},{\"id\":\"008\",\"nome\":\"DIRETA/CONECT\",\"mensagem\":null,\"excluido\":false,\"situacao\":true},{\"id\":\"009\",\"nome\":\"SITE\",\"mensagem\":null,\"excluido\":false},{\"id\":\"010\",\"nome\":\"IBM\",\"mensagem\":null,\"excluido\":false},{\"id\":\"011\",\"nome\":\"ACCESSTAGE\",\"mensagem\":null,\"excluido\":false},{\"id\":\"012\",\"nome\":\"NEOGRID\",\"mensagem\":null,\"excluido\":false},{\"id\":\"013\",\"nome\":\"NEXXERA\",\"mensagem\":null,\"excluido\":false,\"situacao\":true},{\"id\":\"014\",\"nome\":\"PADRAO IX\",\"mensagem\":null,\"excluido\":false},{\"id\":\"015\",\"nome\":\"TERRA\",\"mensagem\":null,\"excluido\":false},{\"id\":\"016\",\"nome\":\"OI\",\"mensagem\":null,\"excluido\":false},{\"id\":\"017\",\"nome\":\"SUPPLAY\",\"mensagem\":null,\"excluido\":false},{\"id\":\"018\",\"nome\":\"FINNET\",\"mensagem\":null,\"excluido\":false},{\"id\":\"019\",\"nome\":\"ATP\",\"mensagem\":null,\"excluido\":false,\"situacao\":true},{\"id\":\"020\",\"nome\":\"CNX\",\"mensagem\":null,\"excluido\":false,\"situacao\":true},{\"id\":\"021\",\"nome\":\"GERENCIADOR FINANCEIRO\",\"mensagem\":null,\"excluido\":false,\"situacao\":true},{\"id\":\"022\",\"nome\":\"VOALLE_RESTRITO\",\"mensagem\":null,\"excluido\":false},{\"id\":\"023\",\"nome\":\"ESALES\",\"mensagem\":null,\"excluido\":false},{\"id\":\"024\",\"nome\":\"NFS\",\"mensagem\":null,\"excluido\":false},{\"id\":\"025\",\"nome\":\"TESTES SPRINT 09\",\"mensagem\":null,\"excluido\":false,\"situacao\":true},{\"id\":\"026\",\"nome\":\"NFS-E\",\"mensagem\":\"Já existe uma VAN cadastrada com o nome informado\",\"excluido\":false,\"situacao\":true},{\"id\":\"027\",\"nome\":\"!@#$$$$$$\",\"mensagem\":null,\"excluido\":false},{\"id\":\"028\",\"nome\":\"SPRINT 09 TIME PIX AUTOMATICO\",\"mensagem\":null,\"excluido\":false,\"situacao\":true},{\"id\":\"029\",\"nome\":\"1978 TESTES\",\"mensagem\":null,\"excluido\":false},{\"id\":\"030\",\"nome\":\"TESTE\",\"mensagem\":null,\"excluido\":false},{\"id\":\"031\",\"nome\":\"3\",\"mensagem\":null,\"excluido\":false},{\"id\":\"032\",\"nome\":\"TESTETESTE\",\"mensagem\":\"Já existe uma VAN cadastrada com o nome informado\",\"excluido\":false,\"situacao\":false}]",
      complemento: null,
    },
  ],
};
