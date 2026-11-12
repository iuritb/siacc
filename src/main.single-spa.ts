import { enableProdMode, NgZone } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Router, NavigationStart } from '@angular/router';
import { singleSpaAngular, getSingleSpaExtraProviders } from 'single-spa-angular';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { singleSpaPropsSubject } from './single-spa/single-spa-props';

if (environment.production) {
  enableProdMode();
}

const lifecycles = singleSpaAngular({
  bootstrapFunction: singleSpaProps => {
    console.log("PIXAUTOMATICO-FRONTEND:MAIN");

    let host = singleSpaProps["host" as keyof typeof singleSpaProps];
    console.log("host", host);

    if (host != null && host.aplicacao && host.aplicacao.tipo == "APP") {
      let data = {
        detail: {
          servico: host.servico,
          aplicacao: host.aplicacao
        }
      };
      dispatchEvent(new CustomEvent("@caixa/application", data));
    }

    environment.host = host;

    singleSpaPropsSubject.next(singleSpaProps);
    return platformBrowserDynamic(getSingleSpaExtraProviders()).bootstrapModule(AppModule);
  },
  template: '<app-root-main />',
  Router,
  NavigationStart,
  NgZone,
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
