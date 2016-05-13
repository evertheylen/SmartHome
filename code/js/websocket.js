var answers = {};  // specify functions that need to be called when the server answers
var currentId = 0; // Current request ID.
var requests = new Queue();  // Queue for requests that are waiting to be sent to the server.
var reconnectLimit = 10; // The maximum amount of times a websocket is allowed to reconnect.
var reconnects = 0; // The amount of times the websocket has attempted to reconnect.
var dataTypes = [Wall, User, Location, Sensor, Tag, Status, Like, Friendship, Group, Membership, Graph, Comment];
var errors = [];

// Used to avoid duplicates of the same object, memory management and live updating.
var cache = {
    Wall: {},
    User: {},
    Location: {},
    Sensor: {},
    Tag: {},
    Status: {},
    Like: {},
    Friendship: {},
    Group: {},
    Membership: {},
    Graph: {},
    Comment: {},

	getObject: function(type, key, data, scope) {
        if (!this[type][key]) {
            var object = getFilledObject(type, data);
            this.addObjectScope(object, scope);
            this[type][key] = object;
        }
        else {
            this[type][key].fill(data);
            if (scope) 
                this.addObjectScope(this[type][key], scope);
        }
        return this[type][key];
	},

	removeObject: function(type, key) {
        var object = this[type][key];
        object._scopes.forEach(function f(scope) { 
            delete this[scope].delete(object);
        });
        delete this[type][key];
	},

    addObjectScope: function(object, scope) {
        object._scopes.add(scope);
        if (!this[scope]) {
            this[scope] = new Set([object]);
            return;
        }
        this[scope].add(object);
    },

    removeScope: function(scope) {
        if (this[scope])
            this[scope].forEach(function f(object) { 
                if (object) { 
                    object.removeLiveScope(scope);
                    // Make sure UNREGISTER IS CALLED HERE.

                    object._scopes.delete(scope);
                    if (object._scopes.size === 0) {
                        var type = object.prototype.getName();
                        var key = getKey(type, object);
                        removeObject(type, key);
                    }                
                }            
            });
        delete this[scope];
    }
}; 

function connect_to_websocket() {
	websocket = new WebSocket("ws://" + window.location.host + "/ws");

	websocket.request = function (requestObject, f, scope, register) {
		// Data can be any object literal or prototype with the toJSON method.
        if (!register) {
		    answers[currentId] = {func: f, scope: scope};
		    requestObject.ID = currentId;
		    currentId++;
        }
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
            console.log("Queued message: " + stringToSend);
		}
	}

	websocket.onopen = function() {
		console.log("Websocket opened");
		// Reset the reconnect counter.
		reconnects = 0;
		// Handle all the requests that have been waiting.
		while (!requests.isEmpty()) {
			console.log("Sent queued data to the server:");
			console.log(requests.peek());
			websocket.send(requests.dequeue());
        }
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
            answer = {scope: null, func: function(){}};
            if (receivedObject["ID"])
                answer = answers[receivedObject.ID];
			polishedObject = window[receivedObject["type"] + "_response"](receivedObject, answer.scope);
            console.log("Calling answer function");
			answer.func(polishedObject);
		}
		catch(err) {
    		console.log('%c Websocket Error occured: ' + err.message, 'color: #ff0000');       
            if (err["name"]) {
                var error = errors.filter(function findError(el) {return el.name == err["name"];})
                if (error.length == 1)
                    error[0].func();
            }
			return;
		}
	};

	websocket.onerror = function(evt) {
		// Currently nothing happens when a websocket error has occured.
		console.log("%c Websocket Error occured: " + evt.data, 'color: #ff0000');
	};

	return websocket;
}

function signup_response(response) {
	data = response["data"];
	if(data["status"] == "success")
		return {success: true, UID: data["UID"]};
	return {success: false, reason: data["reason"]};
}

function login_response(response, scope) {
	data = response["data"];
	if(data["status"] == "success") {
		// This cookie will only be alive for 1 day.
		setCookie("session", data["session"], 1);
        var userData = data["user"];
        var key = getKey("User", userData);
		return {success: true, user: cache.getObject("User", key, userData, scope)};
	}
	return {success: false, reason: data["reason"]};
}

function error_response(response) {
	var error_type = response["data"]["short"];
	var error_description = response["data"]["long"];
    throw {name : error_type, message : error_description}; 
}

function add_response(response, scope) {
	var type = response["what"];
	var data = response["data"];
    var key = getKey(type, data);
    if (type == "Graph") 
        return data;
	return {success: true, for: response["for"], object: cache.getObject(type, key, data, scope)};
}

function delete_response(response) {
	if (response["data"]["status"] == "success")
		return true;	
	return false;
}

function get_response(response, scope) {
	var type = response["what"];
	var data = response["data"];
	var key = getKey(type, data);  
	return {for: response["for"], object: cache.getObject(type, key, data, scope)}
}

function get_all_response(response, scope) {
	var objects = [];
	var type = response["what"];
	var data = response["data"];
    if(type.indexOf("Value") > -1)
		return {for: response["for"], objects: data};
	for(var i = 0; i < data.length; i++)
		objects.push(cache.getObject(type, getKey(type, data[i]), data[i], scope));
	return {for: response["for"], objects: objects};
}

function create_graph_response(response) {
	var data = response["data"];
	var key = getKey("Graph", data);  
	return getFilledObject("Graph", data);
}

function edit_response(response, scope) {
	var type = response["what"];
	var data = response["data"];
	var key = getKey(type, data);  
	return cache.getObject(type, key, data, scope);
}

function live_add_ref_response(response) {
    var to = response["to"];
    var type = to["what"];
    var from = response["from"];
    object = cache[type][getKey(type, to)];
    if (object)
        object.updateLiveScopes(from["what"]);
}

function live_remove_ref_response(response) {
    var to = response["to"];
    var type = to["what"];
    var from = response["from"];
    var object = cache[type][getKey(type, to)];
    if (object)
        object.updateLiveScopes(from["what"]);
}

function live_edit_response(response) {
    var type = response["what"];
    var key = getKey(type, response["data"]);
    var object = cache.getObject(type, key, data);
    if (object)
        object.updateLiveScopes("None");
}

function live_delete_response(response) {
    var type = response["what"];
    var key = getKey(type, response["data"]);
    var object = cache[type][key];
    if (object)
        object.updateLiveScopes("None");
}

function getFilledObject(what, objectData) {
    for(i = 0; i < dataTypes.length; i++) {
        if(dataTypes[i].prototype.getName() == what) {
            var object = new dataTypes[i]();
            object.fill(objectData);
            return object;    
        }
    }
    throw {name : "typeError", message : "'What' in websocket request is of unknown type."}; 
}

function getKey(type, data) {
    for(var n = 0; n < dataTypes.length; n++) {
        if(dataTypes[n].prototype.getName() == type) {
            var key = dataTypes[n].prototype._key;
            var tmp = [];
            for (m = 0; m < key.length; m++) 
                tmp.push(data[key[m]]);
            return tmp;
        }
    }
    throw {name : "typeError", message : "'What' in websocket request is of unknown type."}; 
}
