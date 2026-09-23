/* KPI populacional — todo item carrega simulado: true e a amostra
   sintética que sustenta o número. Nada aqui é dado real. */
window.CM = window.CM || {};

CM.data = CM.data || {};

CM.data.dashboard = {
  periodo: "janeiro a agosto de 2026",
  atualizado_em: "2026-09-22",
  simulado: true,

  kpis: [
    {
      condicao: "HbA1c acima da meta em adultos com diabetes tipo 2",
      periodo: "jan a ago de 2026",
      valor: "42%",
      rotulo: "Adultos com diabetes tipo 2 com HbA1c acima da meta",
      amostra: 320,
      base: "320 registros sintéticos de pessoas",
      simulado: true
    },
    {
      condicao: "Consultas de atenção primária registradas",
      periodo: "jan a ago de 2026",
      valor: "1.284",
      rotulo: "Consultas de atenção primária registradas na rede sintética",
      amostra: 1284,
      base: "1.284 registros sintéticos de consultas",
      simulado: true
    },
    {
      condicao: "Retornos agendados sem comparecimento",
      periodo: "jan a ago de 2026",
      valor: "28%",
      rotulo: "Retornos agendados em que a pessoa não compareceu",
      amostra: 480,
      base: "480 registros sintéticos de retornos",
      simulado: true
    },
    {
      condicao: "LDL acima de 100 mg/dL",
      periodo: "jan a ago de 2026",
      valor: "57%",
      rotulo: "Exames de LDL colesterol com resultado acima de 100 mg/dL",
      amostra: 610,
      base: "610 registros sintéticos de exames",
      simulado: true
    }
  ],

  serie: {
    titulo: "Exames recebidos por mês",
    eixo_x: "Mês de 2026",
    eixo_y: "Exames recebidos, n sintético",
    periodo: "jan a ago de 2026",
    amostra: 3820,
    base: "3.820 registros sintéticos de exames",
    simulado: true,
    pontos: [
      { rotulo: "Jan", valor: 380 },
      { rotulo: "Fev", valor: 410 },
      { rotulo: "Mar", valor: 455 },
      { rotulo: "Abr", valor: 430 },
      { rotulo: "Mai", valor: 502 },
      { rotulo: "Jun", valor: 540 },
      { rotulo: "Jul", valor: 515 },
      { rotulo: "Ago", valor: 588 }
    ]
  },

  tabela: [
    {
      indicador: "Adultos com HbA1c acima da meta",
      valor: "42%",
      amostra: "320 registros sintéticos de pessoas",
      leitura: "Quase metade da coorte sintética está fora da meta. Leitura sugerida: checar se o retorno após o laudo está acontecendo, sem alterar conduta por esta tela."
    },
    {
      indicador: "Retornos agendados sem comparecimento",
      valor: "28%",
      amostra: "480 registros sintéticos de retornos",
      leitura: "Quase três em cada dez retornos não acontecem. Junho concentra a maior faltosidade, junto com a fila mais longa de exames."
    },
    {
      indicador: "Exames de LDL acima de 100 mg/dL",
      valor: "57%",
      amostra: "610 registros sintéticos de exames",
      leitura: "Maioria acima do desejável para pessoas com histórico cardiovascular registrado. Leitura sugerida: revisar cobertura de exame seriado, não indicar terapia por aqui."
    },
    {
      indicador: "Consultas com menos de 8 minutos",
      valor: "34%",
      amostra: "1.284 registros sintéticos de consultas",
      leitura: "Um terço das consultas sintéticas fica abaixo da média descrita na literatura de 7 a 8 minutos. Interpretação: menos tempo, menos registro de evolução, mais dependência do copiloto revisado."
    }
  ]
};
