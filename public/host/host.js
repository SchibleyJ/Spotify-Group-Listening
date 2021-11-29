
    let currentCode;
    const updateRoom = (deleteCode) => {
        let newCode = document.getElementById("lobbyCode").value;
        if (isNaN(parseInt(newCode))) {
            document.getElementById("lobbyCode").value = null;
            alert("Invalid room ID.")
        } else {
            console.log('here')
            fetch(`${window.location.origin}/update`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "code": newCode, "delete_code": deleteCode, "access_token": getCookie('access_token'), "refresh_token": getCookie('refresh_token') })
            }).then(res => {
                return res.json();
            }).then(data => {
                if (data.valid_req) {
                    currentCode = document.getElementById("lobbyCode").value;
                } else {
                    document.getElementById("lobbyCode").value = null;
                    alert("That room ID is already being used.")
                }
            });
        }
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

    document.querySelector('input').addEventListener('change', () => { updateRoom(currentCode) });

    window.onbeforeunload = function () {
        updateRoom(currentCode)
        return null;
    };
