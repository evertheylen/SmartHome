Group.prototype = new DataType();
Group.prototype.constructor = Group;

function Group(GID, title, description, wall_WID) {
	this.GID = GID;
	this.title = title;
	this.description = description;
	this.wall_WID = wall_WID;
}
