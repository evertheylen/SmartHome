Comment.prototype = new DataType();
Comment.prototype.constructor = Comment;
Comment.prototype._key = ["CID", "SID"];

function Status(CID, date, date_edited, author_UID, SID, text) {
	this.CID = CID;
	this.date = date;
	this.date_edited = date_edited;
	this.author_UID = author_UID;
	this.SID = SID;
	this.text = text
}
