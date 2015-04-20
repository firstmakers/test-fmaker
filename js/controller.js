
var app = function(){

	myself = this;
	firmata = require('firmata');
	serialPort = require('serialport');
	board = undefined;
	Testhandler = undefined;
	oldlist ='-';
	//digital actuator
	greedLed = $('#greenLed').bootstrapToggle();
	yellowLed =  $('#yellowLed').bootstrapToggle();
	redLed = $('#redLed').bootstrapToggle();
	whiteLed = $('#whiteLed').bootstrapToggle();
	combobox = $('#listPort').selectpicker();

	//analog sensors
	temperature = $('#a0');
	light = $('#a1');
	audio = $('#a2');
	humidity = $('#a3');
	infrared = $('#a4');
	slider = $('#a5');

	buzzer = $('#buzzer').slider({
			formatter: function(value) {
				return 'Current value: ' + value;
			}
	});


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

	$('#btnConnect').click(this.connect);
	$('#btnDisconnect').click(this.disconnect);

};

app.prototype.getPorts = function(){
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

app.prototype.connect = function(){
	
	if(board){
		board.sp.close();
		board = undefined;
	}
		
	path = combobox.val();
	console.log("connecting to "+ path);

	board = new firmata.Board( path ,function(err){
		if(!err){
		console.log("connected to "+ path);
		board.sp.on("disconnect" , myself.handleDisconnection);
		board.sp.on("error", function(err){myself.handleError(err)});

		//set Analogs pins
		myself.setAnalogPin(board);


		Testhandler = setInterval(myself.runTest, 500);
		}
		else{			
			return showMessage(err.message);
		}		
	});

}


app.prototype.disconnect = function(){
	if(board){
		board.sp.removeListener("disconnect", myself.handleDisconnection);
		board.sp.removeListener("error", myself.handleError);
		board.sp.close();
		board = undefined;
		console.log('closing connection');
		clearInterval(Testhandler);
	}
}

app.prototype.handleDisconnection = function(){
	disconnect();
}

app.prototype.handleError = function(error){
	if(board!= undefined)
		board.sp.close();
	console.log(error);

}

app.prototype.setAnalogPin = function(){
	var analog = board.analogPins;
	console.log("config " + analog.toString());
	analog.forEach(function(pin){
		board.pinMode(pin, board.MODES.ANALOG);
	});
}

app.prototype.runTest = function(){
	if(board){

		vtemp = board.pins[board.analogPins[0]].value;
		vlight = board.pins[board.analogPins[1]].value;
		vaudio = board.pins[board.analogPins[2]].value;
		vhum = board.pins[board.analogPins[3]].value;
		vinf = board.pins[board.analogPins[4]].value;
		vslider = board.pins[board.analogPins[5]].value;


		temperature.text(myself.getCelsius(vtemp)+ ' ºC');
		light.text(myself.getPercentaje(vlight)+' %');
		audio.text(myself.getPercentaje(vaudio)+' %');
		humidity.text(myself.getPercentaje(vhum)+' %');
		infrared.text(myself.getInfrared(vinf));
		slider.text(myself.getPercentaje(vslider)+ ' %');

		console.log("running");
	}
}
app.prototype.getCelsius = function(val){
	return Math.round(10*(val*5000/1023/29))/10;	
}
app.prototype.getPercentaje = function(val){
	return Math.round(10*(100*val/1023))/10;
}
app.prototype.getInfrared = function(val){
	return val<100;
}

$( document ).ready(function() {
    var test = new app();
    setInterval(test.getPorts, 100);
    
});





//init UI elements





//SerialPort.on('error', handleError(err));
//SerialPort.on('open', handleConnection);
//SerialPort.on('disconnect', handleDisconnection);
