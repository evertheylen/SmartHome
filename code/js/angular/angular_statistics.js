angular.module("overwatch").controller("statisticsController", function($scope, $rootScope, Auth, $timeout) {
    $rootScope.auth_user = Auth.getUser();
    $rootScope.tab = "statisticslink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);

    // Sample data
    var is_box2_opened = false;
    $scope.open_box = function(id) {
        if (hasClass(document.getElementById("box" + id), "open")) {
            removeClass(document.getElementById("box" + id), "open");
        } else {
            addClass(document.getElementById("box" + id), "open");
        }
        componentHandler.upgradeDom();
        if (id==2 && !is_box2_opened) {
            document.getElementById('list-checkbox-all_sensors').click();
            is_box2_opened = true;
            componentHandler.upgradeDom();
        }
    }

    // Default opening
    $scope.open_box(1);
    $scope.open_box(3);


    // Fill all the $scope arrays using the database.    
    $scope.houses = [];
    ws.request({
        type: "get_all",
        what: "Location",
        for: {
            what: "User",
            UID: $rootScope.auth_user.UID
        }
    }, function(response) {
		for (var i = 0; i < response.objects.length; i++)
			response.objects[i]._scopes.push($scope);
        $scope.houses = response.objects;
        $scope.$apply();
    });

    $scope.sensors = [];
	$scope.tags = [];
    ws.request({
        type: "get_all",
        what: "Sensor",
        for: {
            what: "User",
            UID: $rootScope.auth_user.UID
        }
    }, function(response) {
		for (var i = 0; i < response.objects.length; i++)
			response.objects[i]._scopes.push($scope);
        $scope.sensors = response.objects;
        for (var sensorIndex = 0; sensorIndex < $scope.sensors.length; sensorIndex++) {
            ws.request({
                type: "get_all",
                what: "Tag",
                for: {
                    what: "Sensor",
                    SID: $scope.sensors[sensorIndex].SID
                }
            }, function(response) {
                for (var i = 0; i < response.objects.length; i++)
                    response.objects[i]._scopes.push($scope);
                var temp_tags = response.objects;
                for (var sensorIndex = 0; sensorIndex < $scope.sensors.length; sensorIndex++) {
                  if ($scope.sensors[sensorIndex].SID === response.for.SID) {
                      $scope.sensors[sensorIndex].tags = temp_tags;
                  }
                }
                for (var i = 0; i < temp_tags.length; i++) {
                    var exists = false;
                    for (j = 0; j < $scope.tags.length; j++) {
                        if (temp_tags[i].text == $scope.tags[j].text) {
                            exists = true;
                            break;
                        }
                    }
                    if (!exists)
                        $scope.tags.push(temp_tags[i]);
                }
                $scope.$apply();
            });
        }
        $scope.$apply();
    });

    // Fill the aggregate $scope arrays.
    $scope.aggregate_by = [false, false, false];
    $scope.select_locs = [];
    $scope.select_types = [];
    $scope.select_tags = [];
    $scope.select_sensors = [];
    $scope.filtered_sensors = [];

    for (i = 0; i < $scope.houses.length; i++)
        $scope.select_locs.push(false);
    for (i = 0; i < $scope.types.length; i++)
        $scope.select_types.push(false);
    for (i = 0; i < $scope.tags.length; i++)
        $scope.select_tags.push(false);

    $scope.select_all = function(type) {
        switch (type) {
            case "location":
                for (i = 0; i < $scope.houses.length; i++) {
                    $scope.select_locs[i] = $scope.all_locs;
                    if ($scope.all_locs) {
                        var select_types = [];
                        for (j = 0; j < $scope.types.length; j++) {
                            if ($scope.select_types[j]) {
                                select_types.push($scope.types[j]);
                            }
                        }
                        var select_tags = [];
                        for (j=0; j< $scope.tags.length; j++) {
                            if ($scope.select_tags[j]) {
                                select_tags.push($scope.tags[j].text);
                            }
                            
                        }
                        addClass(document.getElementById("label-location_" + i), "is-checked");
                        for (j = 0; j < $scope.sensors.length; j++) {
                            if ($scope.sensors[j].location_LID === $scope.houses[i].LID && select_types.indexOf($scope.sensors[j].type) != -1) {
                                for (k = 0; k < $scope.sensors[j].tags.length; k++){
                                  if (select_tags.indexOf($scope.sensors[j].tags[k].text) != -1) {
                                    $scope.filtered_sensors.push($scope.sensors[j]);
                                    break;
                                  }
                                }
                            }
                        }
                    } else {
                        /*var copy = [];
                        for (j = 0; j < $scope.filtered_sensors.length; j++) {
                            if ($scope.filtered_sensors[j].location_LID != $scope.houses[i].LID) {
                                $scope.filtered_sensors.splice(j, 1);
                                copy.push($scope.filtered_sensors[i]);
                            }
                        }*/
                        removeClass(document.getElementById("label-location_" + i), "is-checked");
                        $scope.filtered_sensors = [];
                    }
                };
                break;

            case "type":
                for (i = 0; i < $scope.types.length; i++) {
                    $scope.select_types[i] = $scope.all_types;
                    if ($scope.all_types) {
                        var select_houses = [];
                        for (j = 0; j < $scope.houses.length; j++) {
                            if ($scope.select_locs[j]) {
                                select_houses.push($scope.houses[j].LID);
                            }
                        }
                        var select_tags = [];
                        for (j=0; j< $scope.tags.length; j++) {
                            if ($scope.select_tags[j]) {
                                select_tags.push($scope.tags[j].text);
                            }
                            
                        }
                        addClass(document.getElementById("label-type_" + i), "is-checked");
                        for (j = 0; j < $scope.sensors.length; j++) {
                            if ($scope.sensors[j].type === $scope.types[i] && select_houses.indexOf($scope.sensors[j].location_LID) != -1) {
                                for (k = 0; k < $scope.sensors[j].tags.length; k++){
                                  if (select_tags.indexOf($scope.sensors[j].tags[k].text) != -1) {
                                    $scope.filtered_sensors.push($scope.sensors[j]);
                                    break;
                                  }
                                }
                            }
                        }
                    } else {
                        /*var copy = [];
                        for (j = 0; j < $scope.filtered_sensors.length; j++) {
                            if ($scope.filtered_sensors[j].type != $scope.types[i]) {
                                copy.push($scope.filtered_sensors[i]);
                            }
                        }*/
                        removeClass(document.getElementById("label-type_" + i), "is-checked");
                        $scope.filtered_sensors = [];
                    }
                };
                break;

            case "tag":
                for (i = 0; i < $scope.tags.length; i++) {
                    $scope.select_tags[i] = $scope.all_tags;
                    if ($scope.all_tags) {
                        var select_houses = [];
                        for (j = 0; j < $scope.houses.length; j++) {
                            if ($scope.select_locs[j]) {
                                select_houses.push($scope.houses[j].LID);
                            }
                        }
                        var select_types = [];
                        for (j = 0; j < $scope.types.length; j++) {
                            if ($scope.select_types[j]) {
                                select_types.push($scope.types[j]);
                            }
                        }
                        addClass(document.getElementById("label-tag_" + i), "is-checked");
                        for (j = 0; j < $scope.sensors.length; j++) {
                            for (k=0;k < $scope.sensors[j].tags.length; k++) {
                                if ($scope.sensors[j].tags[k].text === $scope.tags[i].text && select_houses.indexOf($scope.sensors[j].location_LID) != -1 && select_types.indexOf($scope.sensors[j].type) != -1) {
                                    if ($scope.filtered_sensors.indexOf($scope.sensors[j]) === -1) {
                                        $scope.filtered_sensors.push($scope.sensors[j]);
                                    }
                                    break;
                                }
                            }
                        }                        
                    } else {
                        /*var copy = [];
                        for (j = 0; j < $scope.filtered_sensors.length; j++) {
                            if ($scope.filtered_sensors[j].tags != $scope.types[i]) {
                                copy.push($scope.filtered_sensors[i]);
                            }
                        }*/
                        removeClass(document.getElementById("label-tag_" + i), "is-checked");
                        $scope.filtered_sensors = [];
                    }
                };
                break;
            case "sensor":
                for (i = 0; i < $scope.filtered_sensors.length; i++) {
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

    $scope.checkStatus = function(type, index, checked) {
        var checkCount = 0;
        switch (type) {
            case "location":
                for (i = 0; i < $scope.houses.length; i++) {
                    if ($scope.select_locs[i]) {
                        checkCount++;
                    }
                }
                $scope.all_locs = (checkCount === $scope.houses.length);
                if ($scope.all_locs) {
                    addClass(document.getElementById("label-all_locations"), "is-checked");
                } else {
                    removeClass(document.getElementById("label-all_locations"), "is-checked");
                };
                if (checked) {
                    var select_types = [];
                    for (i = 0; i < $scope.types.length; i++) {
                        if ($scope.select_types[i]) {
                            select_types.push($scope.types[i]);
                        }
                    }
                    var select_tags = [];
                        for (j=0; j< $scope.tags.length; j++) {
                            if ($scope.select_tags[j]) {
                                select_tags.push($scope.tags[j].text);
                            }
                            
                        }
                    for (i = 0; i < $scope.sensors.length; i++) {
                        if ($scope.sensors[i].location_LID === $scope.houses[index].LID && select_types.indexOf($scope.sensors[i].type) != -1) {
                            for (k = 0; k < $scope.sensors[i].tags.length; k++){
                                if (select_tags.indexOf($scope.sensors[i].tags[k].text) != -1) {
                                    $scope.filtered_sensors.push($scope.sensors[i]);
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    var copy = [];
                    for (i = 0; i < $scope.filtered_sensors.length; i++) {
                        if ($scope.filtered_sensors[i].location_LID != $scope.houses[index].LID) {
                            copy.push($scope.filtered_sensors[i]);
                        }
                    }
                    $scope.filtered_sensors = copy;
                };

                break;

            case "type":
                for (i = 0; i < $scope.types.length; i++) {
                    if ($scope.select_types[i]) {
                        checkCount++;
                    }
                }
                $scope.all_types = (checkCount === $scope.types.length);
                if ($scope.all_types) {
                    addClass(document.getElementById("label-all_types"), "is-checked");
                } else {
                    removeClass(document.getElementById("label-all_types"), "is-checked");
                };
                if (checked) {
                    var select_houses = [];
                    for (i = 0; i < $scope.houses.length; i++) {
                        if ($scope.select_locs[i]) {
                            select_houses.push($scope.houses[i].LID);
                        }
                    }
                    var select_tags = [];
                    for (j=0; j< $scope.tags.length; j++) {
                        if ($scope.select_tags[j]) {
                            select_tags.push($scope.tags[j].text);
                        }
                        
                    }                    
                    for (i = 0; i < $scope.sensors.length; i++) {
                        if ($scope.sensors[i].type === $scope.types[index] && select_houses.indexOf($scope.sensors[i].location_LID) != -1) {
                            for (k = 0; k < $scope.sensors[i].tags.length; k++){
                                if (select_tags.indexOf($scope.sensors[i].tags[k].text) != -1) {
                                    $scope.filtered_sensors.push($scope.sensors[i]);
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    var copy = [];
                    for (i = 0; i < $scope.filtered_sensors.length; i++) {
                        if ($scope.filtered_sensors[i].type != $scope.types[index]) {
                            copy.push($scope.filtered_sensors[i]);
                        }
                    }
                    $scope.filtered_sensors = copy;
                }
                break;

            case "tag":
                for (i = 0; i < $scope.tags.length; i++) {
                    if ($scope.select_tags[i]) {
                        checkCount++;
                    }
                }
                $scope.all_tags = (checkCount === $scope.tags.length);
                if ($scope.all_tags) {
                    addClass(document.getElementById("label-all_tags"), "is-checked");
                } else {
                    removeClass(document.getElementById("label-all_tags"), "is-checked");
                };
                var select_houses = [];
                for (i = 0; i < $scope.houses.length; i++) {
                    if ($scope.select_locs[i]) {
                        select_houses.push($scope.houses[i].LID);
                    }
                }
                var select_types = [];
                for (i = 0; i < $scope.types.length; i++) {
                    if ($scope.select_types[i]) {
                        select_types.push($scope.types[i]);
                    }
                }
                var select_tags = [];
                for (j=0; j< $scope.tags.length; j++) {
                    if ($scope.select_tags[j]) {
                        select_tags.push($scope.tags[j].text);
                    }
                }                    
                if (checked) {
                    for (i = 0; i < $scope.sensors.length; i++) {
                        if (select_types.indexOf($scope.sensors[i].type) != -1 && select_houses.indexOf($scope.sensors[i].location_LID) != -1) {
                          console.log("Checking valid sensor: " + $scope.sensors[i] + " Tags: " + $scope.sensors[i].tags);
                            for (k = 0; k < $scope.sensors[i].tags.length; k++){
                                if ($scope.sensors[i].tags[k].text == $scope.tags[index].text) {
                                  console.log("Tag checked positive: " + $scope.tags[index].text);
                                    $scope.filtered_sensors.push($scope.sensors[i]);
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    $scope.filtered_sensors = [];
                    for (i = 0; i < $scope.sensors.length; i++) {
                        if (select_types.indexOf($scope.sensors[i].type) != -1 && select_houses.indexOf($scope.sensors[i].location_LID) != -1) {
                          console.log("Checking valid sensor: " + $scope.sensors[i] + " Tags: " + $scope.sensors[i].tags);
                            for (k = 0; k < $scope.sensors[i].tags.length; k++){
                                if (select_tags.indexOf($scope.sensors[i].tags[k].text) != -1) {
                                  console.log("Tag checked positive: " + $scope.tags[index].text);
                                    $scope.filtered_sensors.push($scope.sensors[i]);
                                    break;
                                }
                            }
                        }
                    }
                    /*var copy = [];
                    for (i = 0; i < $scope.filtered_sensors.length; i++) {
                      add = true;
                      for (k = 0; k < $scope.filtered_sensors[i].tags.length; k++){
                       if ($scope.filtered_sensors[i].tags[k].text === $scope.tags[index].text) {
                         add = false;
                         break;
                       }
                      }
                      if (add) {
                          copy.push($scope.filtered_sensors[i]);
                      }
                    }
                    $scope.filtered_sensors = copy;*/
                    console.log("Fixed filtered_sensors after deleting a tag");
                }
                break;
            case "sensor":
                for (i = 0; i < $scope.filtered_sensors.length; i++) {
                    if ($scope.select_sensors[i]) {
                        checkCount++;
                    }
                }
                $scope.all_sensors = (checkCount === $scope.filtered_sensors.length);
                if ($scope.all_sensors) {
                    addClass(document.getElementById("label-all_sensors"), "is-checked");
                } else {
                    removeClass(document.getElementById("label-all_sensors"), "is-checked");
                }
                break;
        }
    };

    $scope.$watch("number_of_time_back + type_of_time", function() {
        if (!($scope.number_of_time_back > 0)) {
            $scope.total_days = 0;
            return;
        }
        switch ($scope.type_of_time) {
            case "days":
                $scope.total_days = $scope.number_of_time_back;
                break;
            case "months":
                $scope.total_days = 30 * $scope.number_of_time_back;
                break;
            case "years":
                $scope.total_days = 365 * $scope.number_of_time_back;
                break;
        }
    });
    $scope.total_days = 0;
    $scope.type_of_time = "days";

    // GRAPH MAKING
    $scope.make_graph = function() {
        var final_sensors = [];
        for (i = 0; i < $scope.filtered_sensors.length; i++) {
            if (!is_box2_opened) {
                final_sensors = $scope.filtered_sensors;
                break;
            }
            if ($scope.select_sensors[i]) {
                final_sensors.push($scope.filtered_sensors[i]);
            }
        }
        if (final_sensors.length === 0 || $scope.total_days === 0) {
            return;
        }
        var graph = {};
        graph.type = "Line";
        graph.labels = [];
        graph.series = [];
        for (i = 0; i < final_sensors.length; i++) {
            graph.series.push(final_sensors[i].title);
        }
        switch ($scope.type_of_time) {
            case 'days':
                for (i = 0; i < $scope.total_days; i++) {
                    graph.labels.push("day " + i);
                };
                break;
            case 'months':
                for (i = 0; i < $scope.total_days; i += 30) {
                    graph.labels.push("month " + i / 30);
                };
                break;
            case 'years':
                for (i = 0; i < $scope.total_days; i += 365) {
                    graph.labels.push("year " + i / 365);
                }
        }
        graph.data = [];

	var date = new Date();
 	date.setDate(date.getDate()-$scope.total_days);

        for (i = 0; i < final_sensors.length; i++) {
		    var sensor_SID = final_sensors[i].SID;
            var sensor_data = [];
        	ws.request({type: "get_all", what: "Value", for: {what: "Sensor", SID: sensor_SID}, where: {field: "Value.time", op: "gt", value: date.getTime()}}, function(response) {
		        for(i = 0; i < response.objects.length; i++) 
			        sensor_data.push(response.objects[i][1]);
		        $scope.$apply();
	        });
        	graph.data.push(sensor_data);
	}
        $scope.graphs.push(graph);
        if (!hasClass(document.getElementById("box4"), "open"))
            $scope.open_box(4);
        componentHandler.upgradeDom();
    }

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
        var element = document.getElementById('important_icon-' + element_id);
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
    var graph_types = ["Line", "Bar", "Radar"];
    for (i = 0; i < 3; i++) {
        graph = {};
        graph.type = graph_types[i];
        graph.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        graph.series = ['Series A', 'Series B'];
        graph.data = [
            [65, 59, 80, 81, 56, 55, 40, 59, 54, 53, 30, 12],
            [28, 48, 40, 19, 86, 27, 90, 40, 78, 45, 01, 45]
        ];
        //$scope.graphs.push(graph);  
    }

    componentHandler.upgradeDom();
});
