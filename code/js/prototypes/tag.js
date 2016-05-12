Tag.prototype = new DataType();
Tag.prototype.constructor = Tag;
Tag.prototype._key = ["TID"];

function Tag(TID, text) {
    this.TID = TID;
    this.text = text;
}
