var handlers = {}; // specify functions to deal with server messages (that aren't a reply)
var answers = {};  // specify functions that need to be called when the server answers
var currentId = 0; // ID to use for the next request.
var requests = new Queue();  // Queue for requests that are waiting to be sent to the server.
var reconnectLimit = 10; // The maximum amount of times a websocket is allowed to reconnect.
var reconnects = 0; // The amount of times the websocket has attempted to reconnect.

// Used to avoid duplicates of the same object. 
var cache = {
		Sensor: [],
		Location: [],
		User: [],
		Group: [],

		searchKey: function(type, key) {
			var array = cache[type];
			for (var i=0; i < array.length; i++) {
				if (array[i].key === key) 
				    return i;
			}
			return -1;
		},

		getObject: function(type, key, data) {
			var index = cache.searchKey(type, key);
			var object = null;
			if(index === -1) {
				// If the object is not in the cache.
				object = getFilledObject(type, data);
				cache[type].push({key: key, object: object});
			}
			else {
				// If the object has been found.
				object = cache[type][index].object;
				object.fill(data);
			}
			return object;
		},

		removeObject: function(type, key) {
			var index = cache.searchKey(type, key);
			if(index !== -1)
				cache[type].splice(index, 1);
		}
}; 

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
		// Currently nothing happens when a websocket error has occured.
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
		// This cookie will only be alive for 1 day.
		setCookie("session", data["session"], 1);
		return {success: true, user: getFilledObject("User", data["user"])};
	}
	return {success: false, reason: data["reason"]};
}

function error_response(response) {
	error_type = response["data"]["short"];
	throw new Error(response["data"]["short"]);
}

function add_response(response) {
	var type = response["what"];
	var data = response["data"];
	var object = getFilledObject(type, data);
	cache[type].push({key: data[getKeyName(type)], object: object});
	return {success: true, for: response["for"], object: object};
}

function delete_response(response) {
	if (response["data"]["status"] == "success")
		return true;	
	return false;
}

function get_response(response) {
	var type = response["what"];
	var data = response["data"];
	var key = data[getKeyName(type)];  
	return {for: response["for"], object: cache.getObject(type, key, data)}
}

function get_all_response(response) {
	var objects = [];
	var type = response["what"];
	var data = response["data"];
	var keyName = getKeyName(type);  
	for(i = 0; i < data.length; i++)
		objects.push(cache.getObject(type, data[i][keyName], data[i]));
	return {for: response["for"], objects: objects};
}

function edit_response(response) {
	var type = response["what"];
	var data = response["data"];
	var key = data[getKeyName(type)];  
	return cache.getObject(type, key, data);
}

function live_add_response(response) {
	var type = response["what"];
	var data = response["data"];
	var object = getFilledObject(type, data);
	cache[type].push({key: data[getKeyName(type)], object: object});

	var parentData = response["for"];
	var parentType = parentData["what"];
	var parent = cache.getObject(parentType, parentData[getKeyName(parentType)], null);  
	// Update all html references of the parent.
	return {for: response["for"], object: object};
}

function live_delete_response(response) {
	var type = response["what"];
	var data = response["data"];
	var object = getFilledObject(type, data);
	cache[type].push({key: data[getKeyName(type)], object: object});

	if(response["for"] != undefined) {
		var parentData = response["for"];
		var parentType = parentData["what"];
		var parent = cache.getObject(parentType, parentData[getKeyName(parentType)], null);  
		// Update all html references of the parent.
		return true;
	}
	return true;
}

function live_edit_response(response) {
	/*
	{
		"what": "<class name>",
		"data": <entire definition with ID of object>
	}

	Update in cache
	Return Type + Key
	*/
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
		case "Group":
			object = new Group();
			break;
		case "Value":
			object = new Value();	
			break;
		/*
		case "Tag":
			object = new Tag();
			break;
		*/
		default:
			throw new Error("'What' in websocket request is of unknown type.");
	}
	object.fill(objectData);
	return object;
}

function getKeyName(type) {
	switch(type) {
		case "Sensor":
			return "SID";
		case "User":
			return "UID";
		case "Location":
			return "LID";
		case "Group":
			return "GID";
		case "Tag":
			return "";
		case "Value":
			return "sensor_SID";
		default:
			throw new Error("'What' in websocket request is of unknown type.");
	}	
}
