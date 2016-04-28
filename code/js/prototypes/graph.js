Graph.prototype = new DataType();
Graph.prototype.constructor = Graph;
Graph.prototype._key = ["GID"];

function Graph(GID, timespan, group_by, where, lines, title) {
	this.GID = GID;
	this.timespan = timespawn;
	this.group_by = group_by; // [{"grouped_by": [..], "sensors": [..], "values": []}, ... ] 
	this.where = where;
	this.lines = lines;
    this.title = title;
}
