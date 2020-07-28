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
    height: '100%',
    width: '100%',
    showControls: true
});
let screenSharePublisher = null;

// Initial setup for the page
function setup(){  
    document.getElementById(elShareScreenContainerId).style.display = null;

    document.addEventListener('DOMContentLoaded', function () {
        var checkbox = window.parent.document.querySelector('input[type="checkbox"]');

        checkbox.addEventListener('change', function () {
            if (checkbox.checked) {
                startShareScreen();
            } else {
                stopShareScreen();
            }
        });
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

            var publishOptions = {};
            // publishOptions.maxResolution = { width: 1920, height: 1080 };
            publishOptions.videoSource = 'screen';
            publishOptions.fitMode = 'cover';
            publishOptions.width = '100%';
            publishOptions.height = '100%';

            screenSharePublisher = OT.initPublisher(elShareScreenContainerId,
                publishOptions,
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
            appendMode: 'append',
            showControls: true,
            width: '100%',
            height: '100%'
        };
    
        let parentElementId = event.stream.videoType === 'screen' ?
            'sub-share-screen' :
            'subscribers';
        subscriber = session.subscribe(event.stream, parentElementId, subOptions);

        session.subscribe(event.stream, elSubscribersId, { insertMode: 'append' });

        // Hide publisher div when susbcriber joins
        document.getElementById(elPublisherId).style.display = 'none';
    }
});

setup();
// Connect to the Session using the 'apiKey' of the application and a 'token' for permission
session.connect(token);