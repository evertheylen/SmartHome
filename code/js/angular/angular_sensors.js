angular.module("overwatch").controller("sensorController", function($scope, $rootScope, $filter, $timeout, Auth, dlgLocation_setup, dlgSensor_setup) {
		
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
        dlgLocation_setup.setLocation(null);
	}
    
	$scope.reset_sen = function reset_sen() {
        dlgSensor_setup.setSensor(null);               
	}
    
	$scope.reset_sen();
	$scope.reset_loc();
    
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

	$scope.open_dialog = function (elem) {
        var element = document.getElementById(elem);
        element.showModal();
        $rootScope.$emit(elem + "_open");
        componentHandler.upgradeDom();
    }  
    
    componentHandler.upgradeDom();
});

angular.module("overwatch").controller("location_objController", function($scope, $rootScope, dlgLocation_setup) {
	$scope.open_dialog = function () {
        var element = document.getElementById("dlgLocation");
        dlgLocation_setup.setLocation($scope.house);
        element.showModal();
        $rootScope.$emit("dlgLocation_open");
        componentHandler.upgradeDom();
    };  
    
    $scope.delete = function () {
        ws.request({type: "delete", what: "Location", data: {"LID": $scope.house.LID}}, function(success) {
            console.log("deleting object:" + $scope.house + " ID: " + $scope.house.LID);
            //$scope.houses.splice($scope.houses.indexOf($scope.house.LID), 1);
             // 'use strict';
            var snackbarContainer = document.getElementById('delete-snackbar');
            //var showSnackbarButton = document.querySelector('#demo-show-snackbar');
            var handler = function(event) {
                $scope.houses.push($scope.house);
                var new_house = new Location(-1, $scope.house.description, $scope.house.number, $scope.house.street, $scope.house.city, $scope.house.postalcode, $scope.house.country, 
			                    $scope.house.elec_price, $rootScope.auth_user.UID);
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
            };
            var data = {
              message: 'Location permanently removed.',
              timeout: 3000,
              actionHandler: handler,
              actionText: 'Undo'
            };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
	        $scope.$apply();
        });    
    };
});

angular.module("overwatch").factory('dlgLocation_setup', function($rootScope) {
    var loc;
    return {
        setLocation : function(location) {
            loc = location;
        },
        
        getLocation : function() {
            return loc;
        }
    }
});

angular.module("overwatch").factory('dlgSensor_setup', function($rootScope) {
    var sen;
    return {
        setSensor : function(sensor) {
            sen = sensor;
        },
        
        getSensor : function() {
            return sen;
        }
    }
});

angular.module("overwatch").controller("sensor_objController", function($scope, $rootScope, dlgSensor_setup) {
	$scope.open_dialog = function () {
        var element = document.getElementById("dlgSensor");
        dlgSensor_setup.setSensor($scope.sensor);
        element.showModal();
        $rootScope.$emit("dlgSensor_open");
        componentHandler.upgradeDom();
    } 
});

angular.module("overwatch").controller("sensor_dialogController", function($scope, $rootScope, dlgSensor_setup) {
    $rootScope.$on("dlgSensor_open", function() {
	    var sen = dlgSensor_setup.getSensor();
	    if (sen != null) {
	        edit = true;
		    $scope.sen_name = sen.title;
		    $scope.sen_type = sen.type;
		    $scope.sen_tags = sen.tags;
		    $scope.sen_house = sen.location_LID;
		    $scope.sen_SID = sen.SID;
		    $scope.dropDownClick(sen.type, 'select_type', 'dropDownType', 'type');
		    $scope.dropDownClick(sen.location_LID, 'select_house', 'dropDownLocation', 'house');

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
	    } else {
	        edit = false;
    		$scope.sen_SID = null;
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
	    componentHandler.upgradeDom();
    });
    
	$scope.save_sen = function save_sen() {
		if ($scope.sensor_form.$valid) {
			if (edit) {
				// Edit Sensor TODO Same as with edit location and updates. DONT FORGET TO UPDATE FILTEREDSENSORS AS WELL!
				var sensor = new Sensor($scope.sen_SID, $scope.sen_type, $scope.sen_name, $rootScope.auth_user.UID, $scope.sen_house);
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
			document.getElementById("dlgSensor").close();
		}
	}
	
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
	document.getElementById('btnSensorBack').addEventListener('click', function(){
		document.getElementById('dlgSensor').close();
	});
});
	    
angular.module("overwatch").controller("location_dialogController", function($scope, $rootScope, dlgLocation_setup) {
    $rootScope.$on("dlgLocation_open", function() {
	    var loc = dlgLocation_setup.getLocation();
	    if (loc != null) {
		    edit = true;
		    $scope.loc_country = loc.country;
		    $scope.loc_city = loc.city;
		    $scope.loc_postalcode = loc.postalcode;
		    $scope.loc_street = loc.street;
		    $scope.loc_number = loc.number;
		    $scope.loc_elec_price = loc.elec_price;
		    $scope.loc_description = loc.description;
		    $scope.loc_LID = loc.LID;
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
	    } else {
	        edit = false;
		    $scope.loc_country = null;
		    $scope.loc_city = null;
		    $scope.loc_postalcode = null;
		    $scope.loc_street = null;
		    $scope.loc_number = null;
		    $scope.loc_elec_price = null;
		    $scope.loc_description = null;
		    $scope.loc_LID = null;
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
		componentHandler.upgradeDom();    
	});
	
	$scope.save_loc = function save_loc() {
		if ($scope.house_form.$valid) {
			if (edit) {
				// Edit house // TODO This doesnt get locally updated anymore because via the live system Jeroen will issue an update to the updated location! (So for the moment only updates on get_all == f5)
				/*$scope.houses[edit_loc_id].description = $scope.loc_description;
				$scope.houses[edit_loc_id].number = $scope.loc_number;
				$scope.houses[edit_loc_id].street = $scope.loc_street;
				$scope.houses[edit_loc_id].city = $scope.loc_city;
				$scope.houses[edit_loc_id].postalcode = $scope.loc_postalcode;
				$scope.houses[edit_loc_id].country = $scope.loc_country;
				$scope.houses[edit_loc_id].elec_price = $scope.loc_elec_price;
				$scope.houses[edit_loc_id].user_UID = $rootScope.auth_user.UID;
				*/
				
				var house = new Location($scope.loc_LID, $scope.loc_description, $scope.loc_number, $scope.loc_street, $scope.loc_city, $scope.loc_postalcode, $scope.loc_country, 
								$scope.loc_elec_price, $rootScope.auth_user.UID);
				var houseObject = house.toJSON();
				ws.request({type: "edit", what: "Location", data: houseObject}, function(response) {
					//$scope.houses[edit_loc_id] = response; //TODO Will be done through jeroen's updates
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
			document.getElementById("dlgLocation").close();
			console.log("Dialog closed");
	    }
	} 
	document.getElementById('btnLocationBack').addEventListener('click', function(){
		document.getElementById('dlgLocation').close();
	});
});
