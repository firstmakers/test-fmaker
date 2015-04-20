var gui = require('nw.gui'); 

// Get the current window
var win = gui.Window.get();

// Listen to the close event
win.on('close', function() {
  console.log('Window is closing');
  if(app){
  	app.disconnect();
  }
});