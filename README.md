# SIACCPixautomaticoFrontend

Projeto no GitHGub/Caixa [![GitHub](https://devops.caixa/projetos/Caixa)](https://devops.caixa/projetos/Caixa)

# Pré-requisitos do Projeto 📜
 

<ul>
  <li>[Angular CLI](https://github.com/angular/angular-cli) version 16.2.14</li>
  <li>Maven 3.6.6</li>
  <li>NodeJs 18.16</li>
  <li>NPM 9.5.1</li>
  <li>Java jdk-17.0.11</li>
</ul>

## Configuração do Arquivo .npmrc

Antes de instalar a biblioteca DSC, certifique-se de que o arquivo .npmrc com a configuração abaixo esteja na pasta raiz do seu projeto. Se o arquivo não estiver presente, adicione-o ao seu projeto.

```
registry=http://binario.caixa:8081/repository/npm-all/
proxy=http://binario.caixa:8081/repository/npm-all/
https-proxy=http://binario.caixa:8081/repository/npm-all/
sass_binary_site=http://binario.caixa:8081/repository/node-sass/
```
## Como instalar
Existem duas formas de instalar a biblioteca do DSC:

<b>Usando o Angular cli</b>
<p>Para configurar a biblioteca em seu projeto angular, use o comando de instalação:</p>

##  ng add sidsc-components
Caso tenha um workspace com vários projetos, pode executar o comando com o seguinte parâmetro:</p>

##  ng add sidsc-components --project<nome-do-projeto>
<p>Este comando irá instalar a biblioteca e também irá adicionar o arquivo de estilo na propriedade do angular.json do projeto.</p>

## Instalando Manualmente 📜
<p>Para configurar a biblioteca em seu projeto angular de forma manual, use o comando de instalação de NPM</p>

## npm i sidsc-components 📜
<p>Para instalar o arquivo de estilos será necessário informar manualmente o caminho no angular.json do seu projeto:</p>

{
  ...
  "styles": [
    "node_modules/sidsc-components/styles/main.scss"
  ],
  ...
}

## Instalação do aplicativo no modo dev 📜

Você pode executar seu aplicativo no modo de desenvolvimento que permite codificação usando::
```
 ./mvnw quarkus:dev ou mvn quarkus:dev
```

## Servidor de desenvolvimento 📜

Execute `ng serve` para um servidor de desenvolvimento. Navegue até `http://localhost:4200/`. O aplicativo será recarregado automaticamente se você alterar algum dos arquivos de origem.

## Code scaffolding

Execute `ng generate component nome-do-componente` para gerar um novo componente. Você também pode usar `ng generate directiva|pipe|service|class|guard|interface|enum|module`.

## Executando 📜

Execute `ng build` para construir o projeto. Os artefatos de construção serão armazenados no diretório `dist/`.

## Executando testes unitários

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Executando testes ponta a ponta

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Mais ajuda

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Dúvidas de Quarkus ou MicroProfile 📜

   - [Quarkus](https://quarkus.io/): Framework poderoso para criar aplicações Java cloud-ready.
   - [MicroProfile](https://microprofile.io/): Conjunto de especificações que facilitam a criação de Microsserviços.

# Dúvidas de utilização 📜

  Para simular com o backend local ir na pasta [text](src/environments)/environment.ts se for local ou [text](src/environments)/environment.prod.ts se for producao

    no caso local, comentar o link acima e descomentar o de baixo
      // backendConvenioUrl: "https://siacc-pixautomatico-api-convenio-des.apps.nprd.caixa",
         backendConvenioUrl: "http://localhost:8080",

  Para simular rode a url: https://siacc-servicos-frontend-des.apps.nprd.caixa/

  Depois va no terminal entre no projeto do backend e execute

  ```
  npm start
  ```

  depois va no frontend clica no menu desenvolvimento e localhost:4200 
   <img src="siacc_frontend.png" alt="Sistema SIACC">





