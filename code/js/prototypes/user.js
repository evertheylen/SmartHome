User.prototype = new DataType();
User.prototype.constructor = User;

function User(id, firstName, lastName, emailAdress) {
	this.id = id;
	this.firstName = firstName;
	this.lastName = lastName;
	this.emailAdress = emailAdress;
}
