angular.module("overwatch").controller("adminController", function($scope, $rootScope, Auth, $timeout, $state) {
    $rootScope.$state = $state;
    $rootScope.simple_css = false;
    $rootScope.tab = "adminlink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    $rootScope.auth_user = Auth.getUser();
  	componentHandler.upgradeDom();
    
    $scope.enter_command = function() {
      console.log("entered");
      document.getElementById('output').innerHTML += $scope.prompt;
      document.getElementById("output").innerHTML += "<br>";
      $scope.prompt = "";
    }
    
      // Sample data
    $scope.open_box = function(id) {
        if (hasClass(document.getElementById("box" + id), "open")) {
            removeClass(document.getElementById("box" + id), "open");
        } else {
            addClass(document.getElementById("box" + id), "open");
        }
        componentHandler.upgradeDom();
    }

    // Default opening
    $scope.open_box(1);
    $scope.open_box(3);


    // Fill all the $scope arrays using the database.    
    $scope.aggregate_by_user = true;

    $scope.sensors = [];
    $scope.users = [];
    ws.request({
      type: "get_all",
      what: "User",
      for: {
          what: "User",
          UID: $rootScope.auth_user.UID
      }
    }, function(response) {
        for (var i= 0; i < response.objects.length; i++)
            response.objects[i]._scopes.push($scope);
        $scope.users = response.objects;
            
        for (var userIndex = 0; userIndex < $scope.users.length; userIndex++) {
            ws.request({
              type: "get_all",
              what: "Sensor",
              for: {
                  what: "User",
                  UID: $scope.users[userIndex].UID
              }
            }, function(response) {
                for (var i= 0; i < response.objects.length; i++) {
                    response.objects[i]._scopes.push($scope);
                    $scope.sensors.push(response.objects[i]);
                }
                $scope.$apply();
            });
        }
        $scope.$apply();
    });
    $scope.select_users = [];
    $scope.filtered_sensors = [];

    for (i = 0; i < $scope.users.length; i++)
        $scope.select_users.push(false);

    $scope.select_all = function(type) {
        switch (type) {
            case "user":
                for (i = 0; i < $scope.users.length; i++) {
                    $scope.select_users[i] = $scope.all_users;
                    if ($scope.all_users) {
                        addClass(document.getElementById("label-user_" + i), "is-checked");
                    } else {
                        removeClass(document.getElementById("label-user_" + i), "is-checked");
                    }
                };
                break;

        }
    };

    $scope.checkStatus = function(type, index, checked) {
        var checkCount = 0;
        switch (type) {
            case "user":
                for (i = 0; i < $scope.users.length; i++) {
                    if ($scope.select_users[i]) {
                        checkCount++;
                    }
                }
                $scope.all_users = (checkCount === $scope.users.length);
                if ($scope.all_users) {
                    addClass(document.getElementById("label-all_users"), "is-checked");
                } else {
                    removeClass(document.getElementById("label-all_users"), "is-checked");
                };
                break;
        }
    };

    var today = new Date();
    $scope.start_date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    $scope.end_date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    $scope.start_date_time = {
       value: new Date(1970, 0, 1, 0, 0, 0)
     };
    $scope.end_date_time = {
       value: new Date(1970, 0, 1, 23, 59, 0)
     };

    $scope.type_of_time = "days";
    $scope.show_raw = false;
    
    $scope.$watch('start_date + end_date', function() {
        today = new Date();
        var start_date = new Date($scope.start_date);
        var end_date = new Date($scope.end_date);
        if (start_date.getYear() == today.getYear() && 
            start_date.getMonth() == today.getMonth() &&
            start_date.getDay() == today.getDay() ) {
            if (end_date.getYear() == today.getYear() && 
                end_date.getMonth() == today.getMonth() &&
                end_date.getDay() == today.getDay() ) {
                $scope.show_raw = true;
                return;
            }
        }
        $scope.show_raw = false;
    });

    // GRAPH MAKING
    $scope.make_graph = function() {
        var final_users = [];
        var final_sensors = [];
        for (i = 0; i < $scope.users.length; i++) {
            if ($scope.select_users[i]) {
                final_users.push($scope.users[i])
                for (var sensorIndex = 0; sensorIndex < $scope.sensors.length; sensorIndex++) {
                    if ($scope.sensors[sensorIndex].user_UID == $scope.users[i].UID) 
                        final_sensors.push($scope.sensors[sensorIndex]);
                }
            }
        }

        console.log("Asking graph for " + final_users);

        var graph = {};
        graph.type = "Line";
        graph.labels = [];
        graph.series = [];
        graph.data = [];

        var timezone_offset = (1000*60*60);
        var full_start_date = ($scope.start_date.getTime() + $scope.start_date_time.value.getTime() + 3*timezone_offset) / 1000;
        var full_end_date = ($scope.end_date.getTime() + $scope.end_date_time.value.getTime() + 3*timezone_offset) / 1000;
        var total_days = ($scope.end_date.getTime() - $scope.start_date.getTime()) / (1000*60*60*24);

        var valueType = "Value";
        switch ($scope.type_of_time) {
            case 'raw':
                break;
            case 'hours':
                valueType = "HourValue";
                var total_hours = (full_end_date - full_start_date) / (1000*60*60);
                for (var i = 0; i < total_hours; i++) 
                    graph.labels.push("hour " + i);
                break;
            case 'days':
                valueType = "DayValue";
                for (var i = 0; i < total_days; i++)
                    graph.labels.push("day " + i);
                break;
            case 'months':
                valueType = "MonthValue";
                for (var i = 0; i < total_days; i += 30)
                    graph.labels.push("month " + i / 30);
                break;
            case 'years':
                valueType = "YearValue";
                for (var i = 0; i < total_days; i += 365) 
                    graph.labels.push("year " + i / 365);
        }

        ws.request({
          type: "get_all",
          what: "Sensor",
          for: {
              what: "User",
              UID: $rootScope.auth_user.UID
          }
        }, function(response) {
            for (var i= 0; i < response.objects.length; i++) {
                response.objects[i]._scopes.push($scope);
                $scope.users = response.objects;
                $scope.$apply();
            }
        });

        var sensor_SIDs = [];
        var user_UIDs = [];
        for (i = 0; i < final_sensors.length; i++)
            sensor_SIDs.push(final_sensors[i].SID);
        for (i = 0; i < final_users.length; i++)
            user_UIDs.push(final_users[i].UID);

        if ($scope.aggregate_by_user) {
            ws.request({
                type: "get_values",
                group_by: [{
                    what: "User",
                    IDs: user_UIDs
                }],
                where: [{
                    field: "sensor_SID",
                    op: "in",
                    value: sensor_SIDs
                }],
                timespan: {
                    valueType: valueType,
                    start: full_start_date,
                    end: full_end_date
                }
            }, function(response) {
                for (var groupIndex = 0; groupIndex < response.length; groupIndex++) {
                    var sensor_data = [];
                    for (var valueIndex = 0; valueIndex < response[groupIndex].values.length; valueIndex++) 
                        sensor_data.push(response[groupIndex].values[valueIndex][1]);
                    graph.series.push(final_sensors[sensor_SIDs.indexOf(response[groupIndex].sensors[0])].title);
                    graph.data.push(sensor_data);
                }
                $scope.$apply();
            });            
        } else {
            ws.request({
                type: "get_values",
                group_by: [],
                where: [{
                    field: "sensor_SID",
                    op: "in",
                    value: sensor_SIDs
                }],
                timespan: {
                    valueType: valueType,
                    start: full_start_date,
                    end: full_end_date
                }
            }, function(response) {
                for (var groupIndex = 0; groupIndex < response.length; groupIndex++) {
                    var sensor_data = [];
                    for (var valueIndex = 0; valueIndex < response[groupIndex].values.length; valueIndex++) 
                        sensor_data.push(response[groupIndex].values[valueIndex][1]);
                    graph.series.push(final_sensors[sensor_SIDs.indexOf(response[groupIndex].sensors[0])].title);
                    graph.data.push(sensor_data);
                }
                $scope.$apply();
            });    
        }

        $scope.graphs.push(graph);

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

        componentHandler.upgradeDom();
    });	
});
