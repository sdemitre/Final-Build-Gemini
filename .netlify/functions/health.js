// Netlify serverless function for health API
export const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod === 'GET') {
    const response = {
      status: 'OK',
      message: 'Public Health Research Platform API (Netlify Deployment)',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(Math.random() * 3600), // Mock uptime
      endpoints: {
        papers: '/api/papers',
        outbreaks: '/api/diseases/outbreaks',
        users: '/api/users',
        jobs: '/api/jobs',
        collaborations: '/api/collaborations',
        health: '/api/health'
      },
      deployment: {
        platform: 'Netlify',
        serverless: true,
        region: 'Global CDN'
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response, null, 2)
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};