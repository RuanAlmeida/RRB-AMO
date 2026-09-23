/* Tela 1 — Análise da consulta.
   Renderiza prontuário e transcrição, executa o motor de pontos de
   atenção e administra aceitar, ignorar e encaminhar. Nenhuma ação
   aqui acontece sem clique explícito do profissional. */
window.CM = window.CM || {};
CM.ui = CM.ui || {};

CM.ui.analise = (function () {
  const u = function () { return CM.util; };

  let itens = [];
  let estados = {};
  let filtro = "todos";
  let analisado = false;

  /* ---------------- Prontuário ---------------- */

  function linhasTabela(colunas, linhas) {
    const cabecalho = "<thead><tr>" + colunas.map(function (c) { return "<th>" + u().esc(c) + "</th>"; }).join("") + "</tr></thead>";
    const corpo = "<tbody>" + linhas.map(function (linha) {
      return "<tr>" + linha.map(function (celula) {
        return "<td" + (celula.num ? ' class="num"' : "") + ">" + u().esc(celula.texto) + "</td>";
      }).join("") + "</tr>";
    }).join("") + "</tbody>";
    return cabecalho + corpo;
  }

  function renderProntuario() {
    const p = CM.data.prontuario;

    const historico = linhasTabela(
      ["Data", "Evento", "Fonte"],
      p.historico.map(function (h) {
        return [
          { texto: u().dataBR(h.data), num: true },
          { texto: h.evento },
          { texto: h.fonte }
        ];
      })
    );

    const exames = linhasTabela(
      ["Data", "Exame", "Resultado", "Laudo"],
      p.exames.map(function (e) {
        return [
          { texto: u().dataBR(e.data), num: true },
          { texto: e.tipo },
          { texto: e.resultado, num: true },
          { texto: e.fonte }
        ];
      })
    );

    const meds = linhasTabela(
      ["Medicamento", "Em uso desde"],
      p.medicacoes_atuais.map(function (m) {
        return [{ texto: m.nome }, { texto: u().dataBR(m.inicio), num: true }];
      })
    );

    document.getElementById("painel-prontuario").innerHTML =
      '<div class="painel__cabecalho">' +
        '<h2 class="painel__titulo">Prontuário sintético</h2>' +
        '<span class="selo">Dado sintético</span>' +
      "</div>" +
      '<p class="painel__nota">Registro de demonstração usado no cruzamento. Nenhum campo veio de prontuário real.</p>' +
      '<dl class="ficha">' +
        "<dt>Paciente</dt><dd>" + u().esc(p.nome_fictício) + ", " + u().esc(p.paciente_id) + "</dd>" +
        '<dt>Idade</dt><dd class="num">' + p.idade + " anos</dd>" +
        "<dt>Atendimento</dt><dd>" + u().esc(p.atendimento) + ", " + u().esc(p.unidade) + "</dd>" +
        '<dt>Data da consulta</dt><dd class="num">' + u().dataBR(p.data_consulta) + "</dd>" +
        "<dt>Profissional</dt><dd>" + u().esc(p.profissional) + "</dd>" +
      "</dl>" +
      '<div class="secao-dados"><p class="secao-dados__titulo">Histórico</p>' +
        '<table class="tabela">' + historico + "</table></div>" +
      '<div class="secao-dados"><p class="secao-dados__titulo">Exames</p>' +
        '<table class="tabela">' + exames + "</table></div>" +
      '<div class="secao-dados"><p class="secao-dados__titulo">Medicações atuais</p>' +
        '<table class="tabela">' + meds + "</table></div>";
  }

  /* ---------------- Transcrição ---------------- */

  function renderTranscricao() {
    const t = CM.data.transcricao;
    const trechos = t.trechos.map(function (tr) {
      return '<div class="trecho ' + (tr.falante === "paciente" ? "trecho--paciente" : "") + '">' +
        '<div class="trecho__cabecalho">' +
          '<span class="trecho__falante">' + u().esc(u().FALANTES[tr.falante] || tr.falante) + "</span>" +
          '<span class="trecho__hora">' + u().esc(tr.timestamp) + "</span>" +
        "</div>" +
        '<p class="trecho__texto">' + u().esc(tr.texto) + "</p>" +
      "</div>";
    }).join("");

    document.getElementById("painel-transcricao").innerHTML =
      '<div class="painel__cabecalho">' +
        '<h2 class="painel__titulo">Transcrição simulada</h2>' +
        '<span class="selo">Gravação fictícia</span>' +
      "</div>" +
      '<p class="painel__nota">Consulta de ' + u().dataBR(t.data) +
        ", duração estimada de " + u().esc(t.duracao) +
        ", identificador " + u().esc(t.consulta_id) + ".</p>" +
      '<div class="transcricao">' + trechos + "</div>";
  }

  /* ---------------- Status e filtros ---------------- */

  function contagens() {
    const c = { pendente: 0, aceito: 0, ignorado: 0, bloqueado: 0 };
    itens.forEach(function (i) { c[estados[i.id].status] += 1; });
    return c;
  }

  function renderBarra() {
    const barra = document.getElementById("barra-status");
    if (!analisado) { barra.hidden = true; return; }
    const c = contagens();
    barra.hidden = false;
    barra.innerHTML =
      item(c.pendente, "pendentes de revisão") +
      item(c.aceito, "aceitos por você") +
      item(c.ignorado, "ignorados por você") +
      item(c.bloqueado, "bloqueados por evidência insuficiente");

    function item(valor, rotulo) {
      return '<span class="barra-status__item"><span class="barra-status__valor">' +
        valor + "</span> " + rotulo + "</span>";
    }
  }

  function renderFiltros() {
    const caixa = document.getElementById("filtros");
    if (!analisado) { caixa.hidden = true; return; }
    const c = contagens();
    const defs = [
      ["todos", "Todos", itens.length],
      ["pendente", "Pendentes", c.pendente],
      ["bloqueado", "Bloqueados", c.bloqueado],
      ["aceito", "Aceitos", c.aceito],
      ["ignorado", "Ignorados", c.ignorado]
    ];
    caixa.hidden = false;
    caixa.innerHTML = defs.map(function (d) {
      return '<button class="filtro" type="button" data-filtro="' + d[0] + '" aria-pressed="' +
        (filtro === d[0]) + '">' + d[1] + " (" + d[2] + ")</button>";
    }).join("");
  }

  /* ---------------- Cartões ---------------- */

  function blocoFonte(item) {
    if (!item.fonte) return "";
    return '<div class="insight__fonte">' +
      '<p><span class="fonte__rotulo">Fonte rastreável</span></p>' +
      '<p class="fonte__detalhe">' +
        u().esc(u().TIPOS_FONTE[item.fonte.tipo]) + ", " +
        u().esc(item.fonte.referencia) + ", " +
        u().esc(u().dataBR(item.fonte.data)) +
      "</p>" +
      (item.citacao ? '<blockquote class="citacao">“' + u().esc(item.citacao) + "”</blockquote>" : "") +
    "</div>";
  }

  function blocoOrigem(item) {
    if (!item.origem) return "";
    return '<blockquote class="citacao">“' + u().esc(item.origem.texto) + "”</blockquote>" +
      '<p class="fonte__detalhe">Transcrição simulada, ' + u().esc(item.origem.timestamp) +
      ", " + u().esc(u().FALANTES[item.origem.falante]) + "</p>";
  }

  function acoes(item) {
    const est = estados[item.id];
    const profissional = CM.data.prontuario.profissional;

    if (est.status === "pendente") {
      return '<div class="insight__acoes">' +
        '<button class="btn btn--primario" type="button" data-acao="aceitar" data-id="' + item.id + '">Validar e aceitar</button>' +
        '<button class="btn btn--secundario" type="button" data-acao="ignorar" data-id="' + item.id + '">Ignorar</button>' +
      "</div>";
    }

    if (est.status === "aceito" || est.status === "ignorado") {
      const texto = (est.status === "aceito"
        ? "Validado por " + profissional + " às " + est.em
        : "Ignorado por " + profissional + " às " + est.em);
      return '<div class="insight__acoes">' +
        '<p class="insight__registro insight__registro--ok">' + u().esc(texto) + "</p>" +
        '<button class="btn btn--fantasma" type="button" data-acao="desfazer" data-id="' + item.id + '">Desfazer</button>' +
      "</div>";
    }

    /* bloqueado */
    if (est.encaminhado) {
      return '<div class="insight__acoes"><p class="insight__registro">' +
        "Encaminhamento registrado às " + u().esc(est.encaminhado) +
      "</p></div>";
    }
    return '<div class="insight__acoes">' +
      '<button class="btn btn--secundario" type="button" data-acao="encaminhar" data-id="' + item.id + '">' +
        "Registrar encaminhamento para revisão</button>" +
    "</div>";
  }

  function cartao(item) {
    const est = estados[item.id];
    const status = est.status;
    const selo = u().SELOS[status];

    let html = '<article class="insight insight--' + status + '" data-id="' + item.id + '">' +
      '<div class="insight__topo">' +
        '<h3 class="insight__titulo">' + u().esc(item.titulo) + "</h3>" +
        '<span class="selo ' + selo.classe + '">' + u().esc(selo.texto) + "</span>" +
      "</div>" +
      '<p class="insight__corpo">' + u().esc(item.corpo) + "</p>";

    html += blocoOrigem(item);

    if (status === "bloqueado") {
      html += '<div class="bloqueio">' +
        '<p><span class="bloqueio__rotulo">Motivo do bloqueio</span></p>' +
        "<p>" + u().esc(item.motivo_bloqueio) + "</p>" +
        '<p><span class="bloqueio__rotulo">Encaminhamento humano</span></p>' +
        "<p>" + u().esc(item.encaminhamento) + "</p>" +
      "</div>";
      if (est.encaminhado) {
        html += '<div class="encaminhamento-ok">Encaminhamento registrado para revisão clínica às ' +
          u().esc(est.encaminhado) + ". Nenhuma ação foi enviada à paciente.</div>";
      }
    } else {
      html += blocoFonte(item);
    }

    html += acoes(item) + "</article>";
    return html;
  }

  function renderLista() {
    const caixa = document.getElementById("lista-insights");
    if (!analisado) {
      caixa.innerHTML = '<div class="vazio"><p class="vazio__texto">Nenhum ponto de atenção gerado até aqui.</p></div>';
      return;
    }
    const visiveis = itens.filter(function (i) {
      return filtro === "todos" || estados[i.id].status === filtro;
    });
    if (!visiveis.length) {
      caixa.innerHTML = '<div class="vazio"><p class="vazio__texto">Nenhum ponto de atenção neste filtro.</p></div>';
      return;
    }
    caixa.innerHTML = visiveis.map(cartao).join("");
  }

  function renderTudo() {
    renderBarra();
    renderFiltros();
    renderLista();
  }

  /* ---------------- Execução do motor ---------------- */

  function executar() {
    if (analisado) {
      const c = contagens();
      if (c.aceito > 0 || c.ignorado > 0) {
        const ok = window.confirm(
          "Reexecutar a análise substitui as marcações feitas nesta sessão. Continuar?"
        );
        if (!ok) return;
      }
    }

    itens = CM.insights.analisar();
    estados = {};
    itens.forEach(function (i) {
      estados[i.id] = { status: i.status, em: null, encaminhado: null };
    });
    filtro = "todos";
    analisado = true;

    const c = contagens();
    const partes = [];
    if (c.pendente) partes.push(c.pendente + " pendente" + (c.pendente > 1 ? "s" : "") + " de revisão");
    if (c.bloqueado) partes.push(c.bloqueado + " bloqueado" + (c.bloqueado > 1 ? "s" : "") + " por evidência insuficiente");

    document.getElementById("analise-estado").textContent =
      "Análise executada às " + u().agora() + ", com " + itens.length +
      " pontos de atenção: " + partes.join(", ") + ".";
    document.getElementById("btn-analisar").textContent = "Reexecutar análise";

    renderTudo();
    persistir();
  }

  /* ---------------- Eventos ---------------- */

  function delegar(evento) {
    const alvo = evento.target.closest("button[data-acao]");
    if (!alvo) return;
    const id = alvo.dataset.id;
    const acao = alvo.dataset.acao;
    if (!estados[id]) return;

    if (acao === "aceitar") {
      estados[id].status = "aceito";
      estados[id].em = u().agora();
    } else if (acao === "ignorar") {
      estados[id].status = "ignorado";
      estados[id].em = u().agora();
    } else if (acao === "desfazer") {
      const original = itens.find(function (i) { return i.id === id; });
      estados[id].status = original.status;
      estados[id].em = null;
      estados[id].encaminhado = null;
    } else if (acao === "encaminhar") {
      estados[id].encaminhado = u().agora();
    } else {
      return;
    }
    renderTudo();
    persistir();
  }

  function filtrar(evento) {
    const alvo = evento.target.closest("button[data-filtro]");
    if (!alvo) return;
    filtro = alvo.dataset.filtro;
    renderFiltros();
    renderLista();
    persistir();
  }

  function persistir() {
    CM.store.gravar("analise", {
      analisado: analisado,
      filtro: filtro,
      statusText: document.getElementById("analise-estado").textContent,
      estados: estados
    });
  }

  function restaurar() {
    const salvo = CM.store.ler("analise");
    if (!salvo || !salvo.analisado) return;
    /* o motor é determinístico: regenera os itens e só reaplica as
       marcações que o profissional fez */
    itens = CM.insights.analisar();
    estados = {};
    itens.forEach(function (i) {
      const antigo = salvo.estados ? salvo.estados[i.id] : null;
      estados[i.id] = antigo
        ? { status: antigo.status, em: antigo.em, encaminhado: antigo.encaminhado }
        : { status: i.status, em: null, encaminhado: null };
    });
    analisado = true;
    filtro = salvo.filtro || "todos";
    if (salvo.statusText) {
      document.getElementById("analise-estado").textContent = salvo.statusText;
    }
    document.getElementById("btn-analisar").textContent = "Reexecutar análise";
  }

  function init() {
    renderProntuario();
    renderTranscricao();
    restaurar();
    renderTudo();
    document.getElementById("btn-analisar").addEventListener("click", executar);
    document.getElementById("lista-insights").addEventListener("click", delegar);
    document.getElementById("filtros").addEventListener("click", filtrar);
  }

  function aceitos() {
    return itens
      .filter(function (i) { return estados[i.id].status === "aceito"; })
      .map(function (i) { return i.titulo; });
  }

  return { init: init, aceitos: aceitos };
})();
