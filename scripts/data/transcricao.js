/* Transcrições simuladas — gravações fictícias de consulta, alinhadas por
   índice a CM.data.prontuarios (mesma ordem: Helena, Giovani, Tereza). */
window.CM = window.CM || {};

CM.data = CM.data || {};

CM.data.transcricoes = [
  {
    consulta_id: "COS-SINT-2026-0918",
    data: "2026-09-18",
    duracao: "8 min",
    trechos: [
      {
        falante: "medico",
        texto: "Bom dia, Helena. Como a senhora tem se sentido desde a última consulta?",
        timestamp: "00:12"
      },
      {
        falante: "paciente",
        texto: "Doutora, faz umas três semanas que dá uma pontada no peito quando eu subo a escada do ônibus.",
        timestamp: "00:31"
      },
      {
        falante: "medico",
        texto: "A senhora continuou com a aspirina e com o remédio da pressão?",
        timestamp: "01:05"
      },
      {
        falante: "paciente",
        texto: "A pressão continuo, a aspirina eu esqueci de tomar uns dias na semana passada.",
        timestamp: "01:22"
      },
      {
        falante: "paciente",
        texto: "Meu filho disse que preciso cuidar do açúcar. O exame deu ruim de novo, né doutora?",
        timestamp: "02:40"
      },
      {
        falante: "medico",
        texto: "Vou olhar aqui no seu registro. A hemoglobina glicada subiu desde a última coleta.",
        timestamp: "03:02"
      },
      {
        falante: "paciente",
        texto: "Tomo um chá que a vizinha indicou para a pressão, junto com o remédio.",
        timestamp: "04:15"
      },
      {
        falante: "paciente",
        texto: "E estou sem o remédio de dormir faz uma semana, não consegui renovar.",
        timestamp: "05:48"
      },
      {
        falante: "medico",
        texto: "Entendo. Vamos revisar tudo isso com calma antes de qualquer decisão.",
        timestamp: "06:10"
      }
    ]
  },

  {
    consulta_id: "COS-SINT-2026-0922",
    data: "2026-09-22",
    duracao: "7 min",
    trechos: [
      {
        falante: "medico",
        texto: "Bom dia, Giovani. Recebi seu retorno e notei que a pressão veio alta na última aferição.",
        timestamp: "00:08"
      },
      {
        falante: "paciente",
        texto: "Doutora, tô sentindo que está cada vez piorando, com uns tremores de cabeça de manhã.",
        timestamp: "00:35"
      },
      {
        falante: "medico",
        texto: "O senhor conseguiu comparecer ao retorno de março que estava marcado?",
        timestamp: "01:10"
      },
      {
        falante: "paciente",
        texto: "Esse eu acabei faltando, foi numa semana complicada de trabalho.",
        timestamp: "01:26"
      },
      {
        falante: "medico",
        texto: "E como está sendo a rotina com os remédios?",
        timestamp: "02:05"
      },
      {
        falante: "paciente",
        texto: "Tomo os remédios da pressão direitinho, mas parei com o chá que a vizinha indicou porque fiquei na dúvida.",
        timestamp: "02:31"
      },
      {
        falante: "medico",
        texto: "O chá pode ter relação com os remédios da pressão, precisamos checar com calma.",
        timestamp: "03:12"
      },
      {
        falante: "paciente",
        texto: "Tô há uma semana sem o remédio de dormir também, não consegui renovar a receita.",
        timestamp: "04:40"
      },
      {
        falante: "medico",
        texto: "Vamos anotar tudo isso no seu registro e revisar junto.",
        timestamp: "05:20"
      }
    ]
  },

  {
    consulta_id: "COS-SINT-2026-0923",
    data: "2026-09-23",
    duracao: "9 min",
    trechos: [
      {
        falante: "medico",
        texto: "Bom dia, Tereza. A senhora está bem desde a internação do ano passado?",
        timestamp: "00:10"
      },
      {
        falante: "paciente",
        texto: "Tô indo e voltando, doutora. Quando eu subo a escada do prédio sinto uma pontada no peito e preciso parar.",
        timestamp: "00:42"
      },
      {
        falante: "medico",
        texto: "Isso é importante a gente acompanhar de perto. E os remédios da pressão?",
        timestamp: "01:20"
      },
      {
        falante: "paciente",
        texto: "Tomo certinho. Só que meu filho insiste para eu cuidar do açúcar, que diz que subiu de novo.",
        timestamp: "02:05"
      },
      {
        falante: "medico",
        texto: "Vou mostrar o resultado da última coleta de hemoglobina glicada.",
        timestamp: "02:44"
      },
      {
        falante: "paciente",
        texto: "Doutora, como ficou minha hemoglobina glicada? A última vez deu alto, né?",
        timestamp: "03:01"
      },
      {
        falante: "medico",
        texto: "A coleta de julho veio acima do esperado. Vamos revisar o conjunto dos exames.",
        timestamp: "03:35"
      },
      {
        falante: "paciente",
        texto: "E o colesterol também veio alto, a senhora acha que precisa mudar alguma coisa na dieta?",
        timestamp: "04:12"
      },
      {
        falante: "medico",
        texto: "Qualquer mudança a gente discute aqui, com o registro todo em mãos.",
        timestamp: "04:50"
      }
    ]
  }
];

/* ponteiro da transcrição do paciente em atendimento */
CM.data.transcricao = CM.data.transcricoes[0];
