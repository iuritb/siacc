import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes, ROUTES } from '@angular/router';
import { DscBreadcrumbItem } from 'sidsc-components/dsc-breadcrumb';
import { environment } from '../environments/environment';
import { Host } from './interfaces';
import { SimuladorComponent } from './pages/simulador/simulador.component';
import { ConvenioComponent } from './pages/convenio/convenio.component';
import { ParametrosGeraisComponent } from './pages/parametros-gerais/parametros-gerais.component';
import { ParametrosTextoComponent } from './pages/parametros-texto/parametros-texto.component';
import { ParametrosTarifaComponent } from './pages/parametros-tarifa/parametros-tarifa.component';
import { AppPrincipalComponent } from './pages/app-principal/app-principal.component';
import { RelatorioRepasseComponent } from './pages/relatoriorepasse/relatoriorepasse.component';
import { RelatorioRemessaComponent } from './pages/relatorioremessa/relatorioremessa.component';
import { AutorizacoesAgendamentosComponent } from '../app/features/autorizacoes-agendamentos/autorizacoes-agendamentos.component';
import { RelatoriosComponent } from './pages/relatorios/relatorios.component';
import { SimulacoesPendentesComponent } from './pages/simulacoes-pendentes/simulacoes-pendentes.component';
import { ConveniosPendentesComponent } from './pages/convenios-pendentes/convenios-pendentes.component';
import { ManutencaoVanComponent } from './pages/manutencao-van/manutencao-van.component';
import { RelatorioLoteCobrComponent } from './pages/relatoriolotecobr/relatoriolotecobr.component';
import { DebitoManualPendenteComponent } from './features/debito-manual-pendente/debito-manual-pendente.component';

let breadcrumbConvenio: DscBreadcrumbItem[] = [
  { label: "Convênio", url: "simulador" }
];

let breadcrumbSimulador: DscBreadcrumbItem[] = [
  { label: "Simulador Negocial", url: "simulador" }
];

const breadcrumbSimulacoesPendentes: DscBreadcrumbItem[] = [
  { label: "Simulações Pendentes", url: "simulacoes-pendentes" }
];

const breadcrumbConveniosPendentes: DscBreadcrumbItem[] = [
  { label: "Convênios Pendentes", url: "convenios-pendentes" }
];

const breadcrumbPendentesDebito: DscBreadcrumbItem[] = [
  { label: "Débitos Pendentes", url: "pendentes-debito" }
];

let breadAgendamentos: DscBreadcrumbItem[] = [
  { label: "Autorizações Agendamentos", url: "agendamentos" }
];

let breadRelatorios: DscBreadcrumbItem[] = [
  { label: "Relatorios", url: "relatorios" }
];

let parametrosGerais: DscBreadcrumbItem[] = [
  { label: "Parâmetros Gerais", url: "parametros-gerais" }
];

const breadCrumbManutencaoVan: DscBreadcrumbItem[] = [
  { label: "Manutenção de van", url: "parametros-manutencao-van" }
];
let parametrosTexto: DscBreadcrumbItem[] = [
  { label: "Parâmetros Texto", url: "parametros-texto" }
];

let parametrosTarifa: DscBreadcrumbItem[] = [
  { label: "Parâmetros Tarifa", url: "parametros-tarifa" }
];


const BASE_ROUTES: Routes = [
  { path: 'convenio', component: ConvenioComponent, pathMatch: 'full', data: { urls: breadcrumbConvenio } },
  { path: 'convenios-pendentes', component: ConveniosPendentesComponent, pathMatch: 'full', data: { urls: breadcrumbConveniosPendentes } },
  { path: 'pendentes-debito', component: DebitoManualPendenteComponent, pathMatch: 'full', data: { urls: breadcrumbPendentesDebito } },
  { path: 'simulador', component: SimuladorComponent, pathMatch: 'full', data: { urls: breadcrumbSimulador } },
  { path: 'simulacoes-pendentes', component: SimulacoesPendentesComponent, pathMatch: 'full', data: { urls: breadcrumbSimulacoesPendentes } },
  { path: 'agendamentos', component: AutorizacoesAgendamentosComponent, pathMatch: 'full', data: { urls: breadAgendamentos } },
  { path: 'relatorios-movimentacao', component: RelatoriosComponent, pathMatch: 'full', data: { urls: breadRelatorios } },
  { path: 'parametros-gerais', component: ParametrosGeraisComponent, pathMatch: 'full', data: { urls: parametrosGerais } },
  { path: 'parametros-manutencao-van', component: ManutencaoVanComponent, pathMatch: 'full', data: { urls: breadCrumbManutencaoVan } },
  { path: 'parametros-texto', component: ParametrosTextoComponent, pathMatch: 'full', data: { urls: parametrosTexto } },
  { path: 'parametros-tarifa', component: ParametrosTarifaComponent, pathMatch: 'full', data: { urls: parametrosTarifa } },
  { path: 'repasse', component: RelatorioRepasseComponent, pathMatch: 'full', data: { urls: parametrosTarifa } },
  { path: 'remessa', component: RelatorioRemessaComponent, pathMatch: 'full', data: { urls: parametrosTarifa } },
  { path: 'lotecobr', component: RelatorioLoteCobrComponent, pathMatch: 'full', data: { urls: parametrosTarifa } },
  { path: '**', component: AppPrincipalComponent },
];

@NgModule({
  imports: [RouterModule.forRoot([])],
  exports: [RouterModule],
  providers: [
    {
      provide: ROUTES,
      useFactory: () => {
        console.log("pathname", window.location.pathname);
        console.log("href", window.location.href);

        let host: Host | any = environment.host;
        let routes = getRoute(host);

        if (host.contexto != window.location.pathname) {
          window.location.href = "/";
        }

        return routes;
      },
      multi: true
    }]
})
export class AppRoutingModule { }

function processRoutes(host: Host) {
  let routes: Routes = [];

  if (host == null || host.basehref == null) return routes;

  let basehref: string = host.basehref;
  basehref = basehref.replace("/", "");
  for (let BASE_ROUTE of BASE_ROUTES) {
    const route = Object.assign({}, BASE_ROUTE);
    route.path = basehref + "/" + route.path;
    routes.push(route);
  }

  return routes;
}

function getAlternateRoute(basehref: string): string | null {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has('route')) {
    let result = basehref + "/" + searchParams.get('route');
    return result.replace("/", "");
  }
  return null;
}

function getRoute(host: Host) {

  let routes: Routes = processRoutes(host);
  if (host && host.caminho) {
    let path = host.caminho;

    if (path == null) return routes;

    path = path.replace("/", "");

    let alternateRoute = getAlternateRoute(host.basehref);

    let routeDefault = getRouteDefault(routes);

    if (routeDefault != null) {

      setRouteComponent(routeDefault, routes, path, alternateRoute);

    } else {
      console.log("rota padrão não localizada. nao é possivel remapear rota para o contexto especificado");
    }
  }


  console.log("routes", routes);

  return routes;
}

function setRouteComponent(routeDefault: any, routes: any, path: string, alternateRoute: string | null) {
  for (let route of routes) {
    if (route.path == path) {
      routeDefault.component = route.component;
      return;
    }
  }

  if (alternateRoute != null) {
    for (let route of routes) {
      if (route.path == alternateRoute) {
        routeDefault.path = path;
        routeDefault.component = route.component;
        return
      }
    }
  }

  let route: Route = {
    path: path,
    component: routeDefault.component,
    pathMatch: 'full'
  }
  routes.push(route);
}

function getRouteDefault(routes: any) {
  let routeDefault = null;
  for (let route of routes) {
    if (route && route.path && route.path.indexOf("**") >= 0) {
      routeDefault = route;
      break;
    }
  }
  return routeDefault;
}
