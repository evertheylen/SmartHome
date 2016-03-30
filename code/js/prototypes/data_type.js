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
	this.fill = function(objectData) {
		for(var key in this) {
			if(typeof this[key] !== 'function') {
				this[key] = objectData[key];
				console.log("Key has been filled: " + key);
				console.log("Result: " + this[key] + ", coming from: " + objectData[key]);
			}
		}
	}
}
