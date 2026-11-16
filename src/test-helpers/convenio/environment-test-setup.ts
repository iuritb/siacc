import { Host, Servico, Aplicacao, Componente, Funcionalidade } from '../../app/interfaces';

const dummyComponent: Componente = {
  id: 'componente-id',
  nome: 'componente-nome',
  descricao: 'componente-descricao',
  caminho: 'componente-caminho',
  origem: 'componente-origem',
};

export const parcelSugestDummyComponent: Componente = {
  id: 'nao-deve-econtrar-parcel-sugest',
  nome: 'parcel-sugest-nome',
  descricao: 'parcel-sugest-descricao',
  caminho: 'parcel-sugest-caminho',
  origem: 'parcel-sugest-origem',
};

const dummyFuncionalidade2: Funcionalidade = {
  id: 'funcionalidade-id',
  nome: 'funcionalidade-nome',
  descricao: 'funcionalidade-descricao',
  icone: 'funcionalidade-icone',
  tipos: ['funcionalidade-tipo1', 'funcionalidade-tipo2']
};

let dummyDefaultAplicacao: Aplicacao = {
  id: 'aplicacao-id',
  origem: 'aplicacao-origem',
  nome: 'aplicacao-nome',
  descricao: 'aplicacao-descricao',
  caminho: 'aplicacao-caminho',
  contexto: 'aplicacao-contexto',
  icone: 'aplicacao-icone',
  perfil: 'aplicacao-perfil',
  tipo: 'aplicacao-tipo',
  ordem: 1,
  favorito: true,
  ajuda: ['aplicacao-ajuda1', 'aplicacao-ajuda2'],
  servico: undefined,
  funcionalidades: [dummyFuncionalidade2]
};

export const dummyFuncionalidade: Funcionalidade = {
  id: 'funcionalidade-id',
  nome: 'funcionalidade-nome',
  descricao: 'funcionalidade-descricao',
  icone: 'funcionalidade-icone',
  tipos: ['funcionalidade-tipo1', 'funcionalidade-tipo2']
};

const dummyServico: Servico = {
  id: "servico-id",
  nome: "servico-nome",
  descricao: 'servico-descricao',
  caminho: 'servico-descricao',
  contexto: 'servico-descricao',
  icone: 'servico-descricao',
  collapse: false,
  aplicacoes: [dummyDefaultAplicacao],
  origem: 'servico-descricao',
  perfil: 'servico-descricao',
  ordem: 1,
  ajuda: ['servico-ajuda1', 'servico-ajuda2'],
};

const dummyAplicacao: Aplicacao = {
  id: 'aplicacao-id',
  origem: 'aplicacao-origem',
  nome: 'aplicacao-nome',
  descricao: 'aplicacao-descricao',
  caminho: 'aplicacao-caminho',
  contexto: 'aplicacao-contexto',
  icone: 'aplicacao-icone',
  perfil: 'aplicacao-perfil',
  tipo: 'aplicacao-tipo',
  ordem: 1,
  favorito: true,
  ajuda: ['aplicacao-ajuda1', 'aplicacao-ajuda2'],
  servico: dummyServico,
  funcionalidades: [dummyFuncionalidade],
};

const dummyHost: Host = {
  id: '12345',
  servico: dummyServico,
  aplicacao: dummyAplicacao,
  origem: 'localhost',
  caminho: '/dummy/path',
  contexto: 'dummyContext',
  basehref: '/dummy/basehref',
  componentes: [parcelSugestDummyComponent]
}

export const dummyEnvironment = {
    id: 1,
    production: false,
    host: dummyHost,
    backendSimuladorUrl: 'dummyBackend/Simulador/Url/Test',
    backendParametrosUrl: 'dummyBackend/Parametros/Url/Test',
    backendConvenioUrl: 'dummyBackend/Convenio/Url/Test',
    contexto: null
  }
