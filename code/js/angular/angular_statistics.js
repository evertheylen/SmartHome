angular.module("overwatch").controller("statisticsController", function($scope, $rootScope, Auth) {
    $rootScope.auth_user = Auth.getUser();
    $rootScope.tab = "statisticslink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    
    // Sample data
    
    $scope.locations = [{"desc": "Campus Middelheim", "country": "Belgium", "city": "Antwerp", "postalcode": 2020, "street": "Middelheimlaan", "number": 1, "selected" : false}, 
			    {"desc": "Campus Groenenborger", "country": "Belgium", "city": "Antwerp", "postalcode": 2020, "street": "Groenenborgerlaan", "number": 171, "selected" : false}, 
			    {"desc": "Campus Drie Eiken", "country": "Belgium", "city": "Antwerp", "postalcode": 2610, "street": "Universiteitsplein", "number": 1, "selected" : false}];
	
    
    $scope.aggregate_by = [false, false, false];
    
    $scope.select_loc = [];
    for (i = 0; i < $scope.locations.length; i++) {
        $scope.select_loc.push(false);
    }

    $scope.all_locations = function () {
        console.log("YIHAA");
        for (i=0; i < $scope.select_loc.length; i++) {
            $scope.locations[i].selected = $scope.all_locs;
        }
    }; 
    
    $scope.checkStatus= function() {
        var checkCount = 0;
        for (i=0; i < $scope.select_loc.length; i++) {
            if ($scope.locations[i].selected) {
                checkCount++;
            }
        }
        $scope.selectedAll = ( checkCount === $scope.select_loc.length);
    };

 
    //Aggregation:
    /*
    [bool : aggregate_location, bool: aggregate_type, bool: aggregate_sensor]
    */

    componentHandler.upgradeDom();
});

angular.module("overwatch").directive('onFinishRenderCheckbox', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    console.log("Setting class!");
                    for (i=0; i < $scope.locations.length; i++ ) {
                        addClass(document.getElementById("label-checkbox-location_" + i), "mdl-js-checkbox");
                    }
                });
            }
        }
    }
});
