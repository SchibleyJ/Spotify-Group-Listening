require('dotenv').config();
/* 
 *  TODO:
 *
 * 
 * 2. Reformat all CSS to use the grid layout.  This includes fixing all .css files
 * to actually align with the current .html files instead of still having chess
 * reminance.  CSS should be primarily focused on mobile.
 * 
 * 3. Add features to the rooms to prevent people from creating rooms "over" eachother.
 * Also, add "end room" feature for host to remove his room from the stored state.
 * 
 * 
 */

const axios = require('axios').default;
const express = require('express');
const app = express();
const port = 8080;
const { URLSearchParams } = require('url');
//console.log(process.env.CLIENT_ID)
app.use(express.static(__dirname + '/public'));
app.use(express.json());

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.SECRET_ID;;
const redirect_uri = 'http://localhost:8080/callback';


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

    let code = req.query.code || null;
    axios.post('https://accounts.spotify.com/api/token',
        new URLSearchParams({
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        }).toString(),
        {
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    ).then(response => {
        if (response.status === 200) {

            let params = new URLSearchParams({
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token
            }).toString();

            res.redirect('/form?' +
                params);
        } else {
            console.log(response)
        }

    }).catch(err => {
        console.log(err);
    })

});

app.get('/refresh_token', function (req, res) {

    // requesting access token from refresh token
    let refresh_token = req.query.refresh_token;

    axios.get('https://accounts.spotify.com/api/token',
        new URLSearchParams({
            refresh_token: refresh_token,
            grant_type: 'authorization_code'
        }).toString(),
        {
            headers:
            {
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    ).then(response => {
        if (response.status === 200) {
            let access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    }).catch(err => {
        console.log(err)
    });

});

app.get('/form', (req, res) => {
    res.cookie('access_token', req.query.access_token, {secure: false, httpOnly: false })
    res.cookie('refresh_token', req.query.refresh_token, {secure: false, httpOnly: false })
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
    if (tokens[code]) {
        res.cookie('room', code, {secure: false, httpOnly: false });
        res.send(JSON.stringify({ room_exists: true }));
    } else {
        res.send(JSON.stringify({ room_exists: false }));
    }

})


app.post('/queue', (req, res) => {
    let uri = req.body.uri;
    let code = req.body.code;
    // i dont understand why the uri must be put in the actual url here rather than
    // as URLSearchParams, i think its something to do with how it's parsed but
    // i cannot pass it in unparsed either

    //for demo purposes lol
    if (code == null) {
        code = "abc";
    }

    axios.post(`https://api.spotify.com/v1/me/player/queue?uri=${uri}`,
        null,
        {
            headers: {
                'Authorization': 'Bearer ' + tokens[code]["access_token"],
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    ).then(response => {
        res.send('done')
    }).catch(err => {
        console.log(err)
    });
});

app.post('/update', (req, res) => {
    let code = req.body.code;
    let delete_code = req.body.delete_code;
    let access_token = req.body.access_token;
    let refresh_token = req.body.refresh_token;
    if (tokens[code] && code !== delete_code) {
        res.send(JSON.stringify({valid_req: false}));
    } else {
        if (code) {
            tokens[code] = {
                'access_token': access_token,
                'refresh_token': refresh_token
            }
        }
        if (delete_code) {
            delete tokens[delete_code];
        }
        res.send(JSON.stringify({valid_req: true}));
    }
});

app.post('/search', (req, res) => {
    let code = req.body.code;
    let search = req.body.search;
    //for demo purposes lol
    if (code == null) {
        code = "abc";
    }
    axios.get(`https://api.spotify.com/v1/search?q=${search}&type=track&market=US&limit=5`,
        {
            headers: {
                'Authorization': 'Bearer ' + tokens[code]["access_token"],
                'Conent-Type': 'application/json'
            }
        }).then(response => {
            let body = response.data;
            let songResponse = [];
            for (let i = 0; i < body.tracks.items.length; i++) {
                console.log(body.tracks.items[i].name);
                songResponse.push(
                    {
                        'name': body.tracks.items[i].name,
                        'artists': [],
                        'album': body.tracks.items[i].album.name,
                        'image': body.tracks.items[i].album.images[0].url,
                        'uri': body.tracks.items[i].uri
                    }
                )
                for (let j = 0; j < body.tracks.items[i].artists.length; j++) {
                    songResponse[songResponse.length - 1].artists.push(body.tracks.items[i].artists[j].name)
                }
            }
            res.send(JSON.stringify(songResponse));
        }).catch(err => {
            console.log(err)
        });;

})


app.listen(port, () => {
    console.log(`Listening at port ${port}`);
});