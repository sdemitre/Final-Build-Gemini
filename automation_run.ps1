$root = 'C:\Users\stoure\Final Build'
$client = Join-Path $root 'client'
$out = Join-Path $root 'automation-out.txt'
Function Write-Log($s){ Add-Content -Path $out -Value ("$(Get-Date -Format o) `t $s") }
if(Test-Path $out){ Remove-Item $out -Force }
Write-Log 'START'
# Show top of key files
$files = @('src\\index.tsx','src\\App.tsx','src\\context\\AuthContext.tsx')
foreach($f in $files){ $p = Join-Path $client $f; if(Test-Path $p){ $head = Get-Content $p -TotalCount 10 -Encoding UTF8 -ErrorAction SilentlyContinue; Write-Log "FILE: $f (exists)"; foreach($line in $head){ Add-Content -Path $out -Value "  > $line" } } else { Write-Log "FILE: $f (MISSING)" } }
# Remove BOM from index
$ix = Join-Path $client 'src\\index.tsx'
if(Test-Path $ix){ $b=[System.IO.File]::ReadAllBytes($ix); if($b.Length -ge 3 -and $b[0] -eq 0xEF -and $b[1] -eq 0xBB -and $b[2] -eq 0xBF){ Write-Log 'BOM_FOUND_REMOVING'; [System.IO.File]::WriteAllBytes($ix,$b[3..($b.Length-1)]) } else { Write-Log 'BOM_NOT_PRESENT' } } else { Write-Log 'INDEX_MISSING' }
# Clean caches
$cache = Join-Path $client 'node_modules\\.cache'
if(Test-Path $cache){ Remove-Item -Recurse -Force $cache -ErrorAction SilentlyContinue; Write-Log 'CACHE_REMOVED' } else { Write-Log 'NO_CACHE' }
# npm ci
Set-Location $client
$npmPath = 'C:\Users\stoure\Final Build\nodejs\\node-v20.10.0-win-x64\\npm.cmd'
$npmLog = Join-Path $client 'npm-ci.log'
if(Test-Path $npmPath){ & $npmPath ci *> $npmLog 2>&1; $ec = $LASTEXITCODE; Write-Log "NPM_CI_EXIT:$ec" } else { Write-Log 'NPM_CMD_MISSING' }
# Start backend
Set-Location $root
$serverScript = Join-Path $root 'server\\index.js'
$serverLog = Join-Path $root 'server.log'
$serverErr = Join-Path $root 'server.err'
if(Test-Path $serverScript){ # kill any node using 5000
  $conflict = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
  if($conflict){ $pid = $conflict.OwningProcess; Write-Log "KILL_PID_5000:$pid"; Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue }
  Start-Process -FilePath 'C:\Users\stoure\Final Build\nodejs\\node-v20.10.0-win-x64\\node.exe' -ArgumentList $serverScript -RedirectStandardOutput $serverLog -RedirectStandardError $serverErr -PassThru | Out-Null; Start-Sleep -Seconds 2; Write-Log 'BACKEND_STARTED' } else { Write-Log 'SERVER_SCRIPT_MISSING' }
# Start frontend
Set-Location $client
$reactOut = Join-Path $client 'react-start.log'
$reactErr = Join-Path $client 'react-start.err'
if(Test-Path $npmPath){ Start-Process -FilePath $npmPath -ArgumentList 'start' -RedirectStandardOutput $reactOut -RedirectStandardError $reactErr -PassThru | Out-Null; Start-Sleep -Seconds 4; Write-Log 'FRONTEND_STARTED' } else { Write-Log 'NPM_CMD_MISSING' }
# Poll endpoints
$backendOk = $false; $frontendOk = $false
for($i=0;$i -lt 15;$i++){ try{ $r = Invoke-WebRequest -Uri http://localhost:5000/health -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop; if($r.StatusCode -eq 200){ $backendOk = $true; Write-Log 'BACKEND_OK'; break } } catch { Start-Sleep -Seconds 1 } }
for($i=0;$i -lt 30;$i++){ try{ $r = Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop; if($r.StatusCode -eq 200){ $frontendOk = $true; Write-Log 'FRONTEND_OK'; break } } catch { Start-Sleep -Seconds 1 } }
Write-Log "RESULT BACKEND:$backendOk FRONTEND:$frontendOk"
# capture tail of logs
if(Test-Path $serverLog){ Write-Log '---SERVER.LOG---'; Get-Content $serverLog -Tail 200 | ForEach-Object { Add-Content -Path $out -Value $_ } }
if(Test-Path $serverErr){ Write-Log '---SERVER.ERR---'; Get-Content $serverErr -Tail 200 | ForEach-Object { Add-Content -Path $out -Value $_ } }
if(Test-Path $reactErr){ Write-Log '---REACT.ERR---'; Get-Content $reactErr -Tail 400 | ForEach-Object { Add-Content -Path $out -Value $_ } }
if(Test-Path $reactOut){ Write-Log '---REACT.OUT---'; Get-Content $reactOut -Tail 400 | ForEach-Object { Add-Content -Path $out -Value $_ } }
Write-Log 'END'
