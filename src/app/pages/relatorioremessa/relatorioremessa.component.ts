import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Host, Preferences } from '../../interfaces';
import { environment } from '../../../environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import { Option } from 'sidsc-components/dsc-select';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { formatDate } from "@angular/common";

const VERSAO = "1.0.0";
const REQUEST_TIMEOUT = 50000;
const AUTOREFRESH: boolean = false;
const ELLIPSIS = "---";
const PRD = "-prd";

type ResumoConsolidadoRemessa = {
  tipoRemessa: string,
  nomeArquivo: string,
  convenio: number,
  sequencial: number,
  dataHoraSituacao: string
};

type RetornoConsolidado = {
  nome: string,
  tipo: 'CNAB 750' | 'CNAB 150',
  situacao: string,
  dataProcessamento: string,
  horaProcessamento: string
};

@Component({
  selector: 'app-root-relatorioremessa',
  templateUrl: './relatorioremessa.component.html',
  styleUrls: ['./relatorioremessa.component.scss']
})

export class RelatorioRemessaComponent implements OnInit {

  constructor(
    private modalService: NgbModal
  ) { }


  @ViewChild('modalMessage') modalMessage: TemplateRef<any> | any;
  @ViewChild('modalValidate') modalValidate: TemplateRef<any> | any;
  @ViewChild('confirmMessage') confirmMessage: TemplateRef<any> | any;

  host: Host | any = environment.host;
  mfeVersao = VERSAO;
  favorite: boolean = false;
  preferences: Preferences | any;

  modalContent: any = null;
  modalValidateContent: any = null;

  remessa: any = {
    filter: null
  }

  itemRemessa: any = {
    filter: null
  }

  roles: string[] | null = null;

  tiporepasses: Option[] = [
    { value: "T", label: "Transação" },
    { value: "C", label: "Consolidado" }
  ];

  tipoconta: Option[] = [
    { value: null, label: "(NENHUM)" },
    { value: "CACC", label: "Corrente" },
    { value: "SVGS", label: "Poupança" },
    { value: "TRAN", label: "Pagamento" }
  ];

  dataSourceRemessa: any = null;
  dataSourceItemRemessa: any = null;
  dataSourceDetalheItemRemessa: any = null;
  dataSourceOcorrenciasItemRemessa: any = null;
  dataSourceSituacoesItemRemessa: any = null;

  consolidadoDiarioMock = {
    dataMovimento: '2026-09-30',
    listaConsolidados: [
      {
        tipoRemessa: 'AUTORIZACAO',
        nomeArquivo: 'AUT_CONSOL_20260930_001.REM',
        convenio: 123456,
        sequencial: 7000101,
        dataHoraSituacao: '30/09/2026 16:20'
      },
      {
        tipoRemessa: 'AUTORIZACAO',
        nomeArquivo: 'AUT_CONSOL_20260930_002.REM',
        convenio: 123456,
        sequencial: 7000102,
        dataHoraSituacao: '30/09/2026 21:09'
      },
      {
        tipoRemessa: 'AGENDAMENTO',
        nomeArquivo: 'AGD_CONSOL_20260930_001.REM',
        convenio: 123456,
        sequencial: 7000103,
        dataHoraSituacao: '30/09/2026 17:45'
      }
    ] as ResumoConsolidadoRemessa[],
    retornosConsolidados: [
      {
        nome: 'RET_CONSOL_20260930_750.CNAB',
        tipo: 'CNAB 750',
        situacao: 'DISPONIVEL',
        dataProcessamento: '01/10/2026',
        horaProcessamento: '00:10'
      },
      {
        nome: 'RET_CONSOL_20260930_150.CNAB',
        tipo: 'CNAB 150',
        situacao: 'DISPONIVEL',
        dataProcessamento: '01/10/2026',
        horaProcessamento: '00:11'
      }
    ] as RetornoConsolidado[]
  };
  remessaSelected: any = null;
  itemRemessaSelected: any = null;
  detalheItemRemessaSelected: any = null;
  ocorrenciaItemRemessaSelected: any = null;
  situacaoItemRemessaSelected: any = null;
  filtroConvenioConsolidado: string = '';
  convenio: any = null;

  tabelaRemessa: string[] = ["id", "tipoRemessa", "nomeArquivo", "convenio", "sequencial", "dataHoraEntrada", "situacao", "dataHoraSituacao", "nomeArquivoRetorno", "nomeArquivoControle", "nomeArquivoScript", "nomeArquivoResultadoScript", "dataHoraRetorno", "comandos"];

  tabelaItemRemessa: string[] = ["id", "nome", "tipo", "situacao", "dataHoraSituacao"];

  //tabelaDetalheItemRemessa: string[] = ["interacao", "dataHoraProcessamento", "codigoRetorno", "conteudoRetorno"];
  tabelaDetalheItemRemessa: string[] = ["nome", "codigoRetorno", "conteudoRequisicao", "conteudoRetorno"];

  tabelaOcorrenciasItemRemessa: string[] = ["id", "codigoRetorno", "descricaoRetorno", "valor"];

  tabelaSituacoesItemRemessa: string[] = ["situacao", "dataHora"];


  dataFiltro: Date = new Date();

  public editMode: boolean = false;
  public autoRefresh: boolean = AUTOREFRESH;
  autoRefreshInerval: any = null;
  private consultaRemessaVersao = 0;
  private selecaoRemessaVersao = 0;
  private selecaoItemRemessaVersao = 0;
  private filtroConsulta: string | null = null;
  private dataConsultaAplicada: string | null = null;
  private consultasPendentes = new Map<string, symbol>();

  ngOnInit(): void {
    this.preferences = {
      favoritos: true,
      acessoRapido: true,
      sugestoesIA: true
    };

    let autoRefreshFavorite = window.sessionStorage.getItem('autoRefresh');
    if (autoRefreshFavorite != null) {
      this.autoRefresh = autoRefreshFavorite == "TRUE";
    }

    let editMode = window.sessionStorage.getItem('editMode');
    if (editMode != null) {
      this.editMode = editMode == "TRUE";
    }


    this.loadData();
    if (this.autoRefresh) {
      this.setAutoRefresh();
    }

  }

  loadData() {
    if (this.dataFiltro == null) this.dataFiltro = new Date();

    this.loadRemessa();
  }

  alterarDataFiltro(data: Date | null): void {
    const dataAnterior = this.dataConsultaAplicada ?? (this.dataFiltro ? this.formatDate(this.dataFiltro) : null);
    this.dataFiltro = data ?? new Date();

    if (dataAnterior === this.formatDate(this.dataFiltro)) return;

    this.limparEstadoRemessa();
    this.dataSourceRemessa = new MatTableDataSource<any>([]);
    this.loadData();
  }

  private limparEstadoRemessa(): void {
    this.selecaoRemessaVersao++;
    this.selecaoItemRemessaVersao++;
    this.remessaSelected = null;
    this.itemRemessaSelected = null;
    this.detalheItemRemessaSelected = null;
    this.ocorrenciaItemRemessaSelected = null;
    this.situacaoItemRemessaSelected = null;

    this.dataSourceItemRemessa = new MatTableDataSource<any>([]);
    this.dataSourceDetalheItemRemessa = new MatTableDataSource<any>([]);
    this.dataSourceOcorrenciasItemRemessa = new MatTableDataSource<any>([]);
    this.dataSourceSituacoesItemRemessa = new MatTableDataSource<any>([]);
  }

  autoRefreshChange() {
    if (!this.autoRefresh) {
      clearInterval(this.autoRefreshInerval);
    } else {
      this.setAutoRefresh();
    }
    window.sessionStorage.setItem('autoRefresh', this.autoRefresh ? "TRUE" : "FALSE");

  }

  editModeChange() {
    window.sessionStorage.setItem('editMode', this.editMode ? "TRUE" : "FALSE");
  }

  setAutoRefresh() {
    let vm = this;
    this.autoRefreshInerval = setInterval(function () {
      vm.loadData()
    }, 5000);
  }

  formatDate(date: Date): string {
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);

    return year + "-" + month + "-" + day;
  }

  baixarConsolidadoMock(event: Event | undefined, nomeArquivo: string): void {
    event?.preventDefault();
    this.showMessageDialog('Protótipo', `Download mockado do arquivo ${nomeArquivo}.`);
  }

  fetchData(url: any, content: any, success: any, error: any) {
    fetch(url, content)
      .then(response => response.json())
      .then((response: any) => {
        if (success) success(response)
      })
      .catch(failure => {
        if (error) error(failure);
      });
  }

  private iniciarConsulta(chave: string) {
    if (this.consultasPendentes.has(chave)) return null;
    const identidade = Symbol();
    const controller = new AbortController();
    const concluir = () => {
      clearTimeout(timeoutId);
      if (this.consultasPendentes.get(chave) !== identidade) return false;
      this.consultasPendentes.delete(chave);
      return true;
    };
    const timeoutId = setTimeout(() => {
      if (concluir()) controller.abort();
    }, REQUEST_TIMEOUT);
    this.consultasPendentes.set(chave, identidade);
    return { signal: controller.signal, concluir };
  }

  loadRemessa() {
    const dataConsulta = this.formatDate(this.dataFiltro);
    let url = environment.backendBatchRemessa + `/consulta/remessa/` + dataConsulta;
    if (this.convenio != null && this.convenio.trim() != "") {
      url = url + "/" + this.convenio;
    }
    this.dataConsultaAplicada = dataConsulta;
    if (this.filtroConsulta !== url) {
      if (this.filtroConsulta !== null) {
        this.limparEstadoRemessa();
        this.dataSourceRemessa = new MatTableDataSource<any>([]);
      }
      this.filtroConsulta = url;
      this.consultaRemessaVersao++;
    }
    const consultaVersao = this.consultaRemessaVersao;
    const consulta = this.iniciarConsulta(`remessas:${consultaVersao}`);
    if (!consulta) return;

    const headers = {
      "Content-Type": "text/plain",
      "Accept": "*/*"
    };

    this.fetchData(url, { method: 'GET', headers: headers, signal: consulta.signal }, (response: any) => {
      if (!consulta.concluir()) return;
      if (consultaVersao !== this.consultaRemessaVersao) return;
      console.log("response: " + response);

      let data = [];
      for (let item of response) {
        try {
          let row: any = {
            id: item.id,
            tipoRemessa: item.tipoRemessa,
            nomeArquivo: item.nomeArquivo,
            convenio: item.convenio,
            sequencial: item.sequencial,
            situacao: item.situacao,
            dataHoraEntrada: item.dataHoraEntrada,
            dataHoraSituacao: item.dataHoraSituacao,
            nomeArquivoRetorno: item.nomeArquivoRetorno,
            nomeArquivoControle: item.nomeArquivoControle,
            nomeArquivoScript: item.nomeArquivoScript,
            nomeArquivoResultadoScript: item.nomeArquivoResultadoScript,
            dataHoraRetorno: item.dataHoraRetorno
          }

          data.push(row);

        } catch (error) {
          console.log(error);

        }
      }

      this.dataSourceRemessa = new MatTableDataSource<any>(data);

      if (this.dataSourceRemessa.data.length === 0) {
        this.limparEstadoRemessa();
        return;
      }

      const remessaSelecionadaAtual = this.remessaSelected
        ? this.dataSourceRemessa.data.find((item: any) => item.id === this.remessaSelected.id)
        : null;

      if (remessaSelecionadaAtual) {
        this.remessaSelected = remessaSelecionadaAtual;
        this.loadItemRemessa();
        this.loadDetalheItemRemessa();
        this.loadOcorrenciasItemRemessa();
        this.loadSituacoesItemRemessa();
        return;
      }

      this.clickRemessa(this.dataSourceRemessa.data[0]);

    }, (error: any) => {
      console.log("error " + error);
      consulta.concluir();
    });

  }

  loadItemRemessa() {

    if (!this.remessaSelected) return;
    const consultaVersao = this.consultaRemessaVersao;
    const selecaoVersao = this.selecaoRemessaVersao;
    const remessaId = this.remessaSelected.id;
    const consulta = this.iniciarConsulta(`itens:${consultaVersao}:${selecaoVersao}:${remessaId}`);
    if (!consulta) return;

    const headers = {
      "Content-Type": "text/plain",
      "Accept": "*/*"
    };

    let url = environment.backendBatchRemessa + `/consulta/itemRemessa/` + remessaId;

    this.fetchData(url, { method: 'GET', headers: headers, signal: consulta.signal }, (response: any) => {
      if (!consulta.concluir()) return;
      if (consultaVersao !== this.consultaRemessaVersao ||
          selecaoVersao !== this.selecaoRemessaVersao ||
          remessaId !== this.remessaSelected?.id) return;
      console.log("response: " + response);

      let data = [];
      for (let item of response) {
        try {
          let row: any = {
            id: item.id,
            nome: item.nome,
            remessa: item.remessa,
            caminho: this.processValue(item.caminho),
            metodo: this.processValue(item.metodo),
            tipo: this.processValue(item.tipo),
            situacao: item.situacao,
            //interacao: item.interacao,
            dataHoraSituacao: item.dataHoraSituacao,
            dadosRequisicao: item.dadosRequisicao,
            dadosRetorno: item.dadosRetorno,
            //conteudoRequisicao: item.conteudoRequisicao ? item.conteudoRequisicao.replaceAll("\r\n",""): null,
            observacoes: item.observacoes,
            dependencia: item.dependencia
          }

          data.push(row);

        } catch (error) {
          console.log(error);

        }
      }

      this.dataSourceItemRemessa = new MatTableDataSource<any>(data);


      if (this.dataSourceItemRemessa.data.length > 0) {

        if (!this.itemRemessaSelected || this.remessaSelected.id != this.itemRemessaSelected.remessa) {
          this.clickItemRemessa(this.dataSourceItemRemessa.data[0]);
        }

      }

    }, (error: any) => {
      console.log("error " + error);
      consulta.concluir();
    });

  }

  loadDetalheItemRemessa() {

    if (!this.itemRemessaSelected) return;
    const consultaVersao = this.consultaRemessaVersao;
    const selecaoVersao = this.selecaoItemRemessaVersao;
    const itemId = this.itemRemessaSelected.id;
    const consulta = this.iniciarConsulta(`detalhes:${consultaVersao}:${selecaoVersao}:${itemId}`);
    if (!consulta) return;

    const headers = {
      "Content-Type": "text/plain",
      "Accept": "*/*"
    };

    let url = environment.backendBatchRemessa + `/consulta/detalheItemRemessa/` + itemId;

    this.fetchData(url, { method: 'GET', headers: headers, signal: consulta.signal }, (response: any) => {
      if (!consulta.concluir()) return;
      if (consultaVersao !== this.consultaRemessaVersao ||
          selecaoVersao !== this.selecaoItemRemessaVersao ||
          itemId !== this.itemRemessaSelected?.id) return;
      console.log("response: " + response);

      let data = [];
      for (let item of response) {

        let json = JSON.parse(item.conteudoRequisicao ? item.conteudoRequisicao.replaceAll("\r\n", "") : null);

        let sistema = json.sistema;
        let nome = json.nome;
        let descricao = json.descricao;

        delete json.sistema;
        delete json.nome;
        delete json.descricao;

        try {
          let row: any = {
            id: item.id,
            //interacao: item.interacao,
            sistema: sistema,
            nome: nome,
            descricao: descricao,
            codigoRetorno: item.codigoRetorno,
            conteudoRequisicao: JSON.stringify(json),
            conteudoRetorno: item.conteudoRetorno ? item.conteudoRetorno.replaceAll("\r\n", "") : null,
            dataHoraProcessamento: item.dataHoraProcessamento
          }

          data.push(row);

        } catch (error) {
          console.log(error);

        }
      }
      this.dataSourceDetalheItemRemessa = new MatTableDataSource<any>(data);

    }, (error: any) => {
      console.log("error " + error);
      consulta.concluir();
    });

  }

  loadOcorrenciasItemRemessa() {

    if (!this.itemRemessaSelected) return;
    const consultaVersao = this.consultaRemessaVersao;
    const selecaoVersao = this.selecaoItemRemessaVersao;
    const itemId = this.itemRemessaSelected.id;
    const consulta = this.iniciarConsulta(`ocorrencias:${consultaVersao}:${selecaoVersao}:${itemId}`);
    if (!consulta) return;

    const headers = {
      "Content-Type": "text/plain",
      "Accept": "*/*"
    };

    let url = environment.backendBatchRemessa + `/consulta/ocorrenciasItemRemessa/` + itemId;

    fetch(url, { method: 'GET', headers: headers, signal: consulta.signal })
      .then(response => response.json())
      .then((response: any) => {
        if (!consulta.concluir()) return;
        if (consultaVersao !== this.consultaRemessaVersao ||
            selecaoVersao !== this.selecaoItemRemessaVersao ||
            itemId !== this.itemRemessaSelected?.id) return;
        let data = [];
        for (let item of response) {
          try {
            let row: any = {
              id: item.id,
              codigoRetorno: item.codigoRetorno,
              descricaoRetorno: item.descricaoRetorno,
              valor: item.valor
            }

            data.push(row);

          } catch (error) {
            console.log(error);

          }
        }
        this.dataSourceOcorrenciasItemRemessa = new MatTableDataSource<any>(data);

      })
      .catch(error => {
        console.log("error " + error);
        consulta.concluir();
      });

  }

  loadSituacoesItemRemessa() {

    if (!this.itemRemessaSelected) return;
    const consultaVersao = this.consultaRemessaVersao;
    const selecaoVersao = this.selecaoItemRemessaVersao;
    const itemId = this.itemRemessaSelected.id;
    const consulta = this.iniciarConsulta(`situacoes:${consultaVersao}:${selecaoVersao}:${itemId}`);
    if (!consulta) return;

    const headers = {
      "Content-Type": "text/plain",
      "Accept": "*/*"
    };

    let url = environment.backendBatchRemessa + `/consulta/situacoesItemRemessa/` + itemId;

    fetch(url, { method: 'GET', headers: headers, signal: consulta.signal })
      .then(response => response.json())
      .then((response: any) => {
        if (!consulta.concluir()) return;
        if (consultaVersao !== this.consultaRemessaVersao ||
            selecaoVersao !== this.selecaoItemRemessaVersao ||
            itemId !== this.itemRemessaSelected?.id) return;
        let data = [];
        for (let item of response) {
          try {
            let row: any = {
              situacao: item.situacao,
              dataHora: item.dataHora
            }

            data.push(row);

          } catch (error) {
            console.log(error);

          }
        }
        this.dataSourceSituacoesItemRemessa = new MatTableDataSource<any>(data);

      })
      .catch(error => {
        console.log("error " + error);
        consulta.concluir();
      });

  }

  processaJson(data: any) {
    try {
      return JSON.stringify(JSON.parse(data), null, 2);
    } catch (error) {
      return data;
    }
  }

  private processValue(value: any) {
    try {
      if (value == null) return ELLIPSIS;
      if (value.trim && value.trim().length == 0) return ELLIPSIS;
      return value;
    } catch (error) {
      return null;
    }
  }

  public geradorRemessa() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("abortando requisicao");
      controller.abort();
    }, REQUEST_TIMEOUT);

    let url = environment.backendBatchRemessa + "/gerador";

    fetch(url, { method: 'POST', signal: controller.signal })
      .then(response => response.text())
      .then((response: any) => {
        clearTimeout(timeoutId);

        this.showMessageDialog("Atenção", response);

        this.loadData();

      })
      .catch(error => {
        console.log("error " + error);
        clearTimeout(timeoutId);
      });

  }

  public redisponibilizarRemessa(event: any, id: number) {
    let vm = this;
    let titulo = "ATENÇÃO";
    let detalhes = "Confirma a redisponibilizar esta remessa?";
    this.showConfirmDialog(titulo, detalhes, function () {
      vm.processarRedisponibilizarRemessa(id);
    });

  }

  public processarRedisponibilizarRemessa(id: number) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("abortando requisicao");
      controller.abort();
    }, REQUEST_TIMEOUT);

    let url = environment.backendBatchRemessa + "/consulta/redisponibilizarRemessa/" + id;

    fetch(url, { method: 'PUT', signal: controller.signal })
      .then(response => response.text())
      .then((response: any) => {
        clearTimeout(timeoutId);
        console.log("response: " + response);

        this.showMessageDialog("Atenção", response);

        this.remessaSelected = null;
        this.itemRemessaSelected = null;
        this.detalheItemRemessaSelected = null;
        this.ocorrenciaItemRemessaSelected = null;
        this.situacaoItemRemessaSelected = null;

        this.loadData();

      })
      .catch(error => {
        console.log("error " + error);
        clearTimeout(timeoutId);
      });
  }

  public removerRemessa(event: any, id: number) {
    let vm = this;
    let titulo = "ATENÇÃO";
    let detalhes = "Confirma a excluir esta remessa?";
    this.showConfirmDialog(titulo, detalhes, function () {
      vm.processarRemoverRemessa(id);
    });

  }

  public processarRemoverRemessa(id: number) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("abortando requisicao");
      controller.abort();
    }, REQUEST_TIMEOUT);

    let url = environment.backendBatchRemessa + "/consulta/removerRemessa/" + id;

    fetch(url, { method: 'DELETE', signal: controller.signal })
      .then(response => response.text())
      .then((response: any) => {
        clearTimeout(timeoutId);

        this.showMessageDialog("Atenção", response);

        this.remessaSelected = null;
        this.itemRemessaSelected = null;
        this.detalheItemRemessaSelected = null;
        this.ocorrenciaItemRemessaSelected = null;
        this.situacaoItemRemessaSelected = null;

        this.loadData();

      })
      .catch(error => {
        console.log("error " + error);
        clearTimeout(timeoutId);
      });
  }

  public reiniciarRemessa() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("abortando requisicao");
      controller.abort();
    }, REQUEST_TIMEOUT);

    let url = environment.backendBatchRemessa + "/consulta/reiniciarRemessa";

    fetch(url, { method: 'DELETE', signal: controller.signal })
      .then(response => response.text())
      .then((response: any) => {
        clearTimeout(timeoutId);

        this.showMessageDialog("Atenção", response);

        this.remessaSelected = null;
        this.itemRemessaSelected = null;
        this.detalheItemRemessaSelected = null;
        this.ocorrenciaItemRemessaSelected = null;
        this.situacaoItemRemessaSelected = null;

        this.loadData();

      })
      .catch(error => {
        console.log("error " + error);
        clearTimeout(timeoutId);
      });
  }

  public clickRemessa(row: any) {
    this.limparEstadoRemessa();
    this.remessaSelected = row;

    this.loadItemRemessa();
    this.loadDetalheItemRemessa();
    this.loadOcorrenciasItemRemessa();
    this.loadSituacoesItemRemessa();
  }

  public clickItemRemessa(row: any) {
    this.selecaoItemRemessaVersao++;
    this.itemRemessaSelected = row;
    this.loadDetalheItemRemessa();
    this.loadOcorrenciasItemRemessa();
    this.loadSituacoesItemRemessa();
  }

  public clickDetalheItemRemessa(row: any) {
    if (this.detalheItemRemessaSelected == row) {
      this.detalheItemRemessaSelected = null;
    } else {
      this.detalheItemRemessaSelected = row;
    }
  }

  public clickOcorrenciaItemRemessa(row: any) {
    if (this.ocorrenciaItemRemessaSelected == row) {
      this.ocorrenciaItemRemessaSelected = null;
    } else {
      this.ocorrenciaItemRemessaSelected = row;
    }
  }

  public clickSituacaoItemRemessa(row: any) {
    if (this.situacaoItemRemessaSelected == row) {
      this.situacaoItemRemessaSelected = null;
    } else {
      this.situacaoItemRemessaSelected = row;
    }
  }

  uploadArquivo(event: any) {

    let url = environment.backendBatchRemessa + "/gerador/validar";
    const formData: FormData = new FormData();

    const files = event.target.files;
    const file = files[0];
    const headers = {
      //"Content-Type": "application/json"
      "Accept": "application/json"
    };


    let vm = this;

    if (file) {
      formData.append('conteudo', file, file.name);
      this.enviarRemessa(headers, url, formData, function (result: any) {
        event.target.value = "";
        try {
          let json = JSON.parse(result);
          vm.showValidate("Validação do arquivo", json);
        } catch (error) {
          vm.showMessageDialog("Atenção", result);
        }
      });
    }


  }

  uploadRemessa(event: any) {
    let url = environment.backendBatchRemessa + "/gerador/upload";

    const files = event.target.files;
    const file = files[0];

    const formData: FormData = new FormData();
    let vm = this;

    if (file) {
      formData.append('conteudo', file, file.name);
      this.enviarRemessa(null, url, formData, function (response: any) {
        event.target.value = "";
        vm.loadData();

        vm.showMessageDialog("Atenção", response);
      });
    }

  }

  public enviarRemessa(headers: any, url: string, body: any, onDone: any) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("abortando requisicao");
      controller.abort();
    }, REQUEST_TIMEOUT);

    fetch(url, { method: 'POST', body: body, signal: controller.signal, headers: headers })
      .then(response => response.text())
      .then((response: any) => {
        clearTimeout(timeoutId);

        if (onDone) onDone(response);

      })
      .catch(error => {
        console.log("error " + error);
        clearTimeout(timeoutId);

        if (onDone) onDone(error);
      });

  }

  public styleRemessa(row: any) {
    if (this.remessaSelected && row.id == this.remessaSelected.id) return "row-selected";
    return null;
  }

  public styleItemRemessa(row: any) {
    if (this.itemRemessaSelected && row.id == this.itemRemessaSelected.id) return "row-selected";
    return null;
  }

  public styleDetalheItemRemessa(row: any) {
    if (this.detalheItemRemessaSelected && row.id == this.detalheItemRemessaSelected.id) return "row-selected";
    return null;
  }

  public get listaConsolidadosFiltrada(): ResumoConsolidadoRemessa[] {
    const itens = this.consolidadoDiarioMock.listaConsolidados;
    return this.filtrarConsolidadoPorConvenio(itens, this.filtroConvenioConsolidado);
  }

  private filtrarConsolidadoPorConvenio<T extends { convenio: number }>(itens: T[], filtro: string): T[] {
    const filtroNormalizado = (filtro || '').trim();
    if (!filtroNormalizado) {
      return itens;
    }

    return itens.filter((item) => item.convenio.toString().includes(filtroNormalizado));
  }

  showMessageDialog(title: any, details: any = null) {
    this.modalContent = {
      title: title,
      description: details
    }

    this.modalService.dismissAll();
    this.modalService.open(this.modalMessage, { size: 'lg', scrollable: false, windowClass: 'modal-large' });
  }

  showValidate(title: any, content: any = null) {
    this.modalValidateContent = content;
    this.modalValidateContent.title = title;

    this.modalService.dismissAll();
    this.modalService.open(this.modalValidate, { size: 'lg', scrollable: false, windowClass: 'modal-large' });
  }

  downloadRemessa(event: any, fileName: string) {
    if (event) event.preventDefault();

    let url = environment.backendBatchRemessa + "/gerador/downloadRemessa/" + fileName;

    this.showMessageDialog("Aguarde...", "Baixando o arquivo " + fileName);

    fetch(url, { method: 'GET' })
      .then((response: any) => {
        if (response && response.status != 200) {
          return response.json();
        }
        return response.blob();
      })
      .then((response) => {
        this.modalService.dismissAll();

        if (response instanceof Blob) {
          const data = URL.createObjectURL(response);
          const link = document.createElement("a");
          link.href = data;
          link.download = fileName;
          link.click();

        } else {
          console.log("Falha efetuar download");
          console.log(response);
          this.showMessageDialog("Não foi possível efetuar o download", response.mensagem);
        }

      }).catch((err => {
        this.modalService.dismissAll();
        console.error(err);
      }));
  }

  downloadRetorno(event: any, fileName: string) {
    if (event) event.preventDefault();

    let url = environment.backendBatchRemessa + "/gerador/downloadRetorno/" + fileName;

    this.showMessageDialog("Aguarde...", "Baixando o arquivo " + fileName);

    fetch(url, { method: 'GET' })
      .then((response: any) => {
        if (response && response.status != 200) {
          return response.json();
        }
        return response.blob();
      })
      .then((response) => {
        this.modalService.dismissAll();

        if (response instanceof Blob) {
          const data = URL.createObjectURL(response);
          const link = document.createElement("a");
          link.href = data;
          link.download = fileName;
          link.click();

        } else {
          console.log("Falha efetuar download");
          console.log(response);
          this.showMessageDialog("Não foi possível efetuar o download", response.mensagem);
        }

      }).catch((err => {
        this.modalService.dismissAll();
        console.error(err);
      }));
  }

  downloadResultadoScript(event: any, fileName: string) {
    if (event) event.preventDefault();

    let url = environment.backendBatchRemessa + "/gerador/downloadResultadoScript/" + fileName;

    this.showMessageDialog("Aguarde...", "Baixando o arquivo " + fileName);

    fetch(url, { method: 'GET' })
      .then((response: any) => {
        if (response && response.status != 200) {
          return response.json();
        }
        return response.blob();
      })
      .then((response) => {
        this.modalService.dismissAll();

        if (response instanceof Blob) {
          const data = URL.createObjectURL(response);
          const link = document.createElement("a");
          link.href = data;
          link.download = fileName;
          link.click();

        } else {
          console.log("Falha efetuar download");
          console.log(response);
          this.showMessageDialog("Não foi possível efetuar o download", response.mensagem);
        }

      }).catch((err => {
        this.modalService.dismissAll();
        console.error(err);
      }));
  }


  downloadScript(event: any, fileName: string) {
    if (event) event.preventDefault();

    let url = environment.backendBatchRemessa + "/gerador/downloadScript/" + fileName;

    this.showMessageDialog("Aguarde...", "Baixando o arquivo " + fileName);

    fetch(url, { method: 'GET' })
      .then((response: any) => {
        if (response && response.status != 200) {
          return response.json();
        }
        return response.blob();
      })
      .then((response) => {
        this.modalService.dismissAll();

        if (response instanceof Blob) {
          const data = URL.createObjectURL(response);
          const link = document.createElement("a");
          link.href = data;
          link.download = fileName;
          link.click();

        } else {
          console.log("Falha efetuar download");
          console.log(response);
          this.showMessageDialog("Não foi possível efetuar o download", response.mensagem);
        }

      }).catch((err => {
        this.modalService.dismissAll();
        console.error(err);
      }));
  }

  downloadControle(event: any, fileName: string) {
    if (event) event.preventDefault();

    let url = environment.backendBatchRemessa + "/gerador/downloadControle/" + fileName;

    this.showMessageDialog("Aguarde...", "Baixando o arquivo " + fileName);

    fetch(url, { method: 'GET' })
      .then((response: any) => {
        if (response && response.status != 200) {
          return response.json();
        }
        return response.blob();
      })
      .then((response) => {
        this.modalService.dismissAll();

        if (response instanceof Blob) {
          const data = URL.createObjectURL(response);
          const link = document.createElement("a");
          link.href = data;
          link.download = fileName;
          link.click();

        } else {
          console.log("Falha efetuar download");
          console.log(response);
          this.showMessageDialog("Não foi possível efetuar o download", response.mensagem);
        }

      }).catch((err => {
        this.modalService.dismissAll();
        console.error(err);
      }));
  }

  formataTimeStamp(dateString: any) {
    const timestamp = Date.parse(dateString);
    const dateObject = new Date(timestamp);
    return formatDate(dateObject, 'dd/MM/yyyy HH:mm', 'pt-BR');
  }

  showConfirmDialog(title: any, details: any, success: any) {
    this.modalContent = {
      title: title,
      description: details ?? null,
      success: success
    }

    this.modalService.dismissAll();
    this.modalService.open(this.confirmMessage, { size: 'lg', scrollable: false, windowClass: 'modal-large' });
  }


  public verificarUsuario(): boolean {
    try {
      const token: any = window.sessionStorage.getItem("tokenParsed");
      const tokenParsed = JSON.parse(token);
      const realm = tokenParsed["realm_access"];

      if (!realm.roles) return false;

      for (let role of realm.roles) {
        if (role === "ACC_MATRIZ" || role === "ACC_GESTOR") return true;
      }
      return false;
    } catch (e) {
      return true;
    }
  }

  public verificarUsuarioMatrizConsolidado(): boolean {
    try {
      const token: any = window.sessionStorage.getItem('tokenParsed');
      const tokenParsed = JSON.parse(token);
      const roles = tokenParsed?.realm_access?.roles;

      if (!Array.isArray(roles)) return false;

      return roles.includes('ACC_MATRIZ');
    } catch {
      return false;
    }
  }

}
