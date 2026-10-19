$ErrorActionPreference = 'Stop'
$sourceDemo = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../dist/project-spark-0.8.0-demo.1')).Path
# Ensure the hosted Windows CI runner also exercises a path containing spaces.
$demoFolder = Join-Path (Split-Path -Parent $sourceDemo) "Windows launcher smoke $([guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Path $demoFolder | Out-Null
Get-ChildItem -LiteralPath $sourceDemo | Copy-Item -Destination $demoFolder -Recurse
$stdout = Join-Path $demoFolder '../launcher-stdout.local'
$stderr = Join-Path $demoFolder '../launcher-stderr.local'
$launcher = $null
$serverChildren = @()
$previousNoOpen = $env:SPARK_DEMO_NO_OPEN
try {
    if (Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue) {
        throw 'Port 4173 is already occupied; stop the other local preview before testing the launcher.'
    }
    $env:SPARK_DEMO_NO_OPEN = '1'
    $launcher = Start-Process -FilePath $env:ComSpec -ArgumentList '/d /s /c ""Start Spark Demo.cmd""' -WorkingDirectory $demoFolder -WindowStyle Hidden -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr
    $ready = $false
    for ($attempt = 0; $attempt -lt 40; $attempt++) {
        try {
            $response = Invoke-WebRequest -Uri 'http://127.0.0.1:4173' -UseBasicParsing -TimeoutSec 1
            if ($response.StatusCode -eq 200 -and $response.Content.Contains('Project Spark')) { $ready = $true; break }
        } catch { Start-Sleep -Milliseconds 250 }
    }
    if (-not $ready) { throw "Launcher did not serve the demo. $(Get-Content -Raw -LiteralPath $stderr)" }
    $serverChildren = @(Get-CimInstance Win32_Process -Filter "ParentProcessId = $($launcher.Id)" | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine.Contains('server.mjs') })
    if ($serverChildren.Count -ne 1) { throw 'Expected one Node server child owned by this launcher.' }
    $serverProcess = Get-Process -Id $serverChildren[0].ProcessId
    Write-Output "Windows command launcher served production assets from a path with spaces. Standalone server working set: $($serverProcess.WorkingSet64) bytes."
} finally {
    # Only stop the exact child of the launcher started above; never unrelated previews.
    if ($launcher) {
        $owned = @(Get-CimInstance Win32_Process -Filter "ParentProcessId = $($launcher.Id)" | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine.Contains('server.mjs') })
        foreach ($child in $owned) { Stop-Process -Id $child.ProcessId -ErrorAction SilentlyContinue }
        Stop-Process -Id $launcher.Id -ErrorAction SilentlyContinue
    }
    $env:SPARK_DEMO_NO_OPEN = $previousNoOpen
}
if (Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue) { throw 'Launcher test left a listening server.' }
Write-Output 'Windows launcher startup and owned-process cleanup passed. Default-browser opening is intentionally suppressed for automation.'
