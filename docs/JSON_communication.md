
# JSON Communication

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

Server response: TODO

### Login

Client message:

	{
		"type": "login",
		"data": {
			"user": {
				"ID": "abc"
			},
			"password": "123",
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

	{
		"type": "logout"
	}





