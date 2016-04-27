Comment.prototype = new DataType();
Comment.prototype.constructor = Comment;
Comment.prototype._key = ["CID", "status_SID"];

function Comment(CID, date, date_edited, author_UID, status_SID, text) {
	this.CID = CID;
	this.date = date;
	this.date_edited = date_edited;
	this.author_UID = author_UID;
	this.status_SID = status_SID;
	this.text = text
}
