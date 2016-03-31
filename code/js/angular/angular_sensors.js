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
		$scope.$apply();
	});
	
	$scope.tags = [{text: "keuken"}, {text: "kerstverlichting"}];
    
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
			    	} else {
			    	    toChange.innerHTML = $scope.i18n(value);
			    	}
				    $scope.sen_type = value;
				    break;
			case 'house':
				if (value === null) {
					toChange.innerHTML = $scope.i18n("pick_loc");
					break;
				}
				ws.request({type: "get", what: "Location", data: {LID: value}}, function(response) {
	    			toChange.innerHTML = response.house.description;
    				$scope.sen_house = value;
    				$scope.$apply();
	            }); 
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
		$scope.edit_loc = $scope.i18n("add_location");    
		if (hasClass(document.getElementById("txtfield_LocationCountry"), "is-dirty")) {
			removeClass(document.getElementById("txtfield_LocationCountry"), "is-dirty");
		}
		if (hasClass(document.getElementById("txtfield_LocationCity"), "is-dirty")) {
			removeClass(document.getElementById("txtfield_LocationCity"), "is-dirty");
		}
		if (hasClass(document.getElementById("txtfield_LocationZip"), "is-dirty")) {
			removeClass(document.getElementById("txtfield_LocationZip"), "is-dirty");
		}
		if (hasClass(document.getElementById("txtfield_LocationStreet"), "is-dirty")) {
			removeClass(document.getElementById("txtfield_LocationStreet"), "is-dirty");
		}
		if (hasClass(document.getElementById("txtfield_LocationNr"), "is-dirty")) {
			removeClass(document.getElementById("txtfield_LocationNr"), "is-dirty");
		}
		if (hasClass(document.getElementById("txtfield_LocationElecPrice"), "is-dirty")) {
			removeClass(document.getElementById("txtfield_LocationElecPrice"), "is-dirty");
		}		
		if (hasClass(document.getElementById("txtfield_LocationDesc"), "is-dirty")) {
			removeClass(document.getElementById("txtfield_LocationDesc"), "is-dirty");
		}
		if (!hasClass(document.getElementById("txtfield_LocationCountry"), "is-invalid")) {
			addClass(document.getElementById("txtfield_LocationCountry"), "is-invalid");
		}
		if (!hasClass(document.getElementById("txtfield_LocationCity"), "is-invalid")) {
			addClass(document.getElementById("txtfield_LocationCity"), "is-invalid");
		}
		if (!hasClass(document.getElementById("txtfield_LocationZip"), "is-invalid")) {
			addClass(document.getElementById("txtfield_LocationZip"), "is-invalid");
		}
		if (!hasClass(document.getElementById("txtfield_LocationStreet"), "is-invalid")) {
			addClass(document.getElementById("txtfield_LocationStreet"), "is-invalid");
		}
		if (!hasClass(document.getElementById("txtfield_LocationNr"), "is-invalid")) {
			addClass(document.getElementById("txtfield_LocationNr"), "is-invalid");
		}
		if (!hasClass(document.getElementById("txtfield_LocationElecPrice"), "is-invalid")) {
			addClass(document.getElementById("txtfield_LocationElecPrice"), "is-invalid");
		}
		if (!hasClass(document.getElementById("txtfield_LocationDesc"), "is-invalid")) {
			addClass(document.getElementById("txtfield_LocationDesc"), "is-invalid");
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
				var new_house = new Location(-1, $scope.loc_description, $scope.loc_number, $scope.loc_street, $scope.loc_city, $scope.loc_postalcode, $scope.loc_country, 
								$scope.loc_elec_price, $rootScope.auth_user.UID);
				delete new_house.LID;
				var houseObject = new_house.toJSON();
				ws.request({type: "add", what: "Location", data: houseObject}, function(response) {
					new_house.LID = response.house.LID;	
					console.log("Pre house added");
			        $scope.houses.push(new_house);
			        console.log("house added");
					console.log("Response verwerkt");
					$scope.$apply();
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
		addClass(document.getElementById("txtfield_LocationCountry"), "is-dirty");
		addClass(document.getElementById("txtfield_LocationCity"), "is-dirty");
		addClass(document.getElementById("txtfield_LocationZip"), "is-dirty");
		addClass(document.getElementById("txtfield_LocationStreet"), "is-dirty");
		addClass(document.getElementById("txtfield_LocationNr"), "is-dirty");
		addClass(document.getElementById("txtfield_LocationElecPrice"), "is-dirty");
		addClass(document.getElementById("txtfield_LocationDesc"), "is-dirty");
		if (hasClass(document.getElementById("txtfield_LocationCountry"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_LocationCountry"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_LocationCity"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_LocationCity"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_LocationZip"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_LocationZip"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_LocationStreet"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_LocationStreet"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_LocationNr"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_LocationNr"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_LocationElecPrice"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_LocationElecPrice"), "is-invalid");
		}		
		if (hasClass(document.getElementById("txtfield_LocationDesc"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_LocationDesc"), "is-invalid");
		}                                
		$scope.edit_loc = $scope.i18n("edit_location");
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
				$scope.sensors[($scope.currentPage - 1) * $scope.numPerPage + edit_sen_id].location_LID = $scope.sen_house;
				$scope.filteredSensors[edit_sen_id].title = $scope.sen_name;
				$scope.filteredSensors[edit_sen_id].type = $scope.sen_type;
				//$scope.filteredSensors[edit_sen_id].tags = $scope.sen_tags;
				$scope.filteredSensors[edit_sen_id].location_LID = $scope.sen_house;
				var sensor = $scope.sensors[($scope.currentPage - 1) * $scope.numPerPage + edit_sen_id];
				var sensorObject = sensor.toJSON();
				delete sensorObject.index;
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
					ws.request({type: "get", what: "Location", data: {LID: response.sensor.location_LID}}, function(response) {
	        			$scope.sensors.push(new_sensor);
				        updateFilteredSensors();
				        $scope.$apply();
	                }); 
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
		$scope.sen_house = $scope.sensors[($scope.currentPage - 1) * $scope.numPerPage + id].location_LID;
		$scope.dropDownClick($scope.sensors[($scope.currentPage - 1) * $scope.numPerPage + id].type, 'select_type', 'dropDownType', 'type');
		$scope.dropDownClick($scope.sensors[($scope.currentPage - 1) * $scope.numPerPage + id].location_LID, 'select_house', 'dropDownLocation', 'house');

		addClass(document.getElementById("txtfield_SensorName"), "is-dirty");
		//addClass(document.getElementById("txtfield_SensorTags"), "is-dirty");
		if (hasClass(document.getElementById("txtfield_SensorName"), "is-invalid")) {
	    		removeClass(document.getElementById("txtfield_SensorName"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_SensorLocation"), "is-invalid")) {
	    		removeClass(document.getElementById("txtfield_SensorLocation"), "is-invalid");
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
    
	$scope.dialog = document.getElementById('dlgLocation');
	    var showDialogButton = document.getElementById('btnAddLoc');
	    showDialogButton.addEventListener('click', function(){
		$scope.dialog.showModal();
	});
	
	document.getElementById('btnLocationBack').addEventListener('click', function(){
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
				ws.request({type: "delete", what: "Sensor", data: {"SID": $scope.sensors[delete_id].SID}}, function(success) {
                    updateFilteredSensors();
					$scope.$apply();
				});
			} else {
			    console.log("Delete_id: " + delete_id);
			    ws.request({type: "delete", what: "Location", data: {"LID": $scope.houses[delete_id].LID}}, function(success) {
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

angular.module("overwatch").controller("location_objController", function($scope, $rootScope) {
    $scope.open_dialog = function (edit) {
        var element = document.getElementById("dlgLocation");
        element.showModal();
        componentHandler.upgradeDom();
    }
});

angular.module("overwatch").controller("sensor_objController", function($scope, $rootScope) {

});

angular.module("overwatch").controller("location_dialogController", function($scope, $rootScope) {
	function set_loc() {
		edit = true;
		$scope.loc_country = $scope.country;
		$scope.loc_city = $scope.city;
		$scope.loc_postalcode = $scope.postalcode;
		$scope.loc_street = $scope.street;
		$scope.loc_number = $scope.number;
		$scope.loc_elec_price = $scope.elec_price;
		$scope.loc_description = $scope.description;
		addClass(document.getElementById("txtfield_LocationCountry"), "is-dirty");
		addClass(document.getElementById("txtfield_LocationCity"), "is-dirty");
		addClass(document.getElementById("txtfield_LocationZip"), "is-dirty");
		addClass(document.getElementById("txtfield_LocationStreet"), "is-dirty");
		addClass(document.getElementById("txtfield_LocationNr"), "is-dirty");
		addClass(document.getElementById("txtfield_LocationElecPrice"), "is-dirty");
		addClass(document.getElementById("txtfield_LocationDesc"), "is-dirty");
		if (hasClass(document.getElementById("txtfield_LocationCountry"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_LocationCountry"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_LocationCity"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_LocationCity"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_LocationZip"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_LocationZip"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_LocationStreet"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_LocationStreet"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_LocationNr"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_LocationNr"), "is-invalid");
		}
		if (hasClass(document.getElementById("txtfield_LocationElecPrice"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_LocationElecPrice"), "is-invalid");
		}		
		if (hasClass(document.getElementById("txtfield_LocationDesc"), "is-invalid")) {
			removeClass(document.getElementById("txtfield_LocationDesc"), "is-invalid");
		}                                
		$scope.edit_loc = $scope.i18n("edit_location");
		edit_loc_id = $scope.LID;
		componentHandler.upgradeDom();    
	};
});
