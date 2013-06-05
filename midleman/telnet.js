var net = require('net'),
 serialport = require('serialport'),
 config = require('./config');

var serialPort;


var startTelnetServer = function(action){
	var server = net.createServer(function(client) { //'connection' listener
	  console.log('server connected');
	  client.on('end', function() {
	    console.log('server disconnected');
	  });
	  client.write('hello\r\n');
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


var giveMeCandy = function(client){
	serialPort.write("give", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
    client.end();
  });  
};

serialPort.open(function () {
  console.log('open');
  startTelnetServer(giveMeCandy);
});




process.on('uncaughtException', function(err){
	console.log('Something bad happened: ');
	console.log(err);
	process.exit(0);
});
