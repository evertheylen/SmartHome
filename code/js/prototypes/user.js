User.prototype = new DataType();
User.prototype.constructor = User;

function User(Id, firstName = "undefined", lastName = "undefined", emailAdress = "undefined") {
	this.id = 0;
	this.firstName = "";
	this.lastName = "";
	this.emailAdress = "";
}
