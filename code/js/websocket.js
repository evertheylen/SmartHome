handlers = {}; // specify functions to deal with server messages (that aren't a reply)
answers = {};  // specify functions that need to be called when the server answers
var currentId = 0; // Every request sent gets an ID.
var requests = new Queue();  // Queue for strings that are waiting to be sent to the server.
var reconnectLimit = 10; // The maximum amount of times a websocket is allowed to reconnect.
var reconnects = 0; // The amount of times the websocket has attempted to reconnect.

function connect_to_websocket() {
	websocket = new WebSocket("ws://" + window.location.host + "/ws");

	websocket.request = function (requestObject, f) {
		// Data can be any object literal or prototype with the toJSON method.
		answers[currentId] = f;
		requestObject.ID = currentId;
		currentId++;
		var stringToSend = JSON.stringify(requestObject);
		if(websocket.readyState == 1) {
			// Send the request to the server.
			websocket.send(stringToSend);
			console.log("Sent data to the server:");
			console.log(stringToSend);
		}
		else {
			// Add the request to the waiting list.
			requests.enqueue(stringToSend);
			console.log("Websocket request has been queued until connection has been established.");
		}
	}

	websocket.onopen = function() {
		console.log("Websocket opened");
		// Reset the reconnect counter.
		reconnects = 0;
		// Handle all the requests that have been waiting.
		while (!requests.isEmpty())
			websocket.send(requests.dequeue());
	};

	websocket.onclose = function() {
		console.log("Websocket closed");
		if (reconnects < reconnectLimit) {
			reconnects++;
			console.log("Attempting to reconnect");
			connect_to_websocket();
		}
	};

	websocket.onmessage = function(evt) {
		console.log("Received data from the server:");
		console.log(evt.data);
		var receivedObject = {};
		var polishedObject = {};
		try {
			receivedObject = JSON.parse(evt.data);
			polishedObject = window[receivedObject["type"] + "_response"](receivedObject);
			if (receivedObject.hasOwnProperty("ID")) {
				answers[receivedObject.ID](polishedObject);
				return;
			} 
		}
		catch(err) {
	    		console.log(err);
			alert(err);
			return;
		}
		if (receivedObject.hasOwnProperty("type")) 
			handlers[receivedObject.type](polishedObject);
	};

	websocket.onerror = function(evt) {
		console.log("Websocket Error occured: " + evt.data);
	};

	return websocket;
}

function signup_response(response) {
	data = response["data"];
	if(data["status"] == "success")
		return {success: true, UID: data["UID"]};
	return {success: false, reason: data["reason"]};
}

function login_response(response) {
	data = response["data"];
	if(data["status"] == "success") {
		// Currently this cookie will only be alive for 1 day.
		setCookie("session", data["session"], 1);
		return {success: true, user: getFilledObject("User", data["user"])};
	}
	return {success: false, reason: data["reason"]};
}

function error_response(response) {
	// Todo: Decide on how to handle the errors.
	error_type = response["error"]["short"];
	switch(error_type) {
		case "type_error":
			arg[0] = "type_error";
			break;
		default:
			arg[0] = "Undefined";
	}
	arg[1] = data["error"]["long"];
	return arg;
}

function add_response(response) {
	object = getFilledObject(response["what"], response["data"]);
	return {success: true, for: response["for"], object: object};	
}

function delete_response(response) {
	if (response["data"]["status"] == "success")
		return true;	
	return false;
}

function get_response(response) {
	object = getFilledObject(response["what"], response["data"]);
	return {for: response["for"], object: object};
}

function get_all_response(response) {
	objects = [];
	responseData = response["data"];
	for(i = 0; i < response["data"].length; i++)
		objects.push(getFilledObject(response["what"], responseData[i]));
	return {for: response["for"], what: objects};
}

function edit_response(response) {
	object = getFilledObject(response["what"], response["data"]);
	return object.toJSON();
}

function getFilledObject(what, objectData) {
	object = {};
	switch(what) {
		case "Sensor":
			object = new Sensor();
			break;
		case "User":
			object = new User();
			break;
		case "Location":
			object = new Location();
			break;
		default:
			throw new Error("'What' in websocket request is of unknown type.");
	}
	object.fill(objectData);
	return object;
}
