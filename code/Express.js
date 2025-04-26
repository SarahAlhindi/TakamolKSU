const express = require('express');
const axios = require('axios');
const path = require('path');  // Import path module for serving static files
const app = express();

// Your ORCID client details
const CLIENT_ID = 'APP-xxx';  // Replace with your ORCID Client ID
const CLIENT_SECRET = 'xxx';  // Replace with your ORCID Client Secret
const REDIRECT_URI = 'https://b8ecd6d38c5a.ngrok.app/callback';  // Replace with your Redirect URI

// Serve static files (like index.html) from the 'public' folder
app.use(express.static(path.join(__dirname, 'code')));

// Root route (serving index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'code', 'index.html'));
});

// OAuth callback route
app.get('/callback', async (req, res) => {
    const code = req.query.code;  // ORCID sends the code in the query parameters

    if (!code) {
        return res.status(400).send('Authorization code not received');
    }

    try {
        // Exchange authorization code for an access token
        const response = await axios.post('https://orcid.org/oauth/token', new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI
        }));

        // Extract the access token from the response
        const accessToken = response.data.access_token;

        // You can store the token for future use or make further API calls
        // Example: fetch the user's ORCID profile
        const orcidProfile = await axios.get('https://api.orcid.org/v3.0/xxx', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.send(`Access Token: ${accessToken}<br>ORCID Profile: ${JSON.stringify(orcidProfile.data)}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during OAuth process');
    }
});

// Start the server
app.listen(8080, () => {
    console.log('Server running on port 8080');
});
