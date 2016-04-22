Wall.prototype = new DataType();
Wall.prototype.constructor = Wall;

function Wall(WID, is_user) {
	this.WID = WID
    this.is_user = is_user;
    this._key = "WID";
}
