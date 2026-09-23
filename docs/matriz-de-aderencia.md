# Matriz de aderência — Desafio 4: Copiloto Médico de Insights

Cada critério da especificação aponta para onde está implementado e para a
evidência verificável (nome exato de uma das 100 verificações do
`testes/smoke.html` — app do médico — ou das 11 do `testes/smoke-gestao.html` —
aplicação de gestão —, arquivo de código ou captura em `docs/`).

## A. Limites não negociáveis

| Critério | Como o produto responde | Onde está | Evidência |
|---|---|---|---|
| Nada de diagnóstico, prescrição ou orientação automática | Nenhuma regra do motor emite conduta; o validador de resumo recusa dose, prescrição, forma farmacêutica, instrução de uso e orientação de conduta (lista `PROIBIDOS`) | `scripts/engine/insights.js`, `scripts/ui/retorno.js` | testes `validação bloqueada para texto com dose` e `status continua não enviado após bloqueio` |
| Dados sempre sintéticos e declarados | Casos `PAC-SINT-0042/0043/0044`, laudos `LAB-SINT-*`, UBS Modelo, profissionais fictícios; aviso "Registro sintético, dado de demonstração" fixo na barra lateral | `scripts/data/*`, `index.html` (`.contexto__aviso`) | teste `sidebar mostra paciente ativo`; rodapé da barra lateral visível nas 8 capturas |
| Validação humana explícita antes de qualquer ação externa | Aceitar, ignorar, encaminhar e reescrever só mudam com clique do profissional; validar exige caixa de revisão marcada + clique; o envio abre o WhatsApp **só depois** da validação, com registro no histórico | `scripts/ui/analise.js`, `scripts/ui/retorno.js` | testes `validar e aceitar muda o status`, `bloqueado oferece registro manual de encaminhamento`, `encaminhamento registrado só após clique, com aviso de não-envio`, `validação exige revisão marcada pelo profissional`, `envio abre o WhatsApp só depois da validação`, `log deixa claro que nada foi enviado de verdade` |
| Caso de bloqueio obrigatório (evidência insuficiente) | `PT-07` não tem documento na base: escore 0,00 contra limiar 0,28 → cartão vermelho com motivo, lacunas do prontuário e encaminhamento humano; sem botão de aceitar | `scripts/engine/insights.js`, `scripts/engine/rag.js` (`LIMIAR`), `scripts/data/base-controlada.js` (6 documentos, nenhum sobre dormir) | testes `existe pelo menos 1 caso bloqueado`, `bloqueado explica o motivo`, `bloqueado mostra encaminhamento humano`, `bloqueado não pode ser aceito`; captura `docs/tela-analise-bloqueio-claro.png` |

## B. Telas funcionais (produto real, não mockup)

| Critério | Como o produto responde | Onde está | Evidência |
|---|---|---|---|
| Tela de análise da consulta | Prontuário + transcrição cruzados pelo motor ao clicar "Analisar consulta": cartões com filtros e ações por cartão (7 para Helena,1 para bloqueado) | `#analise`, `scripts/ui/analise.js`, `scripts/engine/insights.js` | teste `todas as regras do motor dispararam`; capturas `tela-analise-claro/escuro.png` |
| Fila de triagem de3 pacientes | Helena → Giovani → Tereza, cada um com regras, transcrição, marcações e retorno próprios; finalizar só libera após o envio; concluídos viram "atendido" | `scripts/app.js` (`dadosFila`, `finalizarAtual`, `renderFila`), `scripts/data/prontuario.js` | testes `fila de triagem lista todos os pacientes`, `paciente atual destacado na fila`, `motor do paciente da fila dispara só as regras dele`, `marcações da análise não vazam para o paciente seguinte`, `terceiro paciente entra ao concluir o segundo`, `dois pacientes concluídos aparecem como atendidos` |
| Transcrição: ditado ao vivo + organizador | O painel abre no "Ditado da consulta": **Falar agora** ou atalho **Ctrl+Shift+Espaço** (com a aba em foco) dispara a Web Speech API em pt-BR, o texto entra ao vivo e o encerrar marca a etapa **"Transcrição concluída às HH:MM"**; **Organizar em partes** (`scripts/engine/organizar.js`) remove mudaças e repetições e separa a fala em partes rotuladas e editáveis (Motivo da queixa, Sintomas, Medicamentos, Exames, Observações) — só **Usar esta transcrição** torna o ditado a transcrição em uso. O alternador mantém o **Exemplo da consulta** (padrão de demonstração, sem microfone) e o fallback discreto **Sem microfone? Cole o texto** | `scripts/ui/analise.js` (`ditado`, `iniciarDitado`, `estadoTranscricao`), `scripts/engine/organizar.js` | testes `visão de ditado abre com o botão Falar agora`, `Ctrl+Shift+Espaço inicia o ditado`, `a fala entra na transcrição ao vivo`, `encerrar marca a transcrição como concluída com horário`, `organizar separa a fala em partes rotuladas`, `cada parte organizada fica editável`, `usar esta transcrição torna o ditado a transcrição em uso`, `motor roda sobre o ditado organizado`, `suíte volta ao exemplo pronto para seguir o fluxo`, `transcrição oferece exemplo pronto e campo para colar` |
| Retorno ao paciente | Resumo gerado do caso, validação em três passos (texto → revisão → clique), **Enviar ao cliente** abrindo o WhatsApp com o texto pronto e gravando a hora, histórico, reabertura do rascunho | `#retorno`, `scripts/ui/retorno.js` | testes `resumo gerado a partir da consulta`, `validação registrada após clique explícito`, `enviar ao cliente abre o WhatsApp com texto pronto (wa.me)`, `link do WhatsApp carrega o texto do resumo`, `status do retorno vira enviado com horário`, `validação pode ser desfeita pelo profissional` |
| Redação editável em cada cartão | Todo cartão (pendente, aceito, ignorado, bloqueado) oferece **Editar**; o campo abre com a redação atual, salvo aplicada; aceitos editados alimentam o resumo | `scripts/ui/analise.js` (`editando`, `aceitos`) | testes `cartão pendente oferece editar a redação`, `editar abre o campo já com a redação atual`, `salvar aplica a redação corrigida no cartão`, `resumo regenerado usa a redação corrigida do ponto aceito` |
| Dashboard como terceira tela do app, com o app de gestão próprio preservado | O app do médico ganhou a tela **Dashboard da rede** (marca e perfil de acesso da coordenação no topo, sem fila nem paciente); `/gestao/` continua como página independente, inalterada, para o público de gestão | `index.html` (`#tela-dashboard`, item `data-tela="dashboard"`), `scripts/app.js` (`TELAS`), `scripts/ui/dashboard.js`, `gestao/index.html` (inalterado) | testes `dashboard é a terceira tela do app do médico`, `navegar para Dashboard da rede abre a tela de gestão`, `dashboard renderiza kpis, gráfico e tabela no app unificado` (médico) e `gestão não exibe dado de paciente` (gestão) |
| Navegação e estado da sessão | Navegação por hash com item ativo; marcações, transcrição, resumo, histórico, fila e tema sobrevivem a F5, paciente por paciente; reinício em um clique com confirmação | `scripts/app.js`, `scripts/ui/util.js` (`store`) | testes `navegação troca de tela`, fase de persistência (`sobrevive ao recarregamento`, `restaurado`, `preservado`), `existe botão de reiniciar demonstração`, `reinício limpa o resultado da análise` |

## C. Insight com fonte rastreável

| Critério | Como o produto responde | Onde está | Evidência |
|---|---|---|---|
| Toda sugestão relevante mostra de onde veio | Cada pendente exibe o gatilho (trecho da transcrição com horário e falante, ou evento do prontuário) **e** o documento da base com versão, data e citação recuperada pelo RAG | `scripts/ui/analise.js` (render da fonte), `scripts/engine/rag.js` (TF-IDF em memória) | testes `pontos pendentes exibem fonte rastreável` e `pontos da base controlada citam a evidência recuperada`; capturas `tela-analise-claro/escuro.png` |

## D. Dashboard honesto (aplicação de gestão)

| Critério | Como o produto responde | Onde está | Evidência |
|---|---|---|---|
| Todo número com selo visível de simulado | Selo "Simulado" ao lado de cada KPI e em cada linha da tabela | `scripts/ui/dashboard.js` | teste `todo número de KPI tem selo visível de simulado` |
| Amostra declarada | Cada KPI traz "Base: N registros sintéticos de …, jan a ago de 2026"; aviso proeminente no topo | `scripts/ui/dashboard.js`, `gestao/index.html` (`.aviso-simulado`) | testes `todo KPI mostra a amostra sintética que o sustenta` e `tela tem aviso proeminente de número simulado` |
| Gráfico com eixos rotulados | SVG com "Exames recebidos" (Y), "Mês de 2026" (X), ticks, rótulos de ponto e legenda abaixo | `scripts/ui/dashboard.js` | teste `gráfico tem eixos rotulados` |
| Tabela com coluna de leitura interpretativa | Coluna "Leitura interpretativa para gestão" traduz o número em frase de ação humana | `scripts/ui/dashboard.js` | teste `tabela de gestão tem coluna de leitura interpretativa` |
| Nenhuma ação automática | A tela não tem um único `<button>` — só informa | `gestao/index.html` (`#tela-dashboard`) | teste `nenhuma ação automática no dashboard` |
| Público separado: gestão não vê paciente | Sem contexto de paciente, sem fila, sem Helena/Giovani/Tereza nos dados carregados | `gestao/index.html` (carrega só `dashboard.js`, `util.js` e dados do dashboard) | teste `gestão não exibe dado de paciente` |

## E. Design system

| Critério | Como o produto responde | Onde está | Evidência |
|---|---|---|---|
| Tokens exatos (`#E9ECE9`, `#16211C`, `#5C655F`, `#1B4B66`, `#D7DDD8`, `#FFFFFF`) | Declarados como tokens e usados por todo o produto | `styles/tokens.css` | leitura direta dos tokens |
| Cores de sinalização com significado fixo | Âmbar `#A9721F/#FBF1E0` atenção, vermelho `#9C3E37/#F7E9E7` bloqueado, verde `#2F6B4F/#E7F0EA` confirmado | `styles/tokens.css` | selos por status nos cartões (capturas); cartão bloqueado vermelho na captura `tela-analise-bloqueio-claro.png` |
| Modo escuro invertendo luminância, mantendo semântica — e como padrão | Escopo `[data-tema="escuro"]` redefine os tokens; as duas aplicações nascem em `data-tema="escuro"` | `styles/tokens.css`; `scripts/app.js` (tema) | teste `alternador de tema funciona`; capturas `*-escuro.png` (padrão das telas) |
| Source Serif 4 em títulos + Inter na interface | Tokens `--fonte-titulo` e `--fonte-ui`; fontes auto-hospedadas (woff2 latin), zero rede | `styles/fontes.css`, `styles/fontes/*.woff2` | capturas (renderização serifada nos títulos) |
| No máximo 5–6 tamanhos de tipo | Escala fechada `--t-1`…`--t-6`, "sem intermediários" | `styles/tokens.css` | leitura direta |
| Dados em `tabular-nums` | `font-variant-numeric: tabular-nums` em fichas, KPIs, tabela e log | `styles/app.css` | grep: ocorrências em8 regras |
| Linhas de leitura abaixo de 80 caracteres | `--largura-leitura:68ch` aplicado aos blocos de texto | `styles/tokens.css` | leitura direta + capturas |
| Sidebar240–260px e área principal ~980px | `--sidebar-largura:252px`, `--area-largura:980px` | `styles/tokens.css` | capturas desktop |
| Raio4–6px | `--raio-painel:6px`, `--raio-controle:4px` | `styles/tokens.css` | capturas |
| Sem rótulos em caixa-alta, sem "→" em botões, sem " · " decorativo | Nenhum `text-transform` ou `letter-spacing` em todo o CSS; testes varrem botões e texto | `styles/*.css` | testes `nenhum botão com seta decorativa` e `nenhum separador decorativo no texto`; grep `text-transform` =0 |

## F. Entrega e verificação

| Critério | Como o produto responde | Onde está | Evidência |
|---|---|---|---|
| App real, testável, sem build | HTML/CSS/JS puros; roda com `python -m http.server8017` ou direto pelo `file://` | `README.md` (Como rodar) | carga via `file://` validada sem erros de console |
| Suíte de aceitação automatizada (médico) | Fluxo de ponta a ponta: limpo → suíte principal (fonte rastreável, bloqueio, ditado ao vivo com organizador, transcrição exemplo↔colado, dashboard como terceira tela, validação, envio `wa.me`) → persistência → **paciente2 completo** → **terceiro paciente** → volta ao anterior → reinício | `testes/smoke.html` | título `ALL PASS 100 testes` |
| Suíte da aplicação de gestão | Separação de públicos, KPIs, gráfico, tabela, botões=0, tema | `testes/smoke-gestao.html` | título `ALL PASS11 testes` |
| Verificação em390px reais | Medidor e captura por iframe (o `--window-size` do headless não desce de500 no layout) | `testes/mobile.html` | título `OK scrollW=…` (até390); captura `docs/tela-analise-mobile.png` |
| Material para apresentação |8 capturas (análise claro/escuro, bloqueio, retorno claro/escuro, dashboard claro/escuro, mobile) e roteiro de3 minutos amarrado aos critérios | `docs/` | `docs/roteiro-do-pitch.md` |
| Estado à prova de demo | Persistência por paciente em `localStorage` (`copiloto.v1.*`), modo `?sem-estado=1` e botão de reinício com confirmação | `scripts/ui/util.js`, `scripts/app.js` | fases de persistência, de troca de paciente e de reinício do smoke |

## G. Fora do escopo — declarado como pendência (nunca prometido)

| Critério | Posição do produto | Onde está |
|---|---|---|
| Envio e confirmação programáticos por WhatsApp | O app **abre o WhatsApp com o texto pronto** (`wa.me`, sem número embutido) só depois da validação; disparo, escolha de contato e leitura da entrega são manuais do profissional | `README.md` Pendências; testes `envio abre o WhatsApp só depois da validação` e `enviar ao cliente abre o WhatsApp com texto pronto (wa.me)` |
| LGPD completa | Documentada como pendência, sem conformidade inventada | `README.md` Pendências |
| Autenticação/produção | Documentada como pendência | `README.md` Pendências |
| Prontuário eletrônico real e base controlada curada | Dados sintéticos + base de6 documentos demonstram o formato de integração | `scripts/data/base-controlada.js`; `README.md` Pendências |
| Modelos treinados | Motor de regras explícitas + RAG TF-IDF em memória, declarados e auditáveis | `scripts/engine/*`; `README.md` (Como o motor funciona) |
