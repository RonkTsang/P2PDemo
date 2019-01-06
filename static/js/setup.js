var socket = io()

var TYPE = {
	CONN: 'connection',
	JOIN: 'join',
	ACK: 'joinSuccess',
	SEND: 'send',
	MSG: 'msg',
	CANDIDATE: 'candidate',
	OFFER: 'offer',
	ANSWER: 'answer'
}

// socket.on('connection', (e) => {
// 	e.TYPE && (TYPE = e.TYPE)
// });

var name = '', connectedUser;

var $ = (s) => document.querySelector(s)

var loginPage = $('#login-page'),
	usernameInput = $('#username'),
	loginButton = $('#login'),
	callPage = $('#call-page'),
	theirUsernameInput = $('#their-username'),
	callButton = $('#call'),
	hangUpButton = $('#hang-up')

var yourVideo = document.querySelector('#yours'), 
	theirVideo = document.querySelector('#theirs'), 
	yourConnection, 
	theirConnection,
	stream

callPage.style.display = 'none'

loginButton.addEventListener('click', () => {
	name = usernameInput.value;
	if (!!name.trim()) {
		login(name)
	}
});

callButton.addEventListener('click', () => {
	var calltoName = theirUsernameInput.value
	if(calltoName.length > 0){
		startPeerConnection(calltoName);
	}
});

function login(name) {
	socket.emit(TYPE.JOIN, {
		name
	})
	socket.on(TYPE.ACK, () => {
		console.log`join success`
		loginSucc()
	})
}

function offer(to, SDP) {
	console.log('send offer to: ', to, SDP)
	socket.emit(TYPE.OFFER, {
		to,
		offer: SDP
	})
}

socket.on(TYPE.OFFER, ({ from, offer }) => {
	console.log(`receive offer from: ${from}`, offer)
	connectedUser = from
	yourConnection.setRemoteDescription(new RTCSessionDescription(offer))
	yourConnection.createAnswer(function(_answer){
		console.log('createAnswer ', _answer)
		yourConnection.setLocalDescription(_answer)
		answer(from, _answer)
	}, function(err) {
		console.log('An error occur on onOffer.', err)
	})
})

function candidate(candidate) {
	socket.emit(TYPE.CANDIDATE, {
		to: connectedUser,
		candidate
	})
}

socket.on(TYPE.CANDIDATE, ({ from, candidate }) => {
	console.log(TYPE.CANDIDATE, { from })
	yourConnection.addIceCandidate(new RTCIceCandidate(candidate))
})

function answer(to, _answer) {
	console.log('send answer to: ', to, _answer)
	socket.emit(TYPE.ANSWER, {
		to,
		answer: _answer
	})
}

socket.on(TYPE.ANSWER, ({ from, answer }) => {
	console.log(`receive ANSWER from: ${from}`, answer)
	yourConnection.setRemoteDescription(new RTCSessionDescription(answer))
})

function loginSucc() {
	loginPage.style.display = 'none'
	callPage.style.display = 'block'
	startConnection()
};

function startConnection() {
	navigator._getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia || navigator.mozGetUserMedia || navigator.mediaDevices.getUserMedia)
	if (navigator._getUserMedia) {
		navigator._getUserMedia({
			video: true,
			audio: false
		}, (myStream) => {
			stream = myStream;
			// yourVideo.src = window.URL.createObjectURL(myStream);
			yourVideo.srcObject = myStream
			if (hasRTCPeerConnection()) {
				setupPeerConnection(myStream);
			}
			else {
				alert('Sorry, your browser does not support WebRTC.');
			}
		}, (error) => {
			console.warn(error)
		})
	}
};

socket.emit('hello', parseInt(Math.random() * 100));

socket.emit('hello', {
	test: 1
});

function hasRTCPeerConnection() {
	window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
	window.RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
	window.RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate || window.mozRTCIceCandidate;
	var result = !!window.RTCPeerConnection
	hasRTCPeerConnection = ((result) => {
		return () => result
	})(result)
	return result
}

function setupPeerConnection(stream) {
	var configuration = {
		"iceServers": [
			{ url: "stun:173.194.202.127:19302" },
			{ url: "stun:23.21.150.121" },
			{
				url: "turn:numb.viagenie.ca",
        credential: "webrtcdemo",
				username: "louis%40mozilla.com"
			}
		]
	};
	yourConnection = new RTCPeerConnection(configuration);
	yourConnection.addStream(stream);
	yourConnection.onaddstream = function (e) {
		theirVideo.srcObject = e.stream
	};
	yourConnection.onicecandidate = function (e) {
		console.log('onicecandidate', e)
		if (e.candidate) {
			candidate(e.candidate)
		}
	};

};

function startPeerConnection(user){
	connectedUser = user;

	console.log('start call other => startPeerConnection')
	// 发出 offer 请求
	// https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection#createOffer
	yourConnection.createOffer(function(RTC_SDP){
		console.log('createOffer successfully', RTC_SDP)
		offer(user, RTC_SDP)
		yourConnection.setLocalDescription(RTC_SDP)
	}, function(error){
		alert('An error on startPeerConnection:', error)
	});
};