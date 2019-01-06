const path = require('path')
const fs = require('fs')

const express = require('express')
const app = express()

const https = require('https')

var certOptions = {
	key: fs.readFileSync(path.resolve(__dirname, './server.key')),
	cert: fs.readFileSync(path.resolve(__dirname, './server.crt'))
}

const server = https.createServer(certOptions, app);
const io = require('socket.io')(server);

const Peer = require('./Peer')

// 设置静态文件目录
app.use(express.static(path.resolve(__dirname, '../static')));

io.on('connection', (socket) => {
	console.log('connection', socket.id)
	let peer = new Peer(socket)
});

server.listen(3000, () => {
	console.info(`start: 3000`)
});