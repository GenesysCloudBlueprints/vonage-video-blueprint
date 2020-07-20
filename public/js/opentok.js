/* global OT, apiKey, sessionId, token */
// TODO: Move some stuff to view

const elPublisherId = 'publisher';
const elSubscribersId = 'subscribers';
const elShareScreenContainerId = 'share-screen-container';

// Initialize an OpenTok Session object
let session = OT.initSession(apiKey, sessionId);

// Initialize the camera publisher
let publisher = OT.initPublisher(elPublisherId,
{
    name: userName,
    style: { nameDisplayMode: 'on' },
    height: 300,
    width: 300,
});
let screenSharePublisher = null;

// Initial setup for the page
function setup(){  
    document.getElementById(elShareScreenContainerId).style.display = null;
    
    // Event Listeners
    document.getElementById('btnShareScreenStart')
            .addEventListener('click', () => {
        startShareScreen();
    });
    document.getElementById('btnShareScreenStop')
            .addEventListener('click', () => {
        stopShareScreen();
    });
}

function startShareScreen(){
    document.getElementById(elShareScreenContainerId).style.display = null;
    OT.checkScreenSharingCapability(function(response) {
        if(!response.supported || response.extensionRegistered === false) {
            // This browser does not support screen sharing.
        } else if (response.extensionInstalled === false) {
            // Prompt to install the extension.
        } else {
            // Screen sharing is available. Publish the screen.
            //document.getElementById('share-screen-container')

            screenSharePublisher = OT.initPublisher(elShareScreenContainerId,
                {videoSource: 'screen'},
                function(error) {
                    if (error) {
                        console.error(error)
                    } else {
                    session.publish(screenSharePublisher, function(error) {
                        if (error) console.error(error)
                    });
                    }
                }
            );
        }
    });
}

function stopShareScreen(){
    document.getElementById(elShareScreenContainerId).style.display = 'none';
    if(screenSharePublisher) screenSharePublisher.publishVideo(false);
}

// Attach event handlers
session.on({
    // This function runs when session.connect() asynchronously completes
    sessionConnected: function () {
        // Publish the publisher we initialzed earlier (this will trigger 'streamCreated' on other
        // clients)
        session.publish(publisher);
    },

    // This function runs when another client publishes a stream (eg. session.publish())
    streamCreated: function (event) {
        let subOptions = {
            appendMode: 'append'
        };
    
        let parentElementId = event.stream.videoType === 'screen' ?
            'sub-share-screen' :
            'subscribers';
        subscriber = session.subscribe(event.stream, parentElementId, subOptions);

        session.subscribe(event.stream, elSubscribersId, { insertMode: 'append' });
    }
});

setup();
// Connect to the Session using the 'apiKey' of the application and a 'token' for permission
session.connect(token);