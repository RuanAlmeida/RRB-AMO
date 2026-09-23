/* Base controlada — índice pequeno de documentos sintéticos.
   É esta base que o motor de recuperação consulta para sustentar
   (ou recusar) cada ponto de atenção. */
window.CM = window.CM || {};

CM.data = CM.data || {};

CM.data.baseControlada = [
  {
    id: "BC-001",
    titulo: "Dor torácica de esforço na atenção primária",
    org: "Protocolo sintético da rede modelo",
    versao: "v3",
    data: "2026-04-02",
    trechos: [
      "Dor torácica que aparece ao esforço, como subir escada, e cessa em repouso é o padrão clássico de dor de esforço.",
      "Quando o relato de dor ao esforço é novo ou piorou em relação a registros anteriores do prontuário, o retorno presencial ganha prioridade e deve ser documentado.",
      "Piora recente em atividade habitual que antes não provocava sintoma aumenta a prioridade do retorno eletivo.",
      "O registro do relato em prontuário com data é obrigatório para comparação em consultas seguintes."
    ]
  },
  {
    id: "BC-002",
    titulo: "Hemoglobina glicada em diabetes tipo 2 em tratamento",
    org: "Protocolo sintético da rede modelo",
    versao: "v2",
    data: "2026-02-10",
    trechos: [
      "Hemoglobina glicada acima de 7% em pessoa com diabetes tipo 2 em tratamento habitual indica controle glicêmico fora da meta individualizada.",
      "A meta de hemoglobina glicada é definida pelo profissional para cada pessoa, considerando idade e outros fatores registrados.",
      "Resultado fora da meta deve ser comparado com coleta anterior e discutido na consulta presencial, com registro em prontuário.",
      "Adesão ao tratamento e alimentação são revisadas junto com o resultado, sem alteração de conduta fora da consulta."
    ]
  },
  {
    id: "BC-003",
    titulo: "LDL colesterol após síndrome coronariana aguda",
    org: "Protocolo sintético da rede modelo",
    versao: "v1",
    data: "2025-12-05",
    trechos: [
      "Pessoa com histórico de síndrome coronariana aguda busca LDL colesterol abaixo de 100 mg/dL conforme o protocolo da rede.",
      "LDL acima de 100 mg/dL em pessoa pós-infarto fica acima do desejável e entra na revisão de conduta pelo médico assistente.",
      "O valor deve ser lido junto com a data do exame e com o histórico registrado no prontuário."
    ]
  },
  {
    id: "BC-004",
    titulo: "Adesão a medicamentos cardiovasculares",
    org: "Protocolo sintético da rede modelo",
    versao: "v2",
    data: "2026-01-15",
    trechos: [
      "Esquecimentos esporádicos de antiagregante em pessoa pós-infarto são ponto de atenção para revisão de adesão ao tratamento.",
      "Pular dias de medicamento cardiovascular contínuo aumenta o risco cardiovascular e pede conversa de reforço na consulta.",
      "Registrar na consulta os dias em que a pessoa esqueceu a tomada, para acompanhamento longitudinal.",
      "Revisão de adesão acontece sempre em consulta, com validação do profissional antes de qualquer mudança."
    ]
  },
  {
    id: "BC-005",
    titulo: "Chás e plantas medicinais junto com anti-hipertensivos",
    org: "Protocolo sintético da rede modelo",
    versao: "v1",
    data: "2025-10-20",
    trechos: [
      "O uso de chás e plantas medicinais junto com anti-hipertensivos exige checagem de interação pelo profissional antes de manter ou alterar qualquer conduta.",
      "Relato de uso de produto indicado por terceiro deve ser registrado no prontuário com data e origem da indicação.",
      "A decisão sobre continuar ou suspender o uso do chá é do médico, tomada em consulta, nunca automática."
    ]
  },
  {
    id: "BC-006",
    titulo: "Comparação de exames seriados em atenção primária",
    org: "Protocolo sintético da rede modelo",
    versao: "v1",
    data: "2026-03-30",
    trechos: [
      "Exame laboratorial só ganha interpretação quando comparado a coleta anterior, sempre com tipo de exame, data e valor registrados.",
      "Queda ou alta entre duas coletas deve ser descrita em linguagem simples no retorno ao paciente, sem promessa de resultado.",
      "Metadados obrigatórios de exame: tipo, data, valor, unidade e identificação do laudo."
    ]
  }
];
