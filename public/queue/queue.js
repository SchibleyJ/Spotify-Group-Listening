let currentSearchData = [];

    const getURI = (songNum) => {
        postURI(currentSearchData[songNum].uri);
    }

    const postURI = (uri) => {
        fetch(`${window.location.origin}/queue`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "uri": uri, "code": getCookie('room') })
        }).then(res => {
            for (let i = 0; i < 10; i++) {
                document.getElementById(i + "song").remove();
            }
            document.getElementById('search-info-p').innerHTML = "Song successfully queued.";
            currentSearchData = [];
        });
    }
    const getCookie = (name) => {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    const getSearchResults = (search) => {
        fetch(`${window.location.origin}/search`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "search": search, "code": getCookie('room') })
        }).then(res => {
            return res.json();
        }).then((data) => {
            console.log(data)
            for (let i = 0; i < currentSearchData.length; i++) {
                document.getElementById(i + "song").remove();
            }
            currentSearchData = data;
            
            displayResults(data);
            document.getElementById('search-info-p').innerHTML = `Showing top ${currentSearchData.length} results:`;
        });
    }

    const displayResults = (results) => {
        if ('content' in document.createElement('template')) {
            for (let i = 0; i < 10 && results[i]; i++) {
                let parent = document.getElementById('results');
                let template = document.querySelector('#song-template')
    
                let clone = template.content.cloneNode(true);
                //console.log(clone.children)
                clone.querySelector('.picture').src = results[i].image;
                console.log(clone.querySelector('.song-info'));
                clone.querySelector('.song-info').querySelector('.name').innerHTML = shorten(results[i].name);
                clone.querySelector('.song-info').querySelector('.artists').innerHTML = shorten(results[i].artists.join(', '));
                
                clone.children[0].id = i + 'song';
    
                parent.appendChild(clone);
            }
        }
    }

    const search = () => {
        getSearchResults(document.getElementById('search').value);
        document.getElementById('search').value = null;
    }

    const shorten = (text) => {
        if (text.length > 27) {
            return text.substring(0, 27) + "...";
        } else {
            return text
        }

    }

    const clearsearch = () => {
        if (document.getElementById('search-info-p').innerHTML[1] == "o")
        document.getElementById('search-info-p').innerHTML = "";
    }
    