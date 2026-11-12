import { Injectable } from '@angular/core';
import { Cliente, EnumTexto } from '../../interfaces';
import { RestricoesClienteService } from '../restricoes-cliente/restricoes-cliente.service';
import { ContasPJResponse, RestricaoFraudeResponse, RestricoesCliente } from '../../shared/models/convenio/convenio.model';
import { StatusRestricaoCliente } from '../../shared/enums/status-restricao-cliente.enum';
import { DadosEmpresaConvenioResponse, EnumOrigemConsulta } from '../../shared/models/cliente.model';
import { ConvenioService } from '../convenio/convenio.service';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(private restricoesClienteService: RestricoesClienteService, private readonly convenioService: ConvenioService) { };

  processaDadosCliente(dados: any, restricoesPai: RestricoesCliente): Cliente {
    return {
      cnpj: this.obterCNPJ(dados),
      nome: this.obterRazaoSocial(dados),
      restricoes: restricoesPai,
      simulacoes: [],
      convenios: []
    };
  }

  verificarClientePossuiRestricaoNaoValido(restricoes: RestricoesCliente): boolean {

    const { fraude, ...restricoesParcial } = restricoes;

    const temRestricoesNaoValidas: boolean = Object.values(restricoesParcial)
      .some(status => status !== StatusRestricaoCliente.Valido);

    if (temRestricoesNaoValidas) return true;

    return fraude === StatusRestricaoCliente.Invalido;

  }

  verificarRestricaoValida(restricao: StatusRestricaoCliente): boolean {
    return restricao === StatusRestricaoCliente.Valido;
  }

  descreverRestricoesCliente(restricoes: RestricoesCliente): string[] {
    return this.restricoesClienteService.descreverRestricoesCliente(restricoes);
  }

  obterDescricaoIconeRestricaoCliente(campo: keyof RestricoesCliente, statusRestricaoCliente: StatusRestricaoCliente): string {
    return this.restricoesClienteService.obterDescricaoIconeRestricaoCliente(campo, statusRestricaoCliente);
  }

  obterClasseEstiloIconeRestricaoCliente(statusRestricaoCliente: StatusRestricaoCliente): string {
    return this.restricoesClienteService.obterClasseEstiloIconeRestricaoCliente(statusRestricaoCliente);
  }

  obterRazaoSocial(dados: any): string {
    const razaoSocial =
      dados?.razaoSocial ??
      dados?.dadosGeraisSicli?.dadosBasicos?.razaoSocial ??
      dados?.simulacoes?.[0]?.razaoSocial;

    return razaoSocial || EnumTexto.DESCRICAO_INDEFINIDO;
  }

  obterCNPJ(dados: any): string {
    const cnpj =
      dados?.cnpj ??
      dados?.dadosGeraisSicli?.cnpj ??
      dados?.simulacoes?.[0]?.cnpj;

    return cnpj || EnumTexto.DESCRICAO_INDEFINIDO;
  }

  async obterRestricaoDadosEmpresa(
    origem: EnumOrigemConsulta,
    cnpj: string,
    signal?: AbortSignal
  ): Promise<DadosEmpresaConvenioResponse> {
    const estrategiaPorOrigem: Record<EnumOrigemConsulta, () => Promise<DadosEmpresaConvenioResponse>> = {
      [EnumOrigemConsulta.SIMULADOR]: () => this.convenioService.obterRestricaoDadosCadastrais(cnpj, signal),
      [EnumOrigemConsulta.CONVENIO]: () => this.convenioService.obterRestricaoDadosCadastrais(cnpj, signal),
    };

    const estrategia = estrategiaPorOrigem[origem];
    if (!estrategia) {
      throw new Error(`Origem de consulta não suportada: ${origem}`);
    }

    return estrategia();
  }

  async obterRestricaoSICOW(
    origem: EnumOrigemConsulta,
    cnpj: string,
    signal?: AbortSignal
  ): Promise<string[]> {
    const estrategiaPorOrigem: Record<EnumOrigemConsulta, () => Promise<string[]>> = {
      [EnumOrigemConsulta.SIMULADOR]: () => this.convenioService.obterRestricaoSICOW(cnpj, signal),
      [EnumOrigemConsulta.CONVENIO]: () => this.convenioService.obterRestricaoSICOW(cnpj, signal),
    };

    const estrategia = estrategiaPorOrigem[origem];
    if (!estrategia) {
      throw new Error(`Origem de consulta não suportada: ${origem}`);
    }

    return estrategia();
  }

  async obterRestricaoContasPj(
    origem: EnumOrigemConsulta,
    cnpj: string,
    signal?: AbortSignal
  ): Promise<ContasPJResponse> {
    const estrategiaPorOrigem: Record<EnumOrigemConsulta, () => Promise<ContasPJResponse>> = {
      [EnumOrigemConsulta.SIMULADOR]: () => this.convenioService.obterContasPj(cnpj, signal),
      [EnumOrigemConsulta.CONVENIO]: () => this.convenioService.obterContasPj(cnpj, signal),
    };

    const estrategia = estrategiaPorOrigem[origem];
    if (!estrategia) {
      throw new Error(`Origem de consulta não suportada: ${origem}`);
    }

    return estrategia();
  }

  async obterRestricaoFraude(
    origem: EnumOrigemConsulta,
    cnpj: string,
    signal?: AbortSignal
  ): Promise<RestricaoFraudeResponse> {
    const estrategiaPorOrigem: Record<EnumOrigemConsulta, () => Promise<RestricaoFraudeResponse>> = {
      [EnumOrigemConsulta.SIMULADOR]: () => this.convenioService.obterRestricaoFraude(cnpj, signal),
      [EnumOrigemConsulta.CONVENIO]: () => this.convenioService.obterRestricaoFraude(cnpj, signal),
    };

    const estrategia = estrategiaPorOrigem[origem];
    if (!estrategia) {
      throw new Error(`Origem de consulta não suportada: ${origem}`);
    }

    return estrategia();
  }

}
