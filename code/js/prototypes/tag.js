Tag.prototype = new DataType();
Tag.prototype.constructor = Tag;
Tag.prototype._key = ["sensor_SID", "description"];

function Tag(description, sensor_SID) {
    this.description = description;
    this.sensor_SID = sensor_SID;
}
