angular.module("overwatch").controller("statisticsController", function($scope, $rootScope, Auth, $timeout) {
    $rootScope.auth_user = Auth.getUser();
    $rootScope.tab = "statisticslink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    
    // Sample data
    
    $scope.locations = [{"desc": "Campus Middelheim", "country": "Belgium", "city": "Antwerp", "postalcode": 2020, "street": "Middelheimlaan", "number": 1}, 
			    {"desc": "Campus Groenenborger", "country": "Belgium", "city": "Antwerp", "postalcode": 2020, "street": "Groenenborgerlaan", "number": 171}, 
			    {"desc": "Campus Drie Eiken", "country": "Belgium", "city": "Antwerp", "postalcode": 2610, "street": "Universiteitsplein", "number": 1}];
	
    $scope.types = ["Electricity", "Movement", "Water", "Temperature", "Other"];
	
	$scope.sensors = [{"name": "Sensor 1", "location": "Campus Middelheim", "type": "Electricity", "tags": [$scope.tags[1]]}, 
			  {"name": "Sensor 2", "location": "Campus Groenenborger", "type": "Movement", "tags": [$scope.tags[0], $scope.tags[1]]}];
	
    $scope.aggregate_by = [false, false, false];
    $scope.select_locs = [];
    $scope.select_types = [];
    $scope.select_sensors = [];
    
    for (i = 0; i< $scope.locations.length; i++) {
        $scope.select_locs.push(false);
    }
    
    for (i = 0; i < $scope.types.length; i++) {
        $scope.select_types.push(false);
    }
    
    for (i = 0; i < $scope.sensors.length; i++) {
        $scope.select_sensors.push(false);
    }   
    
    $scope.select_all = function (type) {
        switch (type) {
            case "location" : 
                for (i=0; i < $scope.locations.length; i++) {
                    $scope.select_locs[i] = $scope.all_locs;
                    if ($scope.all_locs) {
                        addClass(document.getElementById("label-location_" + i), "is-checked");
                    } else {
                        removeClass(document.getElementById("label-location_" + i), "is-checked");
                    }
                };
                break;
                
            case "type" :
                for (i=0; i < $scope.types.length; i++) {
                    $scope.select_types[i] = $scope.all_types;
                    if ($scope.all_types) {
                        addClass(document.getElementById("label-type_" + i), "is-checked");
                    } else {
                        removeClass(document.getElementById("label-type_" + i), "is-checked");
                    }
                };
                break;

            case "sensor" :
                for (i=0; i < $scope.sensors.length; i++) {
                    $scope.select_sensors[i] = $scope.all_sensors;
                    if ($scope.all_sensors) {
                        addClass(document.getElementById("label-sensor_" + i), "is-checked");
                    } else {
                        removeClass(document.getElementById("label-sensor_" + i), "is-checked");
                    }
                };
                break;
        }
    }; 
    
    $scope.checkStatus = function (type) {
        var checkCount = 0;
        switch (type) {
            case "location" :
                for (i=0; i < $scope.locations.length; i++) {
                    if ($scope.select_locs[i]) {
                        checkCount++;
                    }
                }
                $scope.all_locs = ( checkCount === $scope.locations.length);
                if ($scope.all_locs) {
                    addClass(document.getElementById("label-all_locations"), "is-checked");
                } else {
                    removeClass(document.getElementById("label-all_locations"), "is-checked");
                };
                break;
                
            case "type" :
                for (i=0; i < $scope.types.length; i++) {
                    if ($scope.select_types[i]) {
                        checkCount++;
                    }
                }
                $scope.all_types = ( checkCount === $scope.types.length);
                if ($scope.all_types) {
                    addClass(document.getElementById("label-all_types"), "is-checked");
                } else {
                    removeClass(document.getElementById("label-all_types"), "is-checked");
                };
                break;            
                
            case "sensor" :
                for (i=0; i < $scope.sensors.length; i++) {
                    if ($scope.select_sensors[i]) {
                        checkCount++;
                    }
                }
                $scope.all_sensors = ( checkCount === $scope.sensors.length);
                if ($scope.all_sensors) {
                    addClass(document.getElementById("label-all_sensors"), "is-checked");
                } else {
                    removeClass(document.getElementById("label-all_sensors"), "is-checked");
                };
                break;                
        }
    };

 
    //Aggregation:
    /*
    [bool : aggregate_location, bool: aggregate_type, bool: aggregate_sensor]
    */
    
    componentHandler.upgradeDom();
});
