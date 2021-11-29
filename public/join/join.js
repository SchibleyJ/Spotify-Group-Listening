const joinRoom = () => {
    console.log('here')
    fetch(`${window.location.origin}/join`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "code": document.getElementById("lobbyCode").value })
    }).then(res => {
        return res.json();

    }).then(data => {
        console.log(data)
        if (data.room_exists) {
            console.log('here')
            window.location.href = "/queue";
        } else {
            alert("That room doesn't exist.")
            document.getElementById("lobbyCode").value = null;
        }
    }

    );
}