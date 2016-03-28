angular.module("overwatch").controller("statisticsController", function($scope, $rootScope, Auth, $timeout) {
    $rootScope.auth_user = Auth.getUser();
    $rootScope.tab = "statisticslink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    
    // Sample data
    
    $scope.locations = [{"desc": "Campus Middelheim", "country": "Belgium", "city": "Antwerp", "postalcode": 2020, "street": "Middelheimlaan", "number": 1, "selected" : false}, 
			    {"desc": "Campus Groenenborger", "country": "Belgium", "city": "Antwerp", "postalcode": 2020, "street": "Groenenborgerlaan", "number": 171, "selected" : false}, 
			    {"desc": "Campus Drie Eiken", "country": "Belgium", "city": "Antwerp", "postalcode": 2610, "street": "Universiteitsplein", "number": 1, "selected" : false}];
	
    $scope.aggregate_by = [false, false, false];
    
    $scope.select_all = function (type) {
        switch (type) {
            case "location" : 
                for (i=0; i < $scope.locations.length; i++) {
                    $scope.locations[i].selected = $scope.all_locs;
                    if ($scope.all_locs) {
                        addClass(document.getElementById("label-location_" + i), "is-checked");
                    } else {
                        removeClass(document.getElementById("label-location_" + i), "is-checked");
                    }
                };
                break;
        }
    }; 
    
    $scope.checkStatus = function (type) {
        var checkCount = 0;
        switch (type) {
            case "location" :
                for (i=0; i < $scope.locations.length; i++) {
                    if ($scope.locations[i].selected) {
                        checkCount++;
                    }
                }
                $scope.all_locs = ( checkCount === $scope.locations.length);
                if ($scope.all_locs) {
                    addClass(document.getElementById("label-all_locations"), "is-checked");
                } else {
                    removeClass(document.getElementById("label-all_locations"), "is-checked");
                };
                break;
        }
    };

 
    //Aggregation:
    /*
    [bool : aggregate_location, bool: aggregate_type, bool: aggregate_sensor]
    */
    
    componentHandler.upgradeDom();
});
