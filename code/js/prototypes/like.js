Like.prototype = new DataType();
Like.prototype.constructor = Like;
Like.prototype._key = ["status_SID", "user_UID"];

function Like(positive, status_SID, user_UID) {
	this.positive = positive;
	this.status_SID = status_SID;
	this.user_UID = user_UID;
}
