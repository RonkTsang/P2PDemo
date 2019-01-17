// const path = require('path')
// const fs = require('fs')

// const express = require('express')
// const app = express()

// const https = require('https')

// // var certOptions = {
// // 	key: fs.readFileSync(path.resolve(__dirname, './server.key')),
// // 	cert: fs.readFileSync(path.resolve(__dirname, './server.crt'))
// // }

// // const server = https.createServer(certOptions, app);

// const server = require('http').createServer(app)
// const io = require('socket.io')(server);

// // const Peer = require('./Peer')

// // 设置静态文件目录
// app.use(express.static(path.resolve(__dirname, '../static')));

// io.on('connection', (socket) => {
// 	console.log('connection', socket.id)
// 	// let peer = new Peer(socket)
// });

// server.listen(3000, () => {
// 	console.info(`start: 3000`)
// });

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', function connection(ws) {
	console.log('connection', ws)
  ws.on('message', function incoming(message) {
		console.log('received: %s', message);
		// ws.send('reply: i got the ' + message);
  });

	ws.on('close', function close() {
		console.log('disconnected');
	});

  ws.send(task([{
		module: 'dom',
		method: 'createBody',
		args: {
      ref: 'div1',
      type: 'div',
      attr: {
        id: 'hhh'
      },
     style: {
			 width: 750,
			 height: 600,
			 backgroundColor: 'blue'
		 }
		}
	}]));

	let colors = ['red', 'black', 'white', 'green']
	let count = 3
	function run() {
		let c = colors.shift()
		if (c) {
			setTimeout(() => {
				ws.send(task([{
					module: 'dom',
					method: 'addElement',
					args: [
						'div1',
						{
							ref: 'div' + (count++),
							type: 'div',
							style: {
								width: (count-1) * 100,
								height: 200,
								backgroundColor: c,
								marginTop: '20dp'
							},
							events: ['click']
						},
						-1
					]
				}]))
				run()
			}, 2000)
		}
	}
	run()
});

function task(t) {
	return JSON.stringify(t)
}