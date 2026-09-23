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

  /* ---------------- Transcrição ----------------
     Três origens: ditado ao vivo (fluxo principal), exemplo pronto da
     consulta (padrão de demonstração) e texto colado (alternativa
     discreta, para sem microfone). O estado vale para o paciente da vez
     (chave "transcricao", trocada junto com a fila) e trocar de origem
     zera a análise anterior, porque o motor lê a transcrição. */
  let visaoTranscricao = "ditado";

  /* estado do ditado desta sessão; o texto aplicado vive na store */
  const ditado = { estado: "ocioso", bruto: "", parcial: "", em: "", partes: null, erro: "" };
  let reconhecedor = null;
  let querendoOuvir = false;

  function trechosDoTexto(texto) {
    return texto.split(/\n+/)
      .map(function (linha) { return linha.trim(); })
      .filter(Boolean)
      .map(function (linha, i) {
        return {
          falante: "paciente",
          timestamp: "00:" + String(i + 1).padStart(2, "0"),
          texto: linha
        };
      });
  }

  function estadoTranscricao() {
    const salvo = CM.store.ler("transcricao");
    if (salvo && (salvo.modo === "colado" || salvo.modo === "ditado") && salvo.texto) return salvo;
    return { modo: "exemplo" };
  }

  /* aplica o estado salvo sobre CM.data.transcricao.trechos; o exemplo
     original fica guardado em _exemplo para poder ser restaurado */
  function aplicarEstadoTranscricao() {
    const t = CM.data.transcricao;
    if (!t._exemplo) t._exemplo = t.trechos;
    const est = estadoTranscricao();
    t.trechos = (est.modo === "colado" || est.modo === "ditado")
      ? trechosDoTexto(est.texto)
      : t._exemplo;
  }

  function reiniciarAnalise() {
    itens = [];
    estados = {};
    filtro = "todos";
    analisado = false;
    editando = null;
    document.getElementById("analise-estado").textContent =
      "Ainda não executamos o cruzamento. Clique em Analisar consulta.";
    document.getElementById("btn-analisar").textContent = "Analisar consulta";
    renderTudo();
  }

  function definirTranscricao(estado) {
    CM.store.gravar("transcricao", estado);
    CM.store.gravar("analise", null);  /* a análise anterior não serve para outro texto */
    aplicarEstadoTranscricao();
    reiniciarAnalise();
  }

  function mostrarErroTranscricao(texto) {
    const caixa = document.getElementById("transcricao-erro");
    if (!caixa) return;
    caixa.hidden = !texto;
    caixa.textContent = texto || "";
  }

  function onTranscricao(evento) {
    const alvo = evento.target.closest("button[data-transc]");
    if (!alvo) return;
    const tipo = alvo.dataset.transc;

    if (tipo === "ver-exemplo" || tipo === "ver-colar" || tipo === "ver-ditado") {
      /* trocar de visão encerra um ditado em andamento */
      if (tipo !== "ver-ditado" && ditado.estado === "ouvindo") encerrarDitado();
      visaoTranscricao = tipo === "ver-exemplo" ? "exemplo"
        : tipo === "ver-colar" ? "colar" : "ditado";
      mostrarErroTranscricao("");
      renderTranscricao();
      return;
    }

    if (tipo === "ditado-toggle") {
      alternarDitado();
      return;
    }

    if (tipo === "organizar") {
      const campo = document.getElementById("ditado-texto");
      const texto = (campo ? campo.value : ditado.bruto).trim();
      if (!texto) {
        ditado.erro = "Não há fala para organizar. Toque em Falar agora e fale.";
        renderTranscricao();
        return;
      }
      ditado.bruto = texto;
      ditado.partes = CM.organizar.separar(CM.organizar.limpar(texto));
      if (!ditado.partes.length) {
        ditado.erro = "Não captamos fala reconhecível para separar em partes.";
        renderTranscricao();
        return;
      }
      ditado.erro = "";
      ditado.estado = "organizado";
      renderTranscricao();
      return;
    }

    if (tipo === "ditado-refazer") {
      ditado.estado = "concluido";
      ditado.partes = null;
      renderTranscricao();
      return;
    }

    if (tipo === "usar-ditado") {
      const partes = (ditado.partes || []).map(function (p, i) {
        const campo = document.getElementById("parte-texto-" + i);
        return { rotulo: p.rotulo, texto: (campo ? campo.value : p.texto).trim() };
      }).filter(function (p) { return p.texto; });
      if (!partes.length) {
        ditado.erro = "Escreva o conteúdo de ao menos uma parte antes de usar.";
        renderTranscricao();
        return;
      }
      const ok = window.confirm(
        "Usar esta transcrição organizada como transcrição da consulta? A análise atual será refeita com ela."
      );
      if (!ok) return;
      const texto = partes.map(function (p) { return p.rotulo + ": " + p.texto; }).join("\n");
      definirTranscricao({ modo: "ditado", texto: texto });
      ditado.estado = "ocioso";
      ditado.bruto = "";
      ditado.parcial = "";
      ditado.partes = null;
      ditado.em = "";
      ditado.erro = "";
      visaoTranscricao = "ditado";
      renderTranscricao();
      return;
    }

    if (tipo === "ditado-descartar") {
      const ok = window.confirm("Descartar este ditado? O texto capturado será perdido.");
      if (!ok) return;
      ditado.estado = "ocioso";
      ditado.bruto = "";
      ditado.parcial = "";
      ditado.partes = null;
      ditado.em = "";
      ditado.erro = "";
      renderTranscricao();
      return;
    }

    if (tipo === "aplicar") {
      const campo = document.getElementById("transcricao-texto");
      const texto = campo ? campo.value.trim() : "";
      if (!texto) {
        mostrarErroTranscricao("Cole ou escreva o texto da transcrição antes de usar.");
        return;
      }
      const ok = window.confirm(
        "Aplicar este texto como transcrição da consulta? A análise atual será refeita com ele."
      );
      if (!ok) return;
      definirTranscricao({ modo: "colado", texto: texto });
      visaoTranscricao = "colar";
      renderTranscricao();
      return;
    }

    /* usar-exemplo */
    const ok = window.confirm(
      "Voltar ao exemplo pronto da transcrição? A análise atual será refeita com o exemplo."
    );
    if (!ok) return;
    definirTranscricao({ modo: "exemplo" });
    visaoTranscricao = "exemplo";
    renderTranscricao();
  }

  /* ---------------- Ditado ao vivo ----------------
     Web Speech API (Chrome/Edge, pt-BR). Estados: ocioso → ouvindo →
     concluído (etapa "transcrição feita") → organizado (partes
     rotuladas pelo CM.organizar). O atalho Ctrl+Shift+Espaço funciona
     com a aba em foco; atalho global de sistema não existe para web. */
  function temDitado() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function linhasDitadas() {
    return ditado.bruto.split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
  }

  function iniciarDitado() {
    if (!temDitado()) {
      ditado.erro = "Este navegador não faz ditado. Use Chrome ou Edge — ou cole o texto na alternativa abaixo.";
      renderTranscricao();
      return;
    }
    const Classe = window.SpeechRecognition || window.webkitSpeechRecognition;
    reconhecedor = new Classe();
    reconhecedor.lang = "pt-BR";
    reconhecedor.continuous = true;
    reconhecedor.interimResults = true;
    reconhecedor.onresult = function (evento) {
      for (let i = evento.resultIndex; i < evento.results.length; i++) {
        const r = evento.results[i];
        const texto = r[0] ? r[0].transcript : "";
        if (r.isFinal) {
          if (texto.trim()) {
            ditado.bruto += (ditado.bruto ? "\n" : "") + texto.trim();
            const campo = document.getElementById("ditado-texto");
            if (campo) campo.value = ditado.bruto;
          }
        } else if (ditado.estado === "ouvindo") {
          ditado.parcial = texto;
          const est = document.getElementById("ditado-estado");
          if (est) est.textContent = "Ouvindo… " + texto;
        }
      }
    };
    reconhecedor.onerror = function (evento) {
      const cod = evento && evento.error;
      if (cod === "not-allowed" || cod === "service-not-allowed") {
        ditado.erro = "Microfone bloqueado. Permita o acesso ou use “Sem microfone? Cole o texto”.";
      } else if (cod && cod !== "no-speech" && cod !== "aborted") {
        ditado.erro = "Ditado interrompido (" + cod + "). Toque em Falar agora para recomeçar.";
      }
      querendoOuvir = false;
    };
    reconhecedor.onend = function () {
      if (querendoOuvir) {
        /* o Chrome encerra sozinho após um silêncio; seguimos ouvindo */
        try { reconhecedor.start(); } catch (eIgn) { /* já ativo */ }
        return;
      }
      concluirDitado();
    };
    ditado.erro = "";
    ditado.parcial = "";
    ditado.partes = null;
    ditado.estado = "ouvindo";
    querendoOuvir = true;
    renderTranscricao();
    try {
      reconhecedor.start();
    } catch (eIni) {
      ditado.erro = "Não foi possível abrir o microfone. (" + eIni + ")";
      querendoOuvir = false;
      ditado.estado = ditado.bruto.trim() ? "concluido" : "ocioso";
      if (ditado.estado === "concluido") ditado.em = CM.util.agora();
      renderTranscricao();
    }
  }

  function concluirDitado() {
    querendoOuvir = false;
    if (reconhecedor) {
      reconhecedor.onend = null;
      reconhecedor.onerror = null;
      reconhecedor = null;
    }
    if (ditado.estado !== "ouvindo") return;
    if (ditado.bruto.trim()) {
      ditado.estado = "concluido";
      ditado.em = CM.util.agora();
    } else {
      ditado.estado = "ocioso";
      if (!ditado.erro) ditado.erro = "Não captamos fala. Verifique o microfone e tente de novo.";
    }
    renderTranscricao();
  }

  function encerrarDitado() {
    querendoOuvir = false;
    if (!reconhecedor) { concluirDitado(); return; }
    try {
      reconhecedor.stop();
    } catch (eStop) {
      concluirDitado();
    }
  }

  function alternarDitado() {
    if (ditado.estado === "ouvindo") { encerrarDitado(); return; }
    if (ditado.estado === "organizado") return;
    iniciarDitado();
  }

  function estadoDitadoTexto() {
    if (ditado.estado === "ouvindo") return "Ouvindo… fale naturalmente.";
    if (ditado.estado === "concluido") {
      const n = linhasDitadas().length;
      return "Transcrição concluída às " + ditado.em + " (" + n +
        (n === 1 ? " linha" : " linhas") + "). Organize em partes para usá-la.";
    }
    if (ditado.estado === "organizado") {
      return "Transcrição organizada em " + (ditado.partes ? ditado.partes.length : 0) +
        " partes. Revise cada uma e use quando quiser.";
    }
    return temDitado()
      ? "Pronto para o ditado: clique em Falar agora ou use Ctrl+Shift+Espaço com esta aba em foco."
      : "Ditado indisponível neste navegador (use Chrome ou Edge). Cole o texto abaixo, se precisar.";
  }

  function renderTranscricao() {
    const t = CM.data.transcricao;
    const est = estadoTranscricao();
    const emUso = est.modo;   /* exemplo | colado | ditado */
    const exemplo = t._exemplo || t.trechos;

    const trechos = exemplo.map(function (tr) {
      return '<div class="trecho ' + (tr.falante === "paciente" ? "trecho--paciente" : "") + '">' +
        '<div class="trecho__cabecalho">' +
          '<span class="trecho__falante">' + u().esc(u().FALANTES[tr.falante] || tr.falante) + "</span>" +
          '<span class="trecho__hora">' + u().esc(tr.timestamp) + "</span>" +
        "</div>" +
        '<p class="trecho__texto">' + u().esc(tr.texto) + "</p>" +
      "</div>";
    }).join("");

    let visao = "";
    if (visaoTranscricao === "ditado") {
      let corpo;
      if (ditado.estado === "ocioso") {
        corpo = temDitado()
          ? '<div class="acoes-painel">' +
              '<button class="btn btn--primario" type="button" id="btn-ditado" data-transc="ditado-toggle">Falar agora</button>' +
            "</div>"
          : '<p class="painel__nota">Este navegador não faz ditado. Use Chrome ou Edge — cole o texto na alternativa abaixo.</p>';
      } else if (ditado.estado === "ouvindo") {
        corpo =
          '<label class="rotulo-campo" for="ditado-texto">Transcrição ao vivo</label>' +
          '<textarea class="campo-texto" id="ditado-texto" rows="8" readonly spellcheck="false">' +
            u().esc(ditado.bruto) + "</textarea>" +
          '<div class="acoes-painel">' +
            '<button class="btn btn--secundario" type="button" id="btn-ditado" data-transc="ditado-toggle">Encerrar ditado</button>' +
          "</div>";
      } else if (ditado.estado === "concluido") {
        corpo =
          '<label class="rotulo-campo" for="ditado-texto">Fala capturada (corrija se quiser; organizar é a etapa seguinte)</label>' +
          '<textarea class="campo-texto" id="ditado-texto" rows="8" spellcheck="false">' +
            u().esc(ditado.bruto) + "</textarea>" +
          '<div class="acoes-painel">' +
            '<button class="btn btn--primario" type="button" id="btn-organizar" data-transc="organizar">Organizar em partes</button>' +
            '<button class="btn btn--fantasma" type="button" data-transc="ditado-descartar">Descartar</button>' +
          "</div>";
      } else {
        corpo =
          '<p class="painel__nota">Separação automática da fala. Corrija o que quiser: nada vira transcrição sem você mandar.</p>' +
          '<div class="ditado-partes" id="ditado-partes">' +
            (ditado.partes || []).map(function (p, i) {
              return '<div class="parte">' +
                '<label class="rotulo-campo" for="parte-texto-' + i + '">' + u().esc(p.rotulo) + "</label>" +
                '<textarea class="campo-texto" id="parte-texto-' + i + '" rows="3" spellcheck="false">' +
                  u().esc(p.texto) + "</textarea>" +
              "</div>";
            }).join("") +
          "</div>" +
          '<div class="acoes-painel">' +
            '<button class="btn btn--primario" type="button" id="btn-usar-ditado" data-transc="usar-ditado">Usar esta transcrição</button>' +
            '<button class="btn btn--secundario" type="button" data-transc="ditado-refazer">Voltar ao texto bruto</button>' +
          "</div>";
      }
      visao =
        '<p class="painel__nota" id="ditado-estado">' + u().esc(estadoDitadoTexto()) + "</p>" +
        corpo +
        '<div class="erro" id="ditado-erro"' + (ditado.erro ? "" : " hidden") +
          ' role="alert">' + u().esc(ditado.erro) + "</div>" +
        '<div class="acoes-painel">' +
          '<button class="btn btn--fantasma" type="button" data-transc="ver-colar">Sem microfone? Cole o texto</button>' +
        "</div>";
    } else if (visaoTranscricao === "colar") {
      visao =
        '<label class="rotulo-campo" for="transcricao-texto">Texto da transcrição</label>' +
        '<textarea class="campo-texto" id="transcricao-texto" rows="8" spellcheck="false" ' +
          'placeholder="Cole aqui a transcrição da consulta. Uma linha por fala.">' +
          u().esc(emUso === "colado" ? est.texto : "") + "</textarea>" +
        '<div class="erro" id="transcricao-erro" hidden role="alert"></div>' +
        '<div class="acoes-painel">' +
          '<button class="btn btn--primario" type="button" data-transc="aplicar">Usar este texto</button>' +
          '<button class="btn btn--fantasma" type="button" data-transc="ver-ditado">Voltar ao ditado</button>' +
        "</div>";
    } else {
      visao = '<div class="transcricao">' + trechos + "</div>" +
        (emUso !== "exemplo"
          ? '<div class="acoes-painel">' +
              '<button class="btn btn--secundario" type="button" data-transc="usar-exemplo">' +
                "Usar o exemplo da consulta</button>" +
            "</div>"
          : "");
    }

    document.getElementById("painel-transcricao").innerHTML =
      '<div class="painel__cabecalho">' +
        '<h2 class="painel__titulo">Transcrição da consulta</h2>' +
        '<span class="selo">' + (emUso === "ditado" ? "Ditado organizado"
          : emUso === "colado" ? "Texto colado" : "Exemplo pronto") + "</span>" +
      "</div>" +
      '<p class="painel__nota">Consulta de ' + u().dataBR(t.data) +
        ", duração estimada de " + u().esc(t.duracao) +
        ", identificador " + u().esc(t.consulta_id) + ".</p>" +
      '<div class="alternador" role="group" aria-label="Origem da transcrição">' +
        '<button class="alternador__opcao' + (visaoTranscricao === "ditado" ? " alternador__opcao--ativo" : "") +
          '" type="button" data-transc="ver-ditado" aria-pressed="' + (visaoTranscricao === "ditado") +
          '">Ditado da consulta</button>' +
        '<button class="alternador__opcao' + (visaoTranscricao === "exemplo" ? " alternador__opcao--ativo" : "") +
          '" type="button" data-transc="ver-exemplo" aria-pressed="' + (visaoTranscricao === "exemplo") +
          '">Exemplo da consulta</button>' +
      "</div>" +
      '<p class="painel__nota" id="transcricao-em-uso">Em uso: ' +
        (emUso === "ditado" ? "ditado da consulta (organizado)"
          : emUso === "colado" ? "texto colado pelo profissional"
          : "exemplo pronto da consulta") + ".</p>" +
      visao;
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

  /* redação editável: um cartão por vez (editando = id), com a redação
     corrigida guardada em estados[id].titulo e aplicada ao resumo */
  let editando = null;

  function acoes(item) {
    const est = estados[item.id];
    const profissional = CM.data.prontuario.profissional;
    const editar = '<button class="btn btn--fantasma" type="button" data-acao="editar" data-id="' +
      item.id + '">Editar</button>';

    if (est.status === "pendente") {
      return '<div class="insight__acoes">' +
        '<button class="btn btn--primario" type="button" data-acao="aceitar" data-id="' + item.id + '">Validar e aceitar</button>' +
        '<button class="btn btn--secundario" type="button" data-acao="ignorar" data-id="' + item.id + '">Ignorar</button>' +
        editar +
      "</div>";
    }

    if (est.status === "aceito" || est.status === "ignorado") {
      const texto = (est.status === "aceito"
        ? "Validado por " + profissional + " às " + est.em
        : "Ignorado por " + profissional + " às " + est.em);
      return '<div class="insight__acoes">' +
        '<p class="insight__registro insight__registro--ok">' + u().esc(texto) + "</p>" +
        '<button class="btn btn--fantasma" type="button" data-acao="desfazer" data-id="' + item.id + '">Desfazer</button>' +
        editar +
      "</div>";
    }

    /* bloqueado */
    if (est.encaminhado) {
      return '<div class="insight__acoes"><p class="insight__registro">' +
        "Encaminhamento registrado às " + u().esc(est.encaminhado) +
      "</p>" + editar + "</div>";
    }
    return '<div class="insight__acoes">' +
      '<button class="btn btn--secundario" type="button" data-acao="encaminhar" data-id="' + item.id + '">' +
        "Registrar encaminhamento para revisão</button>" +
      editar +
    "</div>";
  }

  function cartao(item) {
    const est = estados[item.id];
    const status = est.status;
    const selo = u().SELOS[status];
    const titulo = est.titulo || item.titulo;

    let html = '<article class="insight insight--' + status + '" data-id="' + item.id + '">' +
      '<div class="insight__topo">' +
        '<h3 class="insight__titulo">' + u().esc(titulo) + "</h3>" +
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

    if (editando === item.id) {
      html += '<div class="insight__edicao">' +
        '<label class="rotulo-campo" for="insight-edicao-texto">Redação do ponto de atenção</label>' +
        '<textarea class="campo-texto" id="insight-edicao-texto" rows="3" spellcheck="false">' +
          u().esc(titulo) + "</textarea>" +
        '<div class="erro" id="insight-edicao-erro" hidden role="alert"></div>' +
        '<div class="acoes-painel">' +
          '<button class="btn btn--primario" type="button" data-acao="salvar" data-id="' + item.id + '">Salvar redação</button>' +
          '<button class="btn btn--secundario" type="button" data-acao="cancelar" data-id="' + item.id + '">Cancelar</button>' +
        "</div>" +
      "</div>";
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
    } else if (acao === "editar") {
      editando = id;
      renderTudo();
      const campo = document.getElementById("insight-edicao-texto");
      if (campo) campo.focus();
      return;
    } else if (acao === "salvar") {
      const campo = document.getElementById("insight-edicao-texto");
      const texto = campo ? campo.value.trim() : "";
      if (!texto) {
        const erro = document.getElementById("insight-edicao-erro");
        if (erro) {
          erro.hidden = false;
          erro.textContent = "Escreva a redação antes de salvar.";
        }
        return;
      }
      estados[id].titulo = texto;
      editando = null;
      renderTudo();
      persistir();
      return;
    } else if (acao === "cancelar") {
      editando = null;
      renderTudo();
      return;
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
       marcações (e redações) que o profissional fez */
    itens = CM.insights.analisar();
    estados = {};
    itens.forEach(function (i) {
      const antigo = salvo.estados ? salvo.estados[i.id] : null;
      estados[i.id] = antigo
        ? { status: antigo.status, em: antigo.em, encaminhado: antigo.encaminhado, titulo: antigo.titulo }
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
    aplicarEstadoTranscricao();
    renderProntuario();
    renderTranscricao();
    restaurar();
    renderTudo();
    document.getElementById("btn-analisar").addEventListener("click", executar);
    document.getElementById("lista-insights").addEventListener("click", delegar);
    document.getElementById("filtros").addEventListener("click", filtrar);
    document.getElementById("painel-transcricao").addEventListener("click", onTranscricao);

    /* atalho do ditado: Ctrl+Shift+Espaço com esta aba em foco
       (atalho global de sistema não existe para página web) */
    document.addEventListener("keydown", function (e) {
      if (!e || !e.ctrlKey || !e.shiftKey) return;
      if (e.code !== "Space" && e.key !== " " && e.key !== "Spacebar") return;
      const alvo = e.target;
      if (alvo && (alvo.tagName === "INPUT" || alvo.tagName === "TEXTAREA" || alvo.isContentEditable)) return;
      if (document.getElementById("tela-analise").hidden) return;
      if (visaoTranscricao !== "ditado") return;
      e.preventDefault();
      alternarDitado();
    });
  }

  function aceitos() {
    return itens
      .filter(function (i) { return estados[i.id].status === "aceito"; })
      .map(function (i) { return estados[i.id].titulo || i.titulo; });
  }

  return { init: init, aceitos: aceitos };
})();
