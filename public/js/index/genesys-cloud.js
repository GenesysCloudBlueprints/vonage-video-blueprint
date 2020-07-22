import controller from './notifications-controller.js';
import view from './view.js';

// Obtain a reference to the platformClient object
const platformClient = require('platformClient');
const client = platformClient.ApiClient.instance;

// API instances
const usersApi = new platformClient.UsersApi();
const conversationsApi = new platformClient.ConversationsApi();

let userId = '';
let currentConversation = null;
let customerName = ''; 
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
 * Subscribes the conversation to the notifications channel
 * @param {String} conversationId 
 * @returns {Promise}
 */
function subscribeChatConversation(conversationId){
    return controller.addSubscription(
        `v2.conversations.chats.${conversationId}.messages`,
        onMessage);
}

/**
 * Add OpenTok Session ID in conversation notes
 * @param {String} conversationId 
 * @param {String} participantId 
 */
function patchConversation(conversationId, participantId){
    let sessionId = document.getElementById('room-container').contentWindow['sessionId'];

    let body = {'wrapup' : {
                        'code' : '',
                        'name' : '',
                        'notes' : 'OpenTok Session ID: ' + sessionId
                    }
                };

    return conversationsApi.patchConversationParticipant(conversationId, participantId, body);
}

/**
 * Callback function for 'message' and 'typing-indicator' events.
 * For this sample, it will merely get chat communication ID.
 * 
 * @param {Object} data the event data  
 */
let onMessage = (data) => {
    switch(data.metadata.type){
        case 'typing-indicator':
            break;
        case 'message':
            // Values from the event
            let eventBody = data.eventBody;
            let convId = eventBody.conversation.id;
            let senderId = eventBody.sender.id;

            // Conversation values for cross reference
            let conversation = activeConversations.find(c => c.id == convId);
            let participant = conversation.participants.find(p => p.chats[0].id == senderId);
            let purpose = participant.purpose;
            let agentID;
            
            // Get agent communication ID
            if(purpose == 'agent') {
                agentID = senderId;

                let customer = conversation.participants.find(p => p.purpose == 'customer');
                customerName = customer.name;
            } else {
                let agent = conversation.participants.find(p => p.purpose == 'agent');
                agentID = agent.chats[0].id;

                customerName = participant.name;
            }

            break;
    }
};

/**
 * Get current active chat conversations
 * @param {String} agentName Name of the agent
 * @returns {String} agentName Name of the agent
 */
function processActiveChats(agentName){
    return conversationsApi.getConversationsChats()
    .then((data) => {
        let promiseArr = [];        

        if(data.entities.length == 0) {
            view.showErrorIframe('No Active Interaction');
        } else {
            let customerParticipant = data.entities[0].participants.find(
                p => p.purpose == 'customer');

            data.entities.forEach((conv) => {
                view.showIframe(conv.id, agentName);
                promiseArr.push(registerConversation(conv.id));
                subscribeChatConversation(conv.id);
            });
        }

        return agentName;
    })
}

/**
 * Set-up the channel for chat conversations
 *  @param {String} agentName Name of the agent
 */
function setupChatChannel(agentName){
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
                        view.showIframe(conversationId, agentName);

                        return subscribeChatConversation(conversationId);
                    })
                }

                // If agent has multiple interactions, open session for the active chat
                if(agentParticipant.held == false){
                    view.showIframe(conversationId, agentName);
                }

                // If chat has ended display meeting has ended
                if(agentParticipant.state == 'disconnected' && isExisting){
                    // Remove Conversation ID in the activeConversations array
                    let index = activeConversations.indexOf(conversationId);
                    if (index > -1) {
                        activeConversations.splice(index, 1);
                    }

                    // Add OpenTok Session ID in conversation notes
                    patchConversation(conversationId, customerParticipant.id);

                    // view.removeVideoURLButton();
                    view.hideIframe();
                    view.showErrorIframe('This meeting has ended');
                }
            });
    });
}

/**
 * Send the link to the room in the chat if interaction is chat.
 */
function sendLinkToChat(){
    // Determine if the conversation is a chat by checking 'chats' 
    // property of the agent participant

    // TODO: Getting current conversation should be done in a different manner,
    // right now just get the last activeCOnversation,
    currentConversation = activeConversations[activeConversations.length - 1];
    
    let conversationId = currentConversation.id
    let communicationId = '';

    view.showInfoModal('Sending Link...', false);

    return conversationsApi.getConversation(conversationId)
    .then((data) => {
        let agentParticipant = data.participants.find(p => 
            p.purpose == 'agent');

        
        if(!agentParticipant || !agentParticipant.chats) {
            view.showInfoModal('Sorry. This conversation is not a Webchat.');
            return null;
        }        
        let chats = agentParticipant.chats;

        // Get last id just in case there are multiple
        communicationId = chats[chats.length - 1].id;

        return conversationsApi.postConversationsChatCommunicationMessages(
            conversationId,
            communicationId,
            {
                body: `Please join my Vonage Video Room at: https://localhost/room/customer/${conversationId}?username=${encodeURIComponent(customerName)}`,
                bodyType: 'standard'
            }
        )
    })
    .then((success) => {
        if(success){
            view.showInfoModal('Successfully sent!');
        }
    })
    .catch(e => console.error(e));

}   


/** --------------------------------------------------------------
 *                       EVENT HANDLERS
 * -------------------------------------------------------------- */
document.getElementById('btn-email')
    .addEventListener('click', () => view.showEmailModal());
document.getElementById('btn-sms')
    .addEventListener('click', () => view.showSMSModal());
document.getElementById('btn-chat')
    .addEventListener('click', () => sendLinkToChat());

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

    // Get current chat conversations
    return processActiveChats(userMe.name);
}).then(agentName => { 
    // Create the channel for chat notifications
    return setupChatChannel(agentName);
}).then(data => {
    console.log('Finished Setup');
    view.showAgentControls();

// Error Handling
}).catch(e => console.log(e));