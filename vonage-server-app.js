/**
 * This script contains the logic for Vonage Video API and Genesys Cloud functions.
 * For this blueprint solution, this script is not run independent of the
 * web server but is imported and used as a module.
 */
const OpenTok = require('opentok');
const platformClient = require('purecloud-platform-client-v2');
const config = require('./config.js');


// Vonage Credentials
const apiKey = config.vonage.apiKey;
const apiSecret = config.vonage.apiSecret;
const opentok = new OpenTok(apiKey, apiSecret);

// Genesys Cloud Credentials
const client = platformClient.ApiClient.instance;
const conversationsApi = new platformClient.ConversationsApi();

// Dictionary of sessions
// Key: conversation ID. Value: Session ID
// NOTE: Use an actual service to keep track of sessions.
let sessions = {};

/**
 * Returns whether a given conversation is active or not.
 * @param {String} conversationId the Genesys Cloud conversation ID.
 * @param {Promise<Boolean>} Promise object representing if the conversation is active or not.
 */
function _isConversationActive(conversationId){
    return conversationsApi.getConversation(conversationId)
    .then((conversation) => {
        return conversation.endTime ? false : true;
    })
    .catch((err) => console.error('Invalid conversation: conversationId'));
}

/**
 * Create a TokBox Session
 * @returns {Promise<String>} the sessionId
 */
function _createSession(){
    return new Promise((resolve, reject) => {
        opentok.createSession(function(err, session) {
            if (err) reject(err);
          
            resolve(session.sessionId);
        });
    });
}

/**
 * Create a new Vonage Video room and return Vonage Video details (token, sessionId, etc.)
 * @param {String} conversationId Genesys Cloud conversation id 
 * @param {String} userName Name of the agent
 * @returns {Promise<Object>} Promise representing Vonage Video details to be passed to the client app 
 */
async function createRoom(conversationId, userName){
    let conversationActive = await _isConversationActive(conversationId);

    let sessionId = sessions[conversationId];

    if(!conversationActive && !config.testMode){
        // If conversation has ended or invalid, show the error page
        throw new Error('Conversation is invalid');
    }else{
        // Create room if none created for conversation yet.
        if(!sessions[conversationId]){
            sessionId = await _createSession();
            sessions[conversationId] = sessionId;
        }

        let token = opentok.generateToken(
                sessionId, 
                {
                    data: userName
                });

        return {
            apiKey: apiKey,
            sessionId: sessionId,
            token: token,
            userName: userName
        };
    }
}

/**
 * Send a link of the Vonage Room via Genesys Cloud Agentless SMS.
 * @param {Object} body information about the SMS to be sent 
 */
function sendSMS(body){
    return new Promise((resolve, reject) => {
        if(!body.conversationId || !body.address || !body.message) 
            reject();
    
        // Check if in a session
        if(!sessions[body.conversationId]) res.status(404);
    
        // Send agentless SMS
        let smsBody = {
            fromAddress: '+13175763352',
            toAddress: body.address,
            toAddressMessengerType: 'sms',
            textBody: body.message
        }
    
        return conversationsApi.postConversationsMessagesAgentless(smsBody)
        
    })
    .then((data) => {
        console.log('SMS sent');
        resolve();
    })
    .catch((err) => {
        reject(err);
    });
}

// INITIAL SETUP
client.setEnvironment(config.genesysCloud.region);
client.loginClientCredentialsGrant(
    config.genesysCloud.clientId,
    config.genesysCloud.clientSecret
)
.then(() => {
    console.log('Genesys Cloud client credentials grant succeeded.')
})
.catch((err) => {
    console.log(err);
});

module.exports = {
    createRoom: createRoom,
    sendSMS: sendSMS
}
