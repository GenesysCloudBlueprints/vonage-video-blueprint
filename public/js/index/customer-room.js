// Calls agentChecker function every 5 seconds
var timer = setInterval(agentChecker, 5000);

/**
 * Close customer page when agent disconnects
 */
function agentChecker() {
    var div = document.getElementById('subscribers');

    if (!div) {
        window.close();
    }
}