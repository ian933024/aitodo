const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });

// API key proxy function
exports.getOpenAIApiKey = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    // Return the API key from Firebase environment config
    const apiKey = functions.config().openai?.apikey;
    
    if (!apiKey) {
      response.status(500).json({ error: 'API key not configured' });
      return;
    }
    
    response.status(200).json({ apiKey });
  });
});