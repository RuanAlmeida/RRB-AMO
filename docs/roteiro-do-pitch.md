# Roteiro de pitch — Copiloto Médico de Insights

Duração alvo: 3 minutos. Três blocos de 30 segundos + abertura e fechamento.
Cada bloco amarra um critério do desafio à tela que o prova.

## Antes de subir no palco (checklist de 1 minuto)

1. Servidor de pé (`python -m http.server 8017`) **ou** `index.html` aberto
   direto pelo `file://` — os dois funcionam para o app.
2. Estado zerado: rode `http://127.0.0.1:8017/testes/smoke.html` uma vez
   (ele limpa o `localStorage` ao terminar) ou execute `localStorage.clear()`
   no console. Assim a demonstração começa do zero e qualquer marcação feita
   no palco é visível e sobrevive a um F5.
3. Tema escolhido (claro costuma projetar melhor).
4. Conferir as capturas em `docs/` caso o projetor falhe — os 7 PNGs cobrem
   as três telas nos dois temas mais o caso de bloqueio.

## Abertura (20 segundos)

> "Este é o Copiloto de Insights: um produto que cruza transcrição de
> consulta, prontuário e uma base controlada para apontar pontos de atenção.
> Ele não diagnostica, não receita e não fala com a paciente. Tudo que ele
> sugere depende de fonte rastreável e de validação humana antes de virar
> qualquer ação."

Tela: `#analise`, estado inicial (prontuário + transcrição visíveis).

## Bloco 1 — Fonte rastreável (30 segundos)

Critério: *todo insight relevante precisa de origem verificável.*

Ação: clicar em **Analisar a consulta**. O motor dispara 7 pontos de atenção.

> "Cada cartão mostra de onde veio a sugestão: o trecho exato da transcrição
> com horário e falante, e o documento da base controlada com versão e data,
> incluindo a citação recuperada. Nada aqui é opaco — dá para conferir na fonte."

Destaque na tela: cartão pendente com "Fonte rastreável" e citação
(captura: `docs/tela-analise-claro.png`).

## Bloco 2 — Caso de bloqueio (30 segundos)

Critério: *sem evidência suficiente, o sistema não sugere — ele escala para
humano.*

Ação: rolar até o cartão vermelho "Uso interrompido de medicamento para dormir".

> "Este caso o copiloto **se recusou** a sugerir qualquer coisa: nenhum dos
> seis documentos da base casou com o relato, escore 0,00 contra o limiar de
> 0,28, e o prontuário não registra qual medicamento a paciente usa. O cartão
> mostra o motivo, aponta as lacunas e só oferece um botão: registrar
> encaminhamento para revisão humana — com clique, nunca automático."

Destaque na tela: "Motivo do bloqueio" + "Encaminhamento humano" +
botão "Registrar encaminhamento para revisão"
(captura: `docs/tela-analise-bloqueio-claro.png`).

## Bloco 3 — Validação humana obrigatória (30 segundos)

Critério: *nenhuma ação externa sem validação explícita do profissional;
o sistema nunca orienta conduta.*

Ação: tela `#retorno`, editar o resumo e tentar validar.

1. Digitar no fim do resumo: "A senhora deve tomar 500 mg pela manhã." e clicar
   em **Validar e enviar** → o produto **bloqueia** e explica: contém dose.
2. Apagar a frase, marcar a caixa de revisão, clicar de novo → vira
   **Validado**, com registro no histórico: "nenhuma mensagem foi enviada
   nesta demonstração".

> "O validador impede dose, prescrição e conduta no texto. A validação exige
> revisão marcada e clique explícito — e mesmo assim o sistema só cria um
> registro de envio assistido: a mensagem nunca sai daqui sozinha."

Captura: `docs/tela-retorno-claro.png`.

## Bloco opcional — Dashboard (30 segundos)

Critério: *número sem amostra e sem leitura é armadilha.*

> "Todo número traz selo visível de 'Simulado' e a base que o sustenta. O
> gráfico tem eixos rotulados, a tabela tem coluna de leitura interpretativa,
> e esta tela não tem um único botão de ação — ela informa, a gestão decide."

Capturas: `docs/tela-dashboard-claro.png` e `docs/tela-dashboard-escuro.png`.

## Fechamento (20 segundos)

> "Três limites provados ao vivo: fonte rastreável em cada sugestão, bloqueio
> quando a evidência falta e validação humana obrigatória antes de qualquer
> ação. Dados 100% sintéticos. As pendências — envio real, LGPD, integração com
> prontuário — estão no README, declaradas, sem promessa fantasma."

## Frases de segurança (nunca diga)

- Nunca: "o sistema diagnosticou", "receitou", "orientou a paciente".
  Diga sempre: "sugeriu ponto de atenção para revisão humana".
- Nunca: "envia WhatsApp". Diga: "cria registro de envio assistido".
- Nunca: trate os números do dashboard como reais — são simulados, com amostra
  sintética declarada na própria tela.
- Se perguntarem de LGPD/auth: "fora do escopo do hackathon, documentado como
  pendência no README" — não invente conformidade.
