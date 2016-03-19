var currentId = 0;
handlers = {}; // specify functions to deal with server messages (that aren't a reply)
answers = {};  // specify functions that need to be called when the server answers

function connect_to_websocket() {
	websocket = new WebSocket("ws://" + window.location.host + "/ws");
	//websocket = new WebSocket("ws://localhost:8002/ws");

	websocket.request = function (requestObject, f) {
		// Data can be any object literal or prototype with the toJSON method.
		answers[currentId] = f;
		requestObject.ID = currentId;
		var stringToSend = JSON.stringify(requestObject);
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
				case "get":
					polishedObject = get_response(receivedObject);
					break;
				case "add":
					polishedObject = add_response(receivedObject);
					break;
				case "delete":
					polishedObject = delete_response(receivedObject);
					break;
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
		return {success: true, UID: data["UID"]};
	return {success: false, reason: data["reason"]};
}

function login_response(response) {
	data = response["data"];
	if(data["status"] == "success") {
		// Currently this cookie will only be alive for 1 day.
		setCookie("session", data["sessions"], 1);
		userData = data["user"];
		user = new User(userData["UID"], userData["email"], userData["first_name"], userData["last_name"]);
		console.log(user);
		return {success: true, user: user};
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
		case "User":
			users;
			for(i = 0; i < response["data"].length; i++) {
				userData = response["data"][i];
				user = new User(userData["UID"], userData["email"], userData["first_name"], userData["last_name"]);
				users.push(user);
			}
			return {for: response["for"], users: users};
		case "Location":
			locations;
			for(i = 0; i < response["data"].length; i++) {
				locationData = response["data"][i];
				location = new Location(locationData["LID"], locationData["desc"], locationData["country"], locationData["city"], 
							locationData["postalcode"], locationData["street"],  locationData["number"]);
				locations.push(location);
			}
			return {for: response["for"], locations: locations};
		default:
			break;
	}
	return {};
}

function get_response(response) {
	what = response["what"];
	switch(what) {
		case "Sensor":
			sensorData = response["data"];
			sensor = new Sensor(sensorData["SID"], sensorData["title"], sensorData["type"]);
			return {for: response["for"], sensor: sensor};
		case "User":
			userData = response["data"];
			user = new User(userData["UID"], userData["email"], userData["first_name"], userData["last_name"]);
			return {for: response["for"], user: user};
		case "Location":
			locationData = response["data"];
			location = new Location(locationData["LID"], locationData["desc"], locationData["country"], locationData["city"], 
						locationData["postalcode"], locationData["street"],  locationData["number"]);
			return {for: response["for"], location: location};
		default:
			break;
	}
	return {};	
}

function add_response(response) {
	if(response["data"]["status"] == "success") {
		what = response["what"];
		switch(what) {
			case "Sensor":
				sensorData = response["data"]["Sensor"];
				sensor = new Sensor(sensorData["SID"], sensorData["title"], sensorData["type"]);
				return {success: true, for: response["for"], sensor: sensor};
			case "User":
				userData = response["data"]["User"];
				user = new User(userData["UID"], userData["email"], userData["first_name"], userData["last_name"]);
				return {success: true, for: response["for"], user: user};
			case "Location":
				locationData = response["data"]["Location"];
				location = new Location(locationData["LID"], locationData["desc"], locationData["country"], locationData["city"], 
							locationData["postalcode"], locationData["street"],  locationData["number"]);
				return {success: true, for: response["for"], location: location};
			default:
				break;
		}
	}
	return {success: false};		
}

function delete_response(response) {
	if (response["data"]["status"] == "success")
		return true;	
	return false;
}


