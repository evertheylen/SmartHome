angular.module("overwatch").controller("homeController", function($scope, $rootScope, Auth, $timeout, $state) {
    $scope.$on("$destroy", function() {
        cache.removeScope($scope);
    });
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
  
    $scope.scatters = [];
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
        }];
        addPoint(graph, 1, 27, 59);
        graph.data = [
            {
              label: 'My First dataset',
              strokeColor: '#F16220',
              pointColor: '#F16220',
              pointStrokeColor: '#fff',
              data: [
                { x: 28, y: 69 }, 
                { x: 40, y: 81 },
                { x: 48, y: 56 }
              ]
            },
            {
              label: 'My Second dataset',
              strokeColor: '#007ACC',
              pointColor: '#007ACC',
              pointStrokeColor: '#fff',
              data: [
                { x: 19, y: 75, r: 4 }, 
                { x: 27, y: 69, r: 7 }, 
                { x: 28, y: 70, r: 5 }, 
                { x: 40, y: 31, r: 3 },
                { x: 48, y: 76, r: 6 },
                { x: 52, y: 23, r: 3 }, 
                { x: 24, y: 32, r: 4 }
              ]
            }
          ];
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
        for(i=1; i < 3; i++) {
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

