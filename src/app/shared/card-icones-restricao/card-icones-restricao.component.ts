import { Component, computed, effect, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { Conta, RestricoesCliente } from '../models/convenio/convenio.model';
import { StatusRestricaoCliente } from '../enums/status-restricao-cliente.enum';
import { FormatadorService } from '../../services/formatador/formatador.service';
import { RestricoesClienteService } from '../../services/restricoes-cliente/restricoes-cliente.service';
import { DadosCadastrais, EnumOrigemConsulta, MensagensInconsistenciasCliente, RESTRICOES_CLIENTE_PADRAO } from '../models/cliente.model';
import { ClienteService } from '../../services/cliente/cliente.service';
import { FormGroup } from '@angular/forms';
import { ErroRetornoSicli } from '../errors/erro-retorno-sicli';
import { TAMANHO_CNPJ } from '../constants/utils/cnpj.constants';

@Component({
  selector: 'app-card-icones-restricao',
  templateUrl: './card-icones-restricao.component.html',
  styleUrls: ['./card-icones-restricao.component.scss']
})

export class CardIconesRestricaoComponent implements OnChanges {

  constructor(
    private restricaoClienteService: RestricoesClienteService,
    private formatadorService: FormatadorService,
    private clienteService: ClienteService,
  ) {

    effect(() => {
      const valor = this.restricoes();
      this.restricoesChange.emit(valor);
    });
  }

  @Input({ required: true }) cliente!: { cnpj: string };
  @Input({ required: true }) origem!: EnumOrigemConsulta;

  @Output() contasAtivasOutput = new EventEmitter<Conta[]>();
  @Output() dadosCadastraisOutput = new EventEmitter<DadosCadastrais>();
  @Output() restricoesChange = new EventEmitter<RestricoesCliente>();

  //Signals das restrições
  cadastroSig = signal<StatusRestricaoCliente>(StatusRestricaoCliente.Indefinido);
  sicowSig = signal<StatusRestricaoCliente>(StatusRestricaoCliente.Indefinido);
  contaPjSig = signal<StatusRestricaoCliente>(StatusRestricaoCliente.Indefinido);
  dataConstituicaoValidaSig = signal<StatusRestricaoCliente>(StatusRestricaoCliente.Indefinido);
  fraudeSig = signal<StatusRestricaoCliente>(StatusRestricaoCliente.Indefinido);

  razaoSocial: string | null = null;

  //Loading
  dadosEmpresaLoading: boolean = false;
  sicowLoading: boolean = false;
  contaPjLoading: boolean = false;
  fraudeLoading: boolean = false;

  formGroup!: FormGroup;

  restricoes = computed<RestricoesCliente>(() => {
    return {
      ...RESTRICOES_CLIENTE_PADRAO,
      cadastro: this.cadastroSig(),
      sicow: this.sicowSig(),
      contaPJ: this.contaPjSig(),
      dataConstituicao: this.dataConstituicaoValidaSig(),
      fraude: this.fraudeSig()
    };
  });

  inconsistencias = computed<MensagensInconsistenciasCliente>(() => {
    const r = this.restricoes();
    return this.definirInconsistencias(r);
  });

  private abortControllers = new Map<string, AbortController>();

  public get Inconsistencias(): MensagensInconsistenciasCliente {
    return this.inconsistencias();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cliente']) {
      this.orquestrador();
    }
  }

  async orquestrarAPIObterDadosEmpresa(cnpj: string): Promise<void> {
    const controller = new AbortController();
    this.abortControllers.set('cadastro', controller);
    try {
      this.dadosEmpresaLoading = true;
      const { signal } = controller;
      const resultado = await this.clienteService.obterRestricaoDadosEmpresa(this.origem, cnpj, signal);

      // DOI → StatusRestricaoCliente
      const booleanoMarcaDOI = resultado.cadastroAtualizado !== "N";
      const cadastro: StatusRestricaoCliente = this.restricaoClienteService.mapBooleanToStatus(booleanoMarcaDOI);
      // Data de constituição (boolean → StatusRestricaoCliente)
      const statusData: StatusRestricaoCliente = this.restricaoClienteService.mapBooleanToStatus(!!resultado.dataConstituicaoValida);
      // Atribuições
      this.dadosCadastraisOutput.emit(resultado.dadosCadastrais);
      this.razaoSocial = resultado.razaoSocial;
      this.cadastroSig.set(cadastro);
      this.dataConstituicaoValidaSig.set(statusData);
    } catch (error: any) {
      if (error instanceof ErroRetornoSicli) {
        this.razaoSocial = error.message;
      } else {
        this.razaoSocial = "Erro ao obter informações deste CNPJ";
      }

      this.cadastroSig.set(StatusRestricaoCliente.Indefinido);
      this.dataConstituicaoValidaSig.set(StatusRestricaoCliente.Indefinido);
    } finally {
      controller?.abort();
      this.abortControllers.delete('cadastro');
      this.dadosEmpresaLoading = false;
    }
  }

  async orquestrarAPIObterSICOW(cnpj: string): Promise<void> {

    const controller = new AbortController();
    this.abortControllers.set('sicow', controller);

    try {
      this.sicowLoading = true;
      const { signal } = controller;
      const resultado = await this.clienteService.obterRestricaoSICOW(this.origem, cnpj, signal);
      const sicow: StatusRestricaoCliente = this.restricaoClienteService.mapArrayToStatus(resultado);
      this.sicowSig.set(sicow);
    } catch (error: any) {
      this.sicowSig.set(StatusRestricaoCliente.Indefinido);
    } finally {
      controller?.abort();
      this.abortControllers.delete('sicow');
      this.sicowLoading = false;
    }
  }

  async orquestrarAPIFraude(cnpj: string): Promise<void> {

    const controller = new AbortController();
    this.abortControllers.set('fraude', controller);

    try {
      this.fraudeLoading = true;
      const { signal } = controller;
      const resultado = await this.clienteService.obterRestricaoFraude(this.origem, cnpj, signal);
      const fraude: StatusRestricaoCliente = this.restricaoClienteService.mapBooleanToStatus(!resultado.fraudeRegistrada);
      this.fraudeSig.set(fraude);

    } catch (error: any) {
      this.fraudeSig.set(StatusRestricaoCliente.Indefinido);
    } finally {
      controller?.abort();
      this.abortControllers.delete('fraude');
      this.fraudeLoading = false;
    }
  }

  async orquestrarAPIObterContasPj(cnpj: string): Promise<void> {

    const controller = new AbortController();
    this.abortControllers.set('contaPJ', controller);

    try {
      this.contaPjLoading = true;
      const { signal } = controller;
      const resultado = await this.clienteService.obterRestricaoContasPj(this.origem, cnpj, signal);

      const contas = resultado.contas;
      const status: StatusRestricaoCliente = this.definirStatusContaPj(contas);

      this.contaPjSig.set(status);
      this.contasAtivasOutput.emit(contas);
    } catch (error: any) {
      this.contaPjSig.set(StatusRestricaoCliente.Indefinido);
    } finally {
      controller?.abort();
      this.abortControllers.delete('contaPJ');
      this.contaPjLoading = false;
    }
  }

  private definirStatusContaPj(contas: Conta[]): StatusRestricaoCliente {
    if (!contas) return StatusRestricaoCliente.Invalido;
    if (contas.length > 0) return StatusRestricaoCliente.Valido;
    return StatusRestricaoCliente.Invalido;
  }

  private orquestrador(): void {
    const { cnpjLimpo, valido } = this.validarCNPJELimpar(this.cliente.cnpj);
    if (valido) {
      this.orquestrarAPIObterSICOW(cnpjLimpo);
      this.orquestrarAPIObterContasPj(cnpjLimpo);
      this.orquestrarAPIObterDadosEmpresa(cnpjLimpo);
      this.orquestrarAPIFraude(cnpjLimpo)

    } else {
      this.definirRestricoesIndefinido();
    }
  }

  private validarCNPJELimpar(cnpj: string): { cnpjLimpo: string, valido: boolean } {
    const cnpjLimpo = cnpj.replace(/[^a-zA-Z0-9]/g, "");
    if (!cnpjLimpo || cnpjLimpo.trim().length < TAMANHO_CNPJ) return { cnpjLimpo: "", valido: false };
    return { cnpjLimpo, valido: true }
  }

  private definirRestricoesIndefinido(): void {
    this.razaoSocial = "Indefinido";
    this.contaPjSig.set(StatusRestricaoCliente.Indefinido);
    this.sicowSig.set(StatusRestricaoCliente.Indefinido);
    this.dataConstituicaoValidaSig.set(StatusRestricaoCliente.Indefinido);
    this.cadastroSig.set(StatusRestricaoCliente.Indefinido);
  }

  private definirInconsistencias(r: RestricoesCliente): MensagensInconsistenciasCliente {
    const mensagens = this.restricaoClienteService.descreverRestricoesCliente(r);
    let titulo = "";
    if (mensagens.length > 0) {
      titulo = mensagens.length === 1 ? "Existe impedimento para inclusão de convênio" : "Existem impedimentos para inclusão de convênio"
    }
    return {
      mensagens,
      titulo
    };
  }

  public get cnpjFormatado(): string {
    return this.formatadorService.formatarDocumento(this.cliente.cnpj);
  }

  obterDescricaoIconeRestricaoCliente(campo: keyof RestricoesCliente, statusRestricaoCliente: StatusRestricaoCliente): string {
    return this.clienteService.obterDescricaoIconeRestricaoCliente(campo, statusRestricaoCliente);
  }

  obterClasseIconeRestricoesCliente(statusRestricaoCliente: StatusRestricaoCliente): string {
    return this.clienteService.obterClasseEstiloIconeRestricaoCliente(statusRestricaoCliente);
  }

  ngOnDestroy(): void {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
  }
}
