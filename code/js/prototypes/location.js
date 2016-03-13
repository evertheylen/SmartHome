Location.prototype = new DataType();
Location.prototype.constructor = Location;

function Location(LID, desc, country, city, postalCode, street, number) {
	this.id = LID;
	this.desc = desc;
	this.country = country;
	this.city = city;
	this.postalCode = postalCode;
	this.street = street;
	this.number = number;
}
