const TYPE = require('./TYPE')

let peers = {}

class Peer {
    constructor (socket, data) {
        this.socket = socket
        this.id = socket.id
        peers[this.id] = this
        this.listen()
    }
    static ls () {
        return Object.keys(peers)
    }
    static getPeer (id) {
        return peers[id]
    }
    send (to, data) {
        peers[to] && peers[to].emit(TYPE.MSG, {
            from: this.id,
            data
        })
    }
    listen () {
        this.socket.on(TYPE.SEND, this.send)
    }
}

module.exports = Peer