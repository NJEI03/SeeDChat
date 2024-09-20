import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'node:http'


const app = express();
const server = createServer(app);
const io = new Server(server, { connectionStateRecovery: {} });



const users = {}

const chatting = io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('new-user', name => {
        users[socket.id] = name
        socket.broadcast.emit('user-connected', name)
        console.log('user-connected : ', name)
    })
    socket.on('chat message', (msg) => {
        console.log("message :  " + msg)
        io.emit('chat message', { msg: msg, name: users[socket.id] });
        socket.broadcast.emit(msg)
    })

    //disconnect

    socket.on('disconnect', () => {
        socket.broadcast.emit('userDisconnected', users[socket.id])
        delete users[socket.id]
    })


    //typing status
    socket.on('typing', (isTyping) => {
        io.emit('typing', { username: users[socket.id], isTyping })
    })


});


export { chatting }
