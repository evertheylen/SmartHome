function DataType() {
    this._scopes = new Set();
    this._liveScopes = {};

    this.updateLiveScopes = function(type) { 
        this._liveScopes["None"].forEach(function(scope){
            console.log("Updating scope with None");
            scope.update();
        });
        this._liveScopes[type].forEach(function(scope){
            console.log("Updating scope with " + type);
            scope.update();
        });
    };

    this.addLiveScope = function(scope, type) {
        if (this._liveScopes[type]) {
            this._liveScopes[type].add(scope);
            return;
        }
        this._liveScopes[type] = new Set([scope]);
    };

    this.removeLiveScope = function(scope) {
        for (var key in this._liveScopes)
            this._liveScopes[key].delete(scope);
    };

	this.toJSON = function() {
		var tmp = {};

		for (var key in this) {
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
