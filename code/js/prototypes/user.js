User.prototype = new DataType();
User.prototype.constructor = User;

function User(UID, first_name, last_name, email) {
	this.UID = UID;
	this.first_name = firstName;
	this.last_name = lastName;
	this.email = email;
}
