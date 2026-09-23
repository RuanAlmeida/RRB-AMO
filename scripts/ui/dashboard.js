/* Tela 2 — Dashboard populacional.
   Todo número exibido aqui carrega rótulo visível de simulado e a
   amostra sintética que o sustenta. Nenhum elemento desta tela aciona
   ação automática: dashboard informa, humano decide. */
window.CM = window.CM || {};
CM.ui = CM.ui || {};

CM.ui.dashboard = (function () {
  const u = function () { return CM.util; };

  function renderKpis() {
    const kpis = CM.data.dashboard.kpis;
    document.getElementById("kpis").innerHTML = kpis.map(function (k) {
      return '<article class="kpi">' +
        '<div class="kpi__linha">' +
          '<span class="kpi__valor">' + u().esc(k.valor) + "</span>" +
          '<span class="selo selo--simulado">Simulado</span>' +
        "</div>" +
        '<p class="kpi__rotulo">' + u().esc(k.rotulo) + "</p>" +
        '<p class="kpi__base">Base: ' + u().esc(k.base) + ", " + u().esc(k.periodo) + "</p>" +
      "</article>";
    }).join("");
  }

  function svgGrafico(serie) {
    const W = 900, H = 340;
    const m = { top: 28, right: 28, bottom: 66, left: 88 };
    const iw = W - m.left - m.right;
    const ih = H - m.top - m.bottom;
    const maximo = 600;
    const ticks = [0, 150, 300, 450, 600];
    const n = serie.pontos.length;

    const x = function (i) { return m.left + (iw * i) / (n - 1); };
    const y = function (v) { return m.top + ih - (v / maximo) * ih; };

    let s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' +
      u().esc("Gráfico de linha dos exames recebidos por mês em 2026, dado sintético, de 380 em janeiro a 588 em agosto.") + '">';

    ticks.forEach(function (t) {
      const yy = y(t);
      s += '<line class="grade-linha" x1="' + m.left + '" y1="' + yy + '" x2="' + (W - m.right) + '" y2="' + yy + '"></line>';
      s += '<text x="' + (m.left - 12) + '" y="' + yy + '" text-anchor="end" dominant-baseline="middle">' + t + "</text>";
    });

    s += '<line class="eixo" x1="' + m.left + '" y1="' + (m.top + ih) + '" x2="' + (W - m.right) + '" y2="' + (m.top + ih) + '"></line>';
    s += '<line class="eixo" x1="' + m.left + '" y1="' + m.top + '" x2="' + m.left + '" y2="' + (m.top + ih) + '"></line>';

    serie.pontos.forEach(function (p, i) {
      s += '<text x="' + x(i) + '" y="' + (m.top + ih + 24) + '" text-anchor="middle">' + u().esc(p.rotulo) + "</text>";
    });

    const polyline = serie.pontos.map(function (p, i) { return x(i) + "," + y(p.valor); }).join(" ");
    s += '<polyline class="serie" points="' + polyline + '"></polyline>';

    serie.pontos.forEach(function (p, i) {
      s += '<circle class="serie-ponto" cx="' + x(i) + '" cy="' + y(p.valor) + '" r="4">' +
        "<title>" + u().esc(p.rotulo + ": " + p.valor + " exames, valor simulado") + "</title></circle>";
      s += '<text class="serie-valor" x="' + x(i) + '" y="' + (y(p.valor) - 12) + '" text-anchor="middle">' + p.valor + "</text>";
    });

    s += '<text x="' + (m.left + iw / 2) + '" y="' + (H - 14) + '" text-anchor="middle">' + u().esc(serie.eixo_x) + "</text>";
    s += '<text transform="rotate(-90)" x="' + (-(m.top + ih / 2)) + '" y="18" text-anchor="middle">' + u().esc(serie.eixo_y) + "</text>";
    s += "</svg>";
    return s;
  }

  function renderSerie() {
    const serie = CM.data.dashboard.serie;
    document.getElementById("serie-nota").textContent =
      "Série sintética criada para a demonstração, com eixos rotulados. " +
      "Nenhum ponto da curva representa rede real.";
    document.getElementById("grafico").innerHTML = svgGrafico(serie);
    document.getElementById("serie-legenda").textContent =
      "Eixo X: " + serie.eixo_x + ". Eixo Y: " + serie.eixo_y +
      ". Amostra: " + serie.base + ", " + serie.periodo +
      ". Todos os valores são simulados.";
  }

  function renderTabela() {
    const linhas = CM.data.dashboard.tabela.map(function (l) {
      return "<tr>" +
        "<td>" + u().esc(l.indicador) + "</td>" +
        '<td class="num"><strong>' + u().esc(l.valor) + "</strong> " +
          '<span class="selo selo--simulado">Simulado</span></td>' +
        '<td class="num">' + u().esc(l.amostra) + "</td>" +
        '<td class="leitura">' + u().esc(l.leitura) + "</td>" +
      "</tr>";
    }).join("");

    document.getElementById("tabela-gestao").innerHTML =
      "<thead><tr>" +
        "<th>Indicador</th>" +
        "<th>Valor</th>" +
        "<th>Base da amostra</th>" +
        "<th>Leitura interpretativa para gestão</th>" +
      "</tr></thead><tbody>" + linhas + "</tbody>";
  }

  function init() {
    renderKpis();
    renderSerie();
    renderTabela();
  }

  return { init: init };
})();
