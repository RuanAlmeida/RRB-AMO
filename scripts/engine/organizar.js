/* Organizador de ditado — limpa a fala crua capturada pelo microfone e a
   separa em partes rotuladas antes de virar a transcrição da consulta.
   Regras explícitas e conservadoras: mudaças orais saem, conteúdo fica;
   nenhuma linha se perde (toda frase cai em exatamente uma parte). */
window.CM = window.CM || {};

CM.organizar = (function () {
  /* mudaças orais removidas só quando aparecem como palavra isolada */
  const MUDANCAS = ["eh", "eheh", "hum", "humm", "hmm", "hm", "hã", "hãã", "ah", "aha", "uhm", "ãm"];

  /* primeira regra que casa leva a frase; a última é o pano de chão */
  const PARTES = [
    {
      rotulo: "Motivo da queixa",
      gatilhos: /pontada|dor\b|queixa|sinto\b|sentindo|motivo|venho|procurei|refiro/i
    },
    {
      rotulo: "Sintomas relatados",
      gatilhos: /escada|falta de ar|tont|tremor|formigamento|enjoo|sintoma|apert|press[ãa]o|a[çc][uú]car/i
    },
    {
      rotulo: "Medicamentos citados",
      gatilhos: /rem[ée]dio|medicament|aspirina|tomo\b|toma\b|ch[áa]|dormir|renovar|dose|posologia/i
    },
    {
      rotulo: "Exames citados",
      gatilhos: /exame|coleta|resultado|laudo|hemoglobina|glicad|colesterol|an[áa]lise/i
    },
    {
      rotulo: "Observações e encaminhamento",
      gatilhos: /.*/i
    }
  ];

  function linhas(texto) {
    return (texto || "").replace(/\r/g, "").split(/\n+/)
      .map(function (l) { return l.trim(); })
      .filter(Boolean);
  }

  /* limpa cada linha: mudaças, repetição imediata de palavra, espaços;
     capitaliza e fecha a frase; eco idêntico ao anterior sai */
  function limpar(texto) {
    const saida = [];
    linhas(texto).forEach(function (linha) {
      let l = linha
        .replace(/(.)\1{2,}/g, "$1$1")
        .replace(/\s+/g, " ")
        .trim();
      const palavras = l.split(" ").filter(function (p, i, arr) {
        return i === 0 || arr[i - 1].toLowerCase() !== p.toLowerCase();
      });
      l = palavras.filter(function (p) {
        return MUDANCAS.indexOf(p.toLowerCase().replace(/[.,;:!?…]/g, "")) < 0;
      }).join(" ").trim();
      if (!l) return;
      l = l.charAt(0).toUpperCase() + l.slice(1);
      if (!/[.!?…]$/.test(l)) l += ".";
      const ultima = saida.length ? saida[saida.length - 1].toLowerCase() : "";
      if (ultima === l.toLowerCase()) return;
      saida.push(l);
    });
    return saida.join("\n");
  }

  /* frases (linhas divididas em sentenças) vão para a primeira parte cujos
     gatilhos casam; a última parte engole o resto — nada se perde */
  function separar(texto) {
    const frases = [];
    linhas(texto).forEach(function (linha) {
      linha.split(/(?<=[.!?…])\s+/).forEach(function (f) {
        const t = f.trim();
        if (t) frases.push(t);
      });
    });

    const acertos = PARTES.map(function () { return []; });
    frases.forEach(function (f) {
      for (let i = 0; i < PARTES.length; i++) {
        if (PARTES[i].gatilhos.test(f)) {
          acertos[i].push(f);
          return;
        }
      }
    });

    return PARTES.map(function (p, i) {
      return { rotulo: p.rotulo, texto: acertos[i].join(" ") };
    }).filter(function (p) { return p.texto; });
  }

  return { limpar: limpar, separar: separar, PARTES: PARTES };
})();
