import { Option } from "sidsc-components/dsc-select";
import { TipoFormaRepasse, TipoPrazoConvenio } from "../../app/interfaces";
import { AlterarConvenioResponse, ContaCorreta, ContaPreAlterar, EnumModalidadeCobranca, EnumNaturezaEmpresa, EnumPeriodicidadeTarifa, EnumStatusSolicitacaoAlteracao, FormularioAlterarConvenio, ParametroItem, ParametroVan, PreAlterarConvenioResponse } from "../../app/shared/models/convenio/convenio.model";
import { FeedbackGenerico } from "../../app/shared/models/formatador-utils.model";
import { FormBuilder } from "@angular/forms";
import { OutputCardTarifas, OutputCardDetalhes, CardDetalhes } from "../../app/shared/models/formularioAlterarConvenio.model";

export const mockNumeroConvenio = 1;

export const mockContaPre: ContaPreAlterar = {
  produto: '002',
  codigoOperacao: '0',
  dvConta: '0',
  numeroAgencia: '4321',
  numeroConta: '87654321',
};

export const mockContaOriginal: ContaCorreta = {
  codigoOperacao: '002',
  dvConta: '0',
  numeroAgencia: '4321',
  numeroConta: '87654321',
};

export const mockContaAlterada: ContaCorreta = {
  dvConta: '9',
  numeroAgencia: '4567',
  numeroConta: '77888',
  codigoOperacao: '12'
};

export const mockFormularioConvenioOriginal: FormularioAlterarConvenio = {
  apelido: 'Convênio Teste',
  tarifaPagadoresCaixa: 1.5,
  tarifaPagadoresOutros: 2.0,
  tarifaRetentativa: 0.5,
  indice: 'IPCA',
  formaRepasse: TipoFormaRepasse.CONSOLIDADO,
  tipoPrazoConvenio: TipoPrazoConvenio.INDETERMINADO_COM_ATUALIZACAO,
  trocaInformacoesGerenciadorFinanceiro: true,
  trocaInformacoesVan: false,
  trocaInformacoesApi: true,
  trocaInformacoesVanOpcao: 35,
  contaRepasse: mockContaOriginal,
  contaTarifa: mockContaOriginal,
  empresaPublica: true,
  tarifaMensal: true,
  tarifaMensalManual: true,
  diaTarifaMensal: 10
};

export const mockFormularioConvenioAlterado: FormularioAlterarConvenio = {
  apelido: 'Convênio Alterado ',
  tarifaPagadoresCaixa: 1.0,
  tarifaPagadoresOutros: 1.0,
  tarifaRetentativa: 1.0,
  indice: 'IPCA',
  formaRepasse: TipoFormaRepasse.CONSOLIDADO,
  tipoPrazoConvenio: TipoPrazoConvenio.INDETERMINADO_COM_ATUALIZACAO,
  trocaInformacoesGerenciadorFinanceiro: true,
  trocaInformacoesVan: false,
  trocaInformacoesApi: true,
  trocaInformacoesVanOpcao: 35,
  contaRepasse: mockContaAlterada,
  contaTarifa: mockContaAlterada,
  empresaPublica: true,
  tarifaMensal: true,
  tarifaMensalManual: true,
  diaTarifaMensal: 15
};

export const mockVansOption: Option[] = [
  {
    label: 'VAN_X',
    value: '1'
  },
  {
    label: 'VAN_Y',
    value: '2'
  }
];

export const mockFeedback: FeedbackGenerico = {
  titulo: 'Alterar Convênio',
  mensagem: 'Mensagem',
  descricao: 'Descrição',
  variant: 'info',
};

export const mockOutputTarifas: OutputCardTarifas = {
  form: new FormBuilder().group({
    tarifaPagadoresCaixa: [1.0],
    tarifaPagadoresOutros: [1.0],
    tarifaRetentativa: [1.0],
  }),
  formularioValido: true
};

export const mockOutputTarifasInvalido: OutputCardTarifas = {
  form: new FormBuilder().group({
    tarifaPagadoresCaixa: [1.0],
    tarifaPagadoresOutros: [1.0],
    tarifaRetentativa: [1.0],
  }),
  formularioValido: false
};

export const mockOutputDetalhes: OutputCardDetalhes = {
  form: new FormBuilder().group({
    apelido: ['Convênio Alterado '],
    indice: ['IPCA'],
    contaRepasse: [mockContaAlterada],
    formaRepasse: [TipoFormaRepasse.CONSOLIDADO],
    contaTarifa: [mockContaAlterada],
    tipoPrazoConvenio: [TipoPrazoConvenio.INDETERMINADO_COM_ATUALIZACAO],
    trocaInformacoesGerenciadorFinanceiro: [true],
    trocaInformacoesVan: [false],
    trocaInformacoesApi: [true],
    trocaInformacoesVanOpcao: [35],
    naturezaEmpresa: [EnumNaturezaEmpresa.PJ_PUBLICA],
    periodicidadeTarifa: [EnumPeriodicidadeTarifa.MENSAL],
    modalidadeCobranca: [EnumModalidadeCobranca.MANUAL],
    diaTarifaMensal: [15],
  }),
  deveMostrarVan: true,
  formularioValido: true,
  vansOption: mockVansOption
};

export const mockOutputDetalhesInvalido: OutputCardDetalhes = {
  form: new FormBuilder().group({
    apelidoConvenio: ['Convênio Alterado '],
    indiceTarifas: ['IPCA'],
    contaRepasse: [mockContaAlterada],
    formaRepasse: [TipoFormaRepasse.CONSOLIDADO],
    contaTarifa: [mockContaAlterada],
    tipoPrazoConvenio: [TipoPrazoConvenio.INDETERMINADO_COM_ATUALIZACAO],
    trocaInformacoesGerenciadorFinanceiro: [true],
    trocaInformacoesVan: [false],
    trocaInformacoesApi: [true],
    trocaInformacoesVanOpcao: [35],
    empresaPublica: [true],
    naturezaEmpresa: [EnumNaturezaEmpresa.PJ_PUBLICA],
    periodicidadeTarifa: [EnumPeriodicidadeTarifa.MENSAL],
    diaTarifaMensal: [15],
  }),
  deveMostrarVan: true,
  formularioValido: false,
  vansOption: mockVansOption
};

export const mockDadosCardDetalhes: CardDetalhes = {
  apelido: '',
  contaTarifa: mockContaOriginal,
  contaRepasse: mockContaOriginal,
  formaRepasse: TipoFormaRepasse.CONSOLIDADO,
  indice: 'IPA',
  tipoPrazoConvenio: TipoPrazoConvenio.INDETERMINADO_COM_ATUALIZACAO,
  trocaInformacoesApi: true,
  trocaInformacoesGerenciadorFinanceiro: true,
  trocaInformacoesVan: false,
  trocaInformacoesVanOpcao: null,
  empresaPublica: true,
  tarifaMensal: true,
  tarifaMensalManual: true,
  diaTarifaMensal: 15
};

export const mockPatchValueDadosCardDetalhes = {
  apelido: '',
  contaTarifa: mockContaOriginal,
  contaRepasse: mockContaOriginal,
  formaRepasse: TipoFormaRepasse.CONSOLIDADO,
  indice: 'IPA',
  tipoPrazoConvenio: TipoPrazoConvenio.INDETERMINADO_COM_ATUALIZACAO,
  trocaInformacoesApi: true,
  trocaInformacoesGerenciadorFinanceiro: true,
  trocaInformacoesVan: false,
  trocaInformacoesVanOpcao: null,
  modalidadeCobranca: EnumModalidadeCobranca.MANUAL,
  periodicidadeTarifa: EnumPeriodicidadeTarifa.MENSAL,
  naturezaEmpresa: EnumNaturezaEmpresa.PJ_PUBLICA,
  diaTarifaMensal: 15
};

export const mockVan: ParametroVan = {
  nome: 'Teste',
  id: '1',
  excluido: false,
  situacao: true
}

export const mockParamentroVan: ParametroItem = {
  complemento: 'Teste',
  descricao: 'Teste',
  id: 1,
  nome: 'GERAIS_VANS_PRODUTOS',
  valor: JSON.stringify([mockVan])
}
export const mockParametroIndices: ParametroItem = {
  complemento: 'Teste',
  descricao: 'Teste',
  id: 1,
  nome: 'TARIFA_INDICES',
  valor: 'S'
};

export const mockRetornoParametros: PreAlterarConvenioResponse = {
  contas: null,
  parametros: [mockParametroIndices]
};

export const mockResponseAlterarConvenio: AlterarConvenioResponse = {
  dataSituacao: "2025-01-01T01:01:00",
  id: 1,
  idTermoCandidato: 'X',
  situacaoInicial: EnumStatusSolicitacaoAlteracao.PENDENTE
};

export const mockResponseAlterarConvenioSemTermo: AlterarConvenioResponse = {
  dataSituacao: "2025-01-01T01:01:00",
  id: 1,
  idTermoCandidato: null,
  situacaoInicial: EnumStatusSolicitacaoAlteracao.PENDENTE
}
