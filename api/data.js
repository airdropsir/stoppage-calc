
export default async function handler(req, res) {
  // Environment variables
  const CLOUD_ID = process.env.JSONBIN_BIN_ID;
  const CLOUD_KEY = process.env.JSONBIN_API_KEY;

  // Set CORS headers to allow access from anywhere (or restrict to your domain)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request (Preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Ensure JSONBin credentials are present
  if (!CLOUD_ID || !CLOUD_KEY) {
    return res.status(500).json({ 
      error: 'Configuration Error', 
      message: 'JSONBIN_BIN_ID or JSONBIN_API_KEY is missing in environment variables.' 
    });
  }

  // --- GET Request: Read Data ---
  if (req.method === 'GET') {
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${CLOUD_ID}/latest`, {
        headers: {
          'X-Master-Key': CLOUD_KEY
        }
      });
      
      if (response.ok) {
        const json = await response.json();
        // Return the record directly
        return res.status(200).json(json.record);
      } else {
        const errorText = await response.text();
        console.error("Cloud Read Error:", errorText);
        return res.status(500).json({ error: 'Failed to fetch data from cloud' });
      }
    } catch (error) {
      console.error("Cloud Fetch Error:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // --- POST Request: Write Data ---
  if (req.method === 'POST') {
    try {
      // In Vercel serverless, req.body is already parsed if content-type is json
      const dataPayload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      const response = await fetch(`https://api.jsonbin.io/v3/b/${CLOUD_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': CLOUD_KEY
        },
        body: JSON.stringify(dataPayload)
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Cloud Write Error:", error);
      return res.status(500).json({ error: 'Failed to save data to cloud' });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method Not Allowed' });
}
