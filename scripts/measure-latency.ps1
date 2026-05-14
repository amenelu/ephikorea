param(
  [string]$BaseUrl = "http://127.0.0.1:3000",
  [int]$Iterations = 3
)

$routes = @(
  "/",
  "/en",
  "/en/products",
  "/en/search",
  "/en/cart",
  "/en/admin/login"
)

$logDir = Join-Path $PSScriptRoot "..\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$safeBase = ($BaseUrl -replace "https?://", "" -replace "[:/\\]", "_")
$logPath = Join-Path $logDir "latency-$safeBase-$timestamp.log"

function Measure-RouteLatency {
  param(
    [string]$Url
  )

  $samples = @()

  for ($i = 1; $i -le $Iterations; $i++) {
    $curlOutput = curl.exe -o NUL -s -w "%{http_code} %{time_namelookup} %{time_connect} %{time_starttransfer} %{time_total}" $Url
    if (-not $curlOutput) {
      throw "No response from $Url"
    }

    $parts = $curlOutput.Trim().Split(" ")
    $samples += [pscustomobject]@{
      Iteration = $i
      HttpCode = $parts[0]
      NameLookupSeconds = [double]$parts[1]
      ConnectSeconds = [double]$parts[2]
      StartTransferSeconds = [double]$parts[3]
      TotalSeconds = [double]$parts[4]
    }
  }

  return $samples
}

"Latency run at $(Get-Date -Format o)" | Out-File -FilePath $logPath -Encoding utf8
"Base URL: $BaseUrl" | Out-File -FilePath $logPath -Encoding utf8 -Append
"Iterations per route: $Iterations" | Out-File -FilePath $logPath -Encoding utf8 -Append
"" | Out-File -FilePath $logPath -Encoding utf8 -Append

foreach ($route in $routes) {
  $url = "$BaseUrl$route"
  $samples = Measure-RouteLatency -Url $url
  $averageTotal = ($samples | Measure-Object -Property TotalSeconds -Average).Average
  $averageStartTransfer = ($samples | Measure-Object -Property StartTransferSeconds -Average).Average

  "Route: $route" | Out-File -FilePath $logPath -Encoding utf8 -Append
  ($samples | Format-Table -AutoSize | Out-String).TrimEnd() | Out-File -FilePath $logPath -Encoding utf8 -Append
  ("Average start-transfer: {0:N3}s" -f $averageStartTransfer) | Out-File -FilePath $logPath -Encoding utf8 -Append
  ("Average total: {0:N3}s" -f $averageTotal) | Out-File -FilePath $logPath -Encoding utf8 -Append
  "" | Out-File -FilePath $logPath -Encoding utf8 -Append
}

Write-Output $logPath
