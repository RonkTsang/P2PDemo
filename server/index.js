const path = require('path')

const express = require('express')
const app = express()

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const Peer = require('./Peer')

// 设置静态文件目录
app.use(express.static(path.resolve(__dirname, '../static')));

io.on('connection', (socket) => {
    console.log('connection', socket.id)
    socket.on('join', (data) => {
        let peer = new Peer(socket, data)
    })

    io.emit('reply', 'reply from server');
});

server.listen(3000, () => {
    console.info(`start: 3000`)
});