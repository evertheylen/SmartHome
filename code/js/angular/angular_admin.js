angular.module("overwatch").controller("adminController", function($scope, $rootScope, Auth, $timeout, $state) {
    $scope.$on("$destroy", function() {
        cache.removeScope($scope);
    });
    $rootScope.$state = $state;
    $rootScope.simple_css = false;
    $rootScope.tab = "adminlink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    $rootScope.auth_user = Auth.getUser();
    $scope.graphs = [];
  	componentHandler.upgradeDom();
    
    $scope.$on("ngRepeatFinishedGraphs", function(ngRepeatFinishedEvent) {
        for (i = 0; i< $scope.graphs.length; i++) {
            var ctx = document.getElementById("line-"+i).getContext("2d");
            new Chart(ctx).Scatter($scope.graphs[i].data, $scope.graphs[i].options);
        }
      	componentHandler.upgradeDom();
    });
    
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
    ws.request({
      type: "get_all",
      what: "Sensor",
    }, function(response) {
        $scope.sensors = response.objects;
        console.log("length sensors: " + $scope.sensors.length);
        $scope.$apply();
    }, $scope);    

    $scope.users = [];
    ws.request({
      type: "get_all",
      what: "User",
      for: {
          what: "User",
          UID: $rootScope.auth_user.UID
      }
    }, function(response) {
        $scope.users = response.objects;
        $scope.$apply();
    }, $scope);
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
            start_date.getDate() == today.getDate() ) {
            if (end_date.getYear() == today.getYear() && 
                end_date.getMonth() == today.getMonth() &&
                end_date.getDate() == today.getDate() ) {
                $scope.show_raw = true;
                return;
            }
        }
        $scope.show_raw = false;
        if ($scope.type_of_time === "raw")
            $scope.type_of_time = "days";
    });

    // GRAPH MAKING
    $scope.make_graph = function() {
        var final_users = [];
        var final_sensors = [];
        
        console.log("length: " + $scope.users.length); 
        console.log("length: " + $scope.select_users.length);
        for (var i = 0; i < $scope.users.length; i++) {
            if ($scope.select_users[i]) {
                console.log("reached " + i);
                final_users.push($scope.users[i])
                for (var sensorIndex = 0; sensorIndex < $scope.sensors.length; sensorIndex++) {
                    console.log($scope.sensors[sensorIndex].user_UID + " " + $scope.users[i].UID);
                    if ($scope.sensors[sensorIndex].user_UID == $scope.users[i].UID) 
                        final_sensors.push($scope.sensors[sensorIndex]);
                }
            }
        }
        if (final_sensors.length === 0)
            return;
        var user_UIDs = final_users.map(function (user) {return user.UID;});
        var sensor_SIDs = final_sensors.map(function(sensor) {return sensor.SID;});

        // Group by.
        var group_by_objects = [{what: "Sensor", IDs: sensor_SIDs}];
        if ($scope.aggregate_by_user) 
            group_by_objects = [{what: "User", IDs: user_UIDs}];       

        // Where.
        var where = [{
            field: "SID",
            op: "in",
            value: sensor_SIDs
        }]
        
        // Timespan.
        var valueType = "Value";
        switch ($scope.type_of_time) {
            case 'raw':
                break;
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
        var timespan = {
            valueType: valueType,
            start: ($scope.start_date.getTime() + $scope.start_date_time.value.getTime() - (new Date(0).getTimezoneOffset() * 60 * 1000)),
            end: ($scope.end_date.getTime() + $scope.end_date_time.value.getTime()  - (new Date(0).getTimezoneOffset() * 60 * 1000))
        };

        ws.request({
            type: "create_graph",
            group_by: group_by_objects,
            where: where,
            timespan: timespan
        }, function(response) {
            $scope.graphs.push(response.get_graph());
            if (!hasClass(document.getElementById("box4"), "open"))
                $scope.open_box(4);
            componentHandler.upgradeDom();
            $scope.$apply();
        }, $scope); 

        // Graphs
        var layout = document.getElementById("mainLayout");
        if (hasClass(layout, "mdl-layout--no-drawer-button")) {
            removeClass(layout, "mdl-layout--no-drawer-button");
        }

        $scope.exit = function exit(element_id) {
            $scope.graphs.splice(element_id, 1);
            componentHandler.upgradeDom();
        };

        componentHandler.upgradeDom();
    }	
});

