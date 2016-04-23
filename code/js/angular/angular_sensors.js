angular.module("overwatch").controller("sensorController", function($scope, $rootScope, $filter, $timeout, Auth, dlgLocation_setup, dlgSensor_setup) {
		
	$rootScope.tab = "sensorslink";
	$rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
	$rootScope.auth_user = Auth.getUser();
	$scope.add_autocomplete = function (tag) {
        /*
		var i = $scope.tags.length;
		while (i--) {
			if ($scope.tags[i].description === tag.text)
				return;
		}
		$scope.tags.push(tag);
        */
	};

	$scope.check_autocomplete = function (query) {
		return $filter('filter')($scope.tags, query);
	};

    $scope.houses = [];

	ws.request({type: "get_all", what: "Location", for: {what: "User", UID: $rootScope.auth_user.UID}}, function(response) {
		for (var i = 0; i < response.objects.length; i++)
			response.objects[i]._scopes.push($scope);
		$scope.houses = response.objects;
		$scope.$apply();
	});

	$scope.sensors = [];

	ws.request({type: "get_all", what: "Sensor", for: {what: "User", UID: $rootScope.auth_user.UID}}, function(response) {
		for (var i = 0; i < response.objects.length; i++)
			response.objects[i]._scopes.push($scope);
		$scope.sensors = response.objects;
		updateFilteredSensors();
		$scope.$apply();
	});
	
	$scope.tags = [];

	ws.request({type: "get_all", what: "Tag", for: {what: "User", UID: $rootScope.auth_user.UID}}, function(response) {
		for (var i = 0; i < response.objects.length; i++)
			response.objects[i]._scopes.push($scope);
		$scope.tags = response.objects;
		updateFilteredSensors();
		$scope.$apply();
	});
    
	$scope.required = true;
	$scope.selected_order = null;

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
		if (hasClass(document.getElementById("sort_price"), "up")) {
			removeClass(document.getElementById("sort_price"), "up");
		}
		if (hasClass(document.getElementById("sort_price"), "down")) {
			removeClass(document.getElementById("sort_price"), "down");
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
    
	document.getElementById('btnLocationBack').addEventListener('click', function(){
		document.getElementById('dlgLocation').close();
	});

	document.getElementById('btnSensorBack').addEventListener('click', function(){
		document.getElementById('dlgSensor').close();
	});
	
	document.getElementById('btnNoLocationOk').addEventListener('click', function(){
		document.getElementById('dlgNoLocation').close();
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
                var delete_sensor_SID = $scope.sensors[delete_id].SID; 
				ws.request({type: "delete", what: "Tag", for: {what: "Sensor", SID: delete_sensor_SID}}, function(success) {
                    for(var i = 0; i < $scope.tags.length; i++) {
                        if($scope.tags[i].sensor_SID == delete_sensor_SID) 
       				        cache.removeObject("Tag", [$scope.tags[i].text, delete_sensor_SID]);
                    }
				    ws.request({type: "delete", what: "Sensor", data: {SID: delete_sensor_SID}}, function(success) {
            			updateFilteredSensors();
					    $scope.$apply();
				    });
				    cache.removeObject("Sensor", delete_sensor_SID);
					$scope.$apply();
				});
			} else {
				console.log("Delete_id: " + delete_id);
				ws.request({type: "delete", what: "Location", data: {LID: $scope.houses[delete_id].LID}}, function(success) {
					$scope.$apply();
				});
				cache.removeObject("Location", $scope.houses[delete_id].LID);
			}
			if (delete_from.length === 1) {
				delete_from.length = 0;
				return;
			}
			delete_from.splice(delete_id, 1);
		}
	});

	$scope.open_dialog = function (elem) {
				var element;
				var emit = true;
				if (elem === 'dlgSensor') {
						if ($scope.houses.length === 0) {
								element = document.getElementById("dlgNoLocation");
								emit = false;
						} else {
								element = document.getElementById("dlgSensor");
								dlgSensor_setup.setSensor($scope.sensor);
						}
        } else {
						element = document.getElementById("dlgLocation");
				}
        element.showModal();
				if (emit) {
						$rootScope.$emit(elem + "_open");
        }
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
    }  
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
				var element;
				if ($scope.houses.length === 0) {
						element = document.getElementById("dlgNoLocation");
        } else {
						element = document.getElementById("dlgSensor");
						dlgSensor_setup.setSensor($scope.sensor);
				}
        element.showModal();
				if ($scope.houses.length > 0) {
						$rootScope.$emit("dlgSensor_open");
        }
        componentHandler.upgradeDom();
  }
	get_loc = function () {
			ws.request({type: "get", what: "Location", data: {LID: $scope.sensor.location_LID}}, function(response) {
				response.object._scopes.push($scope);
				$scope.location_name = response.object.description;
				$scope.$apply();
			});
	}
	
	get_loc();
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
		    $scope.sen_unit_price = sen.EUR_per_unit;
		    $scope.dropDownClick(sen.type, 'select_type', 'dropDownType', 'type');
		    $scope.dropDownClick(sen.location_LID, 'select_house', 'dropDownLocation', 'house');

		    addClass(document.getElementById("txtfield_SensorName"), "is-dirty");
		    //addClass(document.getElementById("txtfield_SensorTags"), "is-dirty");
		    addClass(document.getElementById("txtfield_SensorUnitPrice"), "is-dirty");
		    if (hasClass(document.getElementById("txtfield_SensorUnitPrice"), "is-invalid")) {
		        removeClass(document.getElementById("txtfield_SensorUnitPrice"), "is-invalid");
		    }
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
		    $scope.sen_unit_price = null;
	        $scope.dropDownClick(null, 'select_house', 'dropDownLocation', 'house');
		    $scope.dropDownClick(null, 'select_type', 'dropDownType', 'type');
		    $scope.edit_sen = $scope.i18n("add_sensor");    
		    if (hasClass(document.getElementById("txtfield_SensorName"), "is-dirty")) {
			    removeClass(document.getElementById("txtfield_SensorName"), "is-dirty");
		    }
            if (hasClass(document.getElementById("txtfield_SensorUnitPrice"), "is-dirty")) {
                removeClass(document.getElementById("txtfield_SensorUnitPrice"), "is-dirty");
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
				// Edit Sensor 
                // Add New Tags
                for(var i = 0; i < $scope.sen_tags.length; i++) {
                    var new_tag = new Tag($scope.sen_tags[i].text, $scope.sen_SID);
			        ws.request({type: "add", what: "Tag", data: new_tag, for: {what: "Sensor", SID: $scope.sen_SID}}, function(response) {
				        response.object._scopes.push($scope);
				        new_tag = response.object;
                        $scope.tags.push(new_tag);
 	                });                
                }

                // TODO Same as with edit location and updates. DONT FORGET TO UPDATE FILTEREDSENSORS AS WELL!
				// TODO Don't forget the unit price when the format updates :)
				var sensor = new Sensor($scope.sen_SID, $scope.sen_type, $scope.sen_name, $scope.sen_unit_price, $rootScope.auth_user.UID, $scope.sen_house);
				var sensorObject = sensor.toJSON();
				delete sensorObject.index;
				ws.request({type: "edit", what: "Sensor", data: sensorObject}, function(response) {
					for (var i = 0; i < $scope.sensors.length; i++) {
							if ($scope.sensors[i].SID === response.SID) {
									$scope.sensors[i] = response;
									updateFilteredSensors();
									$scope.$apply();
                            }
                    }
				});
			} else {
				// Add Sensor
				// TODO Don't forget the unit price when the format updates :)				
				var new_sensor = new Sensor(-1, $scope.sen_type, $scope.sen_name, $scope.sen_unit_price, $rootScope.auth_user.UID, $scope.sen_house);
				delete new_sensor.SID;
				var sensorObject = new_sensor.toJSON();
				ws.request({type: "add", what: "Sensor", data: sensorObject}, function(response) {
					response.object._scopes.push($scope);
					new_sensor = response.object;
                    // TODO @Stijn, waarom die get location hier?
                    /*
					ws.request({type: "get", what: "Location", data: {LID: response.object.location_LID}}, function(response) {
	        			$scope.sensors.push(new_sensor);
				        updateFilteredSensors();
				        $scope.$apply();
	                }); 
                    */
                    // Add Tags
                    for(var i = 0; i < $scope.sen_tags.length; i++) {
                        var new_tag = new Tag($scope.sen_tags[i].text, new_sensor.SID);
				        ws.request({type: "add", what: "Tag", data: new_tag, for: {what: "Sensor", SID: new_sensor.SID}}, function(response) {
					        response.object._scopes.push($scope);
					        new_tag = response.object;
                            $scope.tags.push(new_tag);
     	                });                
                    }
        			$scope.sensors.push(new_sensor);
			        updateFilteredSensors();
			        $scope.$apply();
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
				response.object._scopes.push($scope);
	    			toChange.innerHTML = response.object.description;
    				$scope.sen_house = value;
    				$scope.$apply();
	            }); 
				break; 
		}
		removeClass(document.getElementById(menu).parentNode, "is-visible");
	}

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
		    if (!hasClass(document.getElementById("txtfield_LocationDesc"), "is-invalid")) {
			    addClass(document.getElementById("txtfield_LocationDesc"), "is-invalid");
		    }
	    }
		componentHandler.upgradeDom();    
	});
	
	$scope.save_loc = function save_loc() {
		if ($scope.house_form.$valid) {
			if (edit) {
				// Edit house 
                /*
                TODO This doesnt get locally updated anymore because via the live system Jeroen will issue an update 
                     to the updated location! (So for the moment only updates on get_all == f5)
				    $scope.houses[edit_loc_id].description = $scope.loc_description;
				    $scope.houses[edit_loc_id].number = $scope.loc_number;
				*/
				
				var house = new Location($scope.loc_LID, $scope.loc_description, $scope.loc_number, 
                                         $scope.loc_street, $scope.loc_city, $scope.loc_postalcode, 
                                         $scope.loc_country, $rootScope.auth_user.UID);
				var houseObject = house.toJSON();
				ws.request({type: "edit", what: "Location", data: houseObject}, function(response) {
					//$scope.houses[edit_loc_id] = response.object; //TODO Will be done through jeroen's updates
				    for (var i = 0; i < $scope.houses.length; i++) {
						    if ($scope.houses[i].LID === response.LID) {
								    $scope.houses[i] = response;
								    $scope.$apply();
                            }
                    }
				});
			} else {
				// Add house
				var new_house = new Location(-1, $scope.loc_description, $scope.loc_number, $scope.loc_street, $scope.loc_city, $scope.loc_postalcode, $scope.loc_country, 
							     $rootScope.auth_user.UID);
				delete new_house.LID;
				var houseObject = new_house.toJSON();
				ws.request({type: "add", what: "Location", data: houseObject}, function(response) {
					response.object._scopes.push($scope);
					new_house = response.object;	
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
});
