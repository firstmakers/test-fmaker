var firmata = require('firmata');
var serialPort = require('serialport');
var board = undefined;
var Testhandler = undefined;
var oldlist ='-';
//digital actuator
var	greedLed = $('#greenLed').bootstrapToggle();
var	yellowLed =  $('#yellowLed').bootstrapToggle();
var	redLed = $('#redLed').bootstrapToggle();
var	whiteLed = $('#whiteLed').bootstrapToggle();
var combobox = $('#listPort').selectpicker();

//analog sensors
var temperature = $('#a0');
var light = $('#a1');
var audio = $('#a2');
var humidity = $('#a3');
var infrared = $('#a4');
var slider = $('#a5');

$( document ).ready(function() {
    console.log( "App ready!" );
    setInterval(listPorts, 500);
});


var buzzer = $('#buzzer').slider({
		formatter: function(value) {
			return 'Current value: ' + value;
		}
});

function handleError(error){
	if(board!= undefined)
		board.sp.close();
	console.log(error);
}

function handleConnection(){

}
function handleDisconnection(){
	console.log("Device disconnected");
	clearInterval(Testhandler);
	Testhandler = undefined;
}

function disconnect(){
	if(board){
		board.sp.removeListener("disconnect", handleDisconnection);
		board.sp.removeListener("error", handleError);
		board.sp.close();
		board = undefined;
		console.log('closing connection');
		clearInterval(Testhandler);
	}
}

function connect(){
	if(board){
		board.sp.close();
		board = undefined;
	}
		
	path = combobox.val();
	console.log("connecting to "+path);

	board = new firmata.Board( path ,function(err){
		if(!err){
		console.log("connected to "+path);
		board.sp.on("disconnect" ,handleDisconnection);
		board.sp.on("error", function(err){ handleError(err)});

		

		Testhandler = setInterval(runTest, 150);
		}
		else{			
			return showMessage(err.message);
		}		
	});
}

function showMessage(message){
	console.log(message);
}


function listPorts(){
	var list ='';
	var regex = /usb|DevB|rfcomm|acm|^com/i; 

	serialPort.list(function (err, ports){
		ports.forEach(function(port){
			if(regex.test(port.comName))
				list += '<option>'+port.comName+'</option>';
		});		
		if(list != oldlist){
			console.log('new ports');
			combobox.html(list).selectpicker('refresh');
			oldlist = list;
		}			
	}); 
}

function runTest(){
	console.log('init runTest');
	if(board){

		valTemp = Math.round((board.pins[board.analogPins[0]].value * 5000.0/1023.0)/29 *10)/10
		valLight = Math.round(10*(100.0*board.pins[board.analogPins[1]].value/1023.0))/10
		temperature.text(valTemp+' ºC');
		light.text(valLight+' %');
		audio.text(board.pins[board.analogPins[2]].value.toString());
		humidity.text(board.pins[board.analogPins[3]].value.toString());
		infrared.text(board.pins[board.analogPins[4]].value.toString());
		slider.text(board.pins[board.analogPins[5]].value.toString());

	}

}

$('#buzzer').on("slide", function(pwm){
		board.pinMode(6, board.MODES.PWM);
		board.analogWrite(6, pwm.value);
});

$('#whiteLed').change(function(){
	var val =  $(this).prop('checked');
	if(board){
		board.digitalWrite(13, val);
	}
});

$('#greenLed').change(function(){
	var val =  $(this).prop('checked');
	if(board){
		board.digitalWrite(4, val);
	}
});

$('#yellowLed').change(function(){
	var val =  $(this).prop('checked');
	if(board){
		board.digitalWrite(5, val);
	}
});
$('#redLed').change(function(){
	var val =  $(this).prop('checked');
	if(board){
		board.digitalWrite(7, val);
	}
});



//init UI elements





//SerialPort.on('error', handleError(err));
//SerialPort.on('open', handleConnection);
//SerialPort.on('disconnect', handleDisconnection);
