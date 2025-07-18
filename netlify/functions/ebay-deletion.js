const crypto = require('crypto');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Handle GET request (eBay's challenge validation)
  if (event.httpMethod === 'GET') {
    try {
      const challengeCode = event.queryStringParameters?.challenge_code;
      
      if (!challengeCode) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing challenge_code parameter' })
        };
      }

      // verification token
      const verificationToken = "EbayAPI-ShippingResearch-Production-2025-xyz987uvw654rst321";
      
      // endpoint URL
      const endpoint = "https://fluffy-semifreddo-536294.netlify.app/.netlify/functions/ebay-deletion";

      // Create hash: challengeCode + verificationToken + endpoint
      const hash = crypto.createHash('sha256');
      hash.update(challengeCode);
      hash.update(verificationToken);
      hash.update(endpoint);
      const challengeResponse = hash.digest('hex');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          challengeResponse: challengeResponse
        })
      };

    } catch (error) {
      console.error('Challenge validation error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }

  // Handle POST request (actual deletion notifications)
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      console.log('Received deletion notification:', body);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'acknowledged',
          message: 'Deletion notification processed'
        })
      };

    } catch (error) {
      console.error('Deletion notification error:', error);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'acknowledged',
          message: 'Notification received but processing failed'
        })
      };
    }
  }

  // Handle unsupported methods
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
