Location.prototype = new DataType();
Location.prototype.constructor = Location;

function Location(LID, description, number, street, city, postalcode, country, user_UID) {
	this.LID = LID;
	this.description = description;
	this.number = number;
	this.street = street;
	this.city = city;
	this.postalcode = postalcode;
	this.country = country;
	this.user_UID = user_UID;
}
