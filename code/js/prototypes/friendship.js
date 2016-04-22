Friendship.prototype = new DataType();
Friendship.prototype.constructor = Friendship;

function Friendship(user1_UID, user2_UID) {
	this.user1_UID = user1_UID;
	this.user2_UID = user2_UID;
}

