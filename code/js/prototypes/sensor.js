Sensor.prototype = new DataType();
Sensor.prototype.constructor = Sensor;

function Sensor(id, title, locationId, type) {
	this.id = id;
	this.title = title;
	this.locationId = locationId;
	this.type = type;
	//this.tags = ""; Find out how we're going to use tags.
}
