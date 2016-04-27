Graph.prototype = new DataType();
Graph.prototype.constructor = Graph;
Graph.prototype._key = ["UID"];

function Graph(GID, timespan, group_by, where, lines) {
	this.GID = GID;
	this.timespan = timespawn;
	this.group_by = group_by; // [{"grouped_by": [..], "sensors": [..], "values": []}, ... ] 
	this.where = where;
	this.lines = lines;
}
