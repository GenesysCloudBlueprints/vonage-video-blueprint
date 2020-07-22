const platformClient = require('platformClient');
const conversationsApi = new platformClient.ConversationsApi();


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
     * Show the error page with the optional message
     * @param {String} message 
     */
    showErrorIframe(message){
        let iframe = document.getElementById('room-container');
        iframe.src = `error?message=${message}`;
    },

    showEmailModal(){
        $('#emailModal').modal('show');
    },

    showSMSModal(){ 
        $('#smsModal').modal('show');
    },

    /**
     * 
     * @param {String} message message in modal
     * @param {boolean} cancellable default = true. 
     *                  If can be close with esc or clicking in backdrop
     */
    showInfoModal(message, cancellable){
        if(!cancellable) cancellable = true;

        document.getElementById('infoModalText').textContent = message;
        $('#infoModal').modal({
            backdrop: cancellable? true : 'static',
            show: true,
            keyboard: cancellable
        });
    },

    hideInfoModal(){
        $('#infoModal').modal('hide');
    },

    showAgentControls(){
        document.getElementById('agent-controls').style.display = 'block';
    },

    hideAgentControls(){
        document.getElementById('agent-controls').style.display = 'none';
    }
}