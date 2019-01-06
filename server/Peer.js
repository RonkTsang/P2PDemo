const TYPE = require('./TYPE')

let peers = {}

let joinLs = {}

class Peer {
	constructor(socket, data) {
		this.socket = socket
		this.id = socket.id
		if (data) this.data = data
		peers[this.id] = this
		data && (this.name = data.name)
		this.listen()
		this.sendTYPE()
	}
	static ls() {
		return Object.keys(peers)
	}
	static getPeer(id) {
		return peers[id]
	}
	static getPeerByName(name) {
		let id = joinLs[name]
		return peers[id]
	}
	join({ name }) {
		console.log(` ${name} join ! `)
		this.name = name
		joinLs[name] = this.id
		this.emit(TYPE.ACK, { success: true })
	}
	candidate({ to, candidate }) {
		console.log(`${this.name} Sending candidate to ${to}`)
		const toPeer = Peer.getPeerByName(to)
		toPeer && toPeer.emit(TYPE.CANDIDATE, {
			from: this.name,
			candidate
		})
	}
	offer({ to, offer }) {
		console.log(`${this.name} Sending Offer to ${to}`)
		const toPeer = Peer.getPeerByName(to)
		toPeer && toPeer.emit(TYPE.OFFER, {
			from: this.name,
			offer
		})
	}
	answer({ to, answer }) {
		console.log(`${this.name} Sending answer to ${to}`)
		const toPeer = Peer.getPeerByName(to)
		toPeer && toPeer.emit(TYPE.ANSWER, {
			from: this.name,
			answer
		})
	}
	send(toID, data) {
		console.log(` ${this.name} send msg to ${toID} ! `)
		peers[toID] && peers[toID].emit(TYPE.MSG, {
			from: {
				id: this.id,
				name: this.name
			},
			data
		})
	}
	emit(eventName, data) {
		this.socket.emit(eventName, data)
	}
	sendWithName(name, data) {
		console.log(` ${this.name} send msg to ${name} ! `)
		let toID = joinLs[name]
		peers[toID] && peers[toID].emit(TYPE.MSG, {
			from: this.id,
			data
		})
	}
	listen() {
		this.socket.on(TYPE.JOIN, this.join)

		this.socket.on(TYPE.CANDIDATE, this.candidate)

		this.socket.on(TYPE.ANSWER, this.answer)

		this.socket.on(TYPE.OFFER, this.offer)

		// 监听 client 的 send 信号
		this.socket.on(TYPE.SEND, ({ id, name, data }) => {
			if (id) {
				this.send(id, data)
			} else if (name) {
				this.sendWithName(name, data)
			} else {
				console.error('invaild params')
			}
		})
	}
	sendTYPE() {
		this.emit(TYPE.CONN, {
			TYPE
		})
	}
}

module.exports = Peer