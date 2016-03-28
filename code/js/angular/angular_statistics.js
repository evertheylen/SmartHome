angular.module("overwatch").controller("statisticsController", function($scope, $rootScope, Auth) {
    $rootScope.auth_user = Auth.getUser();
    $rootScope.tab = "statisticslink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    
    // Sample data
    var all_locs= false;
    
    $scope.locations = [{"desc": "Campus Middelheim", "country": "Belgium", "city": "Antwerp", "postalcode": 2020, "street": "Middelheimlaan", "number": 1}, 
			    {"desc": "Campus Groenenborger", "country": "Belgium", "city": "Antwerp", "postalcode": 2020, "street": "Groenenborgerlaan", "number": 171}, 
			    {"desc": "Campus Drie Eiken", "country": "Belgium", "city": "Antwerp", "postalcode": 2610, "street": "Universiteitsplein", "number": 1}];
	
    
    $scope.aggregate_by = [false, false, false];
    
    $scope.select_loc = [];
    for (i = 0; i < $scope.locations.length; i++) {
        $scope.select_loc.push(false);
    }

    $scope.all_locations = function () {
        all_locs != all_locs;
        for (i=0; i < $scope.select_loc.length; i++) {
            $scope.select_loc[i] = all_locs;
        }
    }; 
 
    //Aggregation:
    /*
    [bool : aggregate_location, bool: aggregate_type, bool: aggregate_sensor]
    */
    
    componentHandler.upgradeDom();
});
