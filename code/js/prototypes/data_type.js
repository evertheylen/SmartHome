function DataType() {
	// Used to track how the object was received from the database.
	this.db_log = [];

	this.toJSON = function() {
		var tmp = {};

		for(var key in this) {
			if(typeof this[key] !== 'function') {
				tmp[key] = this[key];
			}
		}

		return tmp;
    	}

	// Caution: Can throw syntax error if key not in ObjectData.
	this.fill = function(objectData) {
		for(var key in this) {
			if(typeof this[key] !== 'function' && key[0] != "_") {
				this[key] = objectData[key];
			}
		}
	}
}
