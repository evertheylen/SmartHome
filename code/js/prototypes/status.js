Status.prototype = new DataType();
Status.prototype.constructor = Status;
Status.prototype._key = ["SID"];

function Status(SID, date, date_edited, author_UID, wall_WID, text, graph) {
	this.SID = SID;
	this.date = date;
	this.date_edited = date_edited;
	this.author_UID = author_UID;
	this.wall_WID = wall_WID;
	this.text = text
    this.graph = graph;
}
