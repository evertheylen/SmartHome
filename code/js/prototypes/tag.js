Tag.prototype = new DataType();
Tag.prototype.constructor = Tag;

function Tag(description, sensor_SID) {
    this.description = description;
    this.sensor_SID = sensor_SID;
}
