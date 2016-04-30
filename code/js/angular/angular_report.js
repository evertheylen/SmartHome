angular.module("overwatch").controller("reportController", function($scope, $rootScope, Auth, $timeout, $state) {
    $rootScope.$state = $state;
    $rootScope.tab = "reportlink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    $rootScope.auth_user = Auth.getUser();
    $rootScope.simple_css = true;
    
    graph = {};
    graph.type = "Line";
    graph.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    graph.series = ['Series A', 'Series B'];
    graph.data = [
        [65, 59,80,81,56,55,40,59,54,53,30,12],
        [28,48,40,19,86,27,90,40,78,45,01,45]
    ];
    $scope.graph0 = graph;
    graph1 = {};
    graph1.type = "Bar";
    graph1.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    graph1.series = ['Series A', 'Series B'];
    graph1.data = [
        [65, 59,80,81,56,55,40,59,54,53,30,12],
        [28,48,40,19,86,27,90,40,78,45,01,45]
    ];
    $scope.graph1 = graph1;  
  	componentHandler.upgradeDom();
});

