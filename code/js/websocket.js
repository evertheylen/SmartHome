var currentId = 0;
handlers = {}; // specify functions to deal with server messages (that aren't a reply)
answers = {};  // specify functions that need to be called when the server answers

function connect_to_websocket() { 
	websocket = new WebSocket("ws://" + window.location.host + "/ws");

	websocket.request = function (type, data, f) {
		// Data can be any object literal or prototype with the toJSON method.
		answers[currentId] = f;
		var stringToSend = JSON.stringify({"ID": currentId, "type": type, "data": data});
		websocket.send(stringToSend);	
		console.log("Sent data to server");
		console.log("ID: " + currentId + " type: " + type + " data: " + data);
		currentId+=1;
	}
	
	websocket.onopen = function() { 
		// Currently nothing happens when socket is first opened.
	};

	websocket.onmessage = function(evt) {
		var receivedObject = null;
		var type = "";
		try {
			receivedObject = JSON.parse(evt.data);
			type = receivedObject["type"];
		}
		catch(SyntaxError) {
	    		// Handle the error.
	    		console.log(SyntaxError);
			console.log(evt);
			alert(SyntaxError);
			return;
		}
		
		
		// a) Preprocess:
		switch(type) {
			case "signup":
				console.log("Recieved signup response.");
				polishedObject = server_signup_response(receivedObject);
			case "login":
				console.log("Recieved login response.");
				polishedObject = server_login_response(receivedObject);
		}
		
		if (receivedObject.hasOwnProperty("ID")) {
			// b) there is an ID
			answers[receivedObject.ID](polishedObject);
		} else {
			// c) there is no ID
			handlers[receivedObject.type](polishedObject);
		}
	};

	websocket.onerror = function(evt) {
		
	};

	return websocket;
}

function server_login_response(data) {
	if(data["data"] == "fail") {
		return false;
	}
	else if(data["data"].hasOwnProperty("session")) {
		// Currently this cookie will only be alive for 1 day.
		setCookie("session", data["data"].session, 1);
		return true;
	}
}

function server_signup_response(data) {
	if(data["data"] == "fail") {
		return false;
	}
	else if(data["data"] == "success") {
		return true;
	}	
}

/*
ws.request("login", data, function);
handlers[generatedId] = function
handlers[generatedId](arguments);

function set_callback(type, callback) { handlers[type] = callback};

set_callback("login", function(event) { console.log(event) }};
*/

