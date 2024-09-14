let name = prompt("Enter your name : ", "Guest");
const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('text');
const message = document.getElementById('messages')
const currentTime = new Date().toLocaleTimeString();
const Friend = document.getElementById('messages1');

document.getElementById('user-Info-Header').innerHTML += `<p class="connected">${name}</p>`;

document.getElementById("chats").innerHTML = `<p class="joined">You joined at ${currentTime}</p>`;
socket.emit('new-user', name)

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});



socket.on('chat message', (msg) => {
    console.log("msgs : ", msg)
    // i.e You : hello how are  u
    let user = msg.name == name ? "You" : msg.name


    const item = (msg.name == name) ? `<p class="chat-message right">You : ${msg.msg} <span class="timeStamp">${currentTime}</span>` : `<p class="chat-message">${msg.name} : ${msg.msg} <span class="timeStamp">${currentTime}</span>`
    document.getElementById("chats").innerHTML += item;
    console.log(item)
});

//disconnect button
const toggleButton = document.getElementById('toggle-btn');

toggleButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (socket.connected) {
        toggleButton.innerText = 'Connect';
        socket.disconnect();
    } else {
        toggleButton.innerText = 'Disconnect';
        socket.connect();
    }
});


//user connected
socket.on('user-connected', name => {
    console.log("connected", name)
    document.getElementById('messages').innerHTML += `<p class="user-connected">${name} connected</p>`;
})



//disconnectednpm 
socket.on('userDisconnected', name => {
    console.log("disconnected ", name)
    document.getElementById('messages').innerHTML += `<p class="user-connected">${name} disconnected</p>`;
})


//dipslay typing
function displayTyping(username, isTyping) {
    const typingStatus = document.getElementById("typing-status")

    if (isTyping) {
        typingStatus.style.visibility = "visible"
        let typer = username == name ? "" : `${username} is typing`
        typingStatus.textContent = typer;
    }

    else {
        typingStatus.textContent = ''
    }

}

let typingTimeout;

function handleTyping() {
    clearTimeout(typingTimeout)

    typingTimeout = setTimeout(() => {
        socket.emit('typing', false)
    }, 1000)

    socket.emit('typing', true)
}

socket.on('typing', (data) => {
    displayTyping(data.username, data.isTyping)
})