Wall.prototype = new DataType();
Wall.prototype.constructor = Wall;
Wall.prototype._key = ["WID"];

function Wall(WID, is_user) {
	this.WID = WID
    this.is_user = is_user;
}
