var firebase = require("firebase");
var fs = require('fs');
var sys = require('sys')
var exec = require('child_process').exec;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use(express.static(__dirname + '/public'));
var config = {
	apiKey: "AIzaSyB7nNSbsK81AgsgTSpE9iZbkrMdyGts_F4",
  	databaseURL: "https://joshhack-c4c1f.firebaseio.com"
};
defaultApp = firebase.initializeApp(config);
var firebaseDatabase = defaultApp.database();
var starCountRef = firebase.database().ref('attendance');
var roomOneRef = firebase.database().ref('one');
var roomTwoRef = firebase.database().ref('two');
var roomThreeRef = firebase.database().ref('three');
var roomFourRef = firebase.database().ref('four');


var client_connected = false;
var existing_att = [];
var roomOne = [];
var roomTwo = [];
var roomThree = [];
var roomFour = [];

starCountRef.on('child_added', (snapshot) => {
	console.log(snapshot.val());
	console.log('------------');
	existing_att.push(snapshot.val());
	io.emit('new_attendance', snapshot.val());
});
starCountRef.on('child_removed', (snapshot) => {
	console.log('REMOVED');
	console.log(snapshot.val());
	console.log('------------');
	existing_att = existing_att.filter((data) => {
		return data.time != snapshot.val().time
	});
	io.emit('attendance_removed', snapshot.val());
});


roomOneRef.on('child_added', (snapshot) => {
	console.log('ROOM ONE');
	console.log(snapshot.val());
	console.log('------------');
	roomOne.push(snapshot.val());
	io.emit('room_one', snapshot.val());
});
roomOneRef.on('child_removed', (snapshot) => {
	console.log('ROOM ONE - REMOVED');
	console.log(snapshot.val());
	console.log('------------');
	io.emit('room_one_removed', snapshot.val());
});


roomTwoRef.on('child_added', (snapshot) => {
	console.log('ROOM TWO');
	console.log(snapshot.val());
	console.log('------------');
	roomTwo.push(snapshot.val());
	io.emit('room_two', snapshot.val());
});
roomTwoRef.on('child_removed', (snapshot) => {
	console.log('ROOM TWO - REMOVED');
	console.log(snapshot.val());
	console.log('------------');
	io.emit('room_two_removed', snapshot.val());
});


roomThreeRef.on('child_added', (snapshot) => {
	console.log('ROOM THREE');
	console.log(snapshot.val());
	console.log('------------');
	roomThree.push(snapshot.val());
	io.emit('room_three', snapshot.val());
});
roomThreeRef.on('child_removed', (snapshot) => {
	console.log('ROOM THREE - REMOVED');
	console.log(snapshot.val());
	console.log('------------');
	io.emit('room_three_removed', snapshot.val());
});


roomFourRef.on('child_added', (snapshot) => {
	console.log('ROOM FOUR');
	console.log(snapshot.val());
	console.log('------------');
	roomFour.push(snapshot.val());
	io.emit('room_four', snapshot.val());
});
roomFourRef.on('child_removed', (snapshot) => {
	console.log('ROOM FOUR - REMOVED');
	console.log(snapshot.val());
	console.log('------------');
	io.emit('room_four_removed', snapshot.val());
});

io.on('connection', function(socket){
	console.log('a user connected');
	console.log(existing_att);
	if(!client_connected) {
		existing_att.forEach((data) => {
			io.emit('new_attendance', data);
		});
		roomOne.forEach((data) => {
			io.emit('room_one', data);
		});
		roomTwo.forEach((data) => {
			io.emit('room_two', data);
		});
		roomThree.forEach((data) => {
			io.emit('room_three', data);
		});
		roomFour.forEach((data) => {
			io.emit('room_four', data);
		});
		client_connected = true;
	}
	socket.on('disconnect', () => {
		console.log('disconnected');
		client_connected = false;
	})
});



app.get('/', function (req, res) {
   	res.sendFile(__dirname + '/public/tmpl/index.html');
});

app.get('/login', function(req, res) {
	res.sendFile(__dirname + '/public/tmpl/login.html');
})

http.listen(8080, function () {
   console.log("app listening");
})