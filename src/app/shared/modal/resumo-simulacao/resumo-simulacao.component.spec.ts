import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResumoSimulacaoComponent } from './resumo-simulacao.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EnumLabelGruposMargemContribuicao, EnumMensagemGrupo } from '../../../interfaces';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { SharedModule } from '../../shared.module';

describe('ResumoSimulacaoComponent', () => {
  let component: ResumoSimulacaoComponent;
  let fixture: ComponentFixture<ResumoSimulacaoComponent>;

  beforeEach(async () => {
    registerLocaleData(localePt, 'pt-BR'); // Registra os dados de localização para pt-BR

    await TestBed.configureTestingModule({
      declarations: [ResumoSimulacaoComponent],
      imports: [SharedModule], // Importa o módulo necessário para o NgbActiveModal
      providers: [NgbActiveModal], // Adiciona o NgbActiveModal como provedor
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResumoSimulacaoComponent);
    component = fixture.componentInstance;

    // Inicializa a propriedade `data` com valores mockados
    component.dados = {
      grupo: EnumLabelGruposMargemContribuicao.GRUPO_1, // Use um valor válido do enum
      infoGrupo: EnumMensagemGrupo.GRUPO_1, // Use um valor válido do enum correspondente
      tarifaPgCaixa: '10',
      tarifaPgOutros: '15',
      tarifaRetentativa: '5',
      diasDegustacao: '30',
      excecoes: {
        contaDebitoDiferente: false,
        inibirRetentativa: false,
        inibirOpenFinance: false,
        minutaContratualForaPadrao: false,
        minutaEditalCredenciamento: false,
        outro: false,
        textoOutro: ''
      },
      agendamentosPorMes: 100,
      ticketMedio: 50,
      justificativa: 'Justificativa Mockada',
      documento: { nome: 'Documento Mockado', tamanho: 1024 },
      labelBotaoConfirmar: 'Confirmar',
      ocorreuExcepcionalizacao: false,
      infoAlcadaAlert: {
        alcadaCalculada: 'Agência',
        varianteAlert: 'success',
        mensagemAlert: 'Mensagem de alerta mockada', // Adiciona a propriedade obrigatória
      },
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
