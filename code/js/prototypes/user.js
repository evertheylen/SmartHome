User.prototype = new DataType();
User.prototype.constructor = User;

function User(UID, first_name, last_name, email) {
	this.UID = UID;
	this.first_name = first_name;
	this.last_name = last_name;
	this.email = email;
}
