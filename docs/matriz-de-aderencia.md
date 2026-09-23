# Matriz de aderência — Desafio 4: Copiloto Médico de Insights

Cada critério da especificação aponta para onde está implementado e para a
evidência verificável (nome exato de uma das 49 verificações do
`testes/smoke.html`, arquivo de código ou captura em `docs/`).

## A. Limites não negociáveis

| Critério | Como o produto responde | Onde está | Evidência |
|---|---|---|---|
| Nada de diagnóstico, prescrição ou orientação automática | Nenhuma regra do motor emite conduta; o validador de resumo recusa dose, prescrição, forma farmacêutica, instrução de uso e orientação de conduta (lista `PROIBIDOS`) | `scripts/engine/insights.js`, `scripts/ui/retorno.js` | teste `validação bloqueada para texto com dose` + teste `status continua não enviado após bloqueio` |
| Dados sempre sintéticos e declarados | Caso `PAC-SINT-0042`, laudos `LAB-SINT-*`, UBS Modelo, profissional fictício; aviso "Registro sintético, dado de demonstração" fixo na barra lateral | `scripts/data/*`, `index.html` (`.contexto__aviso`) | teste `sidebar mostra paciente ativo`; rodapé da barra lateral visível nas 8 capturas |
| Validação humana explícita antes de qualquer ação externa | Aceitar, ignorar e encaminhar só mudam com clique do profissional; validar resumo exige caixa de revisão marcada + clique; o produto cria apenas um **registro** de envio assistido — nada é enviado | `scripts/ui/analise.js`, `scripts/ui/retorno.js` | testes `validar e aceitar muda o status`, `bloqueado oferece registro manual de encaminhamento`, `encaminhamento registrado só após clique, com aviso de não-envio`, `validação exige revisão marcada pelo profissional`, `log deixa claro que nada foi enviado de verdade` |
| Caso de bloqueio obrigatório (evidência insuficiente) | `PT-07` não tem documento na base: escore 0,00 contra limiar 0,28 → cartão vermelho com motivo, lacunas do prontuário e encaminhamento humano; sem botão de aceitar | `scripts/engine/insights.js`, `scripts/engine/rag.js` (`LIMIAR`), `scripts/data/base-controlada.js` (6 documentos, nenhum sobre dormir) | testes `existe pelo menos 1 caso bloqueado`, `bloqueado explica o motivo`, `bloqueado mostra encaminhamento humano`, `bloqueado não pode ser aceito`; captura `docs/tela-analise-bloqueio-claro.png` |

## B. Três telas funcionais (produto real, não mockup)

| Critério | Como o produto responde | Onde está | Evidência |
|---|---|---|---|
| Tela de análise da consulta | Prontuário + transcrição cruzados pelo motor ao clicar "Analisar consulta":7 cartões (6 pendentes +1 bloqueado), filtros, ações por cartão | `#analise`, `scripts/ui/analise.js`, `scripts/engine/insights.js` | teste `todas as regras do motor dispararam (gerados=7 de 7)`; capturas `tela-analise-claro/escuro.png` |
| Dashboard populacional |4 KPIs com selo e base, série SVG mensal, tabela de gestão com leitura interpretativa | `#dashboard`, `scripts/ui/dashboard.js` | testes `4 cartões de KPI`, `gráfico de série temporal renderizado`, `tabela tem linhas para gestão`; capturas `tela-dashboard-claro/escuro.png` |
| Retorno ao paciente | Resumo editável gerado do caso, validação em três passos (texto → revisão → clique), histórico com horário, reabertura do rascunho | `#retorno`, `scripts/ui/retorno.js` | testes `resumo gerado a partir da consulta`, `resumo tem corpo completo`, `validação registrada após clique explícito`, `validação pode ser desfeita pelo profissional`; capturas `tela-retorno-claro/escuro.png` |
| Navegação e estado da sessão | Navegação por hash com item ativo; marcações, filtro, resumo, histórico e tema sobrevivem a F5; reinício em um clique com confirmação | `scripts/app.js`, `scripts/ui/util.js` (`store`) | testes `navegação troca de tela`; fase 3 (6 testes `sobrevive ao recarregamento`/`restaurado`/`preservado`); fase 4 (7 testes `existe botão de reiniciar demonstração` e `reinício ...`) |

## C. Insight com fonte rastreável

| Critério | Como o produto responde | Onde está | Evidência |
|---|---|---|---|
| Toda sugestão relevante mostra de onde veio | Cada pendente exibe o gatilho (trecho da transcrição com horário e falante, ou evento do prontuário) **e** o documento da base com versão, data e citação recuperada pelo RAG | `scripts/ui/analise.js` (render da fonte), `scripts/engine/rag.js` (TF-IDF em memória) | testes `pontos pendentes exibem fonte rastreável (6 de 6 com fonte)` e `pontos da base controlada citam a evidência recuperada (5 com citação)`; capturas `tela-analise-claro/escuro.png` |

## D. Dashboard honesto

| Critério | Como o produto responde | Onde está | Evidência |
|---|---|---|---|
| Todo número com selo visível de simulado | Selo "Simulado" ao lado de cada KPI e em cada linha da tabela | `scripts/ui/dashboard.js` | teste `todo número de KPI tem selo visível de simulado` |
| Amostra declarada | Cada KPI traz "Base: N registros sintéticos de …, jan a ago de 2026"; aviso proeminente no topo da tela | `scripts/ui/dashboard.js`, `index.html` (`.aviso-simulado`) | testes `todo KPI mostra a amostra sintética que o sustenta` e `tela tem aviso proeminente de número simulado` |
| Gráfico com eixos rotulados | SVG com "Exames recebidos" (Y), "Mês de 2026" (X), ticks, rótulos de ponto e legenda abaixo | `scripts/ui/dashboard.js` | teste `gráfico tem eixos rotulados` |
| Tabela com coluna de leitura interpretativa | Coluna "Leitura interpretativa para gestão" traduz o número em frase de ação humana | `scripts/ui/dashboard.js` | teste `tabela de gestão tem coluna de leitura interpretativa` |
| Nenhuma ação automática | A tela não tem um único `<button>` — só informa | `index.html` (`#tela-dashboard`) | teste `nenhuma ação automática no dashboard (botões=0)` |

## E. Design system

| Critério | Como o produto responde | Onde está | Evidência |
|---|---|---|---|
| Tokens exatos (`#E9ECE9`, `#16211C`, `#5C655F`, `#1B4B66`, `#D7DDD8`, `#FFFFFF`) | Declarados como tokens e usados por todo o produto | `styles/tokens.css` linhas 9–15 | leitura direta dos tokens |
| Cores de sinalização com significado fixo | Âmbar `#A9721F/#FBF1E0` atenção, vermelho `#9C3E37/#F7E9E7` bloqueado, verde `#2F6B4F/#E7F0EA` confirmado | `styles/tokens.css` linhas 18–23 | selos por status nos cartões (capturas); cartão bloqueado vermelho na captura `tela-analise-bloqueio-claro.png` |
| Modo escuro invertendo luminância, mantendo semântica | Escopo `[data-tema="escuro"]` redefine os 6 tokens base + 6 de sinal com a mesma função | `styles/tokens.css` linhas 50–65; alternador em `scripts/app.js` | teste `alternador de tema funciona`; capturas `*-escuro.png` |
| Source Serif 4 em títulos + Inter na interface | Tokens `--fonte-titulo` e `--fonte-ui`; fontes auto-hospedadas (woff2 latin), zero rede | `styles/fontes.css`, `styles/fontes/*.woff2` | capturas (renderização serifada nos títulos); checagem `fontes-remotas=0` durante os testes |
| No máximo 5–6 tamanhos de tipo | Escala fechada `--t-1`…`--t-6`, "sem intermediários" | `styles/tokens.css` linhas 30–35 | leitura direta |
| Dados em `tabular-nums` | `font-variant-numeric: tabular-nums` em 8 regras (fichas, KPIs, tabela, log) | `styles/app.css` | grep:8 ocorrências |
| Linhas de leitura abaixo de 80 caracteres | `--largura-leitura:68ch` aplicado aos blocos de texto | `styles/tokens.css` linha 41 | leitura direta + capturas |
| Sidebar 240–260px e área principal ~980px | `--sidebar-largura:252px`, `--area-largura:980px` | `styles/tokens.css` linhas 43–44 | capturas desktop |
| Raio 4–6px | `--raio-painel:6px`, `--raio-controle:4px` | `styles/tokens.css` linhas 26–27 | capturas |
| Sem rótulos em caixa-alta, sem "→" em botões, sem " · " decorativo | Nenhum `text-transform` ou `letter-spacing` em todo o CSS; testes varrem botões e texto | `styles/*.css` | testes `nenhum botão com seta decorativa` e `nenhum separador decorativo no texto`; grep `text-transform` =0 |

## F. Entrega e verificação

| Critério | Como o produto responde | Onde está | Evidência |
|---|---|---|---|
| App real, testável, sem build | HTML/CSS/JS puros; roda com `python -m http.server 8017` ou direto pelo `file://` | `README.md` (Como rodar) | carga via `file://` validada sem erros de console |
| Suíte de aceitação automatizada |4 fases: estado limpo →42 verificações da suíte → persistência pós-recarregamento → fluxo de reinício | `testes/smoke.html` | título `ALL PASS49 testes`,0 erros de console |
| Verificação em 390px reais | Medidor e captura por iframe (o `--window-size` do headless não desce de 500 no layout) | `testes/mobile.html` | título `OK scrollW=375` nas 3 rotas; captura `docs/tela-analise-mobile.png` |
| Material para apresentação |8 capturas (claro/escuro/mobile) e roteiro de 3 minutos amarrado aos critérios | `docs/` | `docs/roteiro-do-pitch.md` |
| Estado à prova de demo | Persistência em `localStorage` (`copiloto.v1.*`), modo `?sem-estado=1` e botão de reinício com confirmação | `scripts/ui/util.js`, `scripts/app.js` |6 testes de persistência +7 do reinício |

## G. Fora do escopo — declarado como pendência (nunca prometido)

| Critério | Posição do produto | Onde está |
|---|---|---|
| Envio real (WhatsApp ou canal) | Não implementado; a validação cria só um registro de envio assistido e a interface diz "nenhuma mensagem foi enviada nesta demonstração" | `README.md` Pendências; teste `log deixa claro que nada foi enviado de verdade` |
| LGPD completa | Documentada como pendência, sem conformidade inventada | `README.md` Pendências |
| Autenticação/produção | Documentada como pendência | `README.md` Pendências |
| Prontuário eletrônico real e base controlada curada | Dados sintéticos + base de 6 documentos demonstram o formato de integração | `scripts/data/base-controlada.js`; `README.md` Pendências |
| Modelos treinados | Motor de 7 regras explícitas + RAG TF-IDF em memória, declarados e auditáveis | `scripts/engine/*`; `README.md` (Como o motor funciona) |
