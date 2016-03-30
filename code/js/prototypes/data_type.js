function DataType() {
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
	this.getArguments = function(objectData) {
		var tmp = [];

		for(var key in this) {
			if(typeof this[key] !== 'function') {
				tmp.push(objectData.key);
			}
		}

		return tmp;
	}
}
