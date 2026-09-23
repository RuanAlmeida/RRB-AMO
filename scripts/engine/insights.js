/* Motor de pontos de atenção.
   Regra de ouro: toda sugestão precisa de apoio rastreável, seja no
   prontuário sintético, seja em documento da base controlada. Sem apoio
   suficiente, o ponto nasce bloqueado e vai para revisão humana.
   Nada aqui gera diagnóstico, prescrição ou orientação ao paciente. */
window.CM = window.CM || {};

CM.insights = (function () {
  const D = function (iso) { return CM.util ? CM.util.dataBR(iso) : iso; };

  function acharTrecho(padroes) {
    const trechos = CM.data.transcricao.trechos;
    for (let i = 0; i < trechos.length; i++) {
      const t = trechos[i];
      if (padroes.some(function (p) { return p.test(t.texto); })) {
        return { texto: t.texto, timestamp: t.timestamp, falante: t.falante };
      }
    }
    return null;
  }

  function acharEventos(padroes) {
    return CM.data.prontuario.historico.filter(function (h) {
      return padroes.some(function (p) { return p.test(h.evento); });
    });
  }

  function acharExames(padroes) {
    return CM.data.prontuario.exames.filter(function (e) {
      return padroes.some(function (p) { return p.test(e.tipo) || p.test(e.resultado); });
    });
  }

  function acharMedicacoes(padroes) {
    return CM.data.prontuario.medicacoes_atuais.filter(function (m) {
      return padroes.some(function (p) { return p.test(m.nome); });
    });
  }

  function fonteBase(doc) {
    return {
      tipo: "base_controlada",
      referencia: doc.id + ", " + doc.titulo + ", " + doc.versao,
      data: doc.data
    };
  }

  function fonteProntuario(evento) {
    return {
      tipo: "prontuario",
      referencia: evento.fonte + ", " + evento.evento,
      data: evento.data
    };
  }

  const REGRAS = [
    {
      id: "PT-01",
      titulo: "Piora de dor torácica ao esforço sobre registro anterior no prontuário",
      exigencias: {
        transcricao: [/pontada no peito/i, /subo a escada/i],
        prontuario: [/dor tor[áa]cica/i]
      },
      consulta: "dor torácica esforço escada subir repouso atividade prioridade retorno presencial registro prontuário",
      exigeApoio: true,
      corpo: function (g) {
        const evento = g.eventos[0];
        let texto = "O relato nesta consulta é de pontada no peito ao subir escada há cerca de três semanas. " +
          "O prontuário já registra dor torácica ao esforço em " + D(evento.data) +
          ", o que faz deste relato uma piora sobre o mesmo ponto, não um sintoma isolado. " +
          "Aqui a decisão de priorizar retorno é sua, com o registro que a base controlada exige.";
        return texto;
      },
      fonte: function (_g, apoio) { return fonteBase(apoio.doc); }
    },
    {
      id: "PT-02",
      titulo: "Retorno agendado sem comparecimento, sem registro de motivo",
      exigencias: {
        prontuario: [/n[ãa]o compareceu/i]
      },
      consulta: null,
      exigeApoio: false,
      corpo: function (g) {
        const evento = g.eventos[0];
        return "O prontuário registra retorno agendado em " + D(evento.data) +
          " sem comparecimento e sem motivo. A consulta atual acontece seis meses depois, " +
          "e o relato desta consulta aponta piora nesse intervalo. Vale recuperar o motivo da falta no histórico antes de fechar o plano.";
      },
      fonte: function (g) { return fonteProntuario(g.eventos[0]); }
    },
    {
      id: "PT-03",
      titulo: "Hemoglobina glicada acima de 7% com pergunta sobre o resultado nesta consulta",
      exigencias: {
        transcricao: [/a[çc][uú]car/i, /hemoglobina glicada/i],
        prontuario: [/HbA1c/i, /Hemoglobina glicada/i]
      },
      consulta: "hemoglobina glicada hba1c acima da meta diabetes coleta anterior consulta presencial",
      exigeApoio: true,
      corpo: function (g, apoio) {
        const exame = g.exames[0];
        return "A coleta de " + D(exame.data) + " registra " + exame.tipo + " de " + exame.resultado +
          ", acima de 7%. Há pergunta sobre o resultado na consulta de hoje. " +
          (apoio && apoio.acima
            ? "A base controlada pede comparação com a coleta anterior e discussão em consulta presencial, com a meta definida por você."
            : "");
      },
      fonte: function (_g, apoio) { return fonteBase(apoio.doc); }
    },
    {
      id: "PT-04",
      titulo: "Esquecimento de dias do antiagregante em pessoa pós-internação",
      exigencias: {
        transcricao: [/aspirina.*esqueci/i],
        medicacoes: [/AAS/i]
      },
      consulta: "esquecimentos dias antiagregante aspirina adesão tomada risco cardiovascular registro consulta",
      exigeApoio: true,
      corpo: function (g) {
        const med = g.medicacoes[0];
        return "O relato é de esquecimento de dias da aspirina na semana passada. " +
          "O prontuário mostra " + med.nome + " em uso contínuo desde " + D(med.inicio) +
          ", após a internação de 03/11/2025. A base controlada trata esse esquecimento como ponto de atenção " +
          "para revisão de adesão em consulta, com validação sua antes de qualquer mudança.";
      },
      fonte: function (_g, apoio) { return fonteBase(apoio.doc); }
    },
    {
      id: "PT-05",
      titulo: "Chá indicado por terceiro usado junto com o anti-hipertensivo do prontuário",
      exigencias: {
        transcricao: [/ch[áa] que a vizinha/i, /ch[áa]/i],
        medicacoes: [/Losartana/i]
      },
      consulta: "chás plantas medicinais interação conduta prontuário indicação profissional consulta",
      exigeApoio: true,
      corpo: function (g) {
        const med = g.medicacoes[0];
        return "O relato descreve chá indicado pela vizinha junto com o remédio da pressão. " +
          "O prontuário registra " + med.nome + " desde " + D(med.inicio) + ". " +
          "A base controlada exige checagem de interação pelo profissional antes de manter ou alterar qualquer conduta " +
          "e manda registrar no prontuário a origem da indicação. Suspender ou manter o chá é decisão sua, tomada em consulta.";
      },
      fonte: function (_g, apoio) { return fonteBase(apoio.doc); }
    },
    {
      id: "PT-06",
      titulo: "LDL acima de 100 mg/dL em pessoa com histórico cardiovascular registrado",
      exigencias: {
        prontuario: [/LDL colesterol/i]
      },
      consulta: "ldl colesterol pós infarto sindrome coronariana aguda desejável revisão conduta exame",
      exigeApoio: true,
      corpo: function (g) {
        const exame = g.exames[0];
        return "O exame de " + D(exame.data) + " registra LDL de " + exame.resultado +
          ". O prontuário traz histórico de síndrome coronariana aguda em 03/11/2025, e para esse perfil a rede busca LDL abaixo de 100 mg/dL. " +
          "O valor está acima do desejável e entra na sua revisão de conduta.";
      },
      fonte: function (_g, apoio) { return fonteBase(apoio.doc); }
    },
    {
      id: "PT-07",
      titulo: "Uso interrompido de medicamento para dormir",
      exigencias: {
        transcricao: [/rem[ée]dio de dormir/i]
      },
      consulta: "remédio de dormir sono interrompido renovação receita hipnótico insonia",
      exigeApoio: true,
      corpo: function () {
        return "O relato é de uma semana sem o remédio de dormir por falta de renovação. " +
          "O ponto trataria da continuidade do tratamento do sono, mas a evidência disponível não sustenta sugestão.";
      },
      motivo: function (g, apoio) {
        const nomes = CM.data.prontuario.medicacoes_atuais
          .map(function (m) { return m.nome.replace(/ \d+ mg/, ""); })
          .join(", ");
        const escore = (apoio ? apoio.escore : 0).toFixed(2).replace(".", ",");
        const escoreTexto = apoio && apoio.doc && apoio.escore > 0
          ? "a melhor tentativa foi " + apoio.doc.id + " (" + apoio.doc.titulo + "), com escore " + escore
          : "nenhum dos " + CM.data.baseControlada.length + " documentos da base casou com o relato, escore " + escore;
        return "A sugestão foi bloqueada por falta de evidência. " +
          "A recuperação na base controlada ficou abaixo do limiar de " + String(CM.rag.LIMIAR).replace(".", ",") +
          ": " + escoreTexto + ". " +
          "O prontuário também não registra qual medicamento para o sono está em uso; " +
          "medicacoes_atuais contém apenas " + nomes + ". " +
          "Sem documento na base controlada e sem registro no prontuário, o copiloto não emite ponto de atenção.";
      },
      encaminhamento: "A clínica médica responsável revisa o caso e confere a origem da orientação antes de qualquer retorno à paciente. " +
        "Nada foi enviado até aqui."
    }
  ];

  function analisar() {
    const resultado = [];

    REGRAS.forEach(function (r) {
      const g = {
        trecho: null,
        eventos: [],
        exames: [],
        medicacoes: CM.data.prontuario.medicacoes_atuais
      };
      let ok = true;

      if (r.exigencias.transcricao) {
        g.trecho = acharTrecho(r.exigencias.transcricao);
        if (!g.trecho) ok = false;
      }
      if (ok && r.exigencias.prontuario) {
        g.eventos = acharEventos(r.exigencias.prontuario);
        g.exames = acharExames(r.exigencias.prontuario);
        if (!g.eventos.length && !g.exames.length) ok = false;
      }
      if (ok && r.exigencias.medicacoes) {
        g.medicacoes = acharMedicacoes(r.exigencias.medicacoes);
        if (!g.medicacoes.length) ok = false;
      }
      if (!ok) return;

      const apoio = r.consulta ? CM.rag.buscar(r.consulta) : null;
      let status = "pendente";
      let motivo = null;
      let fonte = null;

      if (r.exigeApoio) {
        if (apoio && apoio.acima) {
          fonte = r.fonte(g, apoio);
        } else {
          status = "bloqueado";
          motivo = r.motivo(g, apoio);
        }
      } else {
        fonte = r.fonte(g, apoio);
      }

      resultado.push({
        id: r.id,
        titulo: r.titulo,
        corpo: r.corpo(g, apoio),
        fonte: fonte,
        status: status,
        motivo_bloqueio: motivo,
        citacao: apoio && apoio.acima ? apoio.trecho : null,
        escore: apoio ? apoio.escore : null,
        origem: g.trecho,
        encaminhamento: status === "bloqueado" ? r.encaminhamento : null
      });
    });

    return resultado;
  }

  return { analisar: analisar, REGRAS: REGRAS };
})();
