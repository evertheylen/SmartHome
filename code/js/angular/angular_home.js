angular.module("overwatch").controller("homeController", function($scope, $rootScope, Auth, $timeout, $state) {
    $scope.$on("$destroy", function() {
        console.log("Destructor");
        for (var graphIndex = 0; graphIndex < $scope.scatters.length; graphIndex++) {
            var graph = $scope.scatters[graphIndex];
            if (graph.data_type) {
                graph.data_type.removeLiveScope($scope);
                ws.request({
                type: "delete_liveline_values",
                graph: graph.temp_GID,
                }, function(response) {
                }, $scope);
            }
        }
    });

    $scope.$on("ngRepeatFinishedGraphs", function(ngRepeatFinishedEvent) {
        for (i = 0; i< $scope.scatters.length; i++) {
            $scope.scatters[i].ctx = document.getElementById("line-"+i).getContext("2d");
            new Chart($scope.scatters[i].ctx).Scatter($scope.scatters[i].data, $scope.scatters[i].options);
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
    
    $scope.update = function(object) {
        if (object["type"] === "live_add_liveline_values") {
            for (var graphIndex = 0; graphIndex < $scope.scatters.length; graphIndex++) {
                var graph = $scope.scatters[graphIndex];
                if (graph.temp_GID === object.graph) {
                    for (var valueIndex = 0; valueIndex < object.values.length; valueIndex++) {
                        var value = object.values[valueIndex];
                        addPoint(graph, graph.line_map[object.line], value[1], value[0]);
                        new Chart(graph.ctx).Scatter(graph.data, graph.options);
                    }
                }
            }
        }
    }

    $rootScope.$state = $state;
    $rootScope.simple_css = false;
    $rootScope.tab = "homelink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    $rootScope.auth_user = Auth.getUser();
    $scope.importants = [false, false, false, false, false, false];
    var layout = document.getElementById("mainLayout");
    if (hasClass(layout, "mdl-layout--no-drawer-button")) {
        removeClass(layout, "mdl-layout--no-drawer-button");
    }

    $scope.exit = function (index) {
        ws.request({
            type: "delete",
            what: "LiveGraph",
            data: {LGID: $scope.scatters[index].temp_GID}
            }, function(response) {
        }, $scope);
        $scope.scatters.splice(index, 1);
        componentHandler.upgradeDom();
	}
  
    $scope.scatters = [];
        
    // Live Graphs
    ws.request({
    type: "get_all",
    what: "LiveGraph",
    for: {
        what: "User",
        UID: $rootScope.auth_user.UID
    }
    }, function(response) {
        for (var i = 0; i < response.objects.length; i++) {
            response.objects[i].addLiveScope($scope, "None");
            ws.request({
                type: "get_liveline_values",
                graph: response.objects[i].LGID,
                }, function(valueResponse) {
                    var graph = cache["LiveGraph"][valueResponse["LGID"]].get_graph();
                    var lines = valueResponse.lines;
                    graph.options = {
                        bezierCurve: false,
                        responsive: false,
                        maintainAspectRatio: false,
                        scaleType: "date",
                        scaleDateFormat: "dd mmm yy",
                        scaleTimeFormat: "h:MM",
                        useUtc: true,
                        animation: false
                    }
                    for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                        var values = lines[lineIndex].values;
                        for (var valueIndex = 0; valueIndex < values.length; valueIndex++)
                            addPoint(graph, graph.line_map[lines[lineIndex].LLID], values[valueIndex][1], values[valueIndex][0]);
                    }
                    $scope.scatters.push(graph);
                    $scope.$apply();
            }, $scope);
        }
        $scope.$apply();
    }, $scope);

    for (i = 0 ; i < 3; i++) {
        // Get the context of the canvas element we want to select
        var graph = {};
        graph.data = [{
              label: 'My First dataset',
              strokeColor: '#F16220',
              pointColor: '#F16220',
              pointStrokeColor: '#fff',
              data: [
                { x: 19, y: 65 }]
                    },
            {
              label: 'My Second dataset',
              strokeColor: '#007ACC',
              pointColor: '#007ACC',
              pointStrokeColor: '#fff',
              data: [
                { x: 19, y: 75, r: 4 }]
            }
          ];
        addPoint(graph, 0, 27, 59);
        addPoint(graph, 0, 28, 69);
        addPoint(graph, 0, 40, 81);
        addPoint(graph, 0, 48, 56);
        addPoint(graph, 1, 27, 69);
        addPoint(graph, 1, 28, 70);
        addPoint(graph, 1, 40, 31);
        addPoint(graph, 1, 48, 76);
        addPoint(graph, 1, 52, 23);
        addPoint(graph, 1, 64, 32);
        graph.options = {
            bezierCurve: false
        };
        $scope.scatters.push(graph);
        //var ctx = document.getElementById("line").getContext("2d");
        //$scope.scatter = new Chart(ctx).Scatter(data, options);
        //$scope.scatter.data = data;
    }
    
    $timeout(function() {
        var j = 0;
        for (i = $scope.graphs.length + $scope.graphs_single.length; i< $scope.graphs.length+$scope.graphs_single.length+$scope.scatters.length; i++) {
            var ctx = document.getElementById("line-"+i).getContext("2d");
            new Chart(ctx).Scatter($scope.scatters[j].data, $scope.scatters[j].options);
            j++;
        }
    });
  
	componentHandler.upgradeDom();
});

