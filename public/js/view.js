export default {
    /**
     * Shows the OpenTok iframe to display meeting rooms
     * @param {String} conversationId Genesys Cloud conversationId
     */
    showIframe(conversationId){
        document.getElementById("iframe-container").src = '/room/' + conversationId;
    },

    /**
     * Display interaction details
     * @param {String} message Message to display
     */
    displayInteractionDetails(message){
        document.getElementById("interaction-details").textContent = message;
    }
}