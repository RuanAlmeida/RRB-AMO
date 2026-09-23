<#
  Publica as aplicacoes na VM Oracle (roda no seu computador).
  Uso:
    powershell -ExecutionPolicy Bypass -File deploy\publicar.ps1 -Ip <IP-publico>
  Opcional: -Usuario ubuntu   (nao use se a imagem da VM for Oracle Linux)
#>
param(
  [Parameter(Mandatory = $true)][string]$Ip,
  [string]$Usuario = "ubuntu",
  [string]$Chave,
  [string]$Destino = "/var/www/copiloto"
)

$ErrorActionPreference = "Stop"

if (-not $Chave) { $Chave = Join-Path $env:USERPROFILE ".ssh\hackinova_oci_ed25519" }
if (-not (Test-Path $Chave)) { throw "Chave SSH nao encontrada: $Chave" }

$raiz = Split-Path -Parent $PSScriptRoot
$alvos = @("index.html", "gestao", "styles", "scripts", "testes") |
  ForEach-Object { Join-Path $raiz $_ }
foreach ($a in $alvos) { if (-not (Test-Path $a)) { throw "Nao encontrado: $a" } }

Write-Host "Enviando arquivos para ${Usuario}@${Ip}:${Destino} ..."
scp -i $Chave -r $alvos "${Usuario}@${Ip}:${Destino}/"

Write-Host "Ajustando permissao e recarregando nginx ..."
ssh -i $Chave "${Usuario}@${Ip}" "sudo chown -R www-data:www-data $Destino && sudo systemctl reload nginx"

Write-Host "Validando ..."
$ok = $true
foreach ($u in @("http://$Ip/", "http://$Ip/gestao/")) {
  try {
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 10
    Write-Host "$u -> $($r.StatusCode)"
    if ($r.StatusCode -ne 200) { $ok = $false }
  } catch {
    Write-Host "$u -> FALHOU: $($_.Exception.Message)"
    $ok = $false
  }
}
if (-not $ok) { exit 1 }
Write-Host "Publicado com sucesso: http://$Ip/  (gestao: http://$Ip/gestao/)"
