/**
 * Deactivate the bootstrap nav for the manual activation
 */
function deactivateTabs(){
    // Gete references
    let tabContainer = document.getElementById('conversations-tab');
    let contentContainer = document.getElementById('conversation-iframes');
    
    contentContainer.querySelectorAll('.tab-pane').forEach(c => {
        c.classList.remove('active');
        c.classList.remove('show');
    });

    tabContainer.querySelectorAll('a').forEach(c => {
        c.classList.remove('active');
    });
}

export default {
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

    showEmailModal(){
        $('#emailModal').modal('show');
    },

    showSMSModal(){ 
        $('#smsModal').modal('show');
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

    showAgentControls(){
        document.getElementById('agent-controls').style.display = 'block';
    },

    hideAgentControls(){
        document.getElementById('agent-controls').style.display = 'none';
    },

    /**
     * Add a room to the navbar
     * @param {String} conversationId 
     * @param {String} tabName 
     * @param {String} agentName 
     * @param {Function} onClick 
     */
    addRoom(conversationId, tabName, agentName, onClick){
        let newTabId = conversationId + '-tab';
        let newRoomId = conversationId + '-room';

        // Gete references
        let tabContainer = document.getElementById('conversations-tab');
        let contentContainer = document.getElementById('conversation-iframes');

        // Get templates
        let tabTemp = document.getElementById('tab-template');
        let roomTemp = document.getElementById('room-template');

        // Create clones
        let tabClone = tabTemp.content.cloneNode(true);
        let roomClone = roomTemp.content.cloneNode(true);

        // COnfigure IDs  
        tabClone.querySelectorAll('.nav-item')[0].id = newTabId;
        roomClone.querySelectorAll('.tab-pane')[0].id = newRoomId;
        
        // Configure tab name
        let tabAnchor = tabClone.querySelectorAll('.nav-link')[0]
        tabAnchor.textContent = tabName;

        // Add to page
        tabContainer.appendChild(tabClone);
        contentContainer.appendChild(roomClone);

        // New references
        let newTab = document.getElementById(newTabId);
        let newRoom = document.getElementById(newRoomId);

        // Manual activation of tabs because somehow Bootstrap way doesn't work 
        // with the dynamic navs :'(
        newTab.addEventListener('click', () => {
            deactivateTabs();

            // Activate tab
            newTab.querySelectorAll('a')[0].classList.add('active');

            // Activate content
            newRoom.classList.add('active');
            newRoom.classList.add('show');
        });
        if(onClick) newTab.addEventListener('click', onClick);

        // Configure the content behavior
        let iframe = newRoom.querySelectorAll('.room-iframe')[0];
        let btnStartRoom = newRoom.querySelectorAll('.btn-start-room')[0];
        btnStartRoom.addEventListener('click', () => {
            btnStartRoom.style.display = 'none';
            iframe.style.display = 'block';
            iframe.src = `https://localhost/room/agent/${conversationId}?username=${agentName}`;
        });
    },

    removeRoom(conversationId){
        let tabId = conversationId + '-tab';
        let roomId = conversationId + '-room';

        document.getElementById(tabId).remove();
        document.getElementById(roomId).remove();
    }
}   