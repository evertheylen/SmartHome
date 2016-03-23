angular.module("overwatch").controller("homeController", function($scope, $rootScope, Auth) {
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
    $scope.graphs = []
    
    graph = {};
    graph.type = "chart-line";
    graph.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    graph.series = ['Series A', 'Series B'];
    graph.data = [
        [65, 59,80,81,56,55,40,59,54,53,30,12],
        [28,48,40,19,86,27,90,456,78,45,01,45]
    ];
    
    $timeout(function () {
    $scope.data = [
      [28, 48, 40, 19, 86, 27, 90, 59,54,53,30,12],
      [65, 59, 80, 81, 56, 55, 40, 456,78,45,01,45]
    ];
  }, 5000);
        
    $scope.graphs.push(graph);  

	componentHandler.upgradeDom();
});	
