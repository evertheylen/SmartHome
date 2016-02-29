
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
		...
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
		"data": "success"
	}

Server response (Fail):

	{
		"type": "signup",
		"data": "fail",
		"error": ...
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

Server response (Fail): normal failure message

Server response (Success):

	{
		"type": "login",
		"data": {
			"session": "78SD451xdsf487scxg4i7ojkh14q12z4c1f4e87rhj4",
			"user": <definition of user including UID>
		}
	}

While logged in, the cookie (=session) has been set, which the server can get from the headers.

### Logout

Client message:

	{
		"type": "logout"
	}

No server response is needed.

## Getting, adding, deleting data

The `"what"` attribute is the class of the object you are dealing with. Example: `Sensor` or `User`.

In the following "ID" refers to either "SID" (for Sensors) or "UID" (for Users) and so on

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

Response (Failure): normal failure message

### Deleting

Message:

	{
		"type": "delete",
		"what": <object class>,
		"data": {
			"ID": <ID of what you want to delete>,
		} 
	}

Response is either `"data" = "success"` or a typical fail message.

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

#### Getting multiple objects

For now, we only support sensors, so by default the server will only send sensors that are owned by the user.

Message:

	{
		"type": "get_all",
		"what": "Sensor",
		// no data necessary
	}

Response:

(Note, `"data"` is an array here)

	{
		"type": "get_all",
		"what": "Sensor",
		"data": [
			<definition 1>,
			<definition 2>,
			...
		]
	}

There can be failure, but it can also happen that the server returns an empty list. This is not considered an error.

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

