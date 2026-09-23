/* Tela 3 — Retorno ao paciente.
   Resumo editável, gerado a partir da consulta, com validação
   obrigatória do profissional antes de qualquer registro de envio.
   O sistema não recomenda medicação nem conduta: o validador bloqueia
   texto que tente passar desse limite. */
window.CM = window.CM || {};
CM.ui = CM.ui || {};

CM.ui.retorno = (function () {
  const u = function () { return CM.util; };

  const PROIBIDOS = [
    { re: /\b\d+\s?mg\b(?!\/)/i, motivo: "quantidade em miligramas, que caracteriza dose" },
    { re: /\b(prescri\w+|posolog\w+|dosagem|dose[s]?)\b/i, motivo: "vocabulário de prescrição, como dose ou posologia" },
    { re: /\b(comprimido|compressa|c[aá]psula|gotas)\b/i, motivo: "forma farmacêutica, como comprimido ou cápsula" },
    { re: /\b(deve[r]?|precisa|orientamos?)\s+(tomar|ingerir|aplicar)\b/i, motivo: "instrução de uso de medicamento" },
    { re: /\b(procure|v[áa] ao|n[ãa]o tome|deixe de tomar|fa[çc]a isso agora)\b/i, motivo: "orientação automática de conduta à paciente" },
    { re: /\b(iniciar|suspender|suspenda|trocar|troque)\b[^.]{0,40}\b(tratamento|rem[eé]dio|medica[cç][ãa]o)\b/i, motivo: "decisão de conduta escrita no lugar do profissional" }
  ];

  let validado = false;
  let enviado = null;   /* hora em que o WhatsApp foi aberto com o texto */
  let entradas = [];

  /* ---------------- Montagem do resumo ---------------- */

  function montarResumo() {
    const p = CM.data.prontuario;
    const t = CM.data.transcricao;
    const aceitos = CM.ui.analise.aceitos();

    /* relatos = trechos do próprio paciente, sem texto fixo de outro caso */
    const relatos = t.trechos
      .filter(function (tr) { return tr.falante === "paciente"; })
      .map(function (tr) { return tr.texto; });

    /* revisão = histórico e exames do próprio paciente, com fonte e data */
    const revisados = [];
    p.historico.forEach(function (h) {
      revisados.push(u().dataBR(h.data) + ": " + h.evento + " (" + h.fonte + ")");
    });
    p.exames.forEach(function (e) {
      revisados.push(e.tipo + ": " + e.resultado + " (" + u().dataBR(e.data) + ", " + e.fonte + ")");
    });

    let texto = "Resumo da consulta de " + u().dataBR(p.data_consulta) + " (dado sintético)\n\n" +
      p.nome_fictício + ", " + p.idade + " anos, " +
      p.atendimento.toLowerCase() + " na " + p.unidade + ".\n\n" +
      "Relatos desta consulta\n" +
      relatos.map(function (r) { return "- " + r; }).join("\n") + "\n\n" +
      "Revisado no prontuário sintético\n" +
      revisados.map(function (r) { return "- " + r; }).join("\n") + "\n\n" +
      "Pontos de atenção aceitos nesta sessão\n";

    if (aceitos.length) {
      texto += aceitos.map(function (t2) { return "- " + t2; }).join("\n") + "\n\n";
    } else {
      texto += "- Nenhum ponto aceito até aqui. Este resumo se apoia só no prontuário e na transcrição.\n\n";
    }

    texto += "Próximo passo combinado\n" +
      "Retorno presencial para revisão do plano em conjunto, com qualquer mudança decidida em consulta, por você.\n\n" +
      "Resumo informativo gerado com dados sintéticos. Não recomenda medicamento nem conduta.";

    return texto;
  }

  /* ---------------- Estado da tela ---------------- */

  function atualizarEtapas() {
    const texto = document.getElementById("retorno-texto").value.trim();
    const etapas = document.querySelectorAll("#etapas .etapa");

    etapas.forEach(function (li) { li.className = "etapa"; });

    if (validado && enviado) {
      etapas.forEach(function (li) { li.classList.add("etapa--concluido"); });
      return;
    }
    if (validado) {
      etapas[0].classList.add("etapa--concluido");
      etapas[1].classList.add("etapa--concluido");
      etapas[2].classList.add("etapa--ativo");
      return;
    }
    if (texto) {
      etapas[0].classList.add("etapa--concluido");
      etapas[1].classList.add("etapa--ativo");
    } else {
      etapas[0].classList.add("etapa--ativo");
    }
  }

  function atualizarStatus() {
    const selo = document.getElementById("retorno-status");
    const botao = document.getElementById("btn-validar");
    if (validado && enviado) {
      selo.textContent = "Validado e enviado pelo WhatsApp às " + enviado;
      selo.className = "selo selo--aceito";
      botao.textContent = "Reabrir rascunho";
    } else if (validado) {
      selo.textContent = "Validado, registro criado para envio assistido";
      selo.className = "selo selo--aceito";
      botao.textContent = "Reabrir rascunho";
    } else {
      selo.textContent = "Rascunho, não enviado";
      selo.className = "selo selo--pendente";
      botao.textContent = "Validar registro";
    }
    atualizarEtapas();
  }

  function mostrarErro(texto) {
    const caixa = document.getElementById("retorno-erro");
    if (!texto) {
      caixa.hidden = true;
      caixa.innerHTML = "";
      return;
    }
    caixa.hidden = false;
    caixa.innerHTML = texto;
  }

  function renderLog() {
    const log = document.getElementById("retorno-log");
    if (!entradas.length) {
      log.innerHTML = '<li class="log__vazio">Nenhuma validação registrada até aqui.</li>';
      return;
    }
    log.innerHTML = entradas.map(function (e) {
      return '<li><span class="log__hora">' + u().esc(e.hora) + "</span>" + u().esc(e.texto) + "</li>";
    }).join("");
  }

  function registrar(texto) {
    entradas.unshift({ hora: u().agora(), texto: texto });
    renderLog();
  }

  function persistir() {
    CM.store.gravar("retorno", {
      texto: document.getElementById("retorno-texto").value,
      validado: validado,
      enviado: enviado,
      revisao: document.getElementById("chk-revisao").checked,
      entradas: entradas
    });
  }

  function restaurar() {
    const salvo = CM.store.ler("retorno");
    if (!salvo || !salvo.texto) return false;
    document.getElementById("retorno-texto").value = salvo.texto;
    validado = !!salvo.validado;
    enviado = salvo.enviado || null;
    document.getElementById("chk-revisao").checked = !!salvo.revisao;
    entradas = Array.isArray(salvo.entradas) ? salvo.entradas : [];
    renderLog();
    return true;
  }

  /* ---------------- Ações ---------------- */

  function gerar(silencioso) {
    document.getElementById("retorno-texto").value = montarResumo();
    mostrarErro("");
    enviado = null;   /* texto novo invalida qualquer envio anterior */
    if (validado) {
      validado = false;
      document.getElementById("chk-revisao").checked = false;
      registrar("Rascunho regenerado; validação anterior anulada.");
    }
    atualizarStatus();
    if (!silencioso) registrar("Resumo gerado a partir da consulta.");
    persistir();
  }

  function onGerar() {
    const atual = document.getElementById("retorno-texto").value.trim();
    if (atual) {
      const ok = window.confirm(
        "Gerar um novo resumo substitui o texto atual, incluindo suas edições. Continuar?"
      );
      if (!ok) return;
    }
    gerar(false);
  }

  function onEdicao() {
    if (validado) {
      validado = false;
      enviado = null;
      document.getElementById("chk-revisao").checked = false;
      registrar("Texto editado após validação; validação anterior anulada.");
      atualizarStatus();
    } else {
      atualizarEtapas();
    }
    mostrarErro("");
    persistir();
  }

  function onValidar() {
    if (validado) {
      validado = false;
      enviado = null;
      document.getElementById("chk-revisao").checked = false;
      registrar("Rascunho reaberto pelo profissional; registro de envio assistido desfeito.");
      atualizarStatus();
      persistir();
      return;
    }

    const texto = document.getElementById("retorno-texto").value;
    if (!texto.trim()) {
      mostrarErro("O resumo está vazio. Gere ou escreva o texto antes de validar.");
      return;
    }

    const bloqueios = PROIBIDOS.filter(function (p) { return p.re.test(texto); });
    if (bloqueios.length) {
      mostrarErro(
        "<strong>Validação bloqueada.</strong> O texto contém " +
        bloqueios.map(function (b) { return b.motivo; }).join(", ") +
        ". Remova esse conteúdo: o copiloto não escreve medicação nem conduta para você."
      );
      return;
    }

    const revisado = document.getElementById("chk-revisao").checked;
    if (!revisado) {
      mostrarErro(
        "Confirme a revisão antes de validar. Marque a caixa abaixo do resumo " +
        "para registrar que você leu o texto por completo."
      );
      return;
    }

    const ok = window.confirm(
      "Registrar a validação do resumo de " +
      CM.data.prontuario.nome_fictício +
      "? Depois, use Enviar ao cliente para abrir o WhatsApp com o texto pronto."
    );
    if (!ok) return;

    mostrarErro("");
    validado = true;
    registrar(
      "Validado por " + CM.data.prontuario.profissional +
      ". Registro criado para envio assistido; nenhuma mensagem foi enviada nesta demonstração."
    );
    atualizarStatus();
    persistir();
  }

  /* abre o WhatsApp com o texto pronto; o envio e a confirmação seguem
     manuais, na conversa do profissional. Só libera após validação. */
  function onEnviar() {
    if (!validado) {
      mostrarErro(
        "Valide o registro antes de abrir o WhatsApp. O envio só libera depois da sua revisão."
      );
      return;
    }
    const texto = document.getElementById("retorno-texto").value.trim();
    if (!texto) {
      mostrarErro("Não há resumo para enviar.");
      return;
    }
    window.open("https://wa.me/?text=" + encodeURIComponent(texto), "_blank", "noopener");
    enviado = u().agora();
    mostrarErro("");
    registrar("WhatsApp aberto com o texto pronto. O envio e a confirmação seguem na sua conversa.");
    atualizarStatus();
    persistir();
    document.dispatchEvent(new Event("cm:envio-alterado"));
  }

  function init() {
    if (restaurar()) {
      atualizarStatus();
      mostrarErro("");
    } else {
      gerar(true);
    }
    document.getElementById("btn-gerar").addEventListener("click", onGerar);
    document.getElementById("btn-validar").addEventListener("click", onValidar);
    document.getElementById("btn-enviar").addEventListener("click", onEnviar);
    document.getElementById("retorno-texto").addEventListener("input", onEdicao);
    document.getElementById("chk-revisao").addEventListener("change", persistir);
  }

  return { init: init };
})();
