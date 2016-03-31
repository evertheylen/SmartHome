angular.module("overwatch").controller("statisticsController", function($scope, $rootScope, Auth, $timeout) {
    $rootScope.auth_user = Auth.getUser();
    $rootScope.tab = "statisticslink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    
    // Sample data
    
    $scope.houses = [];

	ws.request({type: "get_all", what: "Location", for: {what: "User", UID: $rootScope.auth_user.UID}}, function(response) {
		$scope.houses = response.houses;
		$scope.$apply();
	});

	$scope.sensors = [];

	ws.request({type: "get_all", what: "Sensor", for: {what: "User", UID: $rootScope.auth_user.UID}}, function(response) {
		$scope.sensors = response.sensors;
		$scope.$apply();
	});
	$scope.tags = [{text: "keuken"}, {text: "kerstverlichting"}];
	
    $scope.aggregate_by = [false, false, false];
    $scope.select_locs = [];
    $scope.select_types = [];
    $scope.select_sensors = [];
    
    for (i = 0; i< $scope.houses.length; i++) {
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
                for (i=0; i < $scope.houses.length; i++) {
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
                for (i=0; i < $scope.houses.length; i++) {
                    if ($scope.select_locs[i]) {
                        checkCount++;
                    }
                }
                $scope.all_locs = ( checkCount === $scope.houses.length);
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
