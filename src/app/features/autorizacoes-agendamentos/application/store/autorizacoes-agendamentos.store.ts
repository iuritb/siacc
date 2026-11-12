import { Injectable, computed, signal } from '@angular/core';
import { RelatorioOpcao } from '../../../../shared/models/utils/filtro-dinamico.model';
import { criarOpcoesDeConsulta } from '../../autorizacoes-agendamentos-filtros-configs';
import { CobrancasRecorrentesResponse } from '../../../../shared/models/autorizacao-agendamento/cobr.model';
import { RecorrenciasResponse } from '../../../../shared/models/autorizacao-agendamento/rec.model';
import { EnumOpcoesAutorizacaoAgendamento, EnumOpcoesDePagina } from '../../../../shared/models/autorizacao-agendamento/utils.enum';
import { AutorizacoesAgendamentosQueryService } from '../query/autorizacoes-agendamentos-query.service';
import { EnumTipoRetornoConsulta } from '../../domain/autorizacoes-agendamentos-consulta-result.model';
import { ConsultaPresentationResult } from '../../domain/autorizacoes-agendamentos-presentation-result.model';
import { AutorizacoesAgendamentosErrorMapperService } from '../../domain/autorizacoes-agendamentos-error-mapper.service';
import { LotesCobrResponse } from '../../../lote-agendamentos/domain/lote-agendamentos.model';
import { removerZerosAEsquerda } from '../../../../shared/utils/string/string.utils';

@Injectable({
  providedIn: 'root'
})
export class AutorizacoesAgendamentosStore {
  private readonly _paginaParaMostrar = signal<EnumOpcoesDePagina>(EnumOpcoesDePagina.FILTRO);
  readonly paginaParaMostrar = this._paginaParaMostrar.asReadonly();

  private readonly _mostrarFiltro = computed(() => this._paginaParaMostrar() === EnumOpcoesDePagina.FILTRO);
  readonly mostrarFiltro = this._mostrarFiltro;

  private readonly _mostrarTabela = computed(() => this._paginaParaMostrar() !== EnumOpcoesDePagina.FILTRO);
  readonly mostrarTabela = this._mostrarTabela;

  private readonly _origemDosDadosDoAgendamento = signal<EnumOpcoesDePagina>(EnumOpcoesDePagina.FILTRO);
  readonly origemDosDadosDoAgendamento = this._origemDosDadosDoAgendamento.asReadonly();

  private readonly _opcoesDeRelatorio = signal<RelatorioOpcao<EnumOpcoesAutorizacaoAgendamento>[]>([]);
  readonly opcoesDeRelatorio = this._opcoesDeRelatorio.asReadonly();

  private readonly _destinoSelecionado = signal<EnumOpcoesAutorizacaoAgendamento | null>(null);
  readonly destinoSelecionado = this._destinoSelecionado.asReadonly();

  private readonly _opcaoSelecionada = signal<RelatorioOpcao<EnumOpcoesAutorizacaoAgendamento> | undefined>(undefined);
  readonly opcaoSelecionada = this._opcaoSelecionada.asReadonly();

  private readonly _patchValue = signal<Record<string, any>>({});
  readonly patchValue = this._patchValue.asReadonly();

  private readonly _btnIsLoading = signal<boolean>(false);
  readonly btnIsLoading = this._btnIsLoading.asReadonly();

  private readonly _parametrosSemPaginacao = signal<{ titulo: string; valor: string }[]>([]);
  readonly parametrosSemPaginacao = this._parametrosSemPaginacao.asReadonly();

  private readonly _retornoAPIRec = signal<RecorrenciasResponse | null>(null);
  readonly retornoAPIRec = this._retornoAPIRec.asReadonly();

  private readonly _retornoAPICobR = signal<CobrancasRecorrentesResponse | null>(null);
  readonly retornoAPICobR = this._retornoAPICobR.asReadonly();

  private readonly _retornoAPILote = signal<LotesCobrResponse | null>(null);
  readonly retornoAPILote = this._retornoAPILote.asReadonly();

  private controllerInterno: AbortController | null = null;

  constructor(
    private autorizacoesAgendamentosQueryService: AutorizacoesAgendamentosQueryService,
    private errorMapperService: AutorizacoesAgendamentosErrorMapperService
  ) { }

  public get controller(): AbortController | null {
    return this.controllerInterno;
  }

  public set controller(value: AbortController | null) {
    this.controllerInterno = value;
  }

  public iniciar(): void {
    this.atualizarOpcoesDeConsulta();
  }

  public configurarDestino(opcao: RelatorioOpcao<EnumOpcoesAutorizacaoAgendamento>): void {
    this.lidarComTrocaDeDestino(opcao);

    this._destinoSelecionado.set(opcao.destino);
    this._opcaoSelecionada.set(opcao);
    this._btnIsLoading.set(false);
  }

  public async consultar(query: Record<string, string>): Promise<ConsultaPresentationResult> {
    this._patchValue.set(query);
    this._btnIsLoading.set(true);

    this.controllerInterno = new AbortController();
    const result = await this.autorizacoesAgendamentosQueryService.consultar(this._destinoSelecionado(), this.normalizarFiltrosConsulta(query), this.controllerInterno);

    try {
      if (result.type === EnumTipoRetornoConsulta.SUCCESS) {
        this._parametrosSemPaginacao.set(result.parametrosSemPaginacao);
        switch (result.domain) {
          case EnumOpcoesAutorizacaoAgendamento.AUTORIZACAO:
            this._retornoAPIRec.set(result.data);
            this.prepararParaMostrarListagem(EnumOpcoesDePagina.AUTORIZACAO);
            return { kind: 'success' };
          case EnumOpcoesAutorizacaoAgendamento.AGENDAMENTO:
            this._retornoAPICobR.set(result.data);
            this._origemDosDadosDoAgendamento.set(EnumOpcoesDePagina.FILTRO);
            this.prepararParaMostrarListagem(EnumOpcoesDePagina.AGENDAMENTO);
            return { kind: 'success' };
          case EnumOpcoesAutorizacaoAgendamento.LOTE:
            this._retornoAPILote.set(result.data);
            this.prepararParaMostrarListagem(EnumOpcoesDePagina.LOTE);
            return { kind: 'success' };
          default:
            return { kind: 'success' };
        }
      }

      return this.errorMapperService.mapearErro(result, this._destinoSelecionado());
    } finally {
      this._btnIsLoading.set(false);
    }
  }

  public onListarAgendamentos(response: CobrancasRecorrentesResponse): void {
    this._retornoAPICobR.set(response);
    this._origemDosDadosDoAgendamento.set(EnumOpcoesDePagina.AUTORIZACAO);
    this.prepararParaMostrarListagem(EnumOpcoesDePagina.AGENDAMENTO);
  }

  public voltarParaDestino(destino: EnumOpcoesDePagina): void {
    if (!destino || destino === EnumOpcoesDePagina.FILTRO) {
      this.voltarFiltro();
      return;
    }

    this.prepararParaMostrarListagem(destino);
  }

  public destruir(): void {
    this.controllerInterno?.abort();
  }

  private prepararParaMostrarListagem(destino: EnumOpcoesDePagina.AGENDAMENTO | EnumOpcoesDePagina.AUTORIZACAO | EnumOpcoesDePagina.LOTE): void {
    this._paginaParaMostrar.set(destino);
  }

  private atualizarOpcoesDeConsulta(): void {
    const opcoes = criarOpcoesDeConsulta();
    this._opcoesDeRelatorio.set(opcoes);

    const destinoAtual = this._destinoSelecionado();
    if (!destinoAtual) {
      return;
    }

    const opcaoAtualizada = opcoes.find((opcao) => opcao.destino === destinoAtual);
    if (opcaoAtualizada) {
      this._opcaoSelecionada.set(opcaoAtualizada);
    }
  }

  private lidarComTrocaDeDestino(opcao: RelatorioOpcao<EnumOpcoesAutorizacaoAgendamento>): void {
    if (!this._destinoSelecionado()) {
      return;
    }

    if (opcao.destino === this._destinoSelecionado()) {
      return;
    }

    this.controllerInterno?.abort();
  }

  private normalizarFiltrosConsulta(query: Record<string, string>): Record<string, string> {
    const filtros = { ...query };

    if (filtros['convenio']) {
      filtros['convenio'] = removerZerosAEsquerda(filtros['convenio']);
    }

    return filtros;
  }

  private voltarFiltro(): void {
    this._paginaParaMostrar.set(EnumOpcoesDePagina.FILTRO);
  }
}
