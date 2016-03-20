function DataType() {
	this.toJSON = function() {
		var tmp = {};

		for(var key in this) {
			if(typeof this[key] !== 'function') {
				console.log(key);
				tmp[key] = this[key];
			}
		}

		return tmp;
    	}
}
