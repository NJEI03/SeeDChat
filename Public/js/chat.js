const socket = io();
// Getting the fields from the front end 
const form = document.getElementById('form');
const input = document.getElementById('text');
const currentTime = new Date().toLocaleTimeString();
const Friend = document.getElementById('messages1');

const searchInput = document.getElementById('search');
const searchButton = document.getElementById('searchButton');
const resultContainer = document.getElementById('messages'); // Element to display the result

searchButton.addEventListener('click', () => {
    const username = searchInput.value.trim();
    fetch(`/search?username=${username}`)
        .then(response => {
            if (!response.ok) {
                const errorMessage = document.createElement('p');
                errorMessage.textContent = 'User not found';
                resultContainer.appendChild(errorMessage);
                return;
            }
            return response.json();
        })
        .then(data => {
            // User found, append username and profile image
            const profileImagePath = data.profileImage;
            const imageUrl = window.location.origin + '/uploads/' + profileImagePath;
            // local storage
            localStorage.setItem('UserData', JSON.stringify(data))

            const profileContainer = document.createElement('div');
            profileContainer.classList.add('profile-container');
            profileContainer.innerHTML = `
                <img src="${imageUrl}" alt="${username}'s profile" class="profile-image" onerror="this.onerror=null; this.src='placeholder.png';">
                <p class="profile-name">${username}</p>
            `;
            resultContainer.appendChild(profileContainer);
        })
        .catch(error => {
            console.error('Error searching for user:', error);
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Error searching for user';
            resultContainer.appendChild(errorMessage);
        });

});
// checking if the user is found in the local storage
document.addEventListener('DOMContentLoaded', () => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
        const data = JSON.parse(storedUserData);
        // 
        const profileImagePath = data.profileImage;
        const imageUrl = window.location.origin + '/uploads/' + profileImagePath;

        resultContainer.innerHTML = `
        <img src="${imageUrl}" alt="${username}'s profile" class="profile-image" onerror="this.onerror=null; this.src='placeholder.png';">
        <p class="profile-name">${data.username}</p>
    `;
    }
})
fetch('db.json')
    .then(response => response.json())
    .then(data => {
        const name = data.username;

        document.getElementById('user-Info-Header').innerHTML += `< p class="connected" > ${name}</ > `;
        document.getElementById("chats").innerHTML = `< p class="joined" > You joined at ${currentTime}</ > `;
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
            const item = (msg.name == name) ? `< p class="chat-message right" > You : ${msg.msg} <span class="timeStamp">${currentTime}</span>` : ` < p class="chat-message" > ${msg.name} : ${msg.msg} <span class="timeStamp">${currentTime}</span>`
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
            document.getElementById('messages').innerHTML += `< p class="user-connected" > ${name} connected</ > `;
        });

        // User disconnected
        socket.on('userDisconnected', name => {
            console.log("disconnected ", name)
            document.getElementById('messages').innerHTML += `< p class="user-connected" > ${name} disconnected</ > `;
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
