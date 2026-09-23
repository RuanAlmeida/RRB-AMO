#!/usr/bin/env bash
# Configura uma VM Ubuntu da Oracle Cloud para servir as aplicacoes do hackathon.
# Uso (na VM, a partir de /tmp):
#   sudo bash /tmp/configurar-servidor.sh
# Requer antes: /tmp/nginx-copiloto.conf (enviado pelo seu computador).
set -euo pipefail

if [ ! -f /tmp/nginx-copiloto.conf ]; then
  echo "ERRO: /tmp/nginx-copiloto.conf nao encontrado — suba o arquivo antes."
  exit 1
fi

apt-get update
apt-get install -y nginx

mkdir -p /var/www/copiloto

install -m 644 /tmp/nginx-copiloto.conf /etc/nginx/sites-available/copiloto.conf
ln -sfn /etc/nginx/sites-available/copiloto.conf /etc/nginx/sites-enabled/copiloto.conf
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl restart nginx

echo "OK — servidor pronto em http://$(hostname -I | awk '{print $1}')/"
