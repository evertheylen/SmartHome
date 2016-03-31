var currentId = 0;
handlers = {}; // specify functions to deal with server messages (that aren't a reply)
answers = {};  // specify functions that need to be called when the server answers
var requests = new Queue();  // Queue for strings that are waiting to be sent to the server.

function connect_to_websocket() {
	websocket = new WebSocket("ws://" + window.location.host + "/ws");
	//websocket = new WebSocket("ws://localhost:8002/ws");

	websocket.request = function (requestObject, f) {
		// Data can be any object literal or prototype with the toJSON method.
		answers[currentId] = f;
		requestObject.ID = currentId;
		currentId+=1;
		var stringToSend = JSON.stringify(requestObject);
		if(websocket.readyState == 1) {
			// Send the request to the server.
			websocket.send(stringToSend);
			console.log("Sent data to server:");
			console.log(stringToSend);
		}
		else {
			// Add the request to the waiting list.
			requests.enqueue(stringToSend);
			console.log("Websocket request queued until connection has been established.");
		}
	}

	websocket.onopen = function() {
		console.log("Websocket opened");
		// Handle all the requests that have been waiting.
		while (!requests.isEmpty())
			websocket.send(requests.dequeue());
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
				case "add":
					polishedObject = add_response(receivedObject);
					break;
				case "delete":
					polishedObject = delete_response(receivedObject);
					break;
				case "get":
					polishedObject = get_response(receivedObject);
					break;
				case "get_all":
					polishedObject = get_all_response(receivedObject);
					break;
				case "edit":
					polishedObject = edit_response(receivedObject);
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
		setCookie("session", data["session"], 1);
		userData = data["user"];
		user = new User();
		user.fill(userData);
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

function add_response(response) {
	what = response["what"];
	switch(what) {
		case "Sensor":
			sensorData = response["data"];
			sensor = new Sensor();
			sensor.fill(sensorData);
			return {success: true, for: response["for"], sensor: sensor};
		case "User":
			userData = response["data"];
			user = new User();
			user.fill(userData);
			return {success: true, for: response["for"],  user: user};
		case "Location":
			houseData = response["data"];
			house = new Location();
			house.fill(houseData);
			return {success: true, for: response["for"], house: house};
		default:
			break;
	}	
}

function delete_response(response) {
	if (response["data"]["status"] == "success")
		return true;	
	return false;
}

function get_response(response) {
	what = response["what"];
	switch(what) {
		case "Sensor":
			sensorData = response["data"];
			sensor = new Sensor();
			sensor.fill(sensorData);
			return {for: response["for"], sensor: sensor};
		case "User":
			userData = response["data"];
			user = new User();
			user.fill(userData);
			return {for: response["for"], user: user};
		case "Location":
			houseData = response["data"];
			house = new Location();
			house.fill(houseData);
			return {for: response["for"], house: house};
		default:
			break;
	}
	return {};	
}

function get_all_response(response) {
	what = response["what"];
	switch(what) {
		case "Sensor":
			var sensors_response = [];
			for(i = 0; i < response["data"].length; i++) {
				sensorData = response["data"][i];
				sensor = new Sensor();
				sensor.fill(sensorData);
				sensors_response.push(sensor);
			}
			return {for: response["for"], sensors: sensors_response};
		case "User":
			var users = [];
			for(i = 0; i < response["data"].length; i++) {
				userData = response["data"][i];
				user = new User();
				user.fill(userData);
				users.push(user);
			}
			return {for: response["for"], users: users};
		case "Location":
			var houses = [];
			for(i = 0; i < response["data"].length; i++) {
				houseData = response["data"][i];
				house = new Location();
				house.fill(houseData);
				houses.push(house);
			}
			return {for: response["for"], houses: houses};
		default:
			break;
	}
	return {};
}

function edit_response(response) {
	switch(what) {
		case "Sensor":
			sensorData = response["data"];
			sensor = new Sensor();
			sensor.fill(sensorData);
			return sensor.toJSON();
		case "User":
			userData = response["data"];
			user = new User();
			user.fill(userData);
			return user.toJSON();
		case "Location":
			houseData = response["data"];
			house = new Location();
			house.fill(houseData);
			return house.toJSON();
		default:
			break;
	}
	return {};
}
