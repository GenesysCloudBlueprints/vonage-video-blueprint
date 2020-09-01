export default {
    showVonageSession(conversationId, agentName){
        let iframe = document.getElementById('conversation-iframe');
        iframe.src = `https://localhost/room/agent/${conversationId}?username=${agentName}`
    },

    /**
     * Show the error page with the optional message
     * @param {String} message 
     */
    showErrorIframe(message){
        let iframe = document.getElementById('error-iframe');
        iframe.style.display = 'block';
        iframe.src = `error?message=${message}`;
    },

    hideErrorIframe(){
        let iframe = document.getElementById('error-iframe');
        iframe.src = '';
        iframe.style.display = 'none';
    },

    showEmailModal(email){
        console.log(email);
        if(email){
            document.getElementById('emailModal')
                .querySelectorAll('input')[0].value = email;
        }
        $('#emailModal').modal('show');
    },

    hideEmailModal(){
        $('#emailModal').modal('hide');
        document.getElementById('emailModal')
            .querySelectorAll('input')[0].value = '';
    },

    showSMSModal(ani){ 
        if(ani){
            document.getElementById('smsModal')
                .querySelectorAll('input')[0].value = ani;
        }
        $('#smsModal').modal('show');
    },

    hideSMSModal(){ 
        $('#smsModal').modal('hide');
        document.getElementById('smsModal')
            .querySelectorAll('input')[0].value = '';
    },


    /**
     * 
     * @param {String} message message in modal
     */
    showInfoModal(message){
        document.getElementById('infoModalText').textContent = message;
        $('#infoModal').modal('show')
    },

    hideInfoModal(){
        $('#infoModal').modal('hide');
    },

    uncheckScreenShare(){
        document.getElementById('share-screen-switch').checked = false;
    }
}   