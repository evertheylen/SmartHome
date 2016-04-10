angular.module("overwatch").controller("statisticsController", function($scope, $rootScope, Auth, $timeout) {
    $rootScope.auth_user = Auth.getUser();
    $rootScope.tab = "statisticslink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    
    // Sample data
    
    $scope.open_box = function (id) {
      if (hasClass(document.getElementById("box" + id), "open")) {
        removeClass(document.getElementById("box" + id), "open");
      } else {
        addClass(document.getElementById("box" + id), "open");
      }
    }
    
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
    
    // Graphs
    
    $scope.importants = [false, false, false, false, false, false];
    var layout = document.getElementById("mainLayout");
    if (hasClass(layout, "mdl-layout--no-drawer-button")) {
        removeClass(layout, "mdl-layout--no-drawer-button");
    }

	$scope.mark_important = function mark_important(element_id) {
	    var element = document.getElementById('important_icon-'+element_id);
	    if (hasClass(element, "yellow")) {
	        removeClass(element, "yellow");
	        addClass(element, "white");
	    } else if (hasClass(element, "white")) {
	        removeClass(element, "white");
	        addClass(element, "yellow");
	    }
	    $scope.importants[element_id] = !$scope.importants[element_id];
	};
    
    $scope.graphs = [];
    $scope.graphs_single = [];
    var graph_types = ["Line", "Bar", "Radar"];
    var graph_types_single = ["Pie", "PolarArea", "Doughnut"];
    for (i=0; i < 3; i++) {
        graph = {};
        graph.type = graph_types[i];
        graph.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        graph.series = ['Series A', 'Series B'];
        graph.data = [
            [65, 59,80,81,56,55,40,59,54,53,30,12],
            [28,48,40,19,86,27,90,40,78,45,01,45]
        ];
        $scope.graphs.push(graph);  
    }
    $timeout(function () {
        for(i=0; i < 3; i++) {
            $scope.graphs[i].data = [
                [28, 48, 40, 19, 86, 27, 90, 59,54,53,30,12],
                [65, 59, 80, 81, 56, 55, 40, 50,78,45,01,45]
            ];
        }        
        
    }, 5000);
    for (i=0; i < 3; i++) {
        graph = {};
        graph.type = graph_types_single[i];
        graph.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        graph.data = [65, 59,80,81,56,55,40,59,54,53,30,12];
        $scope.graphs_single.push(graph);  
    }   
    $timeout(function () {
        for (i=0; i < 3; i++) {
            $scope.graphs_single[i].data = [28, 48, 40, 19, 86, 27, 90, 59,54,53,30,12];
        }
    }, 5000); 
    
    componentHandler.upgradeDom();
});
