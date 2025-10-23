# Simple HTTP Server to serve the updated index.html with CDC EOC Timeline
param(
    [int]$Port = 8081
)

Add-Type -AssemblyName System.Web

function Start-TimelineServer {
    Write-Host "🚀 Starting Timeline Demo Server on port $Port..." -ForegroundColor Green
    Write-Host "📅 CDC EOC Timeline: http://localhost:$Port/" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    
    # Create HTTP listener
    $listener = [System.Net.HttpListener]::new()
    $listener.Prefixes.Add("http://localhost:$Port/")
    
    try {
        $listener.Start()
        Write-Host "✅ Server started successfully!" -ForegroundColor Green
        
        while ($listener.IsListening) {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $url = $request.Url.AbsolutePath
            
            Write-Host "$(Get-Date -Format 'HH:mm:ss') - $($request.HttpMethod) $url" -ForegroundColor White
            
            # Set CORS headers
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            
            if ($url -eq "/" -or $url -eq "/index.html") {
                # Serve the updated index.html with timeline
                try {
                    $htmlContent = Get-Content -Path "dist\index.html" -Raw -Encoding UTF8
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes($htmlContent)
                    
                    $response.ContentType = "text/html; charset=utf-8"
                    $response.ContentLength64 = $buffer.Length
                    $response.StatusCode = 200
                    $response.OutputStream.Write($buffer, 0, $buffer.Length)
                }
                catch {
                    $errorMessage = $_.Exception.Message
                    $errorHTML = @"
<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>
    <h1>Error Loading Timeline</h1>
    <p>Could not load dist/index.html: $errorMessage</p>
    <p>Please ensure the file exists in the correct directory.</p>
</body>
</html>
"@
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorHTML)
                    $response.ContentType = "text/html"
                    $response.StatusCode = 500
                    $response.OutputStream.Write($buffer, 0, $buffer.Length)
                }
            }
            else {
                # 404 Not Found
                $notFoundHTML = @"
<!DOCTYPE html>
<html>
<head><title>404 - Not Found</title></head>
<body>
    <h1>404 - Page Not Found</h1>
    <p>The requested resource was not found.</p>
    <p><a href="/">Return to CDC EOC Timeline</a></p>
</body>
</html>
"@
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($notFoundHTML)
                $response.ContentType = "text/html"
                $response.StatusCode = 404
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
            
            $response.OutputStream.Close()
        }
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        if ($listener.IsListening) {
            $listener.Stop()
            Write-Host "Server stopped" -ForegroundColor Yellow
        }
    }
}

# Start the server
Start-TimelineServer -Port $Port