const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('text');
const message = document.getElementById('messages');
const currentTime = new Date().toLocaleTimeString();
const Friend = document.getElementById('messages1');


fetch('db.json')
    .then(response => response.json())
    .then(data => {
        const name = data.username;

        document.getElementById('user-Info-Header').innerHTML += `<p class="connected">${name}</p>`;
        document.getElementById("chats").innerHTML = `<p class="joined">You joined at ${currentTime}</p>`;
        socket.emit('new-user', name);


        // Send chat message
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (input.value) {
                socket.emit('chat message', input.value);
                input.value = '';
            }
        });

        // Receive chat message
        socket.on('chat message', (msg) => {
            console.log("msgs : ", msg)
            let user = msg.name == name ? "You" : msg.name
            const item = (msg.name == name) ? `<p class="chat-message right">You : ${msg.msg} <span class="timeStamp">${currentTime}</span>` : `<p class="chat-message">${msg.name} : ${msg.msg} <span class="timeStamp">${currentTime}</span>`
            document.getElementById("chats").innerHTML += item;
            console.log(item)
        });

        // Disconnect button
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

        // User connected
        socket.on('user-connected', name => {
            console.log("connected", name)
            document.getElementById('messages').innerHTML += `<p class="user-connected">${name} connected</p>`;
        });

        // User disconnected
        socket.on('userDisconnected', name => {
            console.log("disconnected ", name)
            document.getElementById('messages').innerHTML += `<p class="user-connected">${name} disconnected</p>`;
        });

        // Display typing
        function displayTyping(username, isTyping) {
            const typingStatus = document.getElementById("typing-status")

            if (isTyping) {
                typingStatus.style.visibility = "visible"
                let typer = username == username ? "" : `${username} is typing`
                typingStatus.textContent = typer;
            } else {
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
        });

        // Handle typing events
        input.addEventListener('keyup', handleTyping);
    })
    .catch(error => {
        console.error('Error fetching username:', error);

    });