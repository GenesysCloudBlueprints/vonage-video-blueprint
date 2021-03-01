module.exports = {
    expressPort: 443,
    testMode: false, 
    appURI: 'https://localhost/',


    vonage: {
        apiKey: '',
        apiSecret: ''
    },

    genesysCloud: {
        // Genesys Cloud region
        // eg. 'mypurecloud.ie', 'euw2.pure.cloud', etc...
        region: 'mypurecloud.com',

        // Implicit Grant Client ID
        // Used by the web app itself in authorizing the Genesys Cloud agent
        implicitGrantID: '',

        // Client Credentials OAuth
        // For authorizing the server app
        clientID: '',
        clientSecret: '',

        // Required when sending invitation through email, 
        // the outbound email will go through this ACD queue. 
        emailQueueID: '',

        // Required when sending invitation through SMS
        // This number should be purchased by the Genesys Cloud organization.
        smsFromAddress: '', // eg +13175550000
    }
}
