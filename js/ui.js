
var test;

$( document ).ready(function() {
	test = new app();
    setInterval(test.getPorts, 100); 
});

var gui = require('nw.gui'); 

// Get the current window
var win = gui.Window.get();

// Listen to the close event
win.on('close', function() {
  	this.hide();	
  	console.log('Window is closing');
  	if(test){
  	 	test.disconnect();
  	}
  	this.close(true);
});