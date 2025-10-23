// Netlify serverless function for disease outbreaks API
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

  const mockOutbreaks = [
    {
      id: 1,
      disease_name: "Dengue Fever",
      region: "South America",
      country: "Brazil",
      coordinates: { lat: -14.2350, lng: -51.9253 },
      cases_reported: 25000,
      deaths_reported: 150,
      status: "active",
      severity: "high",
      description: "Dengue outbreak during rainy season with increased Aedes aegypti activity",
      last_updated: "2024-10-20",
      source: "Brazilian Ministry of Health",
      affected_areas: ["São Paulo", "Rio de Janeiro", "Minas Gerais"]
    },
    {
      id: 2,
      disease_name: "Mpox",
      region: "Africa",
      country: "Nigeria",
      coordinates: { lat: 9.0820, lng: 8.6753 },
      cases_reported: 1200,
      deaths_reported: 45,
      status: "active",
      severity: "medium",
      description: "Ongoing mpox cases in multiple states with contact tracing in progress",
      last_updated: "2024-10-18",
      source: "Nigeria Centre for Disease Control",
      affected_areas: ["Lagos", "Kano", "Rivers"]
    },
    {
      id: 3,
      disease_name: "Cholera",
      region: "Asia",
      country: "Bangladesh",
      coordinates: { lat: 23.6850, lng: 90.3563 },
      cases_reported: 850,
      deaths_reported: 12,
      status: "contained",
      severity: "low",
      description: "Cholera outbreak in flood-affected areas now under control",
      last_updated: "2024-10-15",
      source: "Bangladesh Department of Public Health",
      affected_areas: ["Dhaka", "Chittagong", "Sylhet"]
    }
  ];

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: mockOutbreaks,
        count: mockOutbreaks.length,
        message: "Disease outbreak data retrieved successfully",
        timestamp: new Date().toISOString(),
        summary: {
          total_cases: mockOutbreaks.reduce((sum, outbreak) => sum + outbreak.cases_reported, 0),
          total_deaths: mockOutbreaks.reduce((sum, outbreak) => sum + outbreak.deaths_reported, 0),
          countries_affected: mockOutbreaks.length,
          active_outbreaks: mockOutbreaks.filter(o => o.status === 'active').length
        }
      }, null, 2)
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};