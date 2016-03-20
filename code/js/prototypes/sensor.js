Sensor.prototype = new DataType();
Sensor.prototype.constructor = Sensor;

function Sensor(SID, UID, title, type) {
	this.SID = SID;
	this.UID = UID;
	this.title = title;
	this.type = type;
	//this.tags = ""; Find out how we're going to use tags.
}
