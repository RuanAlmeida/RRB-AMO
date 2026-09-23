# Copiloto Médico de Insights

Copiloto de apoio à decisão em atenção primária construído para o desafio 4 do
Hack Inova Health AI (Universidade Anhembi Morumbi, 22–23/09/2026).

Cruza **prontuário sintético** e **transcrição simulada** com uma **base controlada**,
mostra pontos de atenção com **fonte rastreável**, permite **aceitar ou ignorar** cada
um e **bloqueia sugestões sem evidência suficiente**, encaminhando para revisão humana.

> Produto de apoio, não de diagnóstico: sem prescrição, sem orientação automática ao
> paciente, sem dado real. Toda saída relevante exige validação humana explícita.

## Como rodar

Não há build nem dependências. É HTML, CSS e JavaScript puros.

```bash
# opção 1 — servidor estático (recomendado)
python -m http.server 8017
# abra http://127.0.0.1:8017/

# opção 2 — abrir o arquivo diretamente
# dê dois cliques em index.html (funciona via file://)
```

O modo escuro acompanha a preferência do sistema e pode ser alternado no rodapé da
barra lateral.

O estado da demonstração fica salvo em `localStorage` (chaves `copiloto.v1.*`):
marcações de aceitar/ignorar, filtro, texto do resumo, histórico de validação e
tema sobrevivem a um refresh. Use `?sem-estado=1` na URL para rodar sem
persistência (é o que os harnesses de teste usam). Para zerar o estado, rode o
smoke test uma vez (ele limpa ao terminar) ou execute `localStorage.clear()` no
console. O botão **Reiniciar demonstração** no rodapé da barra lateral zera
marcações, resumo e histórico com uma confirmação — um clique antes de subir no
palco deixa a demonstração no estado inicial.

O app abre direto pelo `file://` (dois cliques em `index.html`) — validado sem
erros de console. O smoke test, porém, exige servidor HTTP: o harness dirige a
aplicação por um iframe, que no `file://` é considerado cross-origin.

O visual é 100% offline: as fontes Inter e Source Serif 4 vêm de
`styles/fontes/` (auto-hospedadas, subconjunto latin) — nada é buscado na
internet durante a apresentação.

## Telas

| Rota | Tela | O que ela prova no pitch |
|---|---|---|
| `#analise` | Análise da consulta | Prontuário + transcrição viram 7 pontos de atenção com fonte rastreável; 1 fica bloqueado por evidência insuficiente e vai para revisão humana |
| `#dashboard` | Dashboard populacional | Todo número com selo visível de "Simulado" e a amostra que o sustenta; gráfico com eixos rotulados; tabela com coluna de leitura interpretativa; zero botões de ação |
| `#retorno` | Retorno ao paciente | Resumo editável que só sai do estado "não enviado" com revisão marcada + clique em "Validar e enviar"; o validador bloqueia dose, prescrição e conduta |

Layout responsivo: abaixo de 860px a barra lateral vira um topo com navegação
horizontal, as grades viram coluna única e as tabelas do prontuário rolam
horizontalmente dentro do painel (`styles/app.css`, seção Responsivo).

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
  prescrição, forma farmacêutica, instrução de uso ou orientação de conduta.
- Dashboard — nenhum `<button>` na tela; só informa.
- Envio — após validação, o produto cria um **registro** de envio assistido; mensagem
  nenhuma é enviada (fora do escopo, documentado como pendência).

## Testes

```bash
python -m http.server 8017
# 49 verificações cobrindo os critérios de pronto:
#   http://127.0.0.1:8017/testes/smoke.html
# capturas de tela para revisão visual:
#   http://127.0.0.1:8017/testes/shots.html?analisar=1&scroll=painel-insights
```

O smoke test roda a aplicação real em um iframe e verifica fonte rastreável,
bloqueio com motivo, aceitar/ignorar, selos de simulado no dashboard, coluna de
leitura, validação em três passos, ausência de ação automática e a persistência
do estado (marcações, resumo, histórico e tema) após recarregamento. Ele limpa o
`localStorage` ao iniciar e ao terminar, então rodar o teste zera o estado da
demonstração.

Última execução: **49 verificações, 0 falhas**.

As 7 capturas finais (três telas nos dois temas + caso de bloqueio) estão em
`docs/`, prontas para os slides, junto com `tela-analise-mobile.png`. O harness
aceita `?tema=claro|escuro` (padrão claro) além de `?hash=`, `?analisar=1` e
`?scroll=`.

Checagem de celular: `http://127.0.0.1:8017/testes/mobile.html?hash=analise&analisar=1`
deve terminar com título `OK scrollW=375` — nada estoura os 390px reais e as
tabelas rolam dentro do painel (`OVERFLOW` lista os culpados). Detalhe importante:
o `--window-size` do Chrome headless não desce de 500px no layout, então capturas
"de celular" feitas direto pela janela cortam conteúdo; por isso o medidor e a
captura móvel usam um iframe de 390px.

O roteiro de 3 minutos, amarrado critério a critério às telas, está em
`docs/roteiro-do-pitch.md`.

A matriz de aderência — cada critério da especificação mapeado para o arquivo,
o teste e a captura que o provam — está em `docs/matriz-de-aderencia.md`.

## Estrutura

```
index.html                    casca: sidebar + três telas
styles/tokens.css             6 tokens base + 3 pares de sinalização + dark mode
styles/app.css                layout, painéis, insights, KPIs, gráfico, formulários
styles/fontes.css             @font-face das fontes auto-hospedadas
styles/fontes/                Inter e Source Serif 4 (woff2, subconjunto latin)
scripts/data/                 prontuário, transcrição, base controlada, dashboard
scripts/engine/rag.js         recuperação TF-IDF em memória
scripts/engine/insights.js    7 regras de pontos de atenção
scripts/ui/analise.js         tela 1
scripts/ui/dashboard.js       tela 2 (KPIs, SVG da série, tabela)
scripts/ui/retorno.js         tela 3 (geração, validação, histórico)
scripts/app.js                navegação por hash, tema, contexto do paciente
testes/smoke.html             49 verificações de aceitação
testes/shots.html             harness de captura de tela
testes/mobile.html            medidor e captura móvel em 390px reais
docs/                         8 capturas (claro/escuro/mobile) + roteiro do pitch
```

## Pendências (fora do escopo do hackathon)

- Envio real por WhatsApp ou outro canal assistido.
- Conformidade LGPD completa (documentada, não implementada).
- Autenticação e ambientes de produção.
- Integração com prontuário eletrônico real.
- Base controlada curada por equipe de saúde, com versionamento.

## Dados

Todos os dados são sintéticos e identificados como tal na interface:
`PAC-SINT-0042`, laudos `LAB-SINT-*`, UBS Modelo e profissional fictício.
Nenhum arquivo contém dado de paciente real.
