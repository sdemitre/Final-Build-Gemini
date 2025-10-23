# Simple HTTP server for serving static files
# This PowerShell script creates a basic web server to serve the disease outbreak map

$port = 8080
$root = "$PSScriptRoot\dist"

Write-Host "🌍 Starting Public Health Research Platform..." -ForegroundColor Green
Write-Host "📁 Serving files from: $root" -ForegroundColor Yellow
Write-Host "🌐 Local URL: http://localhost:$port" -ForegroundColor Cyan
Write-Host "🦠 Enhanced Disease Map with 40 global outbreaks ready!" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

try {
    # Create HTTP listener
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Start()
    
    Write-Host "✅ Server started successfully!" -ForegroundColor Green
    Write-Host "🚀 Open your browser and navigate to: http://localhost:$port" -ForegroundColor Cyan
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Get the requested file path
        $requestedPath = $request.Url.LocalPath
        if ($requestedPath -eq "/") {
            $requestedPath = "/index.html"
        }
        
        $filePath = Join-Path $root $requestedPath.TrimStart('/')
        
        Write-Host "📄 Request: $($request.HttpMethod) $($request.Url.LocalPath)" -ForegroundColor Blue
        
        if (Test-Path $filePath -PathType Leaf) {
            # File exists, serve it
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $content.Length
            
            # Set content type based on file extension
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($extension) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css" }
                ".js"   { $response.ContentType = "application/javascript" }
                ".json" { $response.ContentType = "application/json" }
                default { $response.ContentType = "application/octet-stream" }
            }
            
            $response.StatusCode = 200
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            # File not found
            $notFoundMessage = "404 - File Not Found: $requestedPath"
            $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes($notFoundMessage)
            $response.StatusCode = 404
            $response.ContentLength64 = $notFoundBytes.Length
            $response.ContentType = "text/plain"
            $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
            
            Write-Host "❌ 404 Not Found: $requestedPath" -ForegroundColor Red
        }
        
        $response.Close()
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Try running as Administrator or use a different port" -ForegroundColor Yellow
} finally {
    if ($listener -and $listener.IsListening) {
        $listener.Stop()
        Write-Host "🛑 Server stopped" -ForegroundColor Yellow
    }
}