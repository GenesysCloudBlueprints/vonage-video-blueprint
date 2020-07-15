import controller from './notifications-controller.js';
import view from './view.js';

// Obtain a reference to the platformClient object
const platformClient = require('platformClient');
const client = platformClient.ApiClient.instance;

// API instances
const usersApi = new platformClient.UsersApi();
const conversationsApi = new platformClient.ConversationsApi();

let userId = '';
let activeConversations = [];

/**
 * Should be called when there's a new conversation. 
 * Will store the conversations in a global array.
 * @param {String} conversationId Genesys Cloud conversationId
 */
function registerConversation(conversationId){
    return conversationsApi.getConversation(conversationId)
        .then((data) => activeConversations.push(data));
}

/**
 * Get current active chat conversations
 * @returns {Promise} 
 */
function processActiveChats(){
    return conversationsApi.getConversationsChats()
    .then((data) => {
        let promiseArr = [];

        data.entities.forEach((conv) => {
            view.showIframe(conv.id);
            promiseArr.push(registerConversation(conv.id));
        });

        if(data.entities.length == 0) {
            view.displayInteractionDetails("You do not have an active interaction.");
        }

        return Promise.all(promiseArr);
    })
}

/**
 * Set-up the channel for chat conversations
 */
function setupChatChannel(){
    return controller.createChannel()
    .then(data => {
        // Subscribe to incoming chat conversations
        return controller.addSubscription(
            `v2.users.${userId}.conversations.chats`,

            // Called when a chat conversation event fires (connected to agent, etc.)
            (data) => {
                let conversation = data.eventBody;
                let participants = conversation.participants;
                let conversationId = conversation.id;
                let agentParticipant = participants.find(
                    p => p.purpose == 'agent');
                let customerParticipant = participants.find(
                    p => p.purpose == 'customer');

                // Value to determine if conversation is already taken into account before
                let isExisting = activeConversations.map((conv) => conv.id)
                                    .indexOf(conversationId) != -1;

                // Once agent is connected, create a room and a session
                if(agentParticipant.state == 'connected' && !isExisting){
                    // Add conversationid to existing conversations array
                    return registerConversation(conversation.id)
                    .then(() => {
                        view.showIframe(conversationId);
                        view.displayInteractionDetails(customerParticipant.name);
                    })
                }

                // If agent has multiple interactions, open session for the active chat
                if(agentParticipant.held == false){
                    view.showIframe(conversationId);
                    view.displayInteractionDetails(customerParticipant.name);
                }

                // If chat has ended display meeting has ended
                if(agentParticipant.state == 'disconnected' && isExisting){
                    view.displayInteractionDetails("This meeting has ended");
                }
            });
    });
}

/** --------------------------------------------------------------
 *                       INITIAL SETUP
 * -------------------------------------------------------------- */
client.loginImplicitGrant(
    '5f3e661d-61be-4a13-b536-3f54f24e26c9',
    window.location.href)
.then(data => {
    console.log(data);
    
    // Get Details of current User
    return usersApi.getUsersMe();
}).then(userMe => {
    userId = userMe.id;

    // Create the channel for chat notifications
    return setupChatChannel();
}).then(data => { 
    
    // Get current chat conversations
    return processActiveChats();
}).then(data => {
    console.log('Finished Setup');

// Error Handling
}).catch(e => console.log(e));