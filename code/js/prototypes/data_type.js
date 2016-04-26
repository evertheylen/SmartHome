function DataType() {
	// Used to track in which scopes the object is being used
	this._scopes = [];

	this.toJSON = function() {
		var tmp = {};

		for(var key in this) {
			if(typeof this[key] !== 'function' && key[0] != "_") {
				tmp[key] = this[key];
			}
		}

		return tmp;
	};

	// Caution: Can throw syntax error if key not in ObjectData.
	this.fill = function(objectData) {
		for(var key in this) {
			if(typeof this[key] !== 'function' && key[0] != "_" && objectData[key]) {
				this[key] = objectData[key];
			}
	    }
	};

    this.getName = function() { 
        var funcNameRegex = /function (.{1,})\(/;
        var results = (funcNameRegex).exec((this).constructor.toString());
        return (results && results.length > 1) ? results[1] : "";
    };
}
