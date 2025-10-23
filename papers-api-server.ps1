# PowerShell HTTP Server for Research Papers API
# Public Health Research Platform - GET /api/papers endpoint demonstration

Add-Type -AssemblyName System.Web

function Start-PapersAPIServer {
    param(
        [int]$Port = 8080
    )
    
    # Sample research papers data
    $mockPapers = @(
        @{
            id = 1
            title = "Global COVID-19 Surveillance and Response Strategies: A Comprehensive Analysis"
            author = "Dr. Sarah Johnson"
            institution = "Harvard T.H. Chan School of Public Health"
            status = "published"
            category = "Infectious Disease"
            research_type = "observational"
            citations = 89
            submission_date = "2023-03-15"
            keywords = @("COVID-19", "surveillance", "global health", "pandemic response")
        },
        @{
            id = 2
            title = "Machine Learning Approaches for Early Detection of Disease Outbreaks in Sub-Saharan Africa"
            author = "Dr. Kwame Asante"
            institution = "Makerere University College of Health Sciences"
            status = "published"
            category = "Digital Health"
            research_type = "modeling"
            citations = 34
            submission_date = "2023-08-22"
            keywords = @("machine learning", "disease surveillance", "early warning", "Sub-Saharan Africa")
        },
        @{
            id = 3
            title = "Vector Control Strategies for Malaria Prevention: A Meta-Analysis"
            author = "Dr. Priya Sharma"
            institution = "London School of Hygiene & Tropical Medicine"
            status = "published"
            category = "Vector-borne Disease"
            research_type = "meta-analysis"
            citations = 67
            submission_date = "2023-06-30"
            keywords = @("malaria", "vector control", "prevention", "meta-analysis")
        },
        @{
            id = 4
            title = "Climate Change Impacts on Vector-Borne Disease Distribution"
            author = "Dr. Elena Volkov"
            institution = "Centers for Disease Control and Prevention"
            status = "under-review"
            category = "Climate Health"
            research_type = "modeling"
            citations = 0
            submission_date = "2023-09-12"
            keywords = @("climate change", "vector-borne diseases", "predictive modeling")
        },
        @{
            id = 5
            title = "Antimicrobial Resistance Surveillance in Low-Resource Settings"
            author = "Dr. Benjamin Okonkwo"
            institution = "World Health Organization"
            status = "under-review"
            category = "Antimicrobial Resistance"
            research_type = "survey"
            citations = 0
            submission_date = "2023-11-03"
            keywords = @("antimicrobial resistance", "surveillance", "low-resource settings")
        }
    )
    
    Write-Host "🚀 Starting Research Papers API Server on port $Port..." -ForegroundColor Green
    Write-Host "📄 API Endpoint: http://localhost:$Port/api/papers" -ForegroundColor Cyan
    Write-Host "🌐 Welcome Page: http://localhost:$Port/" -ForegroundColor Cyan
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
            $query = $request.Url.Query
            
            Write-Host "$(Get-Date -Format 'HH:mm:ss') - $($request.HttpMethod) $url$query" -ForegroundColor White
            
            # Set CORS headers
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
            
            if ($url -eq "/api/papers") {
                # Handle papers API endpoint
                $filteredPapers = $mockPapers
                
                # Parse query parameters
                if ($query) {
                    $queryParams = [System.Web.HttpUtility]::ParseQueryString($query)
                    
                    # Filter by status
                    if ($queryParams["status"]) {
                        $filteredPapers = $filteredPapers | Where-Object { $_.status -eq $queryParams["status"] }
                    }
                    
                    # Filter by category
                    if ($queryParams["category"]) {
                        $filteredPapers = $filteredPapers | Where-Object { $_.category -eq $queryParams["category"] }
                    }
                    
                    # Search in title/keywords
                    if ($queryParams["search"]) {
                        $searchTerm = $queryParams["search"].ToLower()
                        $filteredPapers = $filteredPapers | Where-Object { 
                            $_.title.ToLower().Contains($searchTerm) -or 
                            ($_.keywords | Where-Object { $_.ToLower().Contains($searchTerm) }).Count -gt 0
                        }
                    }
                    
                    # Apply limit
                    if ($queryParams["limit"]) {
                        $limit = [int]$queryParams["limit"]
                        $filteredPapers = $filteredPapers | Select-Object -First $limit
                    }
                }
                
                # Calculate summary statistics
                $statusDistribution = $filteredPapers | Group-Object status | ForEach-Object { @{ $_.Name = $_.Count } }
                $totalCitations = ($filteredPapers | Measure-Object citations -Sum).Sum
                
                # Create response
                $apiResponse = @{
                    success = $true
                    data = $filteredPapers
                    pagination = @{
                        total_count = $filteredPapers.Count
                        returned_count = $filteredPapers.Count
                        offset = 0
                        limit = $null
                        has_more = $false
                    }
                    summary = @{
                        total_citations = $totalCitations
                        status_distribution = $statusDistribution
                    }
                    message = "Research papers retrieved successfully"
                    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
                }
                
                $jsonResponse = $apiResponse | ConvertTo-Json -Depth 10
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonResponse)
                
                $response.ContentType = "application/json"
                $response.ContentLength64 = $buffer.Length
                $response.StatusCode = 200
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                
            } elseif ($url -eq "/") {
                # Serve welcome page
                $welcomeHTML = @"
<!DOCTYPE html>
<html>
<head>
    <title>📄 Research Papers API Server</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; background: #f8fafc; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #0d9488 100%); color: white; padding: 2rem; border-radius: 0.5rem; text-align: center; margin-bottom: 2rem; }
        .section { background: white; padding: 1.5rem; border-radius: 0.5rem; margin: 1rem 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .endpoint { background: #f1f5f9; padding: 1rem; margin: 1rem 0; border-radius: 0.25rem; font-family: monospace; border-left: 4px solid #3b82f6; }
        .button { display: inline-block; padding: 0.75rem 1.5rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 0.25rem; margin: 0.5rem; transition: background 0.2s; }
        .button:hover { background: #2563eb; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1rem 0; }
        .stat { text-align: center; padding: 1rem; background: #f8fafc; border-radius: 0.25rem; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #1e40af; }
        .stat-label { font-size: 0.875rem; color: #64748b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📄 Research Papers API Server</h1>
        <p>Enhanced Public Health Research Platform</p>
        <p>PowerShell HTTP Server - Port $Port</p>
    </div>
    
    <div class="section">
        <h2>🚀 API Endpoint</h2>
        <div class="endpoint">
            <strong>GET /api/papers</strong><br>
            Retrieve research papers with filtering and search capabilities
        </div>
        
        <h3>🔗 Quick Test Links</h3>
        <a href="/api/papers" class="button">All Papers</a>
        <a href="/api/papers?status=published" class="button">Published Papers</a>
        <a href="/api/papers?category=Infectious Disease" class="button">Infectious Disease</a>
        <a href="/api/papers?search=COVID" class="button">Search COVID</a>
        <a href="/api/papers?limit=3" class="button">First 3 Papers</a>
    </div>
    
    <div class="section">
        <h2>📊 Database Statistics</h2>
        <div class="stats">
            <div class="stat">
                <div class="stat-number">5</div>
                <div class="stat-label">Total Papers</div>
            </div>
            <div class="stat">
                <div class="stat-number">3</div>
                <div class="stat-label">Published</div>
            </div>
            <div class="stat">
                <div class="stat-number">2</div>
                <div class="stat-label">Under Review</div>
            </div>
            <div class="stat">
                <div class="stat-number">190</div>
                <div class="stat-label">Total Citations</div>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>🔍 Query Parameters</h2>
        <ul>
            <li><strong>status</strong>: published, under-review, in-preparation</li>
            <li><strong>category</strong>: Infectious Disease, Digital Health, etc.</li>
            <li><strong>search</strong>: Search in titles and keywords</li>
            <li><strong>limit</strong>: Number of results to return</li>
        </ul>
        
        <h3>📝 Example Queries</h3>
        <div class="endpoint">
            /api/papers?status=published&limit=2<br>
            /api/papers?category=Vector-borne Disease<br>
            /api/papers?search=malaria&status=published
        </div>
    </div>
</body>
</html>
"@
                
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($welcomeHTML)
                $response.ContentType = "text/html"
                $response.ContentLength64 = $buffer.Length
                $response.StatusCode = 200
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                
            } else {
                # 404 Not Found
                $errorResponse = @{
                    success = $false
                    error = "Endpoint not found"
                    message = "The requested endpoint does not exist"
                    available_endpoints = @("/api/papers", "/")
                } | ConvertTo-Json
                
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorResponse)
                $response.ContentType = "application/json"
                $response.StatusCode = 404
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
            
            $response.OutputStream.Close()
        }
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        if ($listener.IsListening) {
            $listener.Stop()
            Write-Host "🛑 Server stopped" -ForegroundColor Yellow
        }
    }
}

# Start the server
Start-PapersAPIServer -Port 8080