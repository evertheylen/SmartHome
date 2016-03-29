angular.module("overwatch").controller("sensorController", function($scope, $rootScope, $filter, $timeout, Auth) {
		
	$rootScope.tab = "sensorslink";
	$rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
	$rootScope.auth_user = Auth.getUser();
	$scope.add_autocomplete = function (tag) {
		var i = $scope.tags.length;
		while (i--) {
			if ($scope.tags[i].text === tag.text) {
				return;
			}
		}
		$scope.tags.push(tag);
	};

	$scope.check_autocomplete = function (query) {
		return $filter('filter')($scope.tags, query);
	};

    $scope.houses = [];

	ws.request({type: "get_all", what: "Location", for: {what: "User", UID: $rootScope.auth_user.UID}}, function(response) {
		$scope.houses = response.houses;
		$scope.$apply();
	});

	$scope.sensors = [];

	ws.request({type: "get_all", what: "Sensor", for: {what: "User", UID: $rootScope.auth_user.UID}}, function(response) {
		$scope.sensors = response.sensors;
		updateFilteredSensors();
    		console.log("Filtered Sensors: " + $scope.filteredSensors);
		console.log("Sensor array: " + $scope.sensors);
		$scope.$apply();
	});
	
	$scope.tags = [{text: "keuken"}, {text: "kerstverlichting"}];
    
	$scope.types = ["Electricity", "Movement", "Water", "Temperature", "Other"];


	/*
	$scope.houses = [{"desc": "Campus Middelheim", "country": "Belgium", "city": "Antwerp", "postalcode": 2020, "street": "Middelheimlaan", "number": 1}, 
			    {"desc": "Campus Groenenborger", "country": "Belgium", "city": "Antwerp", "postalcode": 2020, "street": "Groenenborgerlaan", "number": 171}, 
			    {"desc": "Campus Drie Eiken", "country": "Belgium", "city": "Antwerp", "postalcode": 2610, "street": "Universiteitsplein", "number": 1}];
	*/
	
/*
	$scope.sensors = [{"name": "Sensor 1", "house": "Campus Middelheim", "type": "Electricity", "tags": [$scope.tags[1]]}, 
			  {"name": "Sensor 2", "house": "Campus Groenenborger", "type": "Movement", "tags": [$scope.tags[0], $scope.tags[1]]},
    {'name': 'sensor 0', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 0'},
{'name': 'sensor 1', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 1'},
{'name': 'sensor 2', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 2'},
{'name': 'sensor 3', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 3'},
{'name': 'sensor 4', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 4'},
{'name': 'sensor 5', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 5'},
{'name': 'sensor 6', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 6'},
{'name': 'sensor 7', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 7'},
{'name': 'sensor 8', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 8'},
{'name': 'sensor 9', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 9'},
{'name': 'sensor 10', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 10'},
{'name': 'sensor 11', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 11'},
{'name': 'sensor 12', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 12'},
{'name': 'sensor 13', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 13'},
{'name': 'sensor 14', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 14'},
{'name': 'sensor 15', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 15'},
{'name': 'sensor 16', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 16'},
{'name': 'sensor 17', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 17'},
{'name': 'sensor 18', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 18'},
{'name': 'sensor 19', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 19'},
{'name': 'sensor 20', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 20'},
{'name': 'sensor 21', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 21'},
{'name': 'sensor 22', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 22'},
{'name': 'sensor 23', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 23'},
{'name': 'sensor 24', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 24'},
{'name': 'sensor 25', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 25'},
{'name': 'sensor 26', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 26'},
{'name': 'sensor 27', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 27'},
{'name': 'sensor 28', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 28'},
{'name': 'sensor 29', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 29'},
{'name': 'sensor 30', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 30'},
{'name': 'sensor 31', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 31'},
{'name': 'sensor 32', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 32'},
{'name': 'sensor 33', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 33'},
{'name': 'sensor 34', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 34'},
{'name': 'sensor 35', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 35'},
{'name': 'sensor 36', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 36'},
{'name': 'sensor 37', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 37'},
{'name': 'sensor 38', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 38'},
{'name': 'sensor 39', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 39'},
{'name': 'sensor 40', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 40'},
{'name': 'sensor 41', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 41'},
{'name': 'sensor 42', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 42'},
{'name': 'sensor 43', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 43'},
{'name': 'sensor 44', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 44'},
{'name': 'sensor 45', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 45'},
{'name': 'sensor 46', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 46'},
{'name': 'sensor 47', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 47'},
{'name': 'sensor 48', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 48'},
{'name': 'sensor 49', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 49'},
{'name': 'sensor 50', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 50'},
{'name': 'sensor 51', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 51'},
{'name': 'sensor 52', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 52'},
{'name': 'sensor 53', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 53'},
{'name': 'sensor 54', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 54'},
{'name': 'sensor 55', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 55'},
{'name': 'sensor 56', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 56'},
{'name': 'sensor 57', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 57'},
{'name': 'sensor 58', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 58'},
{'name': 'sensor 59', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 59'},
{'name': 'sensor 60', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 60'},
{'name': 'sensor 61', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 61'},
{'name': 'sensor 62', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 62'},
{'name': 'sensor 63', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 63'},
{'name': 'sensor 64', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 64'},
{'name': 'sensor 65', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 65'},
{'name': 'sensor 66', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 66'},
{'name': 'sensor 67', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 67'},
{'name': 'sensor 68', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 68'},
{'name': 'sensor 69', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 69'},
{'name': 'sensor 70', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 70'},
{'name': 'sensor 71', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 71'},
{'name': 'sensor 72', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 72'},
{'name': 'sensor 73', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 73'},
{'name': 'sensor 74', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 74'},
{'name': 'sensor 75', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 75'},
{'name': 'sensor 76', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 76'},
{'name': 'sensor 77', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 77'},
{'name': 'sensor 78', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 78'},
{'name': 'sensor 79', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 79'},
{'name': 'sensor 80', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 80'},
{'name': 'sensor 81', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 81'},
{'name': 'sensor 82', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 82'},
{'name': 'sensor 83', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 83'},
{'name': 'sensor 84', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 84'},
{'name': 'sensor 85', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 85'},
{'name': 'sensor 86', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 86'},
{'name': 'sensor 87', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 87'},
{'name': 'sensor 88', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 88'},
{'name': 'sensor 89', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 89'},
{'name': 'sensor 90', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 90'},
{'name': 'sensor 91', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 91'},
{'name': 'sensor 92', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 92'},
{'name': 'sensor 93', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 93'},
{'name': 'sensor 94', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 94'},
{'name': 'sensor 95', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 95'},
{'name': 'sensor 96', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 96'},
{'name': 'sensor 97', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 97'},
{'name': 'sensor 98', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 98'},
{'name': 'sensor 99', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 99'},
{'name': 'sensor 100', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 100'},
{'name': 'sensor 101', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 101'},
{'name': 'sensor 102', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 102'},
{'name': 'sensor 103', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 103'},
{'name': 'sensor 104', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 104'},
{'name': 'sensor 105', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 105'},
{'name': 'sensor 106', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 106'},
{'name': 'sensor 107', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 107'},
{'name': 'sensor 108', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 108'},
{'name': 'sensor 109', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 109'},
{'name': 'sensor 110', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 110'},
{'name': 'sensor 111', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 111'},
{'name': 'sensor 112', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 112'},
{'name': 'sensor 113', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 113'},
{'name': 'sensor 114', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 114'},
{'name': 'sensor 115', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 115'},
{'name': 'sensor 116', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 116'},
{'name': 'sensor 117', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 117'},
{'name': 'sensor 118', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 118'},
{'name': 'sensor 119', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 119'},
{'name': 'sensor 120', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 120'},
{'name': 'sensor 121', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 121'},
{'name': 'sensor 122', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 122'},
{'name': 'sensor 123', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 123'},
{'name': 'sensor 124', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 124'},
{'name': 'sensor 125', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 125'},
{'name': 'sensor 126', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 126'},
{'name': 'sensor 127', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 127'},
{'name': 'sensor 128', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 128'},
{'name': 'sensor 129', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 129'},
{'name': 'sensor 130', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 130'},
{'name': 'sensor 131', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 131'},
{'name': 'sensor 132', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 132'},
{'name': 'sensor 133', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 133'},
{'name': 'sensor 134', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 134'},
{'name': 'sensor 135', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 135'},
{'name': 'sensor 136', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 136'},
{'name': 'sensor 137', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 137'},
{'name': 'sensor 138', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 138'},
{'name': 'sensor 139', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 139'},
{'name': 'sensor 140', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 140'},
{'name': 'sensor 141', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 141'},
{'name': 'sensor 142', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 142'},
{'name': 'sensor 143', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 143'},
{'name': 'sensor 144', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 144'},
{'name': 'sensor 145', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 145'},
{'name': 'sensor 146', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 146'},
{'name': 'sensor 147', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 147'},
{'name': 'sensor 148', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 148'},
{'name': 'sensor 149', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 149'},
{'name': 'sensor 150', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 150'},
{'name': 'sensor 151', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 151'},
{'name': 'sensor 152', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 152'},
{'name': 'sensor 153', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 153'},
{'name': 'sensor 154', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 154'},
{'name': 'sensor 155', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 155'},
{'name': 'sensor 156', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 156'},
{'name': 'sensor 157', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 157'},
{'name': 'sensor 158', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 158'},
{'name': 'sensor 159', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 159'},
{'name': 'sensor 160', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 160'},
{'name': 'sensor 161', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 161'},
{'name': 'sensor 162', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 162'},
{'name': 'sensor 163', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 163'},
{'name': 'sensor 164', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 164'},
{'name': 'sensor 165', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 165'},
{'name': 'sensor 166', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 166'},
{'name': 'sensor 167', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 167'},
{'name': 'sensor 168', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 168'},
{'name': 'sensor 169', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 169'},
{'name': 'sensor 170', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 170'},
{'name': 'sensor 171', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 171'},
{'name': 'sensor 172', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 172'},
{'name': 'sensor 173', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 173'},
{'name': 'sensor 174', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 174'},
{'name': 'sensor 175', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 175'},
{'name': 'sensor 176', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 176'},
{'name': 'sensor 177', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 177'},
{'name': 'sensor 178', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 178'},
{'name': 'sensor 179', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 179'},
{'name': 'sensor 180', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 180'},
{'name': 'sensor 181', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 181'},
{'name': 'sensor 182', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 182'},
{'name': 'sensor 183', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 183'},
{'name': 'sensor 184', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 184'},
{'name': 'sensor 185', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 185'},
{'name': 'sensor 186', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 186'},
{'name': 'sensor 187', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 187'},
{'name': 'sensor 188', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 188'},
{'name': 'sensor 189', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 189'},
{'name': 'sensor 190', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 190'},
{'name': 'sensor 191', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 191'},
{'name': 'sensor 192', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 192'},
{'name': 'sensor 193', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 193'},
{'name': 'sensor 194', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 194'},
{'name': 'sensor 195', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 195'},
{'name': 'sensor 196', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 196'},
{'name': 'sensor 197', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 197'},
{'name': 'sensor 198', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 198'},
{'name': 'sensor 199', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 199'},
{'name': 'sensor 200', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 200'},
{'name': 'sensor 201', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 201'},
{'name': 'sensor 202', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 202'},
{'name': 'sensor 203', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 203'},
{'name': 'sensor 204', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 204'},
{'name': 'sensor 205', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 205'},
{'name': 'sensor 206', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 206'},
{'name': 'sensor 207', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 207'},
{'name': 'sensor 208', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 208'},
{'name': 'sensor 209', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 209'},
{'name': 'sensor 210', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 210'},
{'name': 'sensor 211', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 211'},
{'name': 'sensor 212', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 212'},
{'name': 'sensor 213', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 213'},
{'name': 'sensor 214', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 214'},
{'name': 'sensor 215', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 215'},
{'name': 'sensor 216', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 216'},
{'name': 'sensor 217', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 217'},
{'name': 'sensor 218', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 218'},
{'name': 'sensor 219', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 219'},
{'name': 'sensor 220', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 220'},
{'name': 'sensor 221', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 221'},
{'name': 'sensor 222', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 222'},
{'name': 'sensor 223', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 223'},
{'name': 'sensor 224', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 224'},
{'name': 'sensor 225', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 225'},
{'name': 'sensor 226', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 226'},
{'name': 'sensor 227', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 227'},
{'name': 'sensor 228', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 228'},
{'name': 'sensor 229', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 229'},
{'name': 'sensor 230', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 230'},
{'name': 'sensor 231', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 231'},
{'name': 'sensor 232', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 232'},
{'name': 'sensor 233', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 233'},
{'name': 'sensor 234', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 234'},
{'name': 'sensor 235', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 235'},
{'name': 'sensor 236', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 236'},
{'name': 'sensor 237', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 237'},
{'name': 'sensor 238', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 238'},
{'name': 'sensor 239', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 239'},
{'name': 'sensor 240', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 240'},
{'name': 'sensor 241', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 241'},
{'name': 'sensor 242', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 242'},
{'name': 'sensor 243', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 243'},
{'name': 'sensor 244', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 244'},
{'name': 'sensor 245', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 245'},
{'name': 'sensor 246', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 246'},
{'name': 'sensor 247', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 247'},
{'name': 'sensor 248', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 248'},
{'name': 'sensor 249', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 249'},
{'name': 'sensor 250', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 250'},
{'name': 'sensor 251', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 251'},
{'name': 'sensor 252', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 252'},
{'name': 'sensor 253', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 253'},
{'name': 'sensor 254', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 254'},
{'name': 'sensor 255', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 255'},
{'name': 'sensor 256', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 256'},
{'name': 'sensor 257', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 257'},
{'name': 'sensor 258', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 258'},
{'name': 'sensor 259', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 259'},
{'name': 'sensor 260', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 260'},
{'name': 'sensor 261', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 261'},
{'name': 'sensor 262', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 262'},
{'name': 'sensor 263', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 263'},
{'name': 'sensor 264', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 264'},
{'name': 'sensor 265', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 265'},
{'name': 'sensor 266', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 266'},
{'name': 'sensor 267', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 267'},
{'name': 'sensor 268', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 268'},
{'name': 'sensor 269', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 269'},
{'name': 'sensor 270', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 270'},
{'name': 'sensor 271', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 271'},
{'name': 'sensor 272', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 272'},
{'name': 'sensor 273', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 273'},
{'name': 'sensor 274', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 274'},
{'name': 'sensor 275', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 275'},
{'name': 'sensor 276', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 276'},
{'name': 'sensor 277', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 277'},
{'name': 'sensor 278', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 278'},
{'name': 'sensor 279', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 279'},
{'name': 'sensor 280', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 280'},
{'name': 'sensor 281', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 281'},
{'name': 'sensor 282', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 282'},
{'name': 'sensor 283', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 283'},
{'name': 'sensor 284', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 284'},
{'name': 'sensor 285', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 285'},
{'name': 'sensor 286', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 286'},
{'name': 'sensor 287', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 287'},
{'name': 'sensor 288', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 288'},
{'name': 'sensor 289', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 289'},
{'name': 'sensor 290', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 290'},
{'name': 'sensor 291', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 291'},
{'name': 'sensor 292', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 292'},
{'name': 'sensor 293', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 293'},
{'name': 'sensor 294', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 294'},
{'name': 'sensor 295', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 295'},
{'name': 'sensor 296', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 296'},
{'name': 'sensor 297', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 297'},
{'name': 'sensor 298', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 298'},
{'name': 'sensor 299', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 299'},
{'name': 'sensor 300', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 300'},
{'name': 'sensor 301', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 301'},
{'name': 'sensor 302', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 302'},
{'name': 'sensor 303', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 303'},
{'name': 'sensor 304', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 304'},
{'name': 'sensor 305', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 305'},
{'name': 'sensor 306', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 306'},
{'name': 'sensor 307', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 307'},
{'name': 'sensor 308', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 308'},
{'name': 'sensor 309', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 309'},
{'name': 'sensor 310', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 310'},
{'name': 'sensor 311', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 311'},
{'name': 'sensor 312', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 312'},
{'name': 'sensor 313', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 313'},
{'name': 'sensor 314', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 314'},
{'name': 'sensor 315', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 315'},
{'name': 'sensor 316', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 316'},
{'name': 'sensor 317', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 317'},
{'name': 'sensor 318', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 318'},
{'name': 'sensor 319', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 319'},
{'name': 'sensor 320', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 320'},
{'name': 'sensor 321', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 321'},
{'name': 'sensor 322', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 322'},
{'name': 'sensor 323', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 323'},
{'name': 'sensor 324', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 324'},
{'name': 'sensor 325', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 325'},
{'name': 'sensor 326', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 326'},
{'name': 'sensor 327', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 327'},
{'name': 'sensor 328', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 328'},
{'name': 'sensor 329', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 329'},
{'name': 'sensor 330', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 330'},
{'name': 'sensor 331', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 331'},
{'name': 'sensor 332', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 332'},
{'name': 'sensor 333', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 333'},
{'name': 'sensor 334', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 334'},
{'name': 'sensor 335', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 335'},
{'name': 'sensor 336', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 336'},
{'name': 'sensor 337', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 337'},
{'name': 'sensor 338', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 338'},
{'name': 'sensor 339', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 339'},
{'name': 'sensor 340', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 340'},
{'name': 'sensor 341', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 341'},
{'name': 'sensor 342', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 342'},
{'name': 'sensor 343', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 343'},
{'name': 'sensor 344', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 344'},
{'name': 'sensor 345', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 345'},
{'name': 'sensor 346', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 346'},
{'name': 'sensor 347', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 347'},
{'name': 'sensor 348', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 348'},
{'name': 'sensor 349', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 349'},
{'name': 'sensor 350', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 350'},
{'name': 'sensor 351', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 351'},
{'name': 'sensor 352', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 352'},
{'name': 'sensor 353', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 353'},
{'name': 'sensor 354', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 354'},
{'name': 'sensor 355', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 355'},
{'name': 'sensor 356', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 356'},
{'name': 'sensor 357', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 357'},
{'name': 'sensor 358', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 358'},
{'name': 'sensor 359', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 359'},
{'name': 'sensor 360', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 360'},
{'name': 'sensor 361', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 361'},
{'name': 'sensor 362', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 362'},
{'name': 'sensor 363', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 363'},
{'name': 'sensor 364', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 364'},
{'name': 'sensor 365', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 365'},
{'name': 'sensor 366', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 366'},
{'name': 'sensor 367', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 367'},
{'name': 'sensor 368', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 368'},
{'name': 'sensor 369', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 369'},
{'name': 'sensor 370', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 370'},
{'name': 'sensor 371', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 371'},
{'name': 'sensor 372', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 372'},
{'name': 'sensor 373', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 373'},
{'name': 'sensor 374', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 374'},
{'name': 'sensor 375', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 375'},
{'name': 'sensor 376', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 376'},
{'name': 'sensor 377', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 377'},
{'name': 'sensor 378', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 378'},
{'name': 'sensor 379', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 379'},
{'name': 'sensor 380', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 380'},
{'name': 'sensor 381', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 381'},
{'name': 'sensor 382', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 382'},
{'name': 'sensor 383', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 383'},
{'name': 'sensor 384', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 384'},
{'name': 'sensor 385', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 385'},
{'name': 'sensor 386', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 386'},
{'name': 'sensor 387', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 387'},
{'name': 'sensor 388', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 388'},
{'name': 'sensor 389', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 389'},
{'name': 'sensor 390', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 390'},
{'name': 'sensor 391', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 391'},
{'name': 'sensor 392', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 392'},
{'name': 'sensor 393', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 393'},
{'name': 'sensor 394', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 394'},
{'name': 'sensor 395', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 395'},
{'name': 'sensor 396', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 396'},
{'name': 'sensor 397', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 397'},
{'name': 'sensor 398', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 398'},
{'name': 'sensor 399', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 399'},
{'name': 'sensor 400', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 400'},
{'name': 'sensor 401', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 401'},
{'name': 'sensor 402', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 402'},
{'name': 'sensor 403', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 403'},
{'name': 'sensor 404', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 404'},
{'name': 'sensor 405', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 405'},
{'name': 'sensor 406', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 406'},
{'name': 'sensor 407', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 407'},
{'name': 'sensor 408', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 408'},
{'name': 'sensor 409', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 409'},
{'name': 'sensor 410', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 410'},
{'name': 'sensor 411', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 411'},
{'name': 'sensor 412', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 412'},
{'name': 'sensor 413', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 413'},
{'name': 'sensor 414', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 414'},
{'name': 'sensor 415', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 415'},
{'name': 'sensor 416', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 416'},
{'name': 'sensor 417', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 417'},
{'name': 'sensor 418', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 418'},
{'name': 'sensor 419', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 419'},
{'name': 'sensor 420', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 420'},
{'name': 'sensor 421', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 421'},
{'name': 'sensor 422', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 422'},
{'name': 'sensor 423', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 423'},
{'name': 'sensor 424', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 424'},
{'name': 'sensor 425', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 425'},
{'name': 'sensor 426', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 426'},
{'name': 'sensor 427', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 427'},
{'name': 'sensor 428', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 428'},
{'name': 'sensor 429', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 429'},
{'name': 'sensor 430', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 430'},
{'name': 'sensor 431', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 431'},
{'name': 'sensor 432', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 432'},
{'name': 'sensor 433', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 433'},
{'name': 'sensor 434', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 434'},
{'name': 'sensor 435', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 435'},
{'name': 'sensor 436', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 436'},
{'name': 'sensor 437', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 437'},
{'name': 'sensor 438', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 438'},
{'name': 'sensor 439', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 439'},
{'name': 'sensor 440', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 440'},
{'name': 'sensor 441', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 441'},
{'name': 'sensor 442', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 442'},
{'name': 'sensor 443', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 443'},
{'name': 'sensor 444', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 444'},
{'name': 'sensor 445', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 445'},
{'name': 'sensor 446', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 446'},
{'name': 'sensor 447', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 447'},
{'name': 'sensor 448', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 448'},
{'name': 'sensor 449', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 449'},
{'name': 'sensor 450', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 450'},
{'name': 'sensor 451', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 451'},
{'name': 'sensor 452', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 452'},
{'name': 'sensor 453', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 453'},
{'name': 'sensor 454', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 454'},
{'name': 'sensor 455', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 455'},
{'name': 'sensor 456', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 456'},
{'name': 'sensor 457', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 457'},
{'name': 'sensor 458', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 458'},
{'name': 'sensor 459', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 459'},
{'name': 'sensor 460', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 460'},
{'name': 'sensor 461', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 461'},
{'name': 'sensor 462', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 462'},
{'name': 'sensor 463', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 463'},
{'name': 'sensor 464', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 464'},
{'name': 'sensor 465', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 465'},
{'name': 'sensor 466', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 466'},
{'name': 'sensor 467', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 467'},
{'name': 'sensor 468', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 468'},
{'name': 'sensor 469', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 469'},
{'name': 'sensor 470', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 470'},
{'name': 'sensor 471', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 471'},
{'name': 'sensor 472', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 472'},
{'name': 'sensor 473', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 473'},
{'name': 'sensor 474', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 474'},
{'name': 'sensor 475', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 475'},
{'name': 'sensor 476', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 476'},
{'name': 'sensor 477', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 477'},
{'name': 'sensor 478', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 478'},
{'name': 'sensor 479', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 479'},
{'name': 'sensor 480', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 480'},
{'name': 'sensor 481', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 481'},
{'name': 'sensor 482', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 482'},
{'name': 'sensor 483', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 483'},
{'name': 'sensor 484', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 484'},
{'name': 'sensor 485', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 485'},
{'name': 'sensor 486', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 486'},
{'name': 'sensor 487', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 487'},
{'name': 'sensor 488', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 488'},
{'name': 'sensor 489', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 489'},
{'name': 'sensor 490', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 490'},
{'name': 'sensor 491', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 491'},
{'name': 'sensor 492', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 492'},
{'name': 'sensor 493', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 493'},
{'name': 'sensor 494', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 494'},
{'name': 'sensor 495', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 495'},
{'name': 'sensor 496', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 496'},
{'name': 'sensor 497', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 497'},
{'name': 'sensor 498', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 498'},
{'name': 'sensor 499', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 499'},
{'name': 'sensor 500', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 500'},
{'name': 'sensor 501', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 501'},
{'name': 'sensor 502', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 502'},
{'name': 'sensor 503', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 503'},
{'name': 'sensor 504', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 504'},
{'name': 'sensor 505', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 505'},
{'name': 'sensor 506', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 506'},
{'name': 'sensor 507', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 507'},
{'name': 'sensor 508', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 508'},
{'name': 'sensor 509', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 509'},
{'name': 'sensor 510', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 510'},
{'name': 'sensor 511', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 511'},
{'name': 'sensor 512', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 512'},
{'name': 'sensor 513', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 513'},
{'name': 'sensor 514', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 514'},
{'name': 'sensor 515', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 515'},
{'name': 'sensor 516', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 516'},
{'name': 'sensor 517', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 517'},
{'name': 'sensor 518', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 518'},
{'name': 'sensor 519', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 519'},
{'name': 'sensor 520', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 520'},
{'name': 'sensor 521', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 521'},
{'name': 'sensor 522', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 522'},
{'name': 'sensor 523', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 523'},
{'name': 'sensor 524', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 524'},
{'name': 'sensor 525', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 525'},
{'name': 'sensor 526', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 526'},
{'name': 'sensor 527', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 527'},
{'name': 'sensor 528', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 528'},
{'name': 'sensor 529', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 529'},
{'name': 'sensor 530', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 530'},
{'name': 'sensor 531', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 531'},
{'name': 'sensor 532', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 532'},
{'name': 'sensor 533', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 533'},
{'name': 'sensor 534', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 534'},
{'name': 'sensor 535', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 535'},
{'name': 'sensor 536', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 536'},
{'name': 'sensor 537', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 537'},
{'name': 'sensor 538', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 538'},
{'name': 'sensor 539', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 539'},
{'name': 'sensor 540', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 540'},
{'name': 'sensor 541', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 541'},
{'name': 'sensor 542', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 542'},
{'name': 'sensor 543', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 543'},
{'name': 'sensor 544', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 544'},
{'name': 'sensor 545', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 545'},
{'name': 'sensor 546', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 546'},
{'name': 'sensor 547', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 547'},
{'name': 'sensor 548', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 548'},
{'name': 'sensor 549', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 549'},
{'name': 'sensor 550', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 550'},
{'name': 'sensor 551', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 551'},
{'name': 'sensor 552', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 552'},
{'name': 'sensor 553', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 553'},
{'name': 'sensor 554', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 554'},
{'name': 'sensor 555', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 555'},
{'name': 'sensor 556', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 556'},
{'name': 'sensor 557', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 557'},
{'name': 'sensor 558', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 558'},
{'name': 'sensor 559', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 559'},
{'name': 'sensor 560', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 560'},
{'name': 'sensor 561', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 561'},
{'name': 'sensor 562', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 562'},
{'name': 'sensor 563', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 563'},
{'name': 'sensor 564', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 564'},
{'name': 'sensor 565', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 565'},
{'name': 'sensor 566', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 566'},
{'name': 'sensor 567', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 567'},
{'name': 'sensor 568', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 568'},
{'name': 'sensor 569', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 569'},
{'name': 'sensor 570', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 570'},
{'name': 'sensor 571', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 571'},
{'name': 'sensor 572', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 572'},
{'name': 'sensor 573', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 573'},
{'name': 'sensor 574', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 574'},
{'name': 'sensor 575', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 575'},
{'name': 'sensor 576', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 576'},
{'name': 'sensor 577', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 577'},
{'name': 'sensor 578', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 578'},
{'name': 'sensor 579', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 579'},
{'name': 'sensor 580', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 580'},
{'name': 'sensor 581', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 581'},
{'name': 'sensor 582', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 582'},
{'name': 'sensor 583', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 583'},
{'name': 'sensor 584', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 584'},
{'name': 'sensor 585', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 585'},
{'name': 'sensor 586', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 586'},
{'name': 'sensor 587', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 587'},
{'name': 'sensor 588', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 588'},
{'name': 'sensor 589', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 589'},
{'name': 'sensor 590', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 590'},
{'name': 'sensor 591', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 591'},
{'name': 'sensor 592', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 592'},
{'name': 'sensor 593', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 593'},
{'name': 'sensor 594', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 594'},
{'name': 'sensor 595', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 595'},
{'name': 'sensor 596', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 596'},
{'name': 'sensor 597', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 597'},
{'name': 'sensor 598', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 598'},
{'name': 'sensor 599', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 599'},
{'name': 'sensor 600', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 600'},
{'name': 'sensor 601', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 601'},
{'name': 'sensor 602', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 602'},
{'name': 'sensor 603', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 603'},
{'name': 'sensor 604', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 604'},
{'name': 'sensor 605', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 605'},
{'name': 'sensor 606', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 606'},
{'name': 'sensor 607', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 607'},
{'name': 'sensor 608', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 608'},
{'name': 'sensor 609', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 609'},
{'name': 'sensor 610', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 610'},
{'name': 'sensor 611', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 611'},
{'name': 'sensor 612', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 612'},
{'name': 'sensor 613', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 613'},
{'name': 'sensor 614', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 614'},
{'name': 'sensor 615', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 615'},
{'name': 'sensor 616', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 616'},
{'name': 'sensor 617', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 617'},
{'name': 'sensor 618', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 618'},
{'name': 'sensor 619', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 619'},
{'name': 'sensor 620', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 620'},
{'name': 'sensor 621', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 621'},
{'name': 'sensor 622', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 622'},
{'name': 'sensor 623', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 623'},
{'name': 'sensor 624', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 624'},
{'name': 'sensor 625', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 625'},
{'name': 'sensor 626', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 626'},
{'name': 'sensor 627', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 627'},
{'name': 'sensor 628', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 628'},
{'name': 'sensor 629', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 629'},
{'name': 'sensor 630', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 630'},
{'name': 'sensor 631', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 631'},
{'name': 'sensor 632', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 632'},
{'name': 'sensor 633', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 633'},
{'name': 'sensor 634', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 634'},
{'name': 'sensor 635', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 635'},
{'name': 'sensor 636', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 636'},
{'name': 'sensor 637', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 637'},
{'name': 'sensor 638', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 638'},
{'name': 'sensor 639', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 639'},
{'name': 'sensor 640', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 640'},
{'name': 'sensor 641', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 641'},
{'name': 'sensor 642', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 642'},
{'name': 'sensor 643', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 643'},
{'name': 'sensor 644', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 644'},
{'name': 'sensor 645', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 645'},
{'name': 'sensor 646', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 646'},
{'name': 'sensor 647', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 647'},
{'name': 'sensor 648', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 648'},
{'name': 'sensor 649', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 649'},
{'name': 'sensor 650', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 650'},
{'name': 'sensor 651', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 651'},
{'name': 'sensor 652', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 652'},
{'name': 'sensor 653', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 653'},
{'name': 'sensor 654', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 654'},
{'name': 'sensor 655', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 655'},
{'name': 'sensor 656', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 656'},
{'name': 'sensor 657', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 657'},
{'name': 'sensor 658', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 658'},
{'name': 'sensor 659', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 659'},
{'name': 'sensor 660', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 660'},
{'name': 'sensor 661', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 661'},
{'name': 'sensor 662', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 662'},
{'name': 'sensor 663', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 663'},
{'name': 'sensor 664', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 664'},
{'name': 'sensor 665', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 665'},
{'name': 'sensor 666', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 666'},
{'name': 'sensor 667', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 667'},
{'name': 'sensor 668', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 668'},
{'name': 'sensor 669', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 669'},
{'name': 'sensor 670', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 670'},
{'name': 'sensor 671', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 671'},
{'name': 'sensor 672', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 672'},
{'name': 'sensor 673', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 673'},
{'name': 'sensor 674', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 674'},
{'name': 'sensor 675', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 675'},
{'name': 'sensor 676', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 676'},
{'name': 'sensor 677', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 677'},
{'name': 'sensor 678', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 678'},
{'name': 'sensor 679', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 679'},
{'name': 'sensor 680', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 680'},
{'name': 'sensor 681', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 681'},
{'name': 'sensor 682', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 682'},
{'name': 'sensor 683', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 683'},
{'name': 'sensor 684', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 684'},
{'name': 'sensor 685', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 685'},
{'name': 'sensor 686', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 686'},
{'name': 'sensor 687', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 687'},
{'name': 'sensor 688', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 688'},
{'name': 'sensor 689', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 689'},
{'name': 'sensor 690', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 690'},
{'name': 'sensor 691', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 691'},
{'name': 'sensor 692', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 692'},
{'name': 'sensor 693', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 693'},
{'name': 'sensor 694', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 694'},
{'name': 'sensor 695', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 695'},
{'name': 'sensor 696', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 696'},
{'name': 'sensor 697', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 697'},
{'name': 'sensor 698', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 698'},
{'name': 'sensor 699', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 699'},
{'name': 'sensor 700', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 700'},
{'name': 'sensor 701', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 701'},
{'name': 'sensor 702', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 702'},
{'name': 'sensor 703', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 703'},
{'name': 'sensor 704', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 704'},
{'name': 'sensor 705', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 705'},
{'name': 'sensor 706', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 706'},
{'name': 'sensor 707', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 707'},
{'name': 'sensor 708', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 708'},
{'name': 'sensor 709', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 709'},
{'name': 'sensor 710', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 710'},
{'name': 'sensor 711', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 711'},
{'name': 'sensor 712', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 712'},
{'name': 'sensor 713', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 713'},
{'name': 'sensor 714', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 714'},
{'name': 'sensor 715', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 715'},
{'name': 'sensor 716', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 716'},
{'name': 'sensor 717', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 717'},
{'name': 'sensor 718', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 718'},
{'name': 'sensor 719', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 719'},
{'name': 'sensor 720', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 720'},
{'name': 'sensor 721', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 721'},
{'name': 'sensor 722', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 722'},
{'name': 'sensor 723', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 723'},
{'name': 'sensor 724', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 724'},
{'name': 'sensor 725', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 725'},
{'name': 'sensor 726', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 726'},
{'name': 'sensor 727', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 727'},
{'name': 'sensor 728', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 728'},
{'name': 'sensor 729', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 729'},
{'name': 'sensor 730', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 730'},
{'name': 'sensor 731', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 731'},
{'name': 'sensor 732', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 732'},
{'name': 'sensor 733', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 733'},
{'name': 'sensor 734', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 734'},
{'name': 'sensor 735', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 735'},
{'name': 'sensor 736', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 736'},
{'name': 'sensor 737', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 737'},
{'name': 'sensor 738', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 738'},
{'name': 'sensor 739', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 739'},
{'name': 'sensor 740', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 740'},
{'name': 'sensor 741', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 741'},
{'name': 'sensor 742', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 742'},
{'name': 'sensor 743', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 743'},
{'name': 'sensor 744', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 744'},
{'name': 'sensor 745', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 745'},
{'name': 'sensor 746', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 746'},
{'name': 'sensor 747', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 747'},
{'name': 'sensor 748', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 748'},
{'name': 'sensor 749', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 749'},
{'name': 'sensor 750', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 750'},
{'name': 'sensor 751', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 751'},
{'name': 'sensor 752', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 752'},
{'name': 'sensor 753', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 753'},
{'name': 'sensor 754', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 754'},
{'name': 'sensor 755', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 755'},
{'name': 'sensor 756', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 756'},
{'name': 'sensor 757', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 757'},
{'name': 'sensor 758', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 758'},
{'name': 'sensor 759', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 759'},
{'name': 'sensor 760', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 760'},
{'name': 'sensor 761', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 761'},
{'name': 'sensor 762', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 762'},
{'name': 'sensor 763', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 763'},
{'name': 'sensor 764', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 764'},
{'name': 'sensor 765', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 765'},
{'name': 'sensor 766', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 766'},
{'name': 'sensor 767', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 767'},
{'name': 'sensor 768', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 768'},
{'name': 'sensor 769', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 769'},
{'name': 'sensor 770', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 770'},
{'name': 'sensor 771', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 771'},
{'name': 'sensor 772', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 772'},
{'name': 'sensor 773', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 773'},
{'name': 'sensor 774', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 774'},
{'name': 'sensor 775', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 775'},
{'name': 'sensor 776', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 776'},
{'name': 'sensor 777', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 777'},
{'name': 'sensor 778', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 778'},
{'name': 'sensor 779', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 779'},
{'name': 'sensor 780', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 780'},
{'name': 'sensor 781', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 781'},
{'name': 'sensor 782', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 782'},
{'name': 'sensor 783', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 783'},
{'name': 'sensor 784', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 784'},
{'name': 'sensor 785', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 785'},
{'name': 'sensor 786', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 786'},
{'name': 'sensor 787', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 787'},
{'name': 'sensor 788', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 788'},
{'name': 'sensor 789', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 789'},
{'name': 'sensor 790', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 790'},
{'name': 'sensor 791', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 791'},
{'name': 'sensor 792', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 792'},
{'name': 'sensor 793', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 793'},
{'name': 'sensor 794', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 794'},
{'name': 'sensor 795', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 795'},
{'name': 'sensor 796', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 796'},
{'name': 'sensor 797', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 797'},
{'name': 'sensor 798', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 798'},
{'name': 'sensor 799', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 799'},
{'name': 'sensor 800', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 800'},
{'name': 'sensor 801', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 801'},
{'name': 'sensor 802', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 802'},
{'name': 'sensor 803', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 803'},
{'name': 'sensor 804', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 804'},
{'name': 'sensor 805', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 805'},
{'name': 'sensor 806', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 806'},
{'name': 'sensor 807', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 807'},
{'name': 'sensor 808', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 808'},
{'name': 'sensor 809', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 809'},
{'name': 'sensor 810', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 810'},
{'name': 'sensor 811', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 811'},
{'name': 'sensor 812', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 812'},
{'name': 'sensor 813', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 813'},
{'name': 'sensor 814', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 814'},
{'name': 'sensor 815', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 815'},
{'name': 'sensor 816', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 816'},
{'name': 'sensor 817', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 817'},
{'name': 'sensor 818', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 818'},
{'name': 'sensor 819', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 819'},
{'name': 'sensor 820', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 820'},
{'name': 'sensor 821', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 821'},
{'name': 'sensor 822', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 822'},
{'name': 'sensor 823', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 823'},
{'name': 'sensor 824', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 824'},
{'name': 'sensor 825', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 825'},
{'name': 'sensor 826', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 826'},
{'name': 'sensor 827', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 827'},
{'name': 'sensor 828', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 828'},
{'name': 'sensor 829', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 829'},
{'name': 'sensor 830', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 830'},
{'name': 'sensor 831', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 831'},
{'name': 'sensor 832', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 832'},
{'name': 'sensor 833', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 833'},
{'name': 'sensor 834', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 834'},
{'name': 'sensor 835', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 835'},
{'name': 'sensor 836', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 836'},
{'name': 'sensor 837', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 837'},
{'name': 'sensor 838', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 838'},
{'name': 'sensor 839', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 839'},
{'name': 'sensor 840', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 840'},
{'name': 'sensor 841', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 841'},
{'name': 'sensor 842', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 842'},
{'name': 'sensor 843', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 843'},
{'name': 'sensor 844', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 844'},
{'name': 'sensor 845', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 845'},
{'name': 'sensor 846', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 846'},
{'name': 'sensor 847', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 847'},
{'name': 'sensor 848', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 848'},
{'name': 'sensor 849', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 849'},
{'name': 'sensor 850', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 850'},
{'name': 'sensor 851', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 851'},
{'name': 'sensor 852', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 852'},
{'name': 'sensor 853', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 853'},
{'name': 'sensor 854', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 854'},
{'name': 'sensor 855', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 855'},
{'name': 'sensor 856', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 856'},
{'name': 'sensor 857', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 857'},
{'name': 'sensor 858', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 858'},
{'name': 'sensor 859', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 859'},
{'name': 'sensor 860', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 860'},
{'name': 'sensor 861', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 861'},
{'name': 'sensor 862', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 862'},
{'name': 'sensor 863', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 863'},
{'name': 'sensor 864', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 864'},
{'name': 'sensor 865', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 865'},
{'name': 'sensor 866', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 866'},
{'name': 'sensor 867', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 867'},
{'name': 'sensor 868', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 868'},
{'name': 'sensor 869', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 869'},
{'name': 'sensor 870', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 870'},
{'name': 'sensor 871', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 871'},
{'name': 'sensor 872', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 872'},
{'name': 'sensor 873', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 873'},
{'name': 'sensor 874', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 874'},
{'name': 'sensor 875', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 875'},
{'name': 'sensor 876', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 876'},
{'name': 'sensor 877', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 877'},
{'name': 'sensor 878', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 878'},
{'name': 'sensor 879', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 879'},
{'name': 'sensor 880', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 880'},
{'name': 'sensor 881', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 881'},
{'name': 'sensor 882', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 882'},
{'name': 'sensor 883', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 883'},
{'name': 'sensor 884', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 884'},
{'name': 'sensor 885', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 885'},
{'name': 'sensor 886', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 886'},
{'name': 'sensor 887', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 887'},
{'name': 'sensor 888', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 888'},
{'name': 'sensor 889', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 889'},
{'name': 'sensor 890', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 890'},
{'name': 'sensor 891', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 891'},
{'name': 'sensor 892', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 892'},
{'name': 'sensor 893', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 893'},
{'name': 'sensor 894', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 894'},
{'name': 'sensor 895', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 895'},
{'name': 'sensor 896', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 896'},
{'name': 'sensor 897', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 897'},
{'name': 'sensor 898', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 898'},
{'name': 'sensor 899', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 899'},
{'name': 'sensor 900', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 900'},
{'name': 'sensor 901', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 901'},
{'name': 'sensor 902', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 902'},
{'name': 'sensor 903', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 903'},
{'name': 'sensor 904', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 904'},
{'name': 'sensor 905', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 905'},
{'name': 'sensor 906', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 906'},
{'name': 'sensor 907', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 907'},
{'name': 'sensor 908', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 908'},
{'name': 'sensor 909', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 909'},
{'name': 'sensor 910', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 910'},
{'name': 'sensor 911', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 911'},
{'name': 'sensor 912', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 912'},
{'name': 'sensor 913', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 913'},
{'name': 'sensor 914', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 914'},
{'name': 'sensor 915', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 915'},
{'name': 'sensor 916', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 916'},
{'name': 'sensor 917', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 917'},
{'name': 'sensor 918', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 918'},
{'name': 'sensor 919', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 919'},
{'name': 'sensor 920', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 920'},
{'name': 'sensor 921', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 921'},
{'name': 'sensor 922', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 922'},
{'name': 'sensor 923', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 923'},
{'name': 'sensor 924', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 924'},
{'name': 'sensor 925', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 925'},
{'name': 'sensor 926', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 926'},
{'name': 'sensor 927', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 927'},
{'name': 'sensor 928', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 928'},
{'name': 'sensor 929', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 929'},
{'name': 'sensor 930', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 930'},
{'name': 'sensor 931', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 931'},
{'name': 'sensor 932', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 932'},
{'name': 'sensor 933', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 933'},
{'name': 'sensor 934', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 934'},
{'name': 'sensor 935', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 935'},
{'name': 'sensor 936', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 936'},
{'name': 'sensor 937', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 937'},
{'name': 'sensor 938', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 938'},
{'name': 'sensor 939', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 939'},
{'name': 'sensor 940', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 940'},
{'name': 'sensor 941', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 941'},
{'name': 'sensor 942', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 942'},
{'name': 'sensor 943', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 943'},
{'name': 'sensor 944', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 944'},
{'name': 'sensor 945', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 945'},
{'name': 'sensor 946', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 946'},
{'name': 'sensor 947', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 947'},
{'name': 'sensor 948', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 948'},
{'name': 'sensor 949', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 949'},
{'name': 'sensor 950', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 950'},
{'name': 'sensor 951', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 951'},
{'name': 'sensor 952', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 952'},
{'name': 'sensor 953', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 953'},
{'name': 'sensor 954', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 954'},
{'name': 'sensor 955', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 955'},
{'name': 'sensor 956', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 956'},
{'name': 'sensor 957', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 957'},
{'name': 'sensor 958', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 958'},
{'name': 'sensor 959', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 959'},
{'name': 'sensor 960', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 960'},
{'name': 'sensor 961', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 961'},
{'name': 'sensor 962', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 962'},
{'name': 'sensor 963', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 963'},
{'name': 'sensor 964', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 964'},
{'name': 'sensor 965', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 965'},
{'name': 'sensor 966', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 966'},
{'name': 'sensor 967', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 967'},
{'name': 'sensor 968', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 968'},
{'name': 'sensor 969', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 969'},
{'name': 'sensor 970', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 970'},
{'name': 'sensor 971', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 971'},
{'name': 'sensor 972', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 972'},
{'name': 'sensor 973', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 973'},
{'name': 'sensor 974', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 974'},
{'name': 'sensor 975', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 975'},
{'name': 'sensor 976', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 976'},
{'name': 'sensor 977', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 977'},
{'name': 'sensor 978', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 978'},
{'name': 'sensor 979', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 979'},
{'name': 'sensor 980', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 980'},
{'name': 'sensor 981', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 981'},
{'name': 'sensor 982', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 982'},
{'name': 'sensor 983', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 983'},
{'name': 'sensor 984', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 984'},
{'name': 'sensor 985', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 985'},
{'name': 'sensor 986', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 986'},
{'name': 'sensor 987', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 987'},
{'name': 'sensor 988', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 988'},
{'name': 'sensor 989', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 989'},
{'name': 'sensor 990', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 990'},
{'name': 'sensor 991', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 991'},
{'name': 'sensor 992', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 992'},
{'name': 'sensor 993', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 993'},
{'name': 'sensor 994', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 994'},
{'name': 'sensor 995', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 995'},
{'name': 'sensor 996', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 996'},
{'name': 'sensor 997', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 997'},
{'name': 'sensor 998', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 998'},
{'name': 'sensor 999', 'house': 'Antwerp', 'type': 'Electricity', 'tags': 'Tag 999'}];
*/

	$scope.required = true;
	$scope.selected_order = null;
	var edit_loc_id = null;
	var edit = false;
	var edit_sen = false;
	var edit_sen_id = null;

	$scope.filteredSensors = []
	,$scope.currentPage = 1
	,$scope.numPerPage = 10
	,$scope.maxSize = 5;
	$scope.pages_css = "";

	$scope.$watch("currentPage + numPerPage", function() {
		var begin = (($scope.currentPage - 1) * $scope.numPerPage)
		, end = begin + $scope.numPerPage;
		
		if ($scope.sensors.length-1 < $scope.numPerPage * ($scope.maxSize-1)) {
			var length = Math.floor(($scope.sensors.length-1)/$scope.numPerPage)+1;
			$scope.pages_css = "pagination--length" + length;
		} else {
			$scope.pages_css = 'pagination--full';
		}
		$scope.filteredSensors = $scope.sensors.slice(begin, end);
	});
	
	updateFilteredSensors = function () {
		var begin = (($scope.currentPage - 1) * $scope.numPerPage)
		, end = begin + $scope.numPerPage;
		if ($scope.sensors.length -1 < $scope.numPerPage * ($scope.maxSize-1)) {
			
			var length = Math.floor(($scope.sensors.length-1)/$scope.numPerPage)+1;
			$scope.pages_css = "pagination--length" + length;
		} else {
			$scope.pages_css = 'pagination--full';
		}
		$scope.filteredSensors = $scope.sensors.slice(begin, end);
	};

	$scope.$watch('houses', function() {
		$timeout(function() {
		    if (hasClass(document.getElementById("select_house"), "mdl-js-menu")) {
			removeClass(document.getElementById("select_house"), "mdl-js-menu");
		    }
		    addClass(document.getElementById("select_house"), "mdl-js-menu");
		}, 0);
	}, true);

	$scope.$watch('types', function() {
		$timeout(function() {
		    if (hasClass(document.getElementById("select_type"), "mdl-js-menu")) {
			removeClass(document.getElementById("select_type"), "mdl-js-menu");
		    }
		    addClass(document.getElementById("select_type"), "mdl-js-menu");
		}, 0);
	}, true);

	$scope.dropDownClick = function (value, menu, button, ng_model) {
		var toChange = document.getElementById(button);
		toChange.innerHTML = value;
		switch (ng_model) {
			case 'type':
			    	if (value === null) {
					toChange.innerHTML = $scope.i18n("pick_type");
					break;
			    	}
				$scope.sen_type = value;
				break;
			case 'house':
				if (value === null) {
					toChange.innerHTML = $scope.i18n("pick_loc");
					break;
				}
				$scope.sen_house = value;
				break; 
		}
		removeClass(document.getElementById(menu).parentNode, "is-visible");
	}

	$scope.set_order = function set_order(orderBy, elementId) {
		if (hasClass(document.getElementById("sort_sensor"), "up")) {
			removeClass(document.getElementById("sort_sensor"), "up");
		}
		if (hasClass(document.getElementById("sort_sensor"), "down")) {
			removeClass(document.getElementById("sort_sensor"), "down");
		}
		if (hasClass(document.getElementById("sort_house"), "up")) {
			removeClass(document.getElementById("sort_house"), "up");
		}
		if (hasClass(document.getElementById("sort_house"), "down")) {
			removeClass(document.getElementById("sort_house"), "down");
		}
		if (hasClass(document.getElementById("sort_type"), "up")) {
			removeClass(document.getElementById("sort_type"), "up");
		}
		if (hasClass(document.getElementById("sort_type"), "down")) {
			removeClass(document.getElementById("sort_type"), "down");
		}
		if (hasClass(document.getElementById("sort_tags"), "up")) {
			removeClass(document.getElementById("sort_tags"), "up");
		}
		if (hasClass(document.getElementById("sort_tags"), "down")) {
			removeClass(document.getElementById("sort_tags"), "down");
		}                
		if ($scope.selected_order === orderBy) {
			$scope.selected_order = '-' + orderBy;
			addClass(document.getElementById(elementId), "up");
		} else {
			$scope.selected_order = orderBy;
			addClass(document.getElementById(elementId), "down");
		}
	}
    
	$scope.reset_loc = function reset_loc() {
		edit = false;
		edit_loc_id = null;
		$scope.loc_country = null;
		$scope.loc_city = null;
		$scope.loc_postalcode = null;
		$scope.loc_street = null;
		$scope.loc_number = null;
		$scope.loc_elec_price = null;
		$scope.loc_description = null;
		$scope.edit_loc = $scope.i18n("add_house");    
		if (hasClass(document.getElementById("txtfield_houseCountry"), "is-dirty")) {
			removeClass(document.getElementById("txtfield_houseCountry"), "is-dirty");
		}
		if (hasClass(document.getElementById("txtfield_houseCity"), "is-dirty")) {
			removeClass(document.getElementById("txtfield_houseCity"), "is-dirty");
		}
		if (hasClass(document.getElementById("txtfield_houseZip"), "is-dirty")) {
			removeClass(document.getElementById("txtfield_houseZip"), "is-dirty");
		}
		if (hasClass(document.getElementById("txtfield_houseStreet"), "is-dirty")) {
			removeClass(document.getElementById("txtfield_houseStreet"), "is-dirty");
		}
		if (hasClass(document.getElementById("txtfield_houseNr"), "is-dirty")) {
			removeClass(document.getElementById("txtfield_houseNr"), "is-dirty");
		}
		if (hasClass(document.getElementById("txtfield_houseElecPrice"), "is-dirty")) {
			removeClass(document.getElementById("txtfield_houseElecPrice"), "is-dirty");
		}		
		if (hasClass(document.getElementById("txtfield_houseDesc"), "is-dirty")) {
			removeClass(document.getElementById("txtfield_houseDesc"), "is-dirty");
		}
		if (!hasClass(document.getElementById("txtfield_houseCountry"), "is-invalid")) {
			addClass(document.getElementById("txtfield_houseCountry"), "is-invalid");
		}
		if (!hasClass(document.getElementById("txtfield_houseCity"), "is-invalid")) {
			addClass(document.getElementById("txtfield_houseCity"), "is-invalid");
		}
		if (!hasClass(document.getElementById("txtfield_houseZip"), "is-invalid")) {
			addClass(document.getElementById("txtfield_houseZip"), "is-invalid");
		}
		if (!hasClass(document.getElementById("txtfield_houseStreet"), "is-invalid")) {
			addClass(document.getElementById("txtfield_houseStreet"), "is-invalid");
		}
		if (!hasClass(document.getElementById("txtfield_houseNr"), "is-invalid")) {
			addClass(document.getElementById("txtfield_houseNr"), "is-invalid");
		}
		if (!hasClass(document.getElementById("txtfield_houseElecPrice"), "is-invalid")) {
			addClass(document.getElementById("txtfield_houseElecPrice"), "is-invalid");
		}
		if (!hasClass(document.getElementById("txtfield_houseDesc"), "is-invalid")) {
			addClass(document.getElementById("txtfield_houseDesc"), "is-invalid");
		}  
	}
    
    	// TODO Database update: house (Make difference between add and edit) Jeroen
	$scope.save_loc = function save_loc() {
		if ($scope.house_form.$valid) {
			if (edit) {
				// Edit house
				$scope.houses[edit_loc_id].description = $scope.loc_description;
				$scope.houses[edit_loc_id].number = $scope.loc_number;
				$scope.houses[edit_loc_id].street = $scope.loc_street;
				$scope.houses[edit_loc_id].city = $scope.loc_city;
				$scope.houses[edit_loc_id].postalcode = $scope.loc_postalcode;
				$scope.houses[edit_loc_id].country = $scope.loc_country;
				$scope.houses[edit_loc_id].elec_price = $scope.loc_elec_price;
				$scope.houses[edit_loc_id].user_UID = $rootScope.auth_user.UID;
				
				var houseObject = $scope.houses[edit_loc_id].toJSON();
				ws.request({type: "edit", what: "Location", data: houseObject}, function(response) {
					$scope.houses[edit_loc_id] = response;
				});
			} else {
				// Add house
				var new_house = new house(-1, $scope.loc_description, $scope.loc_number, $scope.loc_street, $scope.loc_city, $scope.loc_postalcode, $scope.loc_country, 
								$scope.loc_elec_price, $rootScope.auth_user.UID);
				delete new_house.LID;
				var houseObject = new_house.toJSON();
				ws.request({type: "add", what: "Location", data: houseObject}, function(response) {
					new_house.LID = response.house.LID;	
					console.log("Pre house added");
			        $scope.houses.push(new_house);
			        console.log("house added");
					console.log("Response verwerkt");
				});
			}
			$scope.dialog.close();
			console.log("Dialog closed");
		}
	}   

	function set_loc(id) {
		edit = true;
		$scope.loc_country = $scope.houses[id].country;
		$scope.loc_city = $scope.houses[id].city;
		$scope.loc_postalcode = $scope.houses[id].postalcode;
		$scope.loc_street = $scope.houses[id].street;
		$scope.loc_number = $scope.houses[id].number;
		$scope.loc_elec_price = $scope.houses[id].elec_price;
		$scope.loc_description = $scope.houses[id].description;
		addClass(document.getElementById("txtfield_houseCountry"), "is-dirty");
		addClass(document.getElementById("txtfield_houseCity"), "is-dirty");
		addClass(document.getElementById("txtfield_houseZip"), "is-dirty");
		addClass(document.getElementById("txtfield_houseStreet"), "is-dirty");
		addClass(document.getElementById("txtfield_houseNr"), "is-dirty");
		addClass(document.getElementById("txtfield_houseElecPrice"), "is-dirty");
		addClass(document.getElementById("txtfield_houseDesc"), "is-dirty");
		if (hasClass(document.getElementById("txtfield_houseCountry"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_houseCountry"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_houseCity"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_houseCity"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_houseZip"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_houseZip"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_houseStreet"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_houseStreet"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_houseNr"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_houseNr"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_houseElecPrice"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_houseElecPrice"), "is-invalid");
		}		
		if (hasClass(document.getElementById("txtfield_houseDesc"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_houseDesc"), "is-invalid");
		}                                
		$scope.edit_loc = $scope.i18n("edit_house");
		edit_loc_id = id;
		componentHandler.upgradeDom();    
	}
    
	$scope.reset_sen = function reset_sen() {
		edit_sen = false;
		edit_sen_id = null;
		$scope.sen_name = null;
		$scope.sen_house = null;
		$scope.sen_type = null;
		$scope.sen_tags = null;
		$scope.sen_house_name = null;
		$scope.dropDownClick(null, 'select_house', 'dropDownLocation', 'house');
		$scope.dropDownClick(null, 'select_type', 'dropDownType', 'type');
		$scope.edit_sen = $scope.i18n("add_sensor");    
		if (hasClass(document.getElementById("txtfield_SensorName"), "is-dirty")) {
			removeClass(document.getElementById("txtfield_SensorName"), "is-dirty");
		}
		//if (hasClass(document.getElementById("txtfield_SensorTags"), "is-dirty")) {
		//  removeClass(document.getElementById("txtfield_SensorTags"), "is-dirty");
		//}
		if (!hasClass(document.getElementById("txtfield_SensorName"), "is-invalid")) {
			addClass(document.getElementById("txtfield_SensorName"), "is-invalid");
		}
		if (!hasClass(document.getElementById("txtfield_SensorLocation"), "is-invalid")) {
			addClass(document.getElementById("txtfield_SensorLocation"), "is-invalid");
		}
		if (!hasClass(document.getElementById("txtfield_SensorType"), "is-invalid")) {
			addClass(document.getElementById("txtfield_SensorType"), "is-invalid");
		}                
	}
    
	$scope.save_sen = function save_sen() {
		if ($scope.sensor_form.$valid) {
			if (edit_sen) {
				// Edit Sensor
				$scope.sensors[($scope.currentPage - 1) * $scope.numPerPage + edit_sen_id].title = $scope.sen_name;
				$scope.sensors[($scope.currentPage - 1) * $scope.numPerPage + edit_sen_id].type = $scope.sen_type;
				//$scope.sensors[($scope.currentPage - 1) * $scope.numPerPage + edit_sen_id].tags = $scope.sen_tags;
				$scope.sensors[($scope.currentPage - 1) * $scope.numPerPage + edit_sen_id].house = $scope.sen_house;
				$scope.filteredSensors[edit_sen_id].title = $scope.sen_name;
				$scope.filteredSensors[edit_sen_id].type = $scope.sen_type;
				//$scope.filteredSensors[edit_sen_id].tags = $scope.sen_tags;
				$scope.filteredSensors[edit_sen_id].house = $scope.sen_house;
				var sensor = $scope.sensors[($scope.currentPage - 1) * $scope.numPerPage + edit_sen_id];
				var sensorObject = sensor.toJSON();
				delete sensorObject.index;
				delete sensorObject.$$hashKey;
				ws.request({type: "edit", what: "Sensor", data: sensorObject}, function() {
				});
			} else {
				// Add Sensor
				var new_sensor = new Sensor(-1, $scope.sen_type, $scope.sen_name, $rootScope.auth_user.UID, $scope.sen_house);
				//new_sensor.tags = $scope.sen_tags;
				//new_sensor.house = $scope.sen_house;
				delete new_sensor.SID;
				
				var sensorObject = new_sensor.toJSON();
				ws.request({type: "add", what: "Sensor", data: sensorObject}, function(response) {
					new_sensor.SID = response.sensor.SID;	
					$scope.sensors.push(new_sensor);
				updateFilteredSensors();
				});     
				
			}
			dialog2.close();
		}
	}   

	function set_sen(id) {
		edit_sen = true;
		$scope.sen_name = $scope.sensors[($scope.currentPage - 1) * $scope.numPerPage + id].title;
		$scope.sen_type = $scope.sensors[($scope.currentPage - 1) * $scope.numPerPage + id].type;
		$scope.sen_tags = $scope.sensors[($scope.currentPage - 1) * $scope.numPerPage + id].tags;
		$scope.sen_house = $scope.sensors[($scope.currentPage - 1) * $scope.numPerPage + id].house;
		$scope.dropDownClick($scope.sensors[($scope.currentPage - 1) * $scope.numPerPage + id].type, 'select_type', 'dropDownType', 'type');
		$scope.dropDownClick($scope.sensors[($scope.currentPage - 1) * $scope.numPerPage + id].house, 'select_house', 'dropDownLocation', 'house');

		addClass(document.getElementById("txtfield_SensorName"), "is-dirty");
		//addClass(document.getElementById("txtfield_SensorTags"), "is-dirty");
		if (hasClass(document.getElementById("txtfield_SensorName"), "is-invalid")) {
	    		removeClass(document.getElementById("txtfield_SensorName"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_Sensorhouse"), "is-invalid")) {
	    		removeClass(document.getElementById("txtfield_Sensorhouse"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_SensorType"), "is-invalid")) {
	    		removeClass(document.getElementById("txtfield_SensorType"), "is-invalid");
		}        
		$scope.edit_sen = $scope.i18n("edit_sensor");
		edit_sen_id = id;
		componentHandler.upgradeDom();    
	}    

	$scope.reset_sen();
	$scope.reset_loc();
    
	$scope.dialog = document.getElementById('dlghouse');
	var showDialogButton = document.getElementById('btnAddLoc');
	showDialogButton.addEventListener('click', function(){
		$scope.dialog.showModal();
	});
	
	document.getElementById('btnhouseBack').addEventListener('click', function(){
		$scope.dialog.close();
	});

	var dialog2 = document.getElementById('dlgSensor');
	var showDialogButton2 = document.getElementById('btnAddSensor');
	showDialogButton2.addEventListener('click', function(){
		dialog2.showModal();
	});

	document.getElementById('btnSensorBack').addEventListener('click', function(){
		dialog2.close();
	});

	var delete_id = null;    // TODO Nasty global vars
	var delete_from = null;
	
	$scope.delete = function (id, from) {
		$rootScope.confirm_dialog.showModal();
		componentHandler.upgradeDom();
		console.log($scope.sensors + " ID: " + id + " from " + from);
		delete_id = id;
		delete_from = from;
	};

	$scope.$on("confirmation", function (event, value) {
		if (value) {
			if (delete_from == $scope.sensors) {
				console.log("Delete_id: " + delete_id);
				ws.request({type: "delete", what: "Sensor", data: {"ID": $scope.sensors[delete_id].SID}}, function(success) {
                    updateFilteredSensors();
					$scope.$apply();
				});
			}
			if (delete_from.length === 1) {
				delete_from.length = 0;
				return;
			}
			delete_from.splice(delete_id, 1);
		}
	});

	$scope.open_dialog = function(element_id, id, sensor) {
		var element = document.getElementById(element_id);
		element.showModal();
		if (sensor) {
			set_sen(id);
		} else {
			set_loc(id);
		}
		componentHandler.upgradeDom();
	}
	
    componentHandler.upgradeDom();
});
