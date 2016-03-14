var currentId = 0;
handlers = {}; // specify functions to deal with server messages (that aren't a reply)
answers = {};  // specify functions that need to be called when the server answers

function connect_to_websocket() {
	websocket = new WebSocket("ws://" + window.location.host + "/ws");
	//websocket = new WebSocket("ws://localhost:8002/ws");

	websocket.request = function (type, data, f) {
		// Data can be any object literal or prototype with the toJSON method.
		answers[currentId] = f;
		var stringToSend = JSON.stringify({"ID": currentId, "type": type, "data": data});
		websocket.send(stringToSend);
		currentId+=1;
		console.log("Sent data to server:");
		console.log(stringToSend);
	}

	websocket.onopen = function() {
		// Currently nothing happens when the socket is opened.
		console.log("Websocket opened");
	};

	websocket.onclose = function() {
		// Currently nothing happens when the socket is closed.
		console.log("Websocket closed");
	};

	websocket.onmessage = function(evt) {
		console.log("Received data from server:");
		console.log(evt.data);
		var receivedObject = null;
		var polishedObject = null;
		var type = "";
		try {
			receivedObject = JSON.parse(evt.data);
			type = receivedObject["type"];
			switch(type) {
				case "signup":
					polishedObject = signup_response(receivedObject);
					break;
				case "login":
					polishedObject = login_response(receivedObject);
					break;
				case "error":
					polishedObject = error_response(receivedObject);
					break;
				case "get_all":
					polishedObject = get_all_response(receivedObject);
					break;
				case "":

			}
		}
		catch(SyntaxError) {
	    		// Handle the error.
	    		console.log(SyntaxError);
			console.log(evt);
			alert(SyntaxError);
			return;
		}
		if(receivedObject != null) {
			if (receivedObject.hasOwnProperty("ID")) {
				answers[receivedObject.ID](polishedObject);
			} else {
				handlers[receivedObject.type](polishedObject);
			}
		}
	};

	websocket.onerror = function(evt) {
		console.log("Websocket Error occured: " + evt.data);
	};

	return websocket;
}

function signup_response(response) {
	data = response["data"];
	if(data["status"] == "success")
		return {succes: true, UID: data["UID"]};
	return {succes: false};
}

function login_response(response) {
	data = response["data"];
	if(data["status"] == "success") {
		// Currently this cookie will only be alive for 1 day.
		setCookie("session", data["sessions"], 1);
		userData = data["user"];
		return {succes: true, UID: userData["UID"], firstName: userData["first_name"], lastName: userData["last_name"]};
	}
	return {succes: false};
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

function get_all_response(response) {
	what = response["what"];
	switch(what) {
		case "Sensor":
			sensors;
			for(i = 0; i < response["data"].length; i++) {
				sensorData = response["data"][i];
				sensor = new Sensor(sensorData["SID"], sensorData["title"], sensorData["type"]);
				sensors.push(sensor);
			}
			return {for: response["for"], sensors: sensors};
		case "Type":
			return {for: response["for"], types: response["data"]};
		case "Tag":
			return {for: response["for"], tags: response["data"]};
		case "Location":
			locations;
			for(i = 0; i < response["data"].length; i++) {
				locationData = response["data"][i];
				location = new Location(locationData["SID"], locationData["title"], locationData["type"]);
				locations.push(location);
			}
			return {for: response["for"], locations: locations};
		default:
			break;
	}
	return {};
}
