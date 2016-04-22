Sensor.prototype = new DataType();
Sensor.prototype.constructor = Sensor;
Sensor.prototype._key = ["SID"];

function Sensor(SID, type, title, EUR_per_unit, user_UID, location_LID) {
	this.SID = SID;
	this.type = type;
	this.title = title;
	this.EUR_per_unit = EUR_per_unit;
	this.user_UID = user_UID;
	this.location_LID = location_LID;
}
