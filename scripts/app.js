/* Navegação, tema e inicialização das telas. */
(function () {
  const TELAS = ["analise", "retorno", "dashboard"];

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
    /* padrão do produto: modo escuro */
    aplicarTema("escuro");
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

  /* ---------------- Fila de triagem ----------------
     Três pacientes sintéticos. Ao finalizar, o estado do paciente atual
     é guardado sob atendimentos[pid] e o próximo entra no lugar; tudo
     sobrevive ao F5 porque vive no localStorage do produto. */
  function dadosFila() {
    const salva = CM.store.ler("fila");
    if (salva && salva.atual && salva.atendidos) return salva;
    return { atual: CM.data.prontuarios[0].paciente_id, atendidos: [] };
  }

  function indiceDe(pid) {
    for (let i = 0; i < CM.data.prontuarios.length; i++) {
      if (CM.data.prontuarios[i].paciente_id === pid) return i;
    }
    return 0;
  }

  /* aplica o ponteiro do paciente da vez; precisa rodar antes de
     preencherContexto, renderizar painéis e restaurar estado */
  function aplicarPacienteAtual() {
    const ix = indiceDe(dadosFila().atual);
    CM.data.prontuario = CM.data.prontuarios[ix];
    CM.data.transcricao = CM.data.transcricoes[ix];
  }

  function salvarAtendimento(fila) {
    const mapa = CM.store.ler("atendimentos") || {};
    mapa[fila.atual] = {
      analise: CM.store.ler("analise"),
      retorno: CM.store.ler("retorno"),
      transcricao: CM.store.ler("transcricao")
    };
    CM.store.gravar("atendimentos", mapa);
  }

  function carregarAtendimento(pid) {
    const mapa = CM.store.ler("atendimentos") || {};
    const salvo = mapa[pid];
    CM.store.gravar("analise", salvo && salvo.analise ? salvo.analise : null);
    CM.store.gravar("retorno", salvo && salvo.retorno ? salvo.retorno : null);
    CM.store.gravar("transcricao", salvo && salvo.transcricao ? salvo.transcricao : null);
  }

  function trocarPara(pid) {
    const fila = dadosFila();
    if (pid === fila.atual) return;
    salvarAtendimento(fila);
    fila.atual = pid;
    CM.store.gravar("fila", fila);
    carregarAtendimento(pid);
    location.reload();
  }

  function finalizarAtual() {
    const fila = dadosFila();
    if (fila.atendidos.indexOf(fila.atual) < 0) fila.atendidos.push(fila.atual);
    CM.store.gravar("fila", fila);
    salvarAtendimento(fila);
    let prox = null;
    for (let i = 0; i < CM.data.prontuarios.length; i++) {
      const pid = CM.data.prontuarios[i].paciente_id;
      if (pid !== fila.atual && fila.atendidos.indexOf(pid) < 0) { prox = pid; break; }
    }
    if (prox) {
      fila.atual = prox;
      CM.store.gravar("fila", fila);
      carregarAtendimento(prox);
    }
    location.reload();
  }

  function renderFila() {
    const fila = dadosFila();
    const ret = CM.store.ler("retorno");
    const enviado = !!(ret && ret.enviado);
    document.getElementById("fila-lista").innerHTML = CM.data.prontuarios.map(function (pc) {
      const pid = pc.paciente_id;
      const atendido = fila.atendidos.indexOf(pid) >= 0;
      const atual = pid === fila.atual && !atendido;
      const nome = pc.nome_fictício.replace(/\s*\(fictíc\w+\)/, "");
      const status = atendido ? "atendido"
        : (atual ? (enviado ? "retorno enviado" : "em atendimento") : "aguardando");
      const tipo = atendido ? "atendido" : (atual ? "atendimento" : "aguardando");
      return "<li><button class=\"fila__item fila__item--" + tipo + (atual ? " fila__item--atual" : "") +
        "\" type=\"button\" data-pid=\"" + pid + "\"" + (atual ? " aria-current=\"true\"" : "") + ">" +
        "<span class=\"fila__nome\">" + CM.util.esc(nome) + "</span>" +
        "<span class=\"fila__status\">" + status + "</span></button></li>";
    }).join("");

    /* liberação do próximo paciente: o atendimento só finaliza depois
       que o retorno é enviado pelo próprio profissional */
    const restantes = CM.data.prontuarios.length - fila.atendidos.length;
    const btn = document.getElementById("btn-finalizar");
    const aviso = document.getElementById("finalizar-aviso");
    if (restantes === 0) {
      btn.disabled = true;
      btn.textContent = "Fila concluída";
      aviso.hidden = true;
    } else {
      btn.textContent = restantes === 1 ? "Finalizar atendimento" : "Finalizar e chamar próximo";
      btn.disabled = !enviado;
      aviso.hidden = enviado;
    }
  }

  /* o envio acontece dentro do módulo de retorno; a fila só reage */
  document.addEventListener("cm:envio-alterado", renderFila);

  document.getElementById("btn-reiniciar").addEventListener("click", function () {
    const ok = window.confirm(
      "Reiniciar a demonstração? As marcações, o resumo e o histórico salvos serão apagados."
    );
    if (!ok) return;
    CM.store.limpar();
    location.reload();
  });

  document.getElementById("fila-lista").addEventListener("click", function (ev) {
    const alvo = ev.target && ev.target.closest ? ev.target.closest("button[data-pid]") : null;
    if (!alvo) return;
    const pid = alvo.getAttribute("data-pid");
    if (pid === dadosFila().atual) return;
    const pc = CM.data.prontuarios.filter(function (x) { return x.paciente_id === pid; })[0];
    const ok = window.confirm(
      "Trocar para " + (pc ? pc.nome_fictício : pid) +
      "? O estado atual fica salvo e você pode voltar depois."
    );
    if (ok) trocarPara(pid);
  });

  document.getElementById("btn-finalizar").addEventListener("click", function () {
    const fila = dadosFila();
    const pc = CM.data.prontuarios.filter(function (x) { return x.paciente_id === fila.atual; })[0];
    const ok = window.confirm(
      "Finalizar o atendimento de " + (pc ? pc.nome_fictício : "paciente atual") +
      "? O estado fica salvo e o próximo paciente entra na fila."
    );
    if (!ok) return;
    finalizarAtual();
  });

  document.addEventListener("DOMContentLoaded", function () {
    aplicarPacienteAtual();
    temaInicial();
    preencherContexto();
    renderFila();
    CM.ui.analise.init();
    CM.ui.retorno.init();
    rotear();
  });
})();
