const LIFESPRING_CONTEXT = `
Bellevue LifeSpring is a nonprofit organization based in Bellevue, Washington that provides support and services to low-income families and individuals in the greater Bellevue area. Here is what is known about the organization:

MISSION: Bellevue LifeSpring empowers people in need in the Bellevue community through practical assistance and relationship-building.

KEY PROGRAMS & SERVICES:
- Emergency financial assistance (help with rent, utilities, and other urgent needs)
- Food assistance and food bank resources
- Holiday programs (Thanksgiving meals, Christmas gifts for children)
- Back-to-school supplies for children
- Community connection and referrals to other local resources

HOW TO GET HELP:
- Contact Bellevue LifeSpring directly through their website at bellevuelifespring.org
- They serve residents of the greater Bellevue area in Washington State
- Assistance is available to families and individuals experiencing financial hardship

HOW TO DONATE:
- Financial donations can be made through their website
- They also accept donations of goods (food, school supplies, holiday gifts)
- Corporate and community partnerships are welcome

HOW TO VOLUNTEER:
- Volunteer opportunities are available for individuals, groups, and companies
- Volunteers help with food distribution, holiday programs, and other events
- Contact them through bellevuelifespring.org to sign up

LOCATION: Bellevue, Washington (greater Seattle area)
WEBSITE: bellevuelifespring.org
`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { message } = JSON.parse(event.body || '{}');
  if (!message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No message provided' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: `You are a helpful assistant for Bellevue LifeSpring, a nonprofit organization in Bellevue, Washington.
Answer questions using ONLY the information provided below about the organization.
If someone asks something you don't have information about, kindly direct them to visit bellevuelifespring.org or contact the organization directly.
Keep responses warm, helpful, and concise. Do not make up information.

ORGANIZATION INFORMATION:
${LIFESPRING_CONTEXT}`,
      messages: [{ role: 'user', content: message }]
    })
  });

  const data = await response.json();
  const reply = data?.content?.[0]?.text || 'I\'m sorry, I couldn\'t generate a response. Please visit bellevuelifespring.org for more information.';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ reply })
  };
};
