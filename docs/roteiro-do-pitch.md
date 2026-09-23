# Roteiro de pitch — Copiloto Médico de Insights

Duração alvo: 3 minutos. Três blocos de 30 segundos + abertura e fechamento.
Cada bloco amarra um critério do desafio à tela que o prova.

## Antes de subir no palco (checklist de 1 minuto)

1. Servidor de pé (`python -m http.server 8017`) **ou** `index.html` aberto
   direto pelo `file://` — os dois funcionam para o app.
2. Estado zerado: rode `http://127.0.0.1:8017/testes/smoke.html` uma vez
   (ele limpa o `localStorage` ao terminar) ou execute `localStorage.clear()`
   no console. Assim a fila começa em Helena, do zero, e qualquer marcação
   feita no palco é visível e sobrevive a um F5.
3. Tema escuro é o padrão (boa projeção); o claro está a um clique no rodapé
   da barra lateral.
4. Conferir as capturas em `docs/` caso o projetor falhe — os 8 PNGs cobrem
   análise (painel de ditado) e retorno nos dois temas, o caso de bloqueio, o
   dashboard nos dois temas e a versão de celular; a barra lateral (ou o topo,
   no celular) já mostra
   as três telas.

## Abertura (20 segundos)

> "Este é o Copiloto de Insights: um produto que cruza transcrição de
> consulta, prontuário e uma base controlada para apontar pontos de atenção.
> Ele não diagnostica, não receita e não fala com a paciente. Tudo que ele
> sugere depende de fonte rastreável e de validação humana antes de virar
> qualquer ação. A fila ao lado mostra três pacientes — a demonstração
> percorre dois ao vivo."

Tela: `#analise`, estado inicial (fila, prontuário + transcrição visíveis).

## Bloco 1 — Fonte rastreável (30 segundos)

Critério: *todo insight relevante precisa de origem verificável.*

Ação: clicar em **Analisar consulta**. O motor dispara os pontos de atenção da
paciente atual (sete para Helena).

> "Cada cartão mostra de onde veio a sugestão: o trecho exato da transcrição
> com horário e falante, e o documento da base controlada com versão e data,
> incluindo a citação recuperada. Nada aqui é opaco — dá para conferir na
> fonte. E a redação de qualquer cartão pode ser corrigida na hora, com
> **Editar**."

Destaque na tela: cartão pendente com "Fonte rastreável" e citação; citar o
painel **Ditado da consulta** — **Falar agora** ou **Ctrl+Shift+Espaço**, a
etapa "Transcrição concluída" e o organizador em partes — e o **Exemplo da
consulta** ao lado, que garante a demonstração sem microfone (captura:
`docs/tela-analise-claro.png`).

Demo opcional ao vivo (só com microfone e HTTPS, ex.: GitHub Pages): pressione
Ctrl+Shift+Espaço, fale uma frase, **Encerrar ditado** → "Transcrição
concluída" → **Organizar em partes** → **Usar esta transcrição**.

## Bloco 2 — Caso de bloqueio (30 segundos)

Critério: *sem evidência suficiente, o sistema não sugere — ele escala para
humano.*

Ação: rolar até o cartão vermelho "Uso interrompido de medicamento para dormir".

> "Este caso o copiloto **se recusou** a sugerir qualquer coisa: nenhum dos
> seis documentos da base casou com o relato, escore 0,00 contra o limiar de
> 0,28, e o prontuário não registra qual medicamento a paciente usa. O cartão
> mostra o motivo, aponta as lacunas e não oferece aceitar nem ignorar: só
> registrar encaminhamento para revisão humana — com clique, nunca automático.
> (Há também **Editar**, que só corrige a redação, como em todo cartão)."

Destaque na tela: "Motivo do bloqueio" + "Encaminhamento humano" +
botão "Registrar encaminhamento para revisão"
(captura: `docs/tela-analise-bloqueio-claro.png`).

## Bloco 3 — Validação e envio com trava (30 segundos)

Critério: *nenhuma ação externa sem validação explícita do profissional;
o sistema nunca orienta conduta.*

Ação: tela `#retorno`.

1. Digitar no fim do resumo: "A senhora deve tomar 500 mg pela manhã." e clicar
   em **Validar registro** → o produto **bloqueia** e explica: contém dose.
2. Apagar a frase, marcar a caixa de revisão, clicar de novo → vira
   **Validado**, com registro no histórico: "nenhuma mensagem foi enviada
   nesta demonstração".
3. Clicar em **Enviar ao cliente** → o **WhatsApp abre com o texto pronto** na
   conversa, o status vira "Validado e enviado…", a fila ganha o selo de
   retorno enviado e **Finalizar e chamar próximo** libera. (Com o envio
   registrado, finalizar traz Giovani — a fila avança ao vivo.)

> "O validador impede dose, prescrição e conduta. A validação exige revisão
> marcada e clique explícito — e só então o WhatsApp abre com o texto pronto.
> Quem escolhe o contato e quem envia é o profissional; o sistema apenas
> monta, valida e registra."

Captura: `docs/tela-retorno-claro.png`.

## Bloco opcional — Dashboard de gestão (30 segundos)

Critério: *número sem amostra e sem leitura é armadilha.*

Clique em **Dashboard da rede** na barra lateral — mesma aplicação, terceira
tela. O conteúdo da tela é de coordenação e não tem dado de paciente — a
barra lateral, como em toda a aplicação, segue com a fila e o paciente em
atendimento. (`https://ruanalmeida.github.io/RRB-AMO/gestao/` segue no ar como
página própria para o público de coordenação, sem fila nem paciente.)

> "Todo número traz selo visível de 'Simulado' e a base que o sustenta. O
> gráfico tem eixos rotulados, a tabela tem coluna de leitura interpretativa,
> e esta tela não tem um único botão de ação — ela informa, a gestão decide."

Capturas: `docs/tela-dashboard-claro.png` e `docs/tela-dashboard-escuro.png`.

## Fechamento (20 segundos)

> "Três limites provados ao vivo: fonte rastreável em cada sugestão, bloqueio
> quando a evidência falta e validação obrigatória — o WhatsApp só abre
> depois dela. Fila de três pacientes, estado por paciente, dados 100%
> sintéticos. As pendências — envio programático, LGPD, integração com
> prontuário — estão no README, declaradas, sem promessa fantasma."

## Frases de segurança (nunca diga)

- Nunca: "o sistema diagnosticou", "receitou", "orientou a paciente".
  Diga sempre: "sugeriu ponto de atenção para revisão humana".
- Nunca: "o sistema enviou a mensagem". Diga: "abriu o WhatsApp com o texto
  pronto; quem envia e confirma é o profissional".
- Nunca: trate os números do dashboard como reais — são simulados, com amostra
  sintética declarada na própria tela, e a tela é da gestão, não do médico.
- Se perguntarem de LGPD/auth: "fora do escopo do hackathon, documentado como
  pendência no README" — não invente conformidade.
