module.exports = {
    expressPort: 443,
    testMode: false, 

    vonage: {
        apiKey: '',
        apiSecret: ''
    },

    genesysCloud: {
        // Genesys Cloud region
        // eg. 'mypurecloud.ie', 'euw2.pure.cloud', etc...
        region: 'mypurecloud.com',

        // Client Credentials OAuth
        clientId: '',
        clientSecret: ''
    }
}