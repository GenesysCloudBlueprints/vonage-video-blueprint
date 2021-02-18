const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const app = express();
const config = require('./config.js');
const port = config.expressPort;
const vonageApp = require('./vonage-server-app.js')

// Web server
const sslOptions = {
    key: fs.readFileSync('https-requirements/localhost.key'),
    cert: fs.readFileSync('https-requirements/localhost.crt'),
    ca: fs.readFileSync('https-requirements/ca.crt'),
    requestCert: true,
    rejectUnauthorized: false
};
const httpsServer = https.createServer(sslOptions, app);

// Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize the express app
app.use(express.static(__dirname + '/public')); //

// set the view engine to ejs
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    res.render('index.ejs', {
        redirectUri: 'https://localhost/'
    });
});

// Create a session if not yet created
app.get('/room/agent/:conversation_id', async (req, res) => {
    let conversation_id = req.params.conversation_id;
    let userName = req.query.username || 'N/A';

    vonageApp.createRoom(conversation_id, userName)
    .then((data) => {
        res.render('agent-room.ejs', data);
    })
    .catch((e) => {
        res.render('error.ejs', {});
    })
});

// Create room for customer participant
app.get('/room/customer/:conversation_id', async (req, res) => {
    let conversation_id = req.params.conversation_id;
    let userName = req.query.username || 'N/A';

    vonageApp.createRoom(conversation_id, userName)
    .then((data) => {
        res.render('customer-room.ejs', data);
    })
    .catch((e) => {
        res.render('error.ejs', {});
    })
});

app.get('/error', (req, res) => {
    res.render('error.ejs', {});
});

// API for sending Vonage Video link via SMS
app.post('/sendlinktosms', async (req, res) => {
    vonageApp.sendSMS(req.body)
    .then(() => {
        res.status(200).send({success: true});
    })
    .catch((err) => {
        console.log(err);
        res.status(400);
    })
})


httpsServer.listen(port, () => {
    console.log(`Example app listening at https://localhost:${port}`);
    console.log(`Test Mode: ${config.testMode ? 'ON' : 'OFF'}`);
});

