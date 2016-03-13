
# JSON Communication

Everything also contains an ID!

	{
		"ID": 123,
		"type": ...,
		"data": ...
	}

## Errors

If an error occurs and the requested operation did not complete; the backend will send a message back like this:

	{
		"ID": 123,
		"type": "error",
		"data": "fail",
		"error": {
			"short": "short string to be interpreted by frontend",
			"long": "long string for dialog etc"
		}
	}

## User Auth

### Signup

Client message:

	{
		"type": "signup",
		"data": {
			"email": "...",
			"password": "123",
			"first_name": ...,
			"last_name": ...,
		}
	}

Server response (Succes): 

	{
		"type": "signup",
		"data": {
			"result": "succes",
			"UID": 1
		}
	}

Server response (Fail):

	{
		"type": "signup",
		"data": {
			"result": "failure"
		}	
	}

### Login

Client message:

	{
		"type": "login",
		"data": {
			"email": "abc",
			"password": "123"
		}
	}

Server response (Fail):

	{
		"type": "signup",
		"data": {
			"result": "failure"
		}	
	}

Server response (Success):

	{
		"type": "login",
		"data": {
			"result": "succes",
			"session": "78SD451xdsf487scxg4i7ojkh14q12z4c1f4e87rhj4",
			"user": <definition of user including UID>
		}
	}

<definition of user including UID>:
	{
		"UID": 123,
		"firstName": "Douglas",
		"lastName": "Adams"
	}

While logged in, the cookie (=session) has been set, which the server can get from the headers.
42
### Logout

Client message:

	{
		"type": "logout"
	}

No server response is needed.

## Getting, adding, deleting data

The `"what"` attribute is the class of the object you are dealing with. Example: `Sensor` or `User`.

In the following `"ID"` refers to either `"SID"` (for Sensors) or `"UID"` (for Users) and so on.

In some cases, there is a `"for"` attribute. This is used to refer to objects related to some other object. An example is adding a value for a given sensor.
It looks like this:

	{
		...
		"for": {
			"what": "Sensor",
			"SID": 123,
		}
		...
	}

You have to add a `"for"` attribute when it is not clear what you mean. For example, when adding values the definition is not enough to know for which sensor the value holds. 
"Bigger" datatypes will usually store ID's of other object they refer to (e.g. a Sensor has a `"UID"` attribute).

### Adding

Message:

	{
		"type": "add",
		"what": <object class>,
		"data": <definition without ID>
	}

Response (Success):

	{
		"type": "add",
		"what": <object class>,
		"data": <entire definition with ID>
	}

Response (Failure): 

	{
		"type": "add",
		"what": <object class>,
		"data": <entire definition with ID>
	}


When adding a value, you need to specify for which sensor it is.

### Deleting

Message:

	{
		"type": "delete",
		"what": <object class>,
		"data": {
			"ID": <ID of what you want to delete>,
		} 
	}

Response is either `"result" = "success"` or `"result" = "failure"`.

Again, for a value you need a `"for"` attribute.

### Getting

#### Getting a single object by ID

Message:

	{
		"type": "get",
		"what": <object class>,
		"data": {
			"ID": <ID>,
		}
	}

Response (Success):

	{
		"type": "get",
		"what": <object class>,
		"data": <entire definition>
	}

Response (Fail): normal fail message

So far there is no way to get a single Value, and therefore no `"get"` message will need a `"for"` attribute (this may change in the future).

#### Getting multiple objects

Message:

	{
		"type": "get_all",
		"what": "Sensor",
		"for": {
			"what": "User",
			"UID": "123",
		}
	}

Response:

(Note, `"data"` is an array here)

	{
		"type": "get_all",
		"what": "Sensor",
		"for": {
			"what": "User",
			"UID": "123",
		}
		"data": [
			<definition 1>,
			<definition 2>,
			...
		]
	}

There can be failure, but it can also happen that the server returns an empty list. This is not considered an error.

Another example for Data:

Message:

	{
		"type": "get_all",
		"what": "Value",
		"for": {
			"what": "Sensor",
			"SID": "123",
		}
	}

Response:

	{
		"type": "get_all",
		"what": "Value",
		"for": {
			"what": "Sensor",
			"SID": "123",
		}
		"data": [
			[1234567890, 3.1415],
			[1234567891, 3.1546],
			[1234567891, 3.7460],
			...
		]
	}

### Editing

	{
		"type": "edit",
		"what": <class>,
		"data": {
			<new definition WITH ID>
		}
	}



## Definitions

ID's are separate for each type, so it may happen there is a user and a sensor with the same ID.

### User

	{
		"UID": 123,
		"email": "jeroen.verstraelen@hotmail.com",
		"first_name": "Jeroen",
		"last_name": "Verstraelen",
	}

### Sensor

	{
		"SID": 456,
		"type": "Electricity",
		"title": "Measures electricity usage of desktop",
	}

#### Value

A value for a given sensor is encoded in JSON as a simple array (should be interpreted as a tuple):

	[1234567890, 12.457]

The first number is the amount of milliseconds since the UNIX epoch. In Linux you can get that value using `date +%s%3N` and in
Javascript you can simply construct a Date object with that number: `var d = new Date(1234567890)`. The second number is a real number.

A value is uniquely identified by the sensor and it's timestamp.

## Live updates

	{
		"ID": 123,
		"type": "register" / "unregister",
		"what": "<class>",
		"data": {
			"QID" / "SID": 123
		}
	}

Server responses can be of type: `add`, `delete`, `edit`.

For now, registering on a user will also send updates on which sensors the user owns.

Closing the connection will unregister from any objects.

`edit` will simply send a new definition of the object. 

