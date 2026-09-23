/* Prontuário sintético — dado de demonstração, sem vínculo com paciente real. */
window.CM = window.CM || {};

CM.data = CM.data || {};

CM.data.prontuario = {
  paciente_id: "PAC-SINT-0042",
  nome_fictício: "Helena Martins (fictícia)",
  idade: 67,
  unidade: "UBS Modelo (fictícia)",
  atendimento: "Consulta eletiva de atenção primária",
  data_consulta: "2026-09-18",
  profissional: "Dra. Renata Vilas (fictícia)",

  historico: [
    {
      data: "2026-03-12",
      evento: "Consulta de atenção primária com pressão arterial de 14 por 9 mmHg e relato de dor torácica ao esforço",
      fonte: "Prontuário sintético, UBS Modelo"
    },
    {
      data: "2026-01-20",
      evento: "Retorno agendado, paciente não compareceu",
      fonte: "Agenda sintética da UBS Modelo"
    },
    {
      data: "2025-11-03",
      evento: "Internação por síndrome coronariana aguda, alta após quatro dias",
      fonte: "Resumo de internação sintético, Hospital Modelo"
    },
    {
      data: "2024-08-15",
      evento: "Início de tratamento para diabetes tipo 2 com metformina",
      fonte: "Prontuário sintético, UBS Modelo"
    }
  ],

  exames: [
    {
      data: "2026-05-10",
      tipo: "Hemoglobina glicada (HbA1c)",
      resultado: "8,2%",
      fonte: "Laboratório sintético, laudo LAB-SINT-1187"
    },
    {
      data: "2026-05-10",
      tipo: "LDL colesterol",
      resultado: "162 mg/dL",
      fonte: "Laboratório sintético, laudo LAB-SINT-1187"
    },
    {
      data: "2026-06-02",
      tipo: "Eletrocardiograma",
      resultado: "Sobrecarga ventricular esquerda",
      fonte: "Laudo cardiológico sintético, CARD-SINT-0455"
    },
    {
      data: "2026-02-18",
      tipo: "Creatinina",
      resultado: "1,1 mg/dL",
      fonte: "Laboratório sintético, laudo LAB-SINT-0994"
    }
  ],

  medicacoes_atuais: [
    { nome: "Metformina 500 mg", inicio: "2024-08-15" },
    { nome: "Losartana 50 mg", inicio: "2023-05-10" },
    { nome: "AAS 100 mg", inicio: "2025-11-10" }
  ]
};
