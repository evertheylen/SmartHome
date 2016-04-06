Membership.prototype = new DataType();
Membership.prototype.constructor = Membership;

function Membership(status, last_change, user_UID, group_GID) {
	this.status = status;
	this.last_change = last_change;
	this.user_UID = user_UID;
	this.group_GID = group_GID;
}
