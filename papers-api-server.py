#!/usr/bin/env python3
"""
Enhanced Research Papers API Server - Python Version
Public Health Research Platform
"""

import json
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime
import re

# Enhanced research papers dataset
mock_papers = [
    {
        "id": 1,
        "title": "Global COVID-19 Surveillance and Response Strategies: A Comprehensive Analysis",
        "abstract": "This comprehensive study examines the global response to COVID-19, analyzing surveillance systems, public health interventions, and their effectiveness across different regions. Our analysis covers data from 195 countries and territories, evaluating the impact of various containment measures on transmission rates and healthcare system capacity.",
        "author": "Dr. Sarah Johnson",
        "co_authors": ["Dr. Michael Chen", "Dr. Elena Rodriguez", "Dr. James Wilson"],
        "institution": "Harvard T.H. Chan School of Public Health",
        "submission_date": "2023-03-15",
        "publication_date": "2023-05-20",
        "status": "published",
        "doi": "10.1016/j.epidem.2023.100652",
        "keywords": ["COVID-19", "surveillance", "global health", "pandemic response", "public health policy"],
        "category": "Infectious Disease",
        "research_type": "observational",
        "citations": 89,
        "funding_source": "NIH Grant R01AI123456",
        "peer_reviewers": ["Dr. Amanda Foster", "Dr. Robert Kim"],
        "journal": "Epidemics",
        "volume_issue": "Vol 43, Article 100652"
    },
    {
        "id": 2,
        "title": "Machine Learning Approaches for Early Detection of Disease Outbreaks in Sub-Saharan Africa",
        "abstract": "We present novel machine learning algorithms for early detection of infectious disease outbreaks using mobile phone data, social media sentiment analysis, and traditional epidemiological indicators. Our model achieved 94% accuracy in predicting outbreaks 2-3 weeks before traditional surveillance systems.",
        "author": "Dr. Kwame Asante",
        "co_authors": ["Dr. Lisa Thompson", "Dr. Ahmed Hassan", "Dr. Grace Okafor"],
        "institution": "Makerere University College of Health Sciences",
        "submission_date": "2023-08-22",
        "publication_date": "2023-11-10",
        "status": "published",
        "doi": "10.1371/journal.pone.0289456",
        "keywords": ["machine learning", "disease surveillance", "early warning", "Sub-Saharan Africa", "mobile health"],
        "category": "Digital Health",
        "research_type": "modeling",
        "citations": 34,
        "funding_source": "Bill & Melinda Gates Foundation",
        "peer_reviewers": ["Dr. Catherine Williams", "Dr. Samuel Lee"],
        "journal": "PLOS ONE",
        "volume_issue": "Vol 18, No 11"
    },
    {
        "id": 3,
        "title": "Vector Control Strategies for Malaria Prevention: A Meta-Analysis of Randomized Controlled Trials",
        "abstract": "A systematic review and meta-analysis of 47 randomized controlled trials examining the effectiveness of various vector control interventions for malaria prevention. We analyzed data from 156,789 participants across 23 countries to determine the most effective combinations of interventions.",
        "author": "Dr. Priya Sharma",
        "co_authors": ["Dr. David Martinez", "Dr. Fatima Al-Zahra", "Dr. John Anderson"],
        "institution": "London School of Hygiene & Tropical Medicine",
        "submission_date": "2023-06-30",
        "publication_date": "2023-09-15",
        "status": "published",
        "doi": "10.1016/S0140-6736(23)01234-5",
        "keywords": ["malaria", "vector control", "prevention", "meta-analysis", "randomized controlled trials"],
        "category": "Vector-borne Disease",
        "research_type": "meta-analysis",
        "citations": 67,
        "funding_source": "WHO Research Grant",
        "peer_reviewers": ["Dr. Maria Santos", "Dr. Peter Chang"],
        "journal": "The Lancet",
        "volume_issue": "Vol 402, Issue 10405"
    },
    {
        "id": 4,
        "title": "Climate Change Impacts on Vector-Borne Disease Distribution: Predictive Modeling for 2050",
        "abstract": "Using advanced climate models and vector ecology data, we project changes in the geographic distribution of major vector-borne diseases by 2050. Our analysis indicates potential expansion of dengue, Zika, and chikungunya transmission zones, with new areas of risk in temperate regions.",
        "author": "Dr. Elena Volkov",
        "co_authors": ["Dr. Carlos Mendoza", "Dr. Yuki Tanaka", "Dr. Rachel Green"],
        "institution": "Centers for Disease Control and Prevention",
        "submission_date": "2023-09-12",
        "publication_date": None,
        "status": "under-review",
        "doi": None,
        "keywords": ["climate change", "vector-borne diseases", "predictive modeling", "global warming", "disease distribution"],
        "category": "Climate Health",
        "research_type": "modeling",
        "citations": 0,
        "funding_source": "EPA Climate Health Grant",
        "peer_reviewers": ["Dr. Thomas Brown", "Dr. Sophie Laurent"],
        "journal": "Nature Climate Change",
        "volume_issue": "Under Review"
    },
    {
        "id": 5,
        "title": "Antimicrobial Resistance Surveillance in Low-Resource Settings: Implementation Challenges and Solutions",
        "abstract": "This study evaluates the implementation of antimicrobial resistance (AMR) surveillance programs in 15 low-resource countries, identifying key barriers and proposing sustainable solutions. We present a framework for cost-effective AMR monitoring that can be adapted to various healthcare systems.",
        "author": "Dr. Benjamin Okonkwo",
        "co_authors": ["Dr. Melissa Wong", "Dr. Hassan Ibrahim", "Dr. Julia Kowalski"],
        "institution": "World Health Organization",
        "submission_date": "2023-11-03",
        "publication_date": None,
        "status": "under-review",
        "doi": None,
        "keywords": ["antimicrobial resistance", "surveillance", "low-resource settings", "implementation science", "global health"],
        "category": "Antimicrobial Resistance",
        "research_type": "survey",
        "citations": 0,
        "funding_source": "WHO Core Budget",
        "peer_reviewers": ["Dr. Anna Petrov", "Dr. Mark Johnson"],
        "journal": "The Lancet Global Health",
        "volume_issue": "Under Review"
    },
    {
        "id": 6,
        "title": "Digital Health Interventions for Tuberculosis Contact Tracing: A Systematic Review",
        "abstract": "Comprehensive review of digital health technologies used for tuberculosis contact tracing, including mobile applications, GPS tracking, and blockchain-based systems. Analysis of 32 studies reveals significant improvements in contact identification and follow-up rates.",
        "author": "Dr. Raj Patel",
        "co_authors": ["Dr. Kim Nguyen", "Dr. Maria Gonzalez", "Dr. Paul Stewart"],
        "institution": "Johns Hopkins Bloomberg School of Public Health",
        "submission_date": "2023-04-18",
        "publication_date": "2023-07-25",
        "status": "published",
        "doi": "10.1093/ije/dyad123",
        "keywords": ["tuberculosis", "contact tracing", "digital health", "mobile health", "systematic review"],
        "category": "Digital Health",
        "research_type": "systematic review",
        "citations": 23,
        "funding_source": "USAID TB Research Grant",
        "peer_reviewers": ["Dr. Jennifer Liu", "Dr. Francisco Silva"],
        "journal": "International Journal of Epidemiology",
        "volume_issue": "Vol 52, Issue 4"
    },
    {
        "id": 7,
        "title": "Maternal and Child Health Outcomes in Post-Conflict Settings: Evidence from West Africa",
        "abstract": "Longitudinal study examining maternal and child health indicators in post-conflict West African countries over a 10-year period. Analysis of health system reconstruction efforts and their impact on reducing maternal mortality and improving child vaccination coverage.",
        "author": "Dr. Aisha Diallo",
        "co_authors": ["Dr. Robert Taylor", "Dr. Ngozi Okwu", "Dr. Marie Dubois"],
        "institution": "UNICEF West and Central Africa Regional Office",
        "submission_date": "2023-07-14",
        "publication_date": "2023-10-30",
        "status": "published",
        "doi": "10.1186/s12978-023-01678-9",
        "keywords": ["maternal health", "child health", "post-conflict", "West Africa", "health systems"],
        "category": "Global Health",
        "research_type": "observational",
        "citations": 45,
        "funding_source": "UNICEF Research Fund",
        "peer_reviewers": ["Dr. Helen Clark", "Dr. Joseph Kamara"],
        "journal": "Reproductive Health",
        "volume_issue": "Vol 20, Article 168"
    },
    {
        "id": 8,
        "title": "Zoonotic Disease Spillover Risk Assessment Using One Health Surveillance Networks",
        "abstract": "Development and validation of a risk assessment framework for zoonotic disease spillover events using integrated surveillance data from human, animal, and environmental health sectors. The framework was tested in Southeast Asian countries with high biodiversity and human-animal interface activity.",
        "author": "Dr. Kenji Yamamoto",
        "co_authors": ["Dr. Sarah Mitchell", "Dr. Luca Romano", "Dr. Indira Chandra"],
        "institution": "FAO Emergency Centre for Transboundary Animal Diseases",
        "submission_date": "2023-12-08",
        "publication_date": None,
        "status": "in-preparation",
        "doi": None,
        "keywords": ["zoonotic diseases", "spillover", "One Health", "surveillance", "risk assessment"],
        "category": "One Health",
        "research_type": "surveillance",
        "citations": 0,
        "funding_source": "FAO Technical Cooperation Programme",
        "peer_reviewers": [],
        "journal": "EcoHealth",
        "volume_issue": "In Preparation"
    }
]

class PapersAPIHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Override to reduce console spam
        pass
    
    def do_GET(self):
        if self.path.startswith('/api/papers'):
            self.handle_papers_api()
        elif self.path == '/papers-api-test.html':
            self.serve_test_page()
        elif self.path == '/':
            self.serve_welcome_page()
        else:
            self.send_error(404, "Endpoint not found")
    
    def handle_papers_api(self):
        try:
            # Parse URL and query parameters
            parsed_url = urllib.parse.urlparse(self.path)
            query_params = urllib.parse.parse_qs(parsed_url.query)
            
            # Extract query parameters
            status = query_params.get('status', [None])[0]
            category = query_params.get('category', [None])[0]
            author = query_params.get('author', [None])[0]
            institution = query_params.get('institution', [None])[0]
            research_type = query_params.get('research_type', [None])[0]
            search = query_params.get('search', [None])[0]
            
            try:
                limit = int(query_params.get('limit', [None])[0]) if query_params.get('limit', [None])[0] else None
                offset = int(query_params.get('offset', ['0'])[0])
            except (ValueError, TypeError):
                limit = None
                offset = 0
            
            sort_by = query_params.get('sort_by', ['submission_date'])[0]
            sort_order = query_params.get('sort_order', ['desc'])[0]
            
            # Filter papers
            filtered_papers = list(mock_papers)
            
            if status:
                filtered_papers = [p for p in filtered_papers if p['status'] == status]
            
            if category:
                filtered_papers = [p for p in filtered_papers if p['category'] == category]
            
            if author:
                filtered_papers = [p for p in filtered_papers 
                                 if author.lower() in p['author'].lower() or 
                                    any(author.lower() in co_author.lower() for co_author in p['co_authors'])]
            
            if institution:
                filtered_papers = [p for p in filtered_papers 
                                 if institution.lower() in p['institution'].lower()]
            
            if research_type:
                filtered_papers = [p for p in filtered_papers if p['research_type'] == research_type]
            
            if search:
                search_lower = search.lower()
                filtered_papers = [p for p in filtered_papers 
                                 if search_lower in p['title'].lower() or 
                                    search_lower in p['abstract'].lower() or
                                    any(search_lower in keyword.lower() for keyword in p['keywords'])]
            
            # Sort papers
            reverse = sort_order == 'desc'
            if sort_by == 'submission_date':
                filtered_papers.sort(key=lambda x: x['submission_date'], reverse=reverse)
            elif sort_by == 'title':
                filtered_papers.sort(key=lambda x: x['title'], reverse=reverse)
            elif sort_by == 'author':
                filtered_papers.sort(key=lambda x: x['author'], reverse=reverse)
            elif sort_by == 'citations':
                filtered_papers.sort(key=lambda x: x['citations'], reverse=reverse)
            elif sort_by == 'publication_date':
                filtered_papers.sort(key=lambda x: x['publication_date'] or '9999-12-31', reverse=reverse)
            
            # Calculate summary statistics
            status_distribution = {}
            category_distribution = {}
            total_citations = 0
            
            for paper in filtered_papers:
                status_distribution[paper['status']] = status_distribution.get(paper['status'], 0) + 1
                category_distribution[paper['category']] = category_distribution.get(paper['category'], 0) + 1
                total_citations += paper['citations']
            
            # Apply pagination
            total_count = len(filtered_papers)
            paginated_papers = filtered_papers[offset:offset + limit] if limit else filtered_papers[offset:]
            
            # Prepare response
            response_data = {
                "success": True,
                "data": paginated_papers,
                "pagination": {
                    "total_count": total_count,
                    "returned_count": len(paginated_papers),
                    "offset": offset,
                    "limit": limit,
                    "has_more": (offset + len(paginated_papers)) < total_count
                },
                "filters_applied": {
                    "status": status,
                    "category": category,
                    "author": author,
                    "institution": institution,
                    "research_type": research_type,
                    "search": search
                },
                "sorting": {
                    "sort_by": sort_by,
                    "sort_order": sort_order
                },
                "summary": {
                    "status_distribution": status_distribution,
                    "category_distribution": category_distribution,
                    "total_citations": total_citations
                },
                "available_filters": {
                    "statuses": ["published", "under-review", "in-preparation", "draft"],
                    "research_types": ["observational", "meta-analysis", "survey", "surveillance", "modeling", "systematic review"],
                    "categories": ["Infectious Disease", "Global Health", "Vector-borne Disease", "Climate Health", "Antimicrobial Resistance", "Digital Health", "One Health"]
                },
                "message": f"Research papers retrieved successfully. Found {total_count} papers matching criteria.",
                "timestamp": datetime.now().isoformat() + "Z"
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data, indent=2).encode())
            
        except Exception as e:
            error_response = {
                "success": False,
                "error": str(e),
                "message": "An error occurred while processing the request",
                "timestamp": datetime.now().isoformat() + "Z"
            }
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_response, indent=2).encode())
    
    def serve_test_page(self):
        try:
            with open('papers-api-test.html', 'r', encoding='utf-8') as f:
                content = f.read()
            
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(content.encode())
        except FileNotFoundError:
            self.send_error(404, "Test page not found")
    
    def serve_welcome_page(self):
        welcome_html = """
<!DOCTYPE html>
<html>
<head>
    <title>📄 Research Papers API Server</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #0d9488 100%); color: white; padding: 2rem; border-radius: 0.5rem; text-align: center; }
        .endpoint { background: #f8fafc; padding: 1rem; margin: 1rem 0; border-radius: 0.25rem; font-family: monospace; }
        .button { display: inline-block; padding: 0.5rem 1rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 0.25rem; margin: 0.5rem; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📄 Research Papers API Server</h1>
        <p>Enhanced Public Health Research Platform</p>
        <p>Server running on port 8080</p>
    </div>
    
    <h2>🚀 Available Endpoints</h2>
    
    <div class="endpoint">
        <strong>GET /api/papers</strong><br>
        Retrieve research papers with advanced filtering and pagination
    </div>
    
    <h3>🔗 Quick Links</h3>
    <a href="/api/papers" class="button">All Papers</a>
    <a href="/api/papers?status=published" class="button">Published Papers</a>
    <a href="/api/papers?limit=3" class="button">First 3 Papers</a>
    <a href="/papers-api-test.html" class="button">🧪 API Testing Interface</a>
    
    <h3>📊 Database Statistics</h3>
    <ul>
        <li>Total Papers: 8</li>
        <li>Published: 5</li>
        <li>Under Review: 2</li>
        <li>In Preparation: 1</li>
        <li>Total Citations: 258</li>
    </ul>
</body>
</html>
        """
        
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.end_headers()
        self.wfile.write(welcome_html.encode())

def run_server(port=8080):
    server_address = ('', port)
    httpd = HTTPServer(server_address, PapersAPIHandler)
    print(f"🚀 Research Papers API Server running on http://localhost:{port}")
    print(f"📄 API Endpoint: http://localhost:{port}/api/papers")
    print(f"🧪 Test Interface: http://localhost:{port}/papers-api-test.html")
    print("Press Ctrl+C to stop the server")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        httpd.server_close()

if __name__ == '__main__':
    run_server()