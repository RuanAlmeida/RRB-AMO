# Subir as aplicacoes na Oracle Cloud (VM + nginx)

Resultado esperado:

- `http://<IP>/` — app do medico (fila, analise, retorno, dashboard, WhatsApp)
- `http://<IP>/gestao/` — dashboard da gestao

Tudo estatico, nada de build. O ditado com microfone exige HTTPS (regra do
Chrome): sem certificado, `http://<IP>/` serve as telas normalmente, mas o
navegador bloqueia o microfone — como resolver, na secao 5.1.

## 0. Mensagem pronta para a organizacao do hackathon

> Oi! Vou subir o projeto na nuvem Oracle como voce pediu. Conseguem me passar
> os proximos passos para provisionar a conta com os US$ 300 de credito?
> Preciso saber: (1) onde criar a instancia (link/tenant), (2) se ha
> regiao/shape preferencial, (3) se a porta 80 (HTTP) ja vem liberada. O
> projeto e um site estatico (HTML/CSS/JS puro) servido por nginx em Ubuntu.

Se a organizacao mandar um passo a passo oficial, use ele — este guia e a
versao adaptada ao nosso caso (dois apps, nginx, IP puro).

## 1. Chave SSH (feita uma vez, ja existe)

Chave local: `%USERPROFILE%\.ssh\hackinova_oci_ed25519` (privada) e `.pub`
(publica). Ao criar a instancia, cole o conteudo do `.pub` no campo de chave
SSH do console. Nao ha senha de usuario — a chave e o acesso.

Se precisar recriar:

```powershell
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\hackinova_oci_ed25519" -C hackinova-oci
```

## 2. Criar a instancia no console OCI

1. Entrar no console (link da organizacao ou `cloud.oracle.com`).
2. Menu **Compute > Instances > Create instance**.
3. **Imagem:** Canonical Ubuntu (24.04 ou 22.04). *Nao use Oracle Linux* — os
   comandos abaixo sao de apt/nginx com sites-enabled.
4. **Shape:** `VM.Standard.A1.Flex` com 1 OCPU / 6 GB (recomendado com o
   credito de US$ 300). Se a regiao nao tiver capacidade A1, pegue qualquer
   shape menor disponivel — nginx em site estatico quase nao consome nada.
5. **Rede:** "Create new virtual cloud network" (o wizard cria VCN + subnet +
   internet gateway + rota).
6. **Chave SSH:** colar o conteudo de `hackinova_oci_ed25519.pub`.
7. **Segurança:** na security list da subnet, adicionar regra de entrada
   **TCP 80 de 0.0.0.0/0** (o wizard so abre 22 por padrao).
8. Regiao: a mais perto de voce (ex.: `sa-saopaulo-1`).
9. Criar, ligar e anotar o **IP publico**.

## 3. Configurar o servidor (uma vez)

No computador, a partir da pasta do projeto:

```powershell
scp deploy\nginx-copiloto.conf deploy\configurar-servidor.sh ubuntu@<IP>:/tmp/
ssh ubuntu@<IP> "sudo bash /tmp/configurar-servidor.sh"
```

(Se a imagem pedir outro usuario, troque `ubuntu` por ele.)

## 4. Publicar o site (sempre que houver mudanca)

```powershell
powershell -ExecutionPolicy Bypass -File deploy\publicar.ps1 -Ip <IP>
```

O script envia `index.html`, `gestao/`, `styles/`, `scripts/` e `testes/`,
recarrega o nginx e valida `GET /` e `GET /gestao/` (espera 200 nos dois).

## 5. Validar

- `http://<IP>/` abre o app do medico no modo escuro, com a fila
  Helena / Giovani / Tereza e as tres telas (analise, retorno, dashboard).
- `http://<IP>/gestao/` abre o dashboard com selos de "Simulado".
- Opcional: `http://<IP>/testes/smoke.html` roda a suite de 100 verificacoes no
  navegador (util para o jurado ver que o codigo publicado e o testado).

As suites ja passam localmente (`ALL PASS 100` e `ALL PASS 11`) — nao e
obrigatorio re-rodar na VM.

## 5.1 HTTPS (necessario para o ditado com microfone)

O Chrome so libera o microfone em HTTPS (ou localhost). Sem certificado, tudo
no app funciona menos o "Falar agora": pagina em `http://<IP>/` nunca recebe
microfone, nao ha atalho. Opcoes:

1. **Dominio gratis + Let's Encrypt** (recomendado antes da final):
   1. Criar conta em [DuckDNS](https://www.duckdns.org/) (ou no-IP) e pegar um
      subdominio gratis.
   2. Apontar o registro A para o IP publico da VM (painel do DuckDNS).
   3. Na VM:

      ```bash
      sudo apt update && sudo apt install -y certbot python3-certbot-nginx
      sudo certbot --nginx -d <subdominio>.duckdns.org --redirect
      ```

   A renovacao automatica ja vem configurada (confira com
   `sudo certbot renew --dry-run`).

2. **Voz so no GitHub Pages** (`https://ruanalmeida.github.io/RRB-AMO/`, ja
   HTTPS): demo de ditado no Pages e a VM serve as telas.

## 6. Custos e cuidados

- Com US$ 300 de credito, uma A1 de 1 OCPU rodando 24/7 fica tranquila ate o
  fim do hackathon. Se o credito tiver prazo curto, **desligue a instancia**
  (menu Instance > Stop) fora dos horarios de uso/avaliacao — o IP publico
  muda ao desligar, salve o novo se precisar.
- Nao abra portas alem de 80 (app) e 22 (SSH, que ja vem restrito a sua chave).
- O app nao tem backend: nao ha banco, senha nem dado real para proteger alem
  disso. A rede entra em dois pontos do navegador: no clique de "Enviar ao
  cliente" (WhatsApp do usuario final) e no ditado (reconhecimento de fala
  online do Chrome/Edge) — nenhum dos dois passa pela VM.
