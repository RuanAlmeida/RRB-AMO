/* Navegação, tema e inicialização das telas. */
(function () {
  const TELAS = ["analise", "dashboard", "retorno"];

  function mostrar(nome) {
    TELAS.forEach(function (t) {
      document.getElementById("tela-" + t).hidden = t !== nome;
    });
    document.querySelectorAll(".nav__item").forEach(function (b) {
      b.setAttribute("aria-current", String(b.dataset.tela === nome));
    });
  }

  function rotear() {
    const nome = (location.hash || "#analise").replace("#", "");
    mostrar(TELAS.indexOf(nome) >= 0 ? nome : "analise");
  }

  function temaInicial() {
    const salvo = CM.store.ler("tema");
    if (salvo === "claro" || salvo === "escuro") {
      aplicarTema(salvo);
      return;
    }
    const prefereEscuro = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    aplicarTema(prefereEscuro ? "escuro" : "claro");
  }

  function aplicarTema(tema) {
    document.documentElement.setAttribute("data-tema", tema);
    const botao = document.getElementById("btn-tema");
    botao.textContent = tema === "escuro" ? "Usar modo claro" : "Usar modo escuro";
    CM.store.gravar("tema", tema);
  }

  function alternarTema() {
    const atual = document.documentElement.getAttribute("data-tema");
    aplicarTema(atual === "escuro" ? "claro" : "escuro");
  }

  function preencherContexto() {
    const p = CM.data.prontuario;
    document.getElementById("ctx-nome").textContent = p.nome_fictício;
    document.getElementById("ctx-meta").textContent =
      p.paciente_id + ", " + p.idade + " anos, consulta de " + CM.util.dataBR(p.data_consulta);
  }

  document.querySelectorAll(".nav__item").forEach(function (b) {
    b.addEventListener("click", function () {
      /* troca imediata, sem esperar o evento hashchange */
      mostrar(b.dataset.tela);
      location.hash = "#" + b.dataset.tela;
    });
  });
  window.addEventListener("hashchange", rotear);
  document.getElementById("btn-tema").addEventListener("click", alternarTema);

  document.getElementById("btn-reiniciar").addEventListener("click", function () {
    const ok = window.confirm(
      "Reiniciar a demonstração? As marcações, o resumo e o histórico salvos serão apagados."
    );
    if (!ok) return;
    CM.store.limpar();
    location.reload();
  });

  document.addEventListener("DOMContentLoaded", function () {
    temaInicial();
    preencherContexto();
    CM.ui.analise.init();
    CM.ui.dashboard.init();
    CM.ui.retorno.init();
    rotear();
  });
})();
