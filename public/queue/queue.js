let currentSearchData;

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
            for (let i = 0; i < 5; i++) {
                document.getElementById(`song${i}picture`).src = './img/temp.png';
                document.getElementById(`song${i}name`).innerHTML = null;
                document.getElementById(`song${i}artists`).innerHTML = null;
            }
            document.getElementById('search-info-p').innerHTML = "Song successfully queued.";
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
            currentSearchData = data;
            for (let i = 0; i < data.length; i++) {
                document.getElementById(`song${i}picture`).src = data[i].image;
                document.getElementById(`song${i}name`).innerHTML = shorten(data[i].name);
                document.getElementById(`song${i}artists`).innerHTML = shorten(data[i].artists.join(', '));
            }
            document.getElementById('search-info-p').innerHTML = "Showing top 5 results:";
        });
    }

    const search = () => {
        getSearchResults(document.getElementById('search').value);
        document.getElementById('search').value = null;
    }

    const shorten = (text) => {
        if (text.length > 20) {
            return text.substring(0, 20) + "...";
        } else {
            return text
        }

    }

    const clearsearch = () => {
        if (document.getElementById('search-info-p').innerHTML[1] == "o")
        document.getElementById('search-info-p').innerHTML = "";
    }