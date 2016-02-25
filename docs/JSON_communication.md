
# JSON Communication

Everything also contains an ID!

	{
		"ID": 123,
		"type": ...,
		"data": ...
	}

## User Auth

### Signup

Client message:

	{
		"type": "signup",
		"data": {
			"user": "abc",
			"password": "123",
			more info here ...
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
		"data": "fail"
	}

### Login

Client message:

	{
		"type": "login",
		"data": {
			"username": "abc",
			"password": "123"
		}
	}

Server response (Fail):

	{
		"type": "login",
		"data": "fail"
	}

Server response (Success):

	{
		"type": "login",
		"data": {
			"session": "78SD451xdsf487scxg4i7ojkh14q12z4c1f4e87rhj45GFdf1d2s7f8d11asq1d8sdaK45FDW12"
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

### Adding

Client message:

	{
		"type": "add",
		"what": <object class>,
		"data": <definition without ID>
	}

Server response (Success):

	{
		"type": "add",
		"what": <object class>,
		"data": <entire definition with ID>
	}

Server response (Failure):
	
	{
		"type": "add",
		"what": <object class>,
		"data": "failure"
	}

### Deleting

Client message:

	{
		"type": "delete",
		"what": <object class>,
		"data": <ID of what you want to delete>,
	}

Server response:

	{
		"type": "add",
		"what": <object class>,
		"data": "failure" / "success"
	}

### Getting

#### Getting a single object by ID

Client message:

	{
		"type": "get",
		"what": <object class>,
		"data": {
			"ID": <ID>,
		}
	}

Server response (Success):

	{
		"type": "get",
		"what": <object class>,
		"data": <entire definition>
	}

Server response (Fail): simple failure message like in Adding

#### Getting multiple objects

For now, we only support sensors, so by default the server will only send sensors that are owned by the user.

Client message:

	{
		"type": "get_all",
		"what": "Sensor",
		// no data necessary
	}

Server response:

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

There is no real failure, but it could be that the server returns an empty list.
