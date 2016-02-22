function connect_to_websocket() { 
	websocket = new WebSocket("ws://" + window.location.host + "/ws");

	websocket.request(type, data) {
		// Data can be any object literal or prototype with the toJSON method.
		var stringToSend = JSON.stringify({"type": type, "data": data});
		websocket.send(stringToSend);
	};

	websocket.onopen = function() { 
		// Currently nothing happens when socket is first opened.
	};

	websocket.onmessage = function(evt) {
		var recievedObject = null;
		var type = "";
		try {
			recievedObject = JSON.parse(evt);
			type = recievedObject["type"];
		}
		catch(SyntaxError) {
	    		// Handle the error.
		}
		
		if(type == "login") {
			
		}
		
		// Call specific parse functions that will notify Stijn.
	};

	websocket.onerror = function(evt) {
		
	};

	return websocket;
}

function server_login_response(data) {
	if(data["data"] == "fail") {
		// Notify failed log in.
	}
	else if(data["data"].hasOwnProperty("session")) {
		var session = data["data"].session;
		// Notify succesfull login with the correct session.
	}
}


