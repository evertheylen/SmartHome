Value.prototype = new DataType();
Value.prototype.constructor = Value;

function Value(sensor_SID, time, value) {
	this.sensor_SID = ;
	this.time = new Date(time);
	this.value = value;

	this.fill = function(objectData) {
		this.sensor_SID = objectData["for"]["SID"];
		this.time = new Date(objectData[""]);
	}
}
