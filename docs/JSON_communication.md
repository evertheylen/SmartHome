
# JSON Communication

## User Auth

Signup:

	{
		"type": "signup",
		"data": {
			"user": "abc",
			"password": "123",
			more info here ...
		}
	}

Login:

	{
		"type": "login",
		"data": {
			"user": "abc",
			"password": "123",
		}
	}

Login response:

	{
		"type": "fail",
		"data": {
			"what": "login",
		}
	}

While logged in, a cookie has been set, which the server can get from the headers.

Logout:

	{
		"type": "logout"
	}


ws.send("login", {"username": "jdkfjskf", "djflksjf": "dfhjskjf"})


