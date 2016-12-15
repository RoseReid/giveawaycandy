#!/usr/bin/env node

var net = require('net'),
 serialport = require('serialport'),
 config = require('./config');

var serialPort;

//This is telnet Server that listens to incoming connections and will make a call to the Arduino to move the ServerMotor the Candy
var startTelnetServer = function(action){
	//Anytime a new connection is called- the code will run
	var server = net.createServer(function(client) { //'connection' listener
	  console.log('server connected');
	  client.on('end', function() {
	    console.log('server disconnected');
	  });
	  client.write('hello\r\n');
		//run the action called the function giveMeCandy
	  action(client);

	});
	server.listen(50000, function() { //'listening' listener
	  console.log('server bound');
	});
};


var serialPort = new serialport.SerialPort(config.serialPort,
			{//Listening on the serial port for data coming from Arduino over USB
				baudRate: 57600,
				parser: serialport.parsers.readline('\n')
			},false);

//Talk to the Arduino and write Give- And arduino will listen to that and release Candy
var giveMeCandy = function(client){
	serialPort.write("give", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
    client.end();
  });  
};

//Open the serial port which speaks to the Arduino
serialPort.open(function () {
	//When the connection to the Arduino is done- We start the Teleserver to listen on incoming traffic
  console.log('open');
  startTelnetServer(giveMeCandy);
	//giveMeCandy Callback
});




process.on('uncaughtException', function(err){
	console.log('Something bad happened: ');
	console.log(err);
	process.exit(0);
});
