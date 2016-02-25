var currentId = 0;
handlers = {};

function connect_to_websocket() { 
	websocket = new WebSocket("ws://" + window.location.host + "/ws");

	websocket.request = function (type, data, f) {
		// Data can be any object literal or prototype with the toJSON method.
		handlers[currentId] = f;
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
		var recievedObject = null;
		var type = "";
		try {
			recievedObject = JSON.parse(evt);
			type = recievedObject["type"];
		}
		catch(SyntaxError) {
	    		// Handle the error.
	    		console.log(SyntaxError);
				alert(SyntaxError.evt);
				return;
		}
		
		switch(type) {
			case "signup":
				server_signup_response(recievedObject);
			case "login":
				server_login_response(recievedObject);
		}
	};

	websocket.onerror = function(evt) {
		
	};

	return websocket;
}

function server_login_response(data) {
	if(data["data"] == "fail") {
		// Notify failed log in.
		handlers["login"](false);
	}
	else if(data["data"].hasOwnProperty("session")) {
		// Currently this cookie will only be alive for 1 day.
		setCookie("session", data["data"].session, 1);
		handlers["login"](true);
	}
}

function server_signup_response(data) {
	if(data["data"] == "fail") {
			handlers["signup"](false);
	}
	else if(data["data"] == "success") {
		handlers["signup"](true);
	}	
}

/*
request(type, data, function) {
		// Data can be any object literal or prototype with the toJSON method.
		
		var stringToSend = JSON.stringify({"id": id, "type": type, "data": data});
		websocket.send(stringToSend);		
}

ws.request("login", data, function);
handlers[generatedId] = function
handlers[generatedId](arguments);


*/


/*
function set_callback(type, callback) { handlers[type] = callback};

set_callback("login", function(event) { console.log(event) }};
*/

