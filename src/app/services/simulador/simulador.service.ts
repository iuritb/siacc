import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ResumoDocumento } from '../../shared/models/simulacoes-pendentes.model';
import { ErroEnviarSimulacaoAvaliacao } from '../../shared/errors/erro-enviar-avaliacao-simulacao';
import { ErroObterSimulacoesPendentesUnidade } from '../../shared/errors/erro-obter-simulacoes-pendentes-unidade';
import { ErroEnviarContrapropostaSimulacaoAvaliacao } from '../../shared/errors/erro-enviar-contraproposta-avaliacao-simulacao';
import { ErroCancelarSimulacao } from '../../shared/errors/erro-cancelar-simulacao';

@Injectable({
  providedIn: 'root'
})
export class SimuladorService {
  private readonly baseUrl = environment.backendSimuladorUrl;

  public async buscarSimulacoesPendentesDaUnidade(): Promise<any[]> {
    const url: string = `${this.baseUrl}/simulacao/pendentes`;
    const resposta = await fetch(url, { method: 'GET' });
    if (!resposta.ok) {
      throw new ErroObterSimulacoesPendentesUnidade("Não foi possível obter as simulações. Tente novamente em alguns instantes.");
    }
    const dados = await resposta.json();
    return dados;

  }

  public async enviarAvaliacaoSimulacao(formData: FormData): Promise<any> {
    const url = `${this.baseUrl}/simulacao/alcada`;

    const requestOptions = {
      method: 'POST',
      body: formData
    };
    const response = await fetch(url, requestOptions);
    const dados = await response.json();
    if (!response.ok) {
      throw new ErroEnviarSimulacaoAvaliacao(dados.mensagem ?? 'Não foi possível enviar a avaliação. Tente novamente em alguns instantes.');
    }
    return dados;
  }

  public async enviarContraproposta(formData: FormData): Promise<any> {
    const url = `${this.baseUrl}/simulacaoContraProposta`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    const dados = await response.json();
    if (!response.ok) {
      throw new ErroEnviarContrapropostaSimulacaoAvaliacao(dados.mensagem ?? 'Não foi possível enviar a contraproposta. Tente novamente em alguns instantes.');
    };
    return dados;
  }

  public async cancelarSimulacao(id: number, justificativa: FormData): Promise<void> {
    const url = `${this.baseUrl}/simulacao/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      body: justificativa
    });

    if (response.status == 204) return;
    const dados = await response.json();

    if (!response.ok) {
      const titulo = dados.mensagem ?? 'Erro inesperado.';
      const detalhes = dados.descricao ?? 'Não foi possível cancelar a simulação.';

      throw new ErroCancelarSimulacao(titulo, detalhes);
    }
  }

  public async detalharSimulacao(
    numeroSimulacao: number,
    abortController: AbortController
  ): Promise<any> {
    const url: string = `${environment.backendSimuladorUrl}/detalhamento/${numeroSimulacao}`;
    let simulacao = null;

    await fetch(url, { method: 'GET', signal: abortController.signal })
      .then(response => {
        if (!response.ok) {
          throw Error;
        };
        return response.json();
      }).then(response => {
        if (!response) {
          throw Error;
        }

        simulacao = response;
      }).catch(error => {
        throw error;
      })
    return simulacao;
  }

  public async baixarDocumentoSimulacao(
    documento: ResumoDocumento,
  ): Promise<void> {

    const url: string = `${this.baseUrl}/simulacao/download/${encodeURIComponent(documento.caminho)}/${encodeURIComponent(documento.nome)}`;

    await fetch(url, { method: 'GET' })
      .then(response => {
        if (!response.ok) {
          throw Error();
        };
        return response.blob();
      }).then((response) => {

        if (!response) {
          throw Error();
        }
        const blob = response;
        const urlBlob = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = documento.nome;
        link.click();
        window.URL.revokeObjectURL(urlBlob);
      })
      .catch((error) => {
        throw error;
      })
  }

  public verificarUsuarioMatriz(): boolean {
    const token: any = window.sessionStorage.getItem("tokenParsed");
    const tokenParsed = JSON.parse(token);
    const realm = tokenParsed["realm_access"];

    if (!realm.roles) return false;

    for (let role of realm.roles) {
      if (role === "ACC_MATRIZ") return true;
    }
    return false;
  }
}
