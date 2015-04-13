var firmata = require('firmata');
var serialPort = require('serialPort');


	list = [];
	regex = /usb|DevB|rfcomm|acm|^com/i; 
if(serialPort== null){
	console.log('null serial port');
	return;
}
	

	serialPort.list(function (err, ports){
		ports.forEach(function(port){
			if(regex.test(port.comName)){
				list.push(port.comName);
				console.log(port.comName);
			}

				
		});		
	}); 

	board = new firmata.Board( list[list.length -1] ,function(err){
 		if(err){
 			console.log(err); return;
 		}
 		else{
 			console.log('connected to ' +list[0]);
 		}
	}); 

