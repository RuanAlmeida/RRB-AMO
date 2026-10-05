/* Prontuários do produto — casos de exemplo montados para o protótipo,
   sem vínculo com paciente real. A fila tem 3 pacientes; CM.data.prontuario
   é o ponteiro do paciente atual (app.js troca o ponteiro ao navegar na
   fila, antes de qualquer render). */
window.CM = window.CM || {};

CM.data = CM.data || {};

CM.data.prontuarios = [
  {
    paciente_id: "PAC-0042",
    nome: "Helena Martins",
    idade: 67,
    unidade: "UBS Modelo",
    atendimento: "Consulta eletiva de atenção primária",
    data_consulta: "2026-09-18",
    profissional: "Dra. Renata Vilas",

    historico: [
      {
        data: "2026-03-12",
        evento: "Consulta de atenção primária com pressão arterial de 14 por 9 mmHg e relato de dor torácica ao esforço",
        fonte: "Prontuário, UBS Modelo"
      },
      {
        data: "2026-01-20",
        evento: "Retorno agendado, paciente não compareceu",
        fonte: "Agenda da UBS Modelo"
      },
      {
        data: "2025-11-03",
        evento: "Internação por síndrome coronariana aguda, alta após quatro dias",
        fonte: "Resumo de internação, Hospital Modelo"
      },
      {
        data: "2024-08-15",
        evento: "Início de tratamento para diabetes tipo 2 com metformina",
        fonte: "Prontuário, UBS Modelo"
      }
    ],

    exames: [
      {
        data: "2026-05-10",
        tipo: "Hemoglobina glicada (HbA1c)",
        resultado: "8,2%",
        fonte: "Laboratório, laudo LAB-1187"
      },
      {
        data: "2026-05-10",
        tipo: "LDL colesterol",
        resultado: "162 mg/dL",
        fonte: "Laboratório, laudo LAB-1187"
      },
      {
        data: "2026-06-02",
        tipo: "Eletrocardiograma",
        resultado: "Sobrecarga ventricular esquerda",
        fonte: "Laudo cardiológico, CARD-0455"
      },
      {
        data: "2026-02-18",
        tipo: "Creatinina",
        resultado: "1,1 mg/dL",
        fonte: "Laboratório, laudo LAB-0994"
      }
    ],

    medicacoes_atuais: [
      { nome: "Metformina 500 mg", inicio: "2024-08-15" },
      { nome: "Losartana 50 mg", inicio: "2023-05-10" },
      { nome: "AAS 100 mg", inicio: "2025-11-10" }
    ]
  },

  {
    paciente_id: "PAC-0043",
    nome: "Giovani Ribeiro",
    idade: 41,
    unidade: "UBS Modelo",
    atendimento: "Consulta de acompanhamento de hipertensão",
    data_consulta: "2026-09-22",
    profissional: "Dra. Renata Vilas",

    historico: [
      {
        data: "2026-03-25",
        evento: "Retorno agendado para aferição da pressão arterial, paciente não compareceu",
        fonte: "Agenda da UBS Modelo"
      },
      {
        data: "2026-02-10",
        evento: "Consulta com pressão arterial aferida em 158 por 96 mmHg",
        fonte: "Prontuário, UBS Modelo"
      },
      {
        data: "2023-06-14",
        evento: "Diagnóstico de hipertensão arterial, início de acompanhamento na atenção primária",
        fonte: "Prontuário, UBS Modelo"
      }
    ],

    exames: [
      {
        data: "2026-08-05",
        tipo: "Creatinina",
        resultado: "0,9 mg/dL",
        fonte: "Laboratório, laudo LAB-1301"
      },
      {
        data: "2026-08-05",
        tipo: "Potássio sérico",
        resultado: "4,2 mEq/L",
        fonte: "Laboratório, laudo LAB-1301"
      },
      {
        data: "2026-08-05",
        tipo: "Colesterol total",
        resultado: "198 mg/dL",
        fonte: "Laboratório, laudo LAB-1301"
      }
    ],

    medicacoes_atuais: [
      { nome: "Losartana 50 mg", inicio: "2023-06-14" },
      { nome: "Hidroclorotiazida 25 mg", inicio: "2026-02-10" }
    ]
  },

  {
    paciente_id: "PAC-0044",
    nome: "Tereza Campos",
    idade: 72,
    unidade: "UBS Modelo",
    atendimento: "Consulta de retorno de atenção primária",
    data_consulta: "2026-09-23",
    profissional: "Dra. Renata Vilas",

    historico: [
      {
        data: "2026-04-18",
        evento: "Consulta de atenção primária com pressão arterial de 15 por 9 mmHg e relato de dor torácica ao esforço",
        fonte: "Prontuário, UBS Modelo"
      },
      {
        data: "2025-11-03",
        evento: "Internação por síndrome coronariana aguda, alta após cinco dias",
        fonte: "Resumo de internação, Hospital Modelo"
      },
      {
        data: "2024-02-06",
        evento: "Início de acompanhamento para diabetes tipo 2 na atenção primária",
        fonte: "Prontuário, UBS Modelo"
      }
    ],

    exames: [
      {
        data: "2026-07-30",
        tipo: "Hemoglobina glicada (HbA1c)",
        resultado: "8,6%",
        fonte: "Laboratório, laudo LAB-1244"
      },
      {
        data: "2026-07-30",
        tipo: "LDL colesterol",
        resultado: "168 mg/dL",
        fonte: "Laboratório, laudo LAB-1244"
      },
      {
        data: "2026-07-30",
        tipo: "Creatinina",
        resultado: "1,0 mg/dL",
        fonte: "Laboratório, laudo LAB-1244"
      }
    ],

    medicacoes_atuais: [
      { nome: "Metformina 500 mg", inicio: "2024-02-06" },
      { nome: "Atorvastatina 20 mg", inicio: "2025-11-20" },
      { nome: "AAS 100 mg", inicio: "2025-11-20" }
    ]
  }
];

/* ponteiro do paciente em atendimento (aplicado por app.js via fila salva) */
CM.data.prontuario = CM.data.prontuarios[0];
