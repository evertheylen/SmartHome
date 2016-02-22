function DataType() {
	this.toJSON = function() {
		var tmp = {};

		for(var key in this) {
			if(typeof this[key] !== 'function')
				tmp[key] = this[key];
		}

		return tmp;
    }
}