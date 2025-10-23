// Netlify serverless function for papers API
export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const mockPapers = [
    {
      id: 1,
      title: "COVID-19 Transmission Patterns in Urban Areas",
      abstract: "This study examines the transmission patterns of COVID-19 in dense urban environments, analyzing factors such as population density, public transportation usage, and social distancing measures.",
      author: "Dr. Sarah Johnson",
      institution: "University Medical Center",
      research_type: "observational",
      data_type: "quantitative",
      status: "published",
      submission_date: "2024-03-15",
      keywords: ["COVID-19", "urban epidemiology", "transmission", "public health"]
    },
    {
      id: 2,
      title: "Malaria Prevention Strategies in Sub-Saharan Africa",
      abstract: "A comprehensive analysis of various malaria prevention strategies and their effectiveness across different regions in Sub-Saharan Africa.",
      author: "Dr. Michael Chen",
      institution: "Global Health Institute",
      research_type: "meta-analysis",
      data_type: "mixed-methods",
      status: "under-review",
      submission_date: "2024-04-02",
      keywords: ["malaria", "prevention", "Africa", "vector control"]
    },
    {
      id: 3,
      title: "Vaccine Hesitancy in Rural Communities",
      abstract: "Exploring factors contributing to vaccine hesitancy in rural populations and developing targeted intervention strategies.",
      author: "Dr. Emily Rodriguez",
      institution: "Public Health Department",
      research_type: "survey",
      data_type: "qualitative",
      status: "published",
      submission_date: "2024-05-10",
      keywords: ["vaccine hesitancy", "rural health", "behavioral intervention"]
    }
  ];

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: mockPapers,
        count: mockPapers.length,
        message: "Research papers retrieved successfully",
        timestamp: new Date().toISOString()
      }, null, 2)
    };
  }

  if (event.httpMethod === 'POST') {
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Paper submitted successfully",
        paper_id: Date.now(),
        status: "under-review",
        timestamp: new Date().toISOString()
      }, null, 2)
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};