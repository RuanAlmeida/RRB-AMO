# Copiloto Médico de Insights

Copiloto de apoio à decisão em atenção primária construído para o desafio 4 do
Hack Inova Health AI (Universidade Anhembi Morumbi, 22–23/09/2026).

Cruza **prontuário sintético** e **transcrição simulada** com uma **base controlada**,
mostra pontos de atenção com **fonte rastreável**, permite **aceitar, ignorar ou
reescrever** cada um e **bloqueia sugestões sem evidência suficiente**, encaminhando
para revisão humana. O retorno ao paciente só sai do rascunho com validação
explícita, e o **Enviar ao cliente** abre o WhatsApp com o texto pronto — depois,
e só depois, da validação.

> Produto de apoio, não de diagnóstico: sem prescrição, sem orientação automática ao
> paciente, sem dado real. Toda saída relevante exige validação humana explícita.

São **duas aplicações**:

- **App do médico** (raiz): fila de triagem, análise da consulta e retorno ao paciente.
- **App de gestão** (`/gestao/`): dashboard populacional para coordenação e diretoria,
  sem acesso a dados de paciente.

- **Demonstração (médico):** https://ruanalmeida.github.io/RRB-AMO/
- **Gestão (coordenação):** https://ruanalmeida.github.io/RRB-AMO/gestao/
- **Repositório:** https://github.com/RuanAlmeida/RRB-AMO
- **Versões:** tag `v1.0-hackinova` (apresentação original) e tag `v2.0-pitch`
  (refatoração em 5 etapas: dois apps, fila de pacientes, transcrição colável,
  edição de redação e envio por WhatsApp)

## Como rodar

Não há build nem dependências. É HTML, CSS e JavaScript puros.

```bash
# opção 1 — servidor estático (recomendado)
python -m http.server 8017
# abra http://127.0.0.1:8017/

# opção 2 — abrir o arquivo diretamente
# dê dois cliques em index.html (funciona via file://)
```

O modo escuro é o padrão das duas aplicações e pode ser alternado no rodapé da
barra lateral.

### Estado da demonstração

O estado fica salvo em `localStorage` (chaves `copiloto.v1.*`): fila e
atendimentos por paciente, transcrição em uso (exemplo pronto ou texto colado),
marcações de aceitar/ignorar, redações editadas, filtro, texto do resumo,
histórico de validação e envio, e tema — tudo sobrevive a um F5, paciente por
paciente. Use `?sem-estado=1` na URL para rodar sem persistência (é o que os
harnesses de teste usam). Para zerar: rode o smoke test uma vez (ele limpa ao
terminar), execute `localStorage.clear()` no console ou clique em **Reiniciar
demonstração** no rodapé da barra lateral (com confirmação).

O app abre direto pelo `file://` (dois cliques em `index.html`) — validado sem
erros de console. O smoke test, porém, exige servidor HTTP: o harness dirige a
aplicação por um iframe, que no `file://` é considerado cross-origin.

O visual é 100% offline: as fontes Inter e Source Serif 4 vêm de
`styles/fontes/` (auto-hospedadas, subconjunto latin) — nada é buscado na
internet durante a apresentação. A rede só entra no clique de **Enviar ao
cliente**, quando o WhatsApp é aberto.

## Telas

### App do médico

| Rota | Tela | O que ela prova no pitch |
|---|---|---|
| `#analise` | Análise da consulta | Fila de 3 pacientes; prontuário + transcrição (exemplo pronto ou texto colado) viram pontos de atenção com fonte rastreável (7 para Helena, 3 para Giovani e Tereza); o caso sem evidência fica bloqueado com motivo e vai para revisão humana; todo cartão tem **Editar** |
| `#retorno` | Retorno ao paciente | Resumo editável em três etapas: rascunho, **Validar registro** (revisão marcada + clique, com validador de dose/prescrição/conduta) e **Enviar ao cliente**, que abre o WhatsApp com o texto pronto (`wa.me`) e grava o horário; **Finalizar e chamar próximo** só libera depois do envio |

### App de gestão (`/gestao/`)

| Rota | Tela | O que ela prova no pitch |
|---|---|---|
| dashboard | Dashboard populacional | Todo número com selo visível de "Simulado" e a amostra que o sustenta; gráfico com eixos rotulados; tabela com coluna de leitura interpretativa; zero botões de ação; nenhum dado de paciente |

Layout responsivo: abaixo de 860px a barra lateral vira um topo com navegação
horizontal, as grades viram coluna única e as tabelas do prontuário rolam
horizontalmente dentro do painel (`styles/app.css`, seção Responsivo).

## Fila de triagem

Três pacientes sintéticos em sequência: **Helena Martins** (PAC-SINT-0042),
**Giovani Ribeiro** (PAC-SINT-0043) e **Tereza Campos** (PAC-SINT-0044). Cada um
tem seu próprio conjunto de regras disparadas, transcrição em uso, marcações,
redação corrigida, resumo e histórico — nada vaza de um para o outro.
**Finalizar e chamar próximo** conclui o atendimento atual e traz o seguinte; o
botão fica travado com o aviso "Envie o retorno para liberar a finalização" até
o envio ser registrado, e a fila marca o paciente concluído como atendido.

## Como o motor funciona

```
transcrição + prontuário
        │
        ▼
regras (scripts/engine/insights.js)
  · cada regra exige gatilhos em transcrição, prontuário ou medicamentos
        │
        ▼
recuperação na base controlada (scripts/engine/rag.js)
  · índice de 6 documentos sintéticos, escore de cobertura por IDF
  · limiar 0,28 (CM.rag.LIMIAR)
        │
   ┌────┴─────┐
 acima      abaixo
   │          │
pendente   bloqueado ── motivo com escore + lacunas do prontuário
(fonte =     └── encaminhamento humano, só com clique do profissional
documento
ou evento)
```

A base controlada deliberadamente **não tem** documento sobre medicamento para dormir:
é esse o caso que nasce bloqueado (`PT-07`) e demonstra o critério de "dado ausente".

## Limites implementados no código

- `scripts/engine/insights.js` — nenhuma regra emite conduta; sugestão sem apoio vira `bloqueado`.
- `scripts/ui/retorno.js` — lista `PROIBIDOS` que impede validar resumo com dose,
  prescrição, forma farmacêutica, instrução de uso ou orientação de conduta; o
  envio só abre depois da validação.
- Dashboard (gestão) — nenhum `<button>` na tela; só informa.
- Envio — o produto **abre o WhatsApp com o texto pronto** (`https://wa.me/?text=`,
  sem número embutido: o profissional escolhe o contato); o disparo e a
  confirmação são manuais, e a interface deixa isso explícito.

## Testes

```bash
python -m http.server 8017
# suíte do app do médico — 89 verificações:
#   http://127.0.0.1:8017/testes/smoke.html
# suíte da aplicação de gestão — 11 verificações:
#   http://127.0.0.1:8017/testes/smoke-gestao.html
# capturas de tela para revisão visual:
#   http://127.0.0.1:8017/testes/shots.html?analisar=1&scroll=bloqueado
```

O smoke do médico roda a aplicação real em um iframe e cobre, de ponta a ponta:
estado limpo, suíte principal (fonte rastreável, bloqueio com motivo,
aceitar/ignorar/editar, transcrição exemplo↔colado, validação em três passos,
envio `wa.me`), persistência pós-recarregamento, **paciente 2 completo**
(validação, envio e finalização), **entrada do terceiro paciente** com a fila
atualizada, **volta ao anterior** com estado preservado e reinício em um
clique. Ele limpa o `localStorage` ao iniciar e ao terminar, então rodar o
teste zera o estado da demonstração.

Última execução: **médico `ALL PASS 89 testes`**, **gestão `ALL PASS 11 testes`**.

As 8 capturas finais estão em `docs/`, prontas para os slides: análise
(claro/escuro), análise com o caso bloqueado, retorno (claro/escuro), dashboard
da gestão (claro/escuro) e análise em 390px. O harness `testes/shots.html`
aceita `?tema=claro|escuro`, `?hash=`, `?analisar=1`, `?scroll=` e
`?app=gestao` (padrão claro, porque o Chrome headless nasce no modo escuro).
**Regenere uma captura por vez, em processos separados**: Chromes em paralelo
abrem conexões simultâneas e estouram o backlog do servidor `http.server`,
falhando com ERR_CONNECTION_REFUSED (os harnesses também aguardam o app
inicializar e recarregam o iframe em caso de recusa).

Checagem de celular: `http://127.0.0.1:8017/testes/mobile.html?hash=analise&analisar=1`
deve terminar com título `OK scrollW=…` (até 390) — nada estoura os 390px reais
e as tabelas rolam dentro do painel (`OVERFLOW` lista os culpados). Detalhe
importante: o `--window-size` do Chrome headless não desce de 500px no layout,
então capturas "de celular" feitas direto pela janela cortam conteúdo; por isso
o medidor e a captura móvel usam um iframe de 390px.

O roteiro de 3 minutos, amarrado critério a critério às telas, está em
`docs/roteiro-do-pitch.md`.

A matriz de aderência — cada critério da especificação mapeado para o arquivo,
o teste e a captura que o provam — está em `docs/matriz-de-aderencia.md`.

## Estrutura

```
index.html                    casca do app do médico: sidebar + duas telas + fila
gestao/index.html             aplicação de gestão (dashboard populacional)
styles/tokens.css             tokens base + pares de sinalização + dark mode
styles/app.css                layout, painéis, insights, fila, KPIs, gráfico
styles/fontes.css             @font-face das fontes auto-hospedadas
styles/fontes/                Inter e Source Serif 4 (woff2, subconjunto latin)
scripts/data/                 prontuários (3), transcrições (3), base, dashboard
scripts/engine/rag.js         recuperação TF-IDF em memória
scripts/engine/insights.js    regras de pontos de atenção
scripts/ui/analise.js         tela 1 (transcrição, cartões, editar redação)
scripts/ui/dashboard.js       dashboard da gestão (KPIs, SVG, tabela)
scripts/ui/retorno.js         tela 2 (geração, validação, envio wa.me, histórico)
scripts/ui/util.js            store (localStorage com prefixo copiloto.v1)
scripts/app.js                navegação, tema, fila de triagem, contexto
testes/smoke.html             suíte do médico: 89 verificações
testes/smoke-gestao.html      suíte da gestão: 11 verificações
testes/shots.html             harness de captura (aceita ?app=gestao)
testes/mobile.html            medidor e captura móvel em 390px reais
docs/                         8 capturas + roteiro + matriz de aderência
```

## Pendências (fora do escopo do hackathon)

- Envio e confirmação **programáticos** por WhatsApp (hoje o app abre o WhatsApp
  com o texto pronto; disparo, escolha de número e leitura da entrega são manuais).
- Conformidade LGPD completa (documentada, não implementada).
- Autenticação e ambientes de produção.
- Integração com prontuário eletrônico real.
- Base controlada curada por equipe de saúde, com versionamento.
- Modelos treinados (o motor atual é de regras explícitas + RAG em memória).

## Dados

Todos os dados são sintéticos e identificados como tal na interface:
`PAC-SINT-0042/0043/0044`, laudos `LAB-SINT-*`, UBS Modelo e profissionais
fictícios. Nenhum arquivo contém dado de paciente real. O app de gestão não
carrega os dados de paciente — só os agregados sintéticos do dashboard.
