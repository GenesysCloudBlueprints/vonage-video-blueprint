import controller from './notifications-controller.js';
import view from './view.js';

// Obtain a reference to the platformClient object
const platformClient = require('platformClient');
const client = platformClient.ApiClient.instance;

// API instances
const usersApi = new platformClient.UsersApi();
const conversationsApi = new platformClient.ConversationsApi();

let userMe = null;
let currentConversation = null;
let activeConversations = [];
// array of conv ids that are currently in the process of registering.
// helps debounce when multiple duplicate notifications come in.
let inProcessConversations = []; 

/**
 * Add conversation to global activeConversatoins and 
 * add it to the page in the navbar
 * @param {String} conversationId Genesys Cloud conversationId
 */
function registerConversation(conversationId){
    // If already in process then ignore
    if(inProcessConversations.find(id => id == conversationId)) return;
    inProcessConversations.push(conversationId);
    
    view.hideErrorIframe();

    return conversationsApi.getConversation(conversationId)
    .then((data) => {
        addConversationAsTab(data);
        activeConversations.push(data);

        // Remove from inprocess
        let idx = inProcessConversations.findIndex(id => id == conversationId);
        inProcessConversations.splice(idx, 1);
    });
}

/**
 * Remove conversation from global activeConversatoins and 
 * add remove from navbar
 * @param {String} conversationId Genesys Cloud conversationId
 */
function deregisterConversation(conversationId){
    // If already in process then ignore
    if(inProcessConversations.find(id => id == conversationId)) return;
    inProcessConversations.push(conversationId);

    let index = activeConversations.indexOf(conversationId);
    if (index > -1) {
        activeConversations.splice(index, 1);
    }
    view.removeRoom(conversationId);

    // Remove from inprocess
    let idx = inProcessConversations.findIndex(id => id == conversationId);
    inProcessConversations.splice(idx, 1);
}

/**
 * Add OpenTok Session ID in conversation notes
 * @param {String} conversationId 
 * @param {String} participantId 
 */
function patchConversation(conversationId, participantId, sessionId){
    // Just return if no session started in vonage
    if(!sessionId) return;

    let body = {'wrapup' : {
                        'code' : '',
                        'name' : '',
                        'notes' : 'OpenTok Session ID: ' + sessionId
                    }
                };

    return conversationsApi.patchConversationParticipant(conversationId, participantId, body);
}

/**
 * Get Vonage session assosciated witht he conversation
 * @param {String} conversationId 
 */
function getSessionId(conversationId){
    let sessionId = null;
    let iframeContainer = document.getElementById(`${conversationId}-room`)

    // Get session ID if it still exists
    if(iframeContainer){
        let roomIframe = iframeContainer.querySelectorAll('iframe')[0];
        sessionId = roomIframe.contentWindow['sessionId'];
    }
    
    return sessionId;
}

/**
 * Get current active conversations
 */
function processActiveConversations(){
    return conversationsApi.getConversations()
    .then((data) => {
        let promiseArr = [];        

        if(data.entities.length == 0) {
            view.showErrorIframe('No Active Interaction');
        } else {
            data.entities.forEach((conv) => {
                promiseArr.push(registerConversation(conv.id));
            });
        }
    })
}

/**
 * Add the conversation into the page as a tab
 * @param {Object} conversation 
 */
function addConversationAsTab(conversation){
    let customer = conversation.participants.find(p => p.purpose == 'customer');
    let tabName = customer.name ? customer.name : 'Conversation';

    view.addRoom(conversation.id, tabName, userMe.name, 
        // When tab is clicked switch the active conversation to this one
        () => {
            currentConversation = conversation;

            // Check if vonage is activated to show/hide agent controls
            if(conversation.vonageActive){
                view.showAgentControls();
            }else{
                view.hideAgentControls();
            }
        }, 
        // When start vonage button is clicked add a property to the conversation
        () => {
            conversation.vonageActive = true;
            view.showAgentControls();
        }
    );
}

/**
 * Set-up the channel for conversations
 */
function setupChannel(){
    return controller.createChannel()
    .then(data => {
        // Subscribe to conversation notifications
        return controller.addSubscription(
            `v2.users.${userMe.id}.conversations`,

            // Callback function
            (data) => {
                console.log(data);
                let conversation = data.eventBody;
                let participants = conversation.participants;
                let conversationId = conversation.id;
                let agentParticipant = participants.find(
                    p => p.purpose == 'agent');
                let customerParticipant = participants.find(
                    p => p.purpose == 'customer');

                    
                // Ignore if email
                if(agentParticipant.emails) return;

                // Value to determine if conversation is already taken into account before
                let isExisting = activeConversations.map((conv) => conv.id)
                                    .indexOf(conversationId) != -1;

                // Once agent is connected, create a room and a session
                if(agentParticipant.connectedTime && 
                        !agentParticipant.endTime && 
                        !isExisting
                    ){
                    // Add conversationid to existing conversations array
                    return registerConversation(conversationId);
                }

                // If chat has ended display meeting has ended
                if(agentParticipant.endTime && isExisting){
                    // Add OpenTok Session ID in conversation notes
                    let sessionId = getSessionId(conversationId);
                    
                    deregisterConversation(conversationId)

                    if(sessionId){
                        patchConversation(conversationId, customerParticipant.id, sessionId)
                        .catch(e => console.error(e));
                    }

                    view.showErrorIframe('No Active Interaction');
                    view.hideAgentControls();
                }
            });
    });
}

/**
 * Generate the invitation message that's sent ot the customer
 */
function getInvitationMessage(){
    const conversationId = currentConversation.id
    const customerParticipant = currentConversation.participants.find(p => 
        p.purpose == 'customer');
    const customerName = customerParticipant.name || '<No Name>';
    const message = `Please join my Vonage Video Room at: https://localhost/room/customer/${conversationId}?username=${encodeURIComponent(customerName)}`;
    
    return message;
}

/**
 * Send the link to the room in the chat if interaction is chat.
 */
function sendLinkToChat(){
    let conversationId = currentConversation.id
    let communicationId = '';

    view.showInfoModal('Sending Link...');

    // Check if the conversation is chat, if not show a message
    // TODO: Use currentconersation
    return conversationsApi.getConversation(conversationId)
    .then((data) => {
        let customerParticipant = data.participants.find(p => 
            p.purpose == 'customer');
        let agentParticipant = data.participants.find(p => 
            p.purpose == 'agent');
        let customerName = customerParticipant.name || '<No Name>';


        // Determine if the conversation is a chat by checking 'chats' 
        // property of the agent participant
        if(!agentParticipant || !agentParticipant.chats) {
            view.showInfoModal('Sorry. This conversation is not a Webchat.');
            return null;
        }        
        let chats = agentParticipant.chats;

        // Get last id just in case there are multiple
        communicationId = chats[chats.length - 1].id;

        // Send the chat message
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

/**
 * Send chat link to email
 * @param {String} address email address
 */
function sendLinkToEmail(address){
    view.hideEmailModal();
    view.showInfoModal('Sending Link...');

    const queueId = '4750048b-1994-41d4-8410-a5760c49a6cd';

    const emailConvBody = {
        queueId: '4750048b-1994-41d4-8410-a5760c49a6cd',
        provider: 'PureCloud Email',
        toAddress: address,
        direction: 'OUTBOUND'
    }

    const emailBody = {
        to: [
           {
              email: address
           }
        ],
        subject: 'Vonage Room Invitation',
        textBody: getInvitationMessage()
    }

    let conversationId = '';

    return conversationsApi.postConversationsEmails(emailConvBody)
    .then((data) => {
        conversationId = data.id;

        return conversationsApi
                .postConversationsEmailMessages(conversationId, emailBody);
    })
    .then((data) => {

        return conversationsApi.getConversation(conversationId);
    })
    .then((conversation) => {
        let agent = conversation.participants.find(p => p.purpose == 'agent');

        return conversationsApi
                .patchConversationsEmailParticipant(conversationId, agent.id, {
                    state: 'disconnected',
                    wrapupSkipped: true
                })
    })
    .then(() => {
        view.showInfoModal('Link sent!');
    })
    .catch((e) => console.error(e));
}

/**
 * Send link through server sms
 * @param {String} address 
 */
function sendLinkToSMS(address){
    view.hideSMSModal();
    view.showInfoModal('Sending Link...');

    return fetch('https://localhost/sendlinktosms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            conversationId: currentConversation.id,
            address: address,
            message: getInvitationMessage()
        })
    })
    .then(response => response.json())
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

document.getElementById('btn-send-email')
    .addEventListener('click', () => {
        let email = document.getElementById('inputEmail').value;
        sendLinkToEmail(email)
        .then(() => view.showInfoModal('Successfully sent link!'));
    })

document.getElementById('btn-send-sms')
    .addEventListener('click', () => {
        let address = document.getElementById('inputSMS').value;
        sendLinkToSMS(address)
        .then((data) => {
            if(data.success) view.showInfoModal('Successfully sent link!');
        });
    })
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
}).then(data => {
    userMe = data;

    // Get current conversations
    return processActiveConversations();
}).then(() => { 
    // Create the channel conversation notifications
    return setupChannel();
}).then(data => {
    console.log('Finished Setup');

// Error Handling
}).catch(e => console.log(e));