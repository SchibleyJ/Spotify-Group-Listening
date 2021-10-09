const http = require('http');
const express = require('express');
const app = express();
const port = 8080;
const request = require('request');
const { URLSearchParams } = require('url');

app.use(express.static(__dirname + '/public'));
app.use(express.json());

let client_id = 'd417aaa0e7e34ec688d8452b2b7a176c'; // Your client id
let client_secret = 'abeaaa85bb3547df8ea3fbfc4c6aafc5'; // Your secret
let redirect_uri = 'http://localhost:8080/callback'; // Your redirect uri


let tokens = {};


app.get('/login', (req, res) => {

    let scope = 'user-read-private user-read-email user-modify-playback-state';
    let params = new URLSearchParams(
        {
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri
        }).toString();

    res.redirect('https://accounts.spotify.com/authorize?' +
        params
    );
})

app.get('/callback', function (req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {

            var access_token = body.access_token,
                refresh_token = body.refresh_token;

            var options = {
                url: 'https://api.spotify.com/v1/me',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
            };

            // use the access token to access the Spotify Web API
            request.get(options, function (error, response, body) {
                //console.log(body);
            });

            // we can also pass the token to the browser to make requests from there
            let params = new URLSearchParams({
                access_token: access_token,
                refresh_token: refresh_token
            }).toString();
            res.redirect('/form?' +
                params);
        } else {
            let params = new URLSearchParams({
                error: 'invalid_token'
            }).toString();
            res.redirect('/form#' +
                params);
        }
    });
});

app.get('/refresh_token', function (req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});

app.get('/form', (req, res) => {
    // maybe make room id here?
    // then can save it to object

    //res.sendFile(__dirname + '/public/index.html')
    res.cookie('access_token', req.query.access_token)
    res.cookie('refresh_token', req.query.refresh_token)

    res.redirect('/host');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
});
app.get('/queue', (req, res) => {
    res.sendFile(__dirname + '/public/queue.html')
});

app.get('/host', (req, res) => {
    res.sendFile(__dirname + '/public/host.html')
});


app.get('/join', (req, res) => {
    res.sendFile(__dirname + '/public/join.html')
})

app.post('/join', (req, res) => {
    let code = req.body.code;
    res.cookie('room', code)
    console.log('here')
    res.redirect('/queue');
})


app.post('/queue', (req, res) => {
    let uri = req.body.uri;
    let code = req.body.code;
    var options = {
        url: `https://api.spotify.com/v1/me/player/queue?uri=${uri}`,
        headers: {
            'Authorization': 'Bearer ' + tokens[code]["access_token"]
        },
        json: true
    };

    console.log('sent')
    request.post(options, (err, response, body) => {
        res.send('test')

    })
});

app.post('/update', (req, res) => {
    let code = req.body.code;
    let access_token = req.body.access_token;
    let refresh_token = req.body.refresh_token;
    tokens[code] = {
        'access_token': access_token,
        'refresh_token': refresh_token
    }
    console.log(tokens);
    res.send('sent');

});


app.listen(port, () => {
    console.log(`Listening at port ${port}`);
});