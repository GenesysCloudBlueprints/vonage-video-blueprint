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
        document.getElementById("room-container").src = '/room/agent/' + conversationId + '?username=' + username;
    },

    /**
     * Hides the OpenTok iframe that displays meeting rooms
     */
    hideIframe(){
        document.getElementById("room-container").src = '';
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
        var elementExists = !!document.getElementById("room-container").contentWindow.document.getElementById("btnSendURL");

        if(!elementExists) {
            var sendURL = document.createElement("button");
            sendURL.id = "btnSendURL";
            sendURL.innerHTML = 'Send Video URL';
            sendURL.addEventListener('click', function(event) {
                sendMessage('https://localhost/room/customer/' + conversationId + '?username=' + userName, conversationId, communicationId);
            });
            document.getElementById("room-container").contentWindow.document.getElementById("button-container").appendChild(sendURL);
        }        
    },

    /**
     * Removes the Send Video URL Button
     */
    removeVideoURLButton(){
        document.getElementById("room-container").contentWindow.document.getElementById("btnSendURL").remove();
    }
}