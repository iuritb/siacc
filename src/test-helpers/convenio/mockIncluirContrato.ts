import { TipoAssinatura } from "../../app/interfaces";

export let convenioMock = {
    apelido: 'Apelido Mock',
    chavePix: { chave: 'chaveMock', agencia: '1234', produto: '567', numeroConta: '890123', dbConta: '4' },
    viaGerenciadorFinanceiro: true,
    viaAPI: true,
    viaVAN: true,
    van: 'vanMock',
    indiceTarifas: 'indiceMock',
    formaRepasse: 'formaRepasseMock',
    prazoConvenio: 'prazoConvenioMock',
    prazoConvenioData: 'prazoConvenioDataMock',
    tipoConvenio: 'tipoConvenioMock',
    aditivoContratual: true,
    ajustarTarifa: true,
    renovacaoPrazoMaximo: 'renovacaoPrazoMaximoMock',
    prorrogavelPrazoMaximo: 'prorrogavelPrazoMaximoMock',
    iniciadoraCaixa: 'iniciadoraCaixaMock',
    tarifa: { tipo: 'tipoMock', id: 'idMock', nome: 'nomeMock', pgCaixa: 0, pgOutros: 0, retentativa: 0, degustacao: 0 },
    razaoSocial: 'Razao Social Mock',
    nomeFantasia: 'Nome Fantasia Mock',
    unidadeConvenioInternoCaixa: '123',
    logradouro: 'Logradouro Mock',
    numero: 'Numero Mock',
    complemento: 'Complemento Mock',
    bairro: 'Bairro Mock',
    cidade: 'Cidade Mock',
    uf: 'UF Mock',
    cep: 'CEP Mock',
    email: 'Email Mock',
    cnae: 'CNAE Mock',
    nicho: 'Nicho Mock',
    naturezaJuridica: 'Natureza Juridica Mock',
    segmento: 'Segmento Mock',
    assinantes: ['assinante1', 'assinante2'],
    internoCaixa: false,
    tipoAssinatura: TipoAssinatura.CONVENIO_INTERNO
};

export let bodyConvenioMock = {
    apelidoConvenio: 'Apelido Mock',
    parametrosConvenio: {
        chavePixConvenio: 'chaveMock',
        trocaInformacoesGerenciadorFinanceiro: true,
        trocaInformacoesApi: true,
        trocaInformacoesVan: true,
        trocaInformacoesVanOpcao: 'vanMock',
        indiceTarifas: 'indiceMock',
        formaRepasse: 'formaRepasseMock',
        contaRepasse: {
        numeroAgencia: 1234,
        codigoOperacao: 567,
        numeroConta: 890123,
        dvConta: 4
        },
        contaDebitoTarifa: {
        numeroAgencia: 1234,
        codigoOperacao: 570,
        numeroConta: 890123,
        dvConta: 4
        },
        tipoPrazoConvenio: 'prazoConvenioMock',
        dataFimConvenio: null,
        tipoFrequenciaConvenio: 'tipoConvenioMock',
        renovacaoAutomaticaNecessidadeAditivoContratual: false,
        renovacaoAutomaticaNecessidadeAjustarTarifa: false,
        renovacaoAutomaticaPrazoMaximo: null,
        prorrogavelPrazoMaximo: null,
        numeroIniciadoraCaixa: 'iniciadoraCaixaMock'
    },
    tarifaConvenio: {
        tipo: 'tipoMock',
        id: 'idMock',
        nome: 'nomeMock',
        tarifaPagadoresCaixa: 0,
        tarifaPagadoresOutras: 0,
        tarifaRetentativa: 0,
        diasDegustacao: 0,
        inibirRetentativa: true,
        inibirOpenFinance: true
    },
    dadosCadastraisConvenio: {
        cnpj: '123456789',
        razaoSocial: 'Razao Social Mock',
        nomeFantasia: 'Nome Fantasia Mock',
        convenioInternoCaixa: false,
        unidadeConvenioInternoCaixa: 123,
        enderecoConvenio: {
        logradouro: 'Logradouro Mock',
        numero: 'Numero Mock',
        complemento: 'Complemento Mock',
        bairro: 'Bairro Mock',
        cidade: 'Cidade Mock',
        uf: 'UF Mock',
        cep: 'CEP Mock'
        },
        contatoConvenio: {
        email: 'Email Mock',
        telefone: ['telefoneMock']
        },
        dadosGeraisConvenio: {
        cnae: 'CNAE Mock',
        nicho: 'Nicho Mock',
        naturezaJuridica: 'Natureza Juridica Mock',
        segmento: 'Segmento Mock'
        }
    },
    assinaturaParteConvenio: {
        tipoAssinatura: TipoAssinatura.CONVENIO_INTERNO,
        socioRepresentanteLegalConvenio: [],
        representanteCaixaConvenio: [],
        testemunhaConvenio: []
    }
}
