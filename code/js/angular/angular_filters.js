angular.module('overwatch').filter('startFrom', function() {
	return function(input, start) {
		if(input) {
			start = +start; //parse to int
			return input.slice(start);
		}
		return [];
	}
});

angular.module("overwatch").filter('index', function () {
    return function (array, index) {
        if (!index)
            index = 'index';
        for (var i = 0; i < array.length; ++i) {
            array[i][index] = i;
        }
        return array;
    };
});

angular.module("overwatch").filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

