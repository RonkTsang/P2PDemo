var socket = io()

socket.emit('hello', parseInt(Math.random() * 100));

socket.emit('hello', {
    test: 1
});

socket.on('reply', (msg) => {
    console.log(msg)
})