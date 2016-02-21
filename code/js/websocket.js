function connect_to_websocket() { 
	websocket = new WebSocket("ws://" + window.location.host + "/ws");

	websocket.prototype.request(type, data) {
		var stringToSend = JSON.stringify({"type": type, "data": data});
		websocket.send(stringToSend);
	};

	websocket.onopen = function() { 

	};

	websocket.onmessage = function(evt) {
		var recievedObject = null;
		var type = "";
		try {
	    		recievedObject = JSON.parse(evt);
			type = recievedObject["type"];
		}
		catch(SyntaxError) {
	    		// Display error message.
		}

		
		
		
		// Call functions (Stijn).
	};

	websocket.onerror = function(evt) {
		
	};

	return websocket;
}


