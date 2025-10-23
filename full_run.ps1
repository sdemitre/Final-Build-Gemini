$root = 'C:\Users\stoure\Final Build'
$client = Join-Path $root 'client'
$node = Join-Path $root 'nodejs\node-v20.10.0-win-x64\node.exe'
$npm = Join-Path $root 'nodejs\node-v20.10.0-win-x64\npm.cmd'
$out = Join-Path $root 'full-run-out.txt'
if(Test-Path $out){ Remove-Item $out -Force }
function Log($m){ $line = "$(Get-Date -Format o) `t $m"; Write-Output $line; Add-Content -Path $out -Value $line }
Log 'FULL RUN START'

# Kill stray node processes that look like our servers
Log 'KILL stray node processes (react-scripts/server)'
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -match 'react-scripts|start.js|server\\index.js|server\\server.js|index.js' } | ForEach-Object { Log "KILL PID:$($_.ProcessId) CMD:$($_.CommandLine)"; Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

# Remove CRA/Webpack cache
$cache = Join-Path $client 'node_modules\.cache'
if(Test-Path $cache){ Remove-Item -Recurse -Force $cache -ErrorAction SilentlyContinue; Log 'REMOVED client node_modules\.cache' } else { Log 'NO client .cache' }

# npm ci in client
Set-Location $client
$npmLog = Join-Path $client 'npm-ci.log'
if(Test-Path $npm){ Log 'RUNNING npm ci (bundled)'; & $npm ci *> $npmLog 2>&1; $ec=$LASTEXITCODE; Log "npm ci exit:$ec"; if(Test-Path $npmLog){ Get-Content $npmLog -Tail 200 | ForEach-Object { Log "npm-ci: $_" } } } else { Log 'npm.cmd not found at expected path' }

# Start backend
Set-Location $root
$serverLog = Join-Path $root 'server.log'
$serverErr = Join-Path $root 'server.err'
$serverScript = Join-Path $root 'server\index.js'
if(Test-Path $serverScript){ Log 'STARTING backend'; Start-Process -FilePath $node -ArgumentList $serverScript -RedirectStandardOutput $serverLog -RedirectStandardError $serverErr -NoNewWindow -PassThru | Out-Null; Start-Sleep -Seconds 2 } else { Log 'NO server/index.js found' }

# Poll backend
$backendOk = $false
for($i=0;$i -lt 15;$i++){ try{ $r = Invoke-WebRequest -Uri http://localhost:5000/health -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop; Log "BACKEND_RESP:$($r.StatusCode)"; if($r.StatusCode -eq 200){ $backendOk=$true; break } } catch { Log "BACKEND_POLL_FAIL:$i"; Start-Sleep -Seconds 1 } }

# Start frontend
Set-Location $client
$reactOut = Join-Path $client 'react-start.log'
$reactErr = Join-Path $client 'react-start.err'
if(Test-Path $npm){ Log 'STARTING frontend (npm start)'; Start-Process -FilePath $npm -ArgumentList 'start' -WorkingDirectory $client -RedirectStandardOutput $reactOut -RedirectStandardError $reactErr -NoNewWindow -PassThru | Out-Null; Start-Sleep -Seconds 3 } else { Log 'npm.cmd missing' }

# Poll frontend
$frontendOk = $false
for($i=0;$i -lt 60;$i++){ try{ $r = Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop; Log "FRONTEND_RESP:$($r.StatusCode)"; if($r.StatusCode -eq 200){ $frontendOk=$true; break } } catch { if($i -lt 8 -or $i -in 15,30,45){ Log "FRONT_POLL_FAIL:$i" } Start-Sleep -Seconds 1 } }

Log "SUMMARY backend:$backendOk frontend:$frontendOk"

# Dump tails of logs for debugging
if(Test-Path $serverLog){ Log '---server.log tail---'; Get-Content $serverLog -Tail 200 | ForEach-Object { Log $_ } } else { Log 'server.log missing' }
if(Test-Path $serverErr){ Log '---server.err tail---'; Get-Content $serverErr -Tail 200 | ForEach-Object { Log $_ } } else { Log 'server.err missing' }
if(Test-Path $reactErr){ Log '---react-start.err tail---'; Get-Content $reactErr -Tail 400 | ForEach-Object { Log $_ } } else { Log 'react-start.err missing' }
if(Test-Path $reactOut){ Log '---react-start.log tail---'; Get-Content $reactOut -Tail 400 | ForEach-Object { Log $_ } } else { Log 'react-start.log missing' }

Log 'FULL RUN END'
Write-Output "WROTE OUTPUT TO: $out"
