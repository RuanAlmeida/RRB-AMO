/* Utilidades compartilhadas das telas. */
window.CM = window.CM || {};

CM.util = (function () {
  function esc(texto) {
    return String(texto == null ? "" : texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function dataBR(iso) {
    const p = String(iso).split("-");
    if (p.length !== 3) return iso;
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  function agora() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return hh + ":" + mm;
  }

  const SELOS = {
    pendente: { texto: "Pendente de revisão", classe: "selo--pendente" },
    aceito: { texto: "Aceito pelo profissional", classe: "selo--aceito" },
    ignorado: { texto: "Ignorado pelo profissional", classe: "selo--ignorado" },
    bloqueado: { texto: "Bloqueado, evidência insuficiente", classe: "selo--bloqueado" }
  };

  const FALANTES = {
    medico: "Profissional de saúde",
    paciente: "Paciente"
  };

  const TIPOS_FONTE = {
    prontuario: "Prontuário sintético",
    base_controlada: "Base controlada"
  };

  /* Persistência leve: localStorage com prefixo próprio.
     ?sem-estado=1 na URL desliga (usado pelos harnesses de teste
     para não deixar estado para trás). */
  const PREFIXO = "copiloto.v1.";
  const ativo = !/[?&]sem-estado=1/.test(window.location.search);

  function ler(chave) {
    if (!ativo) return null;
    try {
      const bruto = window.localStorage.getItem(PREFIXO + chave);
      return bruto ? JSON.parse(bruto) : null;
    } catch (e) {
      return null;
    }
  }

  function gravar(chave, valor) {
    if (!ativo) return;
    try {
      window.localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
    } catch (e) {
      /* armazenamento indisponível: o estado vive só em memória */
    }
  }

  /* remove só as chaves do produto (nunca o localStorage inteiro) */
  function limpar() {
    if (!ativo) return;
    try {
      var alvo = [];
      for (var i = 0; i < window.localStorage.length; i++) {
        var k = window.localStorage.key(i);
        if (k && k.indexOf(PREFIXO) === 0) alvo.push(k);
      }
      alvo.forEach(function (k) { window.localStorage.removeItem(k); });
    } catch (e) {
      /* sem armazenamento, nada a limpar */
    }
  }

  return {
    esc: esc,
    dataBR: dataBR,
    agora: agora,
    SELOS: SELOS,
    FALANTES: FALANTES,
    TIPOS_FONTE: TIPOS_FONTE,
    store: { ler: ler, gravar: gravar, limpar: limpar }
  };
})();

/* alias público usado por app.js, analise.js e retorno.js */
CM.store = CM.util.store;
