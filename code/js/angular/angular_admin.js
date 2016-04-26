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
    $scope.users = [];
    ws.request({
      type: "get_all",
      what: "User",
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

    $scope.$watch("number_of_time_back_from + number_of_time_back_until + type_of_time", function() {
        if (!($scope.number_of_time_back_from - $scope.numer_of_time_back_until > 0)) {
            $scope.total_days = 0;
            return;
        }
        switch ($scope.type_of_time) {
            case "days":
                $scope.total_days = $scope.number_of_time_back_from - $scope.numer_of_time_back_until;
                break;
            case "months":
                $scope.total_days = 30 * $scope.number_of_time_back_from - $scope.numer_of_time_back_until;
                break;
            case "years":
                $scope.total_days = 365 * $scope.number_of_time_back_from - $scope.numer_of_time_back_until;
                break;
        }
    });
    $scope.total_days = 0;
    $scope.type_of_time = "days";

    // GRAPH MAKING
    $scope.make_graph = function() {
        var final_users = [];
        for (i = 0; i < $scope.users.length; i++) {
          if ($scope.select_users[i]) {
              final_users.push($scope.users[i])
          }
        }
        console.log("Asking graph for " + final_users);
        /*if (final_sensors.length === 0 || $scope.total_days === 0) {
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
        	ws.request({type: "get_all", what: "Value", for: {what: "Sensor", SID: sensor_SID}, where: {field: "time", op: "gt", value: date.getTime()}}, function(response) {
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
*/
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
