# Reconstroi pastas e arquivos vazios a partir de estrutura-projeto.txt.
# Uso: .\clonar-estrutura.ps1 -ArquivoEstrutura '.\estrutura-projeto.txt' -Destino 'C:\Projetos\meu-angular'
param(
    [Parameter(Mandatory = $true)] [string] $ArquivoEstrutura,
    [Parameter(Mandatory = $true)] [string] $Destino
)

$ErrorActionPreference = 'Stop'
$origem = (Resolve-Path -LiteralPath $ArquivoEstrutura -ErrorAction Stop).Path
$raiz = [System.IO.Path]::GetFullPath($Destino)
$linhas = @(Get-Content -LiteralPath $origem -Encoding UTF8 | Where-Object { $_ -match '^(\|   )*\|-- ' })
if ($linhas.Count -eq 0) { throw 'Nenhuma entrada de arvore encontrada no TXT.' }

$entradas = @(
    foreach ($linha in $linhas) {
        $match = [regex]::Match($linha, '^(?<indent>(?:\|   )*)\|-- (?<nome>.*)$')
        $nome = $match.Groups['nome'].Value
        $nivel = [int]($match.Groups['indent'].Value.Length / 4)
        if ([string]::IsNullOrWhiteSpace($nome) -or $nome -in @('.', '..') -or
            $nome.EndsWith(' ') -or $nome.EndsWith('.') -or
            $nome.IndexOfAny([char[]]'\/:*?"<>|') -ge 0 -or
            $nome -match '^(?i:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)') {
            throw "Nome invalido no TXT: $linha"
        }
        [pscustomobject]@{ Nivel = $nivel; Nome = $nome }
    }
)

# Arquivos sem extensao conhecidos na arvore recebida.
$arquivosSemExtensao = @('assemble', 'run', 'Dockerfile', 'Makefile', 'LICENSE', 'README')
# Pastas ocultas que possuem ponto no nome.
$pastasComPonto = @('.s2i', '.vscode')

# Primeiro validar a hierarquia, antes de criar qualquer item.
$tipos = @()
$pilhaValidacao = @()
for ($i = 0; $i -lt $entradas.Count; $i++) {
    $e = $entradas[$i]
    if ($e.Nivel -gt $pilhaValidacao.Count) { throw "Nivel inesperado no item: $($e.Nome)" }
    $pilhaValidacao = @($pilhaValidacao | Select-Object -First $e.Nivel)
    $temFilhos = ($i + 1 -lt $entradas.Count -and $entradas[$i + 1].Nivel -gt $e.Nivel)
    $ehArquivo = -not $temFilhos -and (
        $e.Nome -in $arquivosSemExtensao -or
        ($e.Nome.Contains('.') -and $e.Nome -notin $pastasComPonto)
    )
    $tipos += $(if ($ehArquivo) { 'Arquivo' } else { 'Diretorio' })
    if (-not $ehArquivo) { $pilhaValidacao += $e.Nome }
}

[void][System.IO.Directory]::CreateDirectory($raiz)
$pilha = @()
$pastasCriadas = 0
$arquivosCriados = 0
$existentes = 0
for ($i = 0; $i -lt $entradas.Count; $i++) {
    $e = $entradas[$i]
    $pilha = @($pilha | Select-Object -First $e.Nivel)
    $partes = @($pilha) + @($e.Nome)
    $caminho = $raiz
    foreach ($parte in $partes) { $caminho = Join-Path -Path $caminho -ChildPath $parte }

    if ($tipos[$i] -eq 'Diretorio') {
        if (Test-Path -LiteralPath $caminho -PathType Leaf) { throw "Arquivo existente impede criar pasta: $caminho" }
        if (-not (Test-Path -LiteralPath $caminho -PathType Container)) {
            [void][System.IO.Directory]::CreateDirectory($caminho)
            $pastasCriadas++
        } else { $existentes++ }
        $pilha += $e.Nome
    } else {
        if (Test-Path -LiteralPath $caminho) {
            if (Test-Path -LiteralPath $caminho -PathType Container) { throw "Pasta existente impede criar arquivo: $caminho" }
            $existentes++
        } else {
            $arquivo = [System.IO.File]::Create($caminho)
            $arquivo.Dispose()
            $arquivosCriados++
        }
    }
}
Write-Host "Concluido. Pastas criadas: $pastasCriadas; arquivos vazios criados: $arquivosCriados; itens existentes preservados: $existentes"
Write-Host "Destino: $raiz"
