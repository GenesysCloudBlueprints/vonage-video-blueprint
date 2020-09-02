export default {
    showShareScreen(){
        document.getElementById('share-screen-container').style.display = 'block';
        document.querySelectorAll('.stream-container').forEach(n => {
            n.classList.add('smaller-stream');
        });
        // Hide empty share screen message
        document.getElementById('empty-share-screen').style.display = 'none';
    },

    hideShareScreen(){
        document.getElementById('share-screen-container').style.display = 'none';
        document.querySelectorAll('.stream-container').forEach(n => {
            n.classList.remove('smaller-stream');
        });
        // Hide empty share screen message
        document.getElementById('empty-share-screen').style.display = '';
    },

    addPubShareScreen(){
        if(!document.getElementById('pub-share-screen')){
            let container = document.getElementById('share-screen-container');
            let newShareScreen = document.createElement('div');
            newShareScreen.id = 'pub-share-screen';
            container.appendChild(newShareScreen);
        }
    },

    addSubShareScreen(){
        if(!document.getElementById('sub-share-screen')){
            let container = document.getElementById('share-screen-container');
            let newShareScreen = document.createElement('div');
            newShareScreen.id = 'sub-share-screen';
            container.appendChild(newShareScreen);
        }
    },

    isAnyoneSharing(){
        let container = document.getElementById('share-screen-container');
        return container && container.childElementCount > 0;
    }
}