const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const message = document.getElementById('message')

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