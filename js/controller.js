
var app = function(){

	myself = this;
	serialPort = require('serialport');
	firmata = require('firmata');
	board = undefined;
	Testhandler = undefined;
	oldlist ='-';
	analogMode = false;
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
	btnSwitch = $('#d2');

	buzzer = $('#motorSpeed').slider({
			formatter: function(value) {
				return 'Current value: ' + value;
			}
	});

	motorSpeed = $('#buzzer').slider({
			formatter: function(value) {
				return 'Current value: ' + value;
			}
	});
	servo = $('#servo').slider({
			formatter: function(value) {
				return 'Current value: ' + value;
			}
	});

	$('#buzzer').on("slide", function(pwm){
			board.pinMode(6, board.MODES.PWM);
			board.analogWrite(6, pwm.value);
	});
	//set motor speed 0-255
	$('#motorSpeed').on("slide", function(pwm){
		board.analogWrite(3, pwm.value);
		board.analogWrite(11, pwm.value);
	});
	$('#servo').on("slide", function(degrees){
		console.log("servo value = "+ degrees.value);
		board.servoWrite(9, degrees.value);
		board.servoWrite(10, degrees.value);
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

	$('#inputMode').change(function(){
		analogMode = $(this).prop('checked');
		if(analogMode)
			myself.setAnalogMode();
		else
			myself.setSensorMode();
	});
	$('#motorSpin').change(function(){
		var val =  $(this).prop('checked');
		if(board){
			board.digitalWrite(12, val);
			board.digitalWrite(8, val);
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
		//set pin Mode
		myself.setAnalogPin();
		myself.setDigitalInput();
		myself.setDigitalOutput();
		Testhandler = setInterval(myself.runTest, 120);
		}
		else{			
			return showMessage(err.message);
		}		
	});
}

app.prototype.setAnalogMode = function(){
	
	$('#a0label').text('Analog [A0]');
	$('#a1label').text('Analog [A1]');
	$('#a2label').text('Analog [A2]');
	$('#a3label').text('Analog [A3]');
	$('#a4label').text('Analog [A4]');
	$('#a5label').text('Analog [A5]');
}

app.prototype.setSensorMode = function(){
	
	$('#a0label').text('[A0] Temperature');
	$('#a1label').text('[A1] Light');
	$('#a2label').text('[A2] Audio');
	$('#a3label').text('[A3] Humidity');
	$('#a4label').text('[A4] Infrared');
	$('#a5label').text('[A5] Slider');
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
app.prototype.setDigitalInput =function(){
	board.pinMode(2, board.MODES.INPUT);
	board.digitalRead(2, function(value){btnSwitch.text(value == 1? true:false)});
}
app.prototype.setDigitalOutput =function(){
	board.pinMode(3,board.MODES.PWM);
	board.pinMode(11,board.MODES.PWM);

	//board.pinMode(9,board.MODES.SERVO);
	//board.pinMode(10,board.MODES.SERVO);
	board.servoConfig(9,0,180);
	board.servoConfig(10,0,180);
}
app.prototype.runTest = function(){
	if(board){

		vtemp = board.pins[board.analogPins[0]].value;
		vlight = board.pins[board.analogPins[1]].value;
		vaudio = board.pins[board.analogPins[2]].value;
		vhum = board.pins[board.analogPins[3]].value;
		vinf = board.pins[board.analogPins[4]].value;
		vslider = board.pins[board.analogPins[5]].value;

		if(analogMode){
			temperature.text(vtemp);
			light.text(vlight);
			audio.text(vaudio);
			humidity.text(vhum);
			infrared.text(vinf);
			slider.text(vslider);
		}
		else{
			temperature.text(myself.getCelsius(vtemp)+ ' ºC');
			light.text(myself.getPercentaje(vlight)+' %');
			audio.text(myself.getPercentaje(vaudio)+' %');
			humidity.text(myself.getPercentaje(vhum)+' %');
			infrared.text(myself.getInfrared(vinf));
			slider.text(myself.getPercentaje(vslider)+ ' %');
		}
		//console.log("running");
	}/*
	board.analogRead(board.analogPins[0],function(value){
		if(analogMode)
			temperature.text(value);
		else
			temperature.text(myself.getCelsius(value)+ ' ºC');
	});*/
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







//init UI elements





//SerialPort.on('error', handleError(err));
//SerialPort.on('open', handleConnection);
//SerialPort.on('disconnect', handleDisconnection);
