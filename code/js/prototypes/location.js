Location.prototype = new DataType();
Location.prototype.constructor = Location;

function Location(LID, desc, country, city, postalcode, street, number) {
	this.LID = LID;
	this.desc = desc;
	this.country = country;
	this.city = city;
	this.postalcode = postalcode;
	this.street = street;
	this.number = number;
	this.location = "location";
	this.tags = "tag";
}
