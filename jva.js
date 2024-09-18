import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = http.createServer(app)
const io = new Server(httpServer);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/sugnup.html')
});


httpServer.listen(8000, () => {
    console.log('server running on 8000');
})