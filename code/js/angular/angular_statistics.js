angular.module("overwatch").controller("statisticsController", function($scope, $rootScope, Auth, $timeout, $state, graphShare) {
    $scope.$on("$destroy", function() {
        for (var graphIndex = 0; graphIndex < $scope.graphs.length; graphIndex++) {
            var graph = $scope.graphs[graphIndex];
            if (graph.live) {
                graph.data_type.removeLiveScope($scope);
                ws.request({
                type: "live_delete_liveline_values",
                graph: graph.temp_GID,
                }, function(response) {
                }, $scope);
            }
        }
    });

    $scope.update = function(object) {
        if (object["type"] === "live_add_liveline_values") {
            for (var graphIndex = 0; graphIndex < $scope.graphs.length; graphIndex++) {
                var graph = $scope.graphs[graphIndex];
                if (graph.temp_GID === object.graph) {
                    for (var valueIndex = 0; valueIndex < object.values.length; valueIndex++) {
                        var value = object.values[valueIndex];
                        addPoint(graph, graph.line_map[object.line], value[1], value[0]);
                        new Chart(graph.ctx).Scatter(graph.data, graph.options);
                    }
                    break;
                }
            }
        } else if (object["type"] === "live_delete_liveline_values") {
            for (var graphIndex = 0; graphIndex < $scope.graphs.length; graphIndex++) {
                var graph = $scope.graphs[graphIndex];
                if (graph.temp_GID === object.graph) {
                    for (var valueIndex = 0; valueIndex < object.values.length; valueIndex++) {
                        var value = object.values[valueIndex];
                        deletePoint(graph, graph.line_map[object.line], value[1], value[0]);
                        new Chart(graph.ctx).Scatter(graph.data, graph.options);
                    }
					break;
                }
            }
        }
    }

    $rootScope.$state = $state;
    $rootScope.simple_css = false;  
    $rootScope.auth_user = Auth.getUser();
    $rootScope.tab = "statisticslink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    $scope.graphs = [];
    $scope.amount_live_back = 0;
    
    $scope.statistics = true;

    $scope.set_live = function () {
        //console.log("clicked options");
        //console.log("$scope.live: " + $scope.live);
        componentHandler.upgradeDom();
    }
    
    $scope.$on("ngRepeatFinishedGraphs", function(ngRepeatFinishedEvent) {
        for (i = 0; i< $scope.graphs.length; i++) {
            $scope.graphs[i].ctx = document.getElementById("line-"+i).getContext("2d");
            var chart = new Chart($scope.graphs[i].ctx).Scatter($scope.graphs[i].data, $scope.graphs[i].options);
            document.getElementById("legend-"+ i).innerHTML = chart.generateLegend();
            //$scope.live_graph = $scope.graphs[i];
        }
      	componentHandler.upgradeDom();
        /*$timeout(function() {
          addPoint($scope.live_graph, 0, 5,5);
         addPoint($scope.live_graph, 0, 35,5324);
         addPoint($scope.live_graph, 0, 245,53);
         addPoint($scope.live_graph, 0, 523,5);
         addPoint($scope.live_graph, 0, 532,345);
         addPoint($scope.live_graph, 0, 52,5324);
          new Chart($scope.live_graph.ctx).Scatter($scope.live_graph.data, $scope.live_graph.options);
          }, 2000);*/
        
    });
    
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

    $scope.all_locs = false;
    $scope.all_types = false;
    $scope.all_sensors = false;
    $scope.all_tags = false;
    

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
        $scope.houses = response.objects;
        $scope.$apply();
    }, $scope);

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
            }, $scope);
        }
        $scope.$apply();
    }, $scope);

    // Fill the aggregate $scope arrays.
    $scope.aggregate_by = [false, false, false, false];
    $scope.select_locs = [];
    $scope.select_types = [];
    $scope.select_tags = [];
    $scope.select_sensors = [];
    $scope.select_no_tags = false;
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
                                if ($scope.select_no_tags && $scope.sensors[j].tags.length == 0) {
                                    $scope.filtered_sensors.push($scope.sensors[j]);
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
                                if ($scope.select_no_tags && $scope.sensors[j].tags.length == 0) {
                                    $scope.filtered_sensors.push($scope.sensors[j]);
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
                if ($scope.tags.length === 0) {
                    $scope.select_no_tags = $scope.all_tags;
                    addClass(document.getElementById('label-no_tags'), "is-checked");
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
                        for (j = 0; j < $scope.sensors.length; j++) {
                            if ($scope.sensors[j].tags.length > 0) {
                                break;
                            } else {
                                    if ($scope.select_no_tags && select_houses.indexOf($scope.sensors[j].location_LID) != -1 && select_types.indexOf($scope.sensors[j].type) != -1) {
                                        if ($scope.filtered_sensors.indexOf($scope.sensors[j]) === -1) {
                                            $scope.filtered_sensors.push($scope.sensors[j]);
                                        }
                                    }
                            }
                        }                        
                    } else {
                        removeClass(document.getElementById('label-no_tags'), "is-checked");
                        $scope.filtered_sensors = [];
                    }
                }
                for (i = 0; i < $scope.tags.length; i++) {
                    $scope.select_no_tags = $scope.all_tags;
                    addClass(document.getElementById('label-no_tags'), "is-checked");
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
                            if ($scope.sensors[j].tags.length > 0) {
                                for (k=0;k < $scope.sensors[j].tags.length; k++) {
                                    if ($scope.sensors[j].tags[k].text === $scope.tags[i].text && select_houses.indexOf($scope.sensors[j].location_LID) != -1 && select_types.indexOf($scope.sensors[j].type) != -1) {
                                        if ($scope.filtered_sensors.indexOf($scope.sensors[j]) === -1) {
                                            $scope.filtered_sensors.push($scope.sensors[j]);
                                        }
                                        break;
                                    }
                                }
                            } else {
                                    if ($scope.select_no_tags && select_houses.indexOf($scope.sensors[j].location_LID) != -1 && select_types.indexOf($scope.sensors[j].type) != -1) {
                                        if ($scope.filtered_sensors.indexOf($scope.sensors[j]) === -1) {
                                            $scope.filtered_sensors.push($scope.sensors[j]);
                                        }
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
                        removeClass(document.getElementById('label-no_tags'), "is-checked");
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
                console.log("Checking locs");
                for (i = 0; i < $scope.houses.length; i++) {
                    if ($scope.select_locs[i]) {
                        checkCount++;
                    }
                }
                $scope.all_locs = (checkCount === $scope.houses.length);
                console.log("All locs: " + $scope.all_locs);
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
                            if ($scope.select_no_tags && $scope.sensors[i].tags.length == 0) {
                                $scope.filtered_sensors.push($scope.sensors[i]);
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
                            if ($scope.select_no_tags && $scope.sensors[i].tags.length == 0) {
                                $scope.filtered_sensors.push($scope.sensors[i]);
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
                if ($scope.select_no_tags) {
                    checkCount++;
                }
                $scope.all_tags = (checkCount === $scope.tags.length+1);
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
                            for (k = 0; k < $scope.sensors[i].tags.length; k++){
                                if ($scope.sensors[i].tags[k].text == $scope.tags[index].text) {
                                    if ($scope.filtered_sensors.indexOf($scope.sensors[i]) === -1) {
                                        $scope.filtered_sensors.push($scope.sensors[i]);
                                        break;
                                    }
                                }
                            }
                            if ($scope.select_no_tags && $scope.sensors[i].tags.length == 0 && $scope.filtered_sensors.indexOf($scope.sensors[i]) === -1) {
                                $scope.filtered_sensors.push($scope.sensors[i]);
                            }                            
                        }
                    }
                } else {
                    $scope.filtered_sensors = [];
                    for (i = 0; i < $scope.sensors.length; i++) {
                        if (select_types.indexOf($scope.sensors[i].type) != -1 && select_houses.indexOf($scope.sensors[i].location_LID) != -1) {
                            for (k = 0; k < $scope.sensors[i].tags.length; k++){
                                if (select_tags.indexOf($scope.sensors[i].tags[k].text) != -1) {
                                    if ($scope.filtered_sensors.indexOf($scope.sensors[i]) === -1) {
                                        $scope.filtered_sensors.push($scope.sensors[i]);
                                        break;
                                    }
                                }
                            }
                            if ($scope.select_no_tags && $scope.sensors[i].tags.length == 0 && $scope.filtered_sensors.indexOf($scope.sensors[i]) === -1) {
                                $scope.filtered_sensors.push($scope.sensors[i]);
                            }                            
                        }
                    }
                }
                break;
            
            case "notag":
                for (i = 0; i < $scope.tags.length; i++) {
                    if ($scope.select_tags[i]) {
                        checkCount++;
                    }
                }
                if (checked) {
                    checkCount++;
                }                
                $scope.all_tags = (checkCount === $scope.tags.length+1);
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
                            if ($scope.sensors[i].tags.length === 0) {
                                if ($scope.filtered_sensors.indexOf($scope.sensors[i]) === -1) {
                                    $scope.filtered_sensors.push($scope.sensors[i]);
                                }
                            }
                        }
                    }
                } else {
                    $scope.filtered_sensors = [];
                    for (i = 0; i < $scope.sensors.length; i++) {
                        if (select_types.indexOf($scope.sensors[i].type) != -1 && select_houses.indexOf($scope.sensors[i].location_LID) != -1) {
                            for (k = 0; k < $scope.sensors[i].tags.length; k++){
                                if (select_tags.indexOf($scope.sensors[i].tags[k].text) != -1) {
                                    //console.log("Tag checked positive: " + $scope.tags[index].text);
                                    if ($scope.filtered_sensors.indexOf($scope.sensors[i]) === -1) {
                                        $scope.filtered_sensors.push($scope.sensors[i]);
                                        break;
                                    }
                                }
                            }
                            if ($scope.select_no_tags && $scope.sensors[i].tags.length == 0 && $scope.filtered_sensors.indexOf($scope.sensors[i]) === -1) {
                                $scope.filtered_sensors.push($scope.sensors[i]);
                            }                            
                        }
                    }
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
    var today = new Date();
    $scope.start_date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    $scope.end_date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    $scope.start_date_time = {
       value: new Date(1970, 0, 1)
     };
    $scope.end_date_time = {
       value: new Date(1970, 0, 1, 23, 59) 
     };

    $scope.type_of_time = "days";
    $scope.show_raw = false;
    
    $scope.$watch('start_date + end_date', function() {
        today = new Date();
        if ($scope.start_date.getYear() == today.getYear() && 
            $scope.start_date.getMonth() == today.getMonth() &&
            $scope.start_date.getDate() == today.getDate() ) {
            if ($scope.end_date.getYear() == today.getYear() && 
                $scope.end_date.getMonth() == today.getMonth() &&
                $scope.end_date.getDate() == today.getDate() ) {
                $scope.show_raw = true;
                return;
            }
        }
        $scope.show_raw = false;
        if ($scope.type_of_time == "raw") 
            $scope.type_of_time = "days";
    });

    $scope.$watch('amount_live_back + live + type_of_time', function() {
    });    
    $scope.graph_title = $scope.i18n("untitled");
    addClass(document.getElementById("graphTextfield"), "is-dirty");
    // GRAPH MAKING
    $scope.type_of_aggregate = "raw";
    $scope.make_graph = function() {
        console.log("Making graph");

        var final_sensors = [];
        if (!is_box2_opened) {
            final_sensors = $scope.filtered_sensors;
        }
        else {
            final_sensors = $scope.filtered_sensors.filter(function getFinal(el, pos) {
                return ($scope.select_sensors[pos]);
            });
        }
        if (final_sensors.length === 0) 
            return;
        var sensor_SIDs = final_sensors.map(function(sensor) {return sensor.SID;});

        // Group_by.
        var group_by_objects = [];
        if($scope.aggregate_by.filter(function checkTrue(el) { return el === true;}).length === 0) {
            group_by_objects.push({what: "Sensor", IDs: sensor_SIDs}); 
        }
        if($scope.aggregate_by[0] === true) {
            var IDs = $scope.houses.map(function (loc, pos) {if ($scope.select_locs[pos]) return loc.LID;});
            group_by_objects.push({what: "Location", IDs: IDs});
        }
        if($scope.aggregate_by[1] === true) {
            var IDs = $scope.types.map(function (type, pos) {if ($scope.select_types[pos]) return type;});
            group_by_objects.push({what: "Type", IDs: IDs});
        }
        if($scope.aggregate_by[2] === true) {
            var IDs = $scope.tags.map(function (tag, pos) {if ($scope.select_tags[pos]) return tag.TID;});
            if ($scope.select_no_tags) IDs.push("$NOTAGS$");
            group_by_objects.push({what: "Tag", IDs: IDs});
        }
        if($scope.aggregate_by[3] === true) {
            var IDs = final_sensors.map(function(sensor) {return sensor.Eur_per_unit;});
            IDs.filter(function(item, pos) {return eur_per_unit_IDs.indexOf(item) == pos;}); // Make unique.
            group_by_objects.push({what: "Eur_per_Unit", IDs: IDs});
        }   

        // Where.
        var where = [{
            field: "SID",
            op: "in",
            value: sensor_SIDs
        }]

        // Timespan.
        var valueType = "Value";
        switch ($scope.type_of_aggregate) {
            case 'hours':
                valueType = "HourValue";
                break;
            case 'days':
                valueType = "DayValue";
                break;
            case 'months':
                valueType = "MonthValue";
                break;
            case 'years':
                valueType = "YearValue";
        }

        if (!$scope.live) {
            var timespan = {
                valueType: valueType,
                start: ($scope.start_date.getTime() + $scope.start_date_time.value.getTime() - (new Date(0).getTimezoneOffset() * 60 * 1000)),
                end: ($scope.end_date.getTime() + $scope.end_date_time.value.getTime()  - (new Date(0).getTimezoneOffset() * 60 * 1000))
            }

            ws.request({
                type: "create_graph",
                group_by: group_by_objects,
                where: where,
                title: $scope.graph_title,
                timespan: timespan
            }, function(response) {
                $scope.graphs.push(response.get_graph());
                if (!hasClass(document.getElementById("box4"), "open"))
                    $scope.open_box(4);
                componentHandler.upgradeDom();
                $scope.$apply();
            }, $scope);
            return;
        }

        var start_time = $scope.amount_live_back;
        start_time *= 1000*60;
        switch ($scope.type_of_time) {
            case 'hours':
                start_time *= 60;
                break;
            case 'days':
                start_time *= 60*24;
                break;
            case 'months':
                start_time *= 60*24*30;
                break;
            case 'years':
                start_time *= 60*24*30*365;
        }

        var timespan = {
            valueType: valueType,
            start: -start_time,
            end: 0
        } 

        ws.request({
            type: "create_live_graph",
            group_by: group_by_objects,
            where: where,
            timespan: timespan
        }, function(response) {
            response.addLiveScope($scope, "None");
            ws.request({
                type: "get_liveline_values",
                graph: response.LGID,
                }, function(valueResponse) {
                    var graph = cache["LiveGraph"][valueResponse["LGID"]].get_graph();
                    var lines = valueResponse.lines;
                    for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                        var values = lines[lineIndex].values;
                        for (var valueIndex = 0; valueIndex < values.length; valueIndex++)
                            addPoint(graph, graph.line_map[lines[lineIndex].LLID], values[valueIndex][1], values[valueIndex][0]);
                    }
                    $scope.graphs.push(graph);
                    $scope.$apply();
            }, $scope);
            if (!hasClass(document.getElementById("box4"), "open"))
                $scope.open_box(4);
            componentHandler.upgradeDom();
            $scope.$apply();
        }, $scope);
    }

    $scope.share = function (index) {
	    graphShare.setGraph($scope.graphs[index].temp_GID);
	    document.getElementById("dlgShare").showModal();    
	    $rootScope.$broadcast("dialog share");
	}

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
            ws.request({
                type: "delete",
                what: "LiveGraph",
                data: {LGID: $scope.graphs[element_id].temp_GID}
                }, function(response) {
            }, $scope);
        } else if (hasClass(element, "white")) {
            removeClass(element, "white");
            addClass(element, "yellow");
            ws.request({
                type: "add",
                what: "LiveGraph",
                data: {LGID: $scope.graphs[element_id].temp_GID}
                }, function(response) {
            }, $scope);
        }
        $scope.importants[element_id] = !$scope.importants[element_id];
    };

    $scope.exit = function (index) {
        if ($scope.graphs[index].live) {
            ws.request({
            type: "delete_liveline_values",
            graph: $scope.graphs[index].temp_GID,
            }, function(response) {
            }, $scope);
        }
        $scope.graphs.splice(index, 1);
        componentHandler.upgradeDom();
	}


    componentHandler.upgradeDom();
});

