const express = require('express');
const https = require('https');
const fs = require('fs');
const OpenTok = require('opentok');
const platformClient = require('purecloud-platform-client-v2');
const config = require('./config.js');

const app = express();
const port = config.expressPort;

// Web server
const sslOptions = {
    key: fs.readFileSync('https-requirements/localhost.key'),
    cert: fs.readFileSync('https-requirements/localhost.crt'),
    ca: fs.readFileSync('https-requirements/ca.crt'),
    requestCert: true,
    rejectUnauthorized: false
};
const httpsServer = https.createServer(sslOptions, app);

// Vonage
const apiKey = config.vonage.apiKey;
const apiSecret = config.vonage.apiSecret;
const opentok = new OpenTok(apiKey, apiSecret);

// Genesys Cloud
const client = platformClient.ApiClient.instance;
const conversationsApi = new platformClient.ConversationsApi();

// DIctionary of sessions
// Key: conversation ID. Value: Session ID
let sessions = {};

function checkConversationActive(conversationId){
    return conversationsApi.getConversation(conversationId)
    .then((conversation) => {
        return conversation.endTime ? false : true;
    })
    .catch((err) => console.error('Invalid conversation.'));
}

/**
 * Create a TokBox Session
 * @returns {Promise} the sessionId
 */
function createSession(){
    return new Promise((resolve, reject) => {
        opentok.createSession(function(err, session) {
            if (err) reject(err);
          
            resolve(session.sessionId);
        });
    });
}

// Initialize the express app
app.use(express.static(__dirname + '/public')); //

// set the view engine to ejs
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    res.render('index.ejs');
});

// Create a session if not yet created
app.get('/room/:conversation_id', async (req, res) => {
    let conversation_id = req.params.conversation_id;
    let userName = req.query.username || 'N/A';
    let sessionId = sessions[conversation_id];

    let conversationActive = await checkConversationActive(conversation_id);

    if(!conversationActive && !config.testMode){
        // If conversation has ended or invalid, show the error page
        res.render('invalid-room.ejs', {});
    }else{
        // Create room if none created for conversation yet.
        if(!sessions[conversation_id]){
            sessionId = await createSession();
            sessions[conversation_id] = sessionId;
        }

        let token = opentok.generateToken(
                sessionId, 
                {
                    data: userName
                });

        res.render('room.ejs', {
            apiKey: apiKey,
            sessionId: sessionId,
            token: token,
            userName: userName
        });
    }
});

httpsServer.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    console.log(`Test Mode: ${config.testMode ? 'ON' : 'OFF'}`);
});

client.loginClientCredentialsGrant(
    config.genesysCloud.clientId,
    config.genesysCloud.clientSecret
)
.then(()=> {
    console.log('Genesys Cloud client credentials grant succeeded.')
})
.catch((err) => {
    console.log(err);
});