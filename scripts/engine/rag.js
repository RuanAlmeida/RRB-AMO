/* Recuperação na base controlada — índice TF por palavra-peso IDF.
   Pequeno, em memória, suficiente para a demonstração: não há
   infraestrutura de produção neste hackathon. */
window.CM = window.CM || {};

CM.rag = (function () {
  const STOP = new Set([
    "a", "o", "as", "os", "de", "da", "do", "das", "dos", "em", "no", "na",
    "nas", "nos", "um", "uma", "umas", "uns", "e", "ou", "que", "para", "por",
    "com", "sem", "sob", "mais", "mas", "como", "se", "lhe", "ela", "ele",
    "isso", "este", "esta", "seu", "sua", "nao", "sim", "ate", "apos", "entre"
  ]);

  /* Limiar mínimo de sustentação: abaixo dele a sugestão é bloqueada. */
  const LIMIAR = 0.28;

  const EXPANSAO = {
    aspirina: ["antiagregante", "aas"],
    aas: ["antiagregante", "aspirina"],
    glicada: ["hemoglobina", "diabetes"],
    hba1c: ["glicada", "hemoglobina"],
    dormir: ["sono", "insonia", "hipnotico"],
    cha: ["plantas", "medicinais"],
    peito: ["toracica", "esforco"],
    ldl: ["colesterol"],
    infarto: ["coronariana", "sindrome"]
  };

  function normalizar(texto) {
    return String(texto)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenizar(texto) {
    return normalizar(texto)
      .split(" ")
      .filter(function (w) { return w.length > 2 && !STOP.has(w); });
  }

  function expandir(tokens) {
    const saida = new Set(tokens);
    tokens.forEach(function (t) {
      (EXPANSAO[t] || []).forEach(function (x) { saida.add(x); });
    });
    return Array.from(saida);
  }

  function novoTf(tokens) {
    const tf = new Map();
    tokens.forEach(function (t) { tf.set(t, (tf.get(t) || 0) + 1); });
    return tf;
  }

  let indice = null;

  function montarIndice() {
    const docs = CM.data.baseControlada;
    const df = new Map();
    const bruto = docs.map(function (d) {
      const texto = [d.titulo].concat(d.trechos).join(" ");
      const tf = novoTf(tokenizar(texto));
      tf.forEach(function (_v, k) { df.set(k, (df.get(k) || 0) + 1); });
      return { doc: d, tf: tf };
    });
    const idf = new Map();
    const N = docs.length;
    df.forEach(function (v, k) {
      idf.set(k, Math.log(1 + (N + 1) / (v + 1)));
    });
    indice = { bruto: bruto, idf: idf };
  }

  /* Escore de cobertura: quanto do peso da consulta é coberto pelo alvo.
     Varia de 0 a 1 e é comparável entre consultas. */
  function cobertura(tokensConsulta, idf, tfAlvo) {
    let atingido = 0;
    let total = 0;
    tokensConsulta.forEach(function (t) {
      const w = idf.get(t) || 0;
      total += w;
      if (tfAlvo.has(t)) atingido += w;
    });
    return total > 0 ? atingido / total : 0;
  }

  function buscar(consulta) {
    if (!indice) montarIndice();
    const q = expandir(Array.from(new Set(tokenizar(consulta))));

    let melhor = null;
    indice.bruto.forEach(function (reg) {
      const s = cobertura(q, indice.idf, reg.tf);
      if (!melhor || s > melhor.escore) melhor = { doc: reg.doc, escore: s };
    });

    let trecho = null;
    let melhorTrecho = -1;
    if (melhor) {
      melhor.doc.trechos.forEach(function (t) {
        const s = cobertura(q, indice.idf, novoTf(tokenizar(t)));
        if (s > melhorTrecho) { melhorTrecho = s; trecho = t; }
      });
    }

    return {
      consulta: consulta,
      doc: melhor ? melhor.doc : null,
      escore: melhor ? melhor.escore : 0,
      trecho: trecho,
      acima: melhor ? melhor.escore >= LIMIAR : false
    };
  }

  return {
    normalizar: normalizar,
    tokenizar: tokenizar,
    buscar: buscar,
    LIMIAR: LIMIAR
  };
})();
