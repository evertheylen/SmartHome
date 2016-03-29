Sensor.prototype = new DataType();
Sensor.prototype.constructor = Sensor;

function Sensor(SID, type, title, user_UID, location_LID, location_name) {
	this.SID = SID;
	this.type = type;
	this.title = title;
	this.user_UID = user_UID;
	this.location_LID = location_LID;
	this.location_name = location_name;
}
