User.prototype = new DataType();
User.prototype.constructor = User;

function User() {
	this.id = 0;
	this.firstName = "";
	this.lastName = "";
	this.emailAdress = "";
}