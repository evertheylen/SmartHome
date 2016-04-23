Tag.prototype = new DataType();
Tag.prototype.constructor = Tag;
Tag.prototype._key = ["sensor_SID", "text"];

function Tag(text, sensor_SID) {
    this.text = text;
    this.sensor_SID = sensor_SID;
}
