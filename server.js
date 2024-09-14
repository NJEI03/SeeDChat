import express from 'express';
import { createServer } from 'node:http';
import path, { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
// declaring the variables
const app = express();
const server = createServer(app)
const __dirname = dirname(fileURLToPath(import.meta.url))
const io = new Server(server, {
    connectionStateRecovery: {}
})
// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));


// router 
app.get('/login', (req, res) => {
    res.redirect(__dirname + 'pages/login.html')

})

// app.get('/SignUp', (req, res) => {
//     res.sendFile(path.join(__dirname, 'signup.html'))

// })


app.get('/SeedChat', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'))
    // res.send("Hello am running")
})
io.on('connection', (Socket) => {
    Socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});
// server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
})