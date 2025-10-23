// Netlify serverless function for users API
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

  const mockUsers = [
    {
      id: 1,
      email: "sarah.johnson@university.edu",
      name: "Dr. Sarah Johnson",
      institution: "University Medical Center",
      specialization: "Epidemiology",
      role: "researcher",
      verified: true,
      papers_count: 15,
      collaborations_count: 8,
      location: "Boston, USA",
      research_interests: ["Infectious Diseases", "Urban Health", "Data Analytics"]
    },
    {
      id: 2,
      email: "michael.chen@globalhealth.org",
      name: "Dr. Michael Chen",
      institution: "Global Health Institute",
      specialization: "Infectious Diseases",
      role: "researcher",
      verified: true,
      papers_count: 22,
      collaborations_count: 12,
      location: "Geneva, Switzerland",
      research_interests: ["Malaria", "Vector Control", "Global Health Policy"]
    },
    {
      id: 3,
      email: "emily.rodriguez@publichealth.gov",
      name: "Dr. Emily Rodriguez",
      institution: "Public Health Department",
      specialization: "Behavioral Health",
      role: "researcher",
      verified: true,
      papers_count: 18,
      collaborations_count: 6,
      location: "Atlanta, USA",
      research_interests: ["Vaccine Hesitancy", "Health Communication", "Community Engagement"]
    }
  ];

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: mockUsers,
        count: mockUsers.length,
        message: "Users retrieved successfully",
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