const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const message = document.getElementById('message')
const currentTime = new Date().toLocaleTimeString();


document.getElementById("messages2").innerHTML = `<p class="joined">You joined at ${currentTime}</p>`;
socket.emit('new-user', name)

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = " ";
    }

});


socket.on('chat message', (msg) => {
    const item = document.createElement("li");
    item.textContent = msg;
    message.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight)

})

socket.on('chat message', (msg) => {
    console.log("msgs : ", msg)
    // i.e You : hello how are  u
    let user = msg.name == name ? "You" : msg.name


    const item = (msg.name == name) ? `<p class="chat-message right">You : ${msg.msg} <span class="timeStamp">${currentTime}</span>` : `<p class="chat-message">${msg.name} : ${msg.msg} <span class="timeStamp">${currentTime}</span>`
    document.getElementById("messages").innerHTML += item;
    console.log(item)
});