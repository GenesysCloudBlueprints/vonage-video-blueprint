const platformClient = require('platformClient');
const conversationsApi = new platformClient.ConversationsApi();

function sendMessage(message, conversationId, communicationId){
    conversationsApi.postConversationsChatCommunicationMessages(
        conversationId, communicationId,
        {
            "body": message,
            "bodyType": "standard"
        }
    )
}

export default {
    /**
     * Shows the OpenTok iframe to display meeting rooms
     * @param {String} conversationId Genesys Cloud conversationId
     * @param {String} username Name of the participant
     */
    showIframe(conversationId, username){
        document.getElementById("room-container").src = '/room/' + conversationId + '?username=' + username;
    },

    /**
     * Display interaction details
     * @param {String} message Message to display
     */
    displayInteractionDetails(message){
        document.getElementById("interaction-message").textContent = message;
    },

    /**
     * Shows the button to send the video URL to the customer
     * @param {String} userName Customer username
     * @param {String} conversationId Genesys Cloud conversationId
     * @param {String} communicationId Agent participant ID
     */
    showVideoURLButton(userName, conversationId, communicationId){
        var elementExists = !!document.getElementById("send-url-button");

        if(!elementExists) {
            var sendURL = document.createElement("button");
            sendURL.innerHTML = 'Send Video URL';
            sendURL.addEventListener('click', function(event) {
                sendMessage('https://localhost/room/' + conversationId + '?uername=' + userName, conversationId, communicationId);
            });

            var sendURLContainer = document.createElement("div");
            sendURLContainer.appendChild(sendURL);
            sendURLContainer.id = "send-url-button";
            sendURLContainer.className = "send-url-button";
            document.getElementById("interaction-details").appendChild(sendURLContainer);
        }        
    }
}