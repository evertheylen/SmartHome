angular.module("overwatch").controller("homeController", function($scope, $rootScope, Auth) {
    $rootScope.tab = "homelink";
    $rootScope.page_title = "OverWatch - " + i18n($rootScope.tab);
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
    
    barchart = {};
    barchart.type = "BarChart";
    
    barchart.data = {"cols": [{id: "t", label: "Topic", type: "string"},
    {id: "a", label: "Amount", type: "number"}],
     "rows": [{c: [{v: "University"},{v: 20},]},{c: [{v: "Programming"},{v: 50},]},{c: [{v: "Databases"},{v: 100},]},{c: [{v: "Work"},{v: 40},]},{c: [{v: "This Epic Chart"},{v: 560},]}]};
    
    barchart.options = {
        'title': "Things I Like",
        "hAxis": {
            "gridlines": {
                "count": 10
            }
        }
    };
    
    $scope.graphs.push(barchart);
    
    for (var i = 0; i < 3; i ++ ) {
        graph = {};
        graph.type = "LineChart";
        graph.displayed = false;
        graph.data = {
            "cols": [{
                id: "year",
                label: "Year",
                type: "number"
            }, {
                id: "importance",
                label: "Importance",
                type: "number"
            }, {
                id: "sales",
                label: "Sales",
                type: "number"
            }], 
            "rows" : [{
                c: [{
                    v: 2011
                }, {
                    v: 0
                }, {
                    v: 3100
                }]
            }, {
                c: [{
                    v: 2012
                }, {
                    v: 200
                }, {
                    v: 3000
                }]
            }, {
                c: [{
                    v: 2013
                }, {
                    v: 400
                }, {
                    v: 2800
                }]
            }, {
                c: [{
                    v: 2014
                }, {
                    v: 800
                }, {
                    v: 2400
                }]
            }, {    
                c: [{
                    v: 2015
                }, {
                    v: 1600
                }, {
                    v: 1600
                }]
            }, {     
                c: [{
                    v: 2016
                }, {
                    v: 3200
                }, {
                    v: 0
                }]
            }]
        };
        graph.options = {
            "title": "Sales Of Important Stuff",
            "colors": ['#FF0000', '#0000FF'],
            "defaultColors": ['#FF0000', '#0000FF'],
            "isStacked": "true",
            "fill": 20,
            "displayExactValues": true,
            "vAxis": {
                "title": "Values",
                "gridlines": {
                    "count": 4
                }
            },
            "hAxis": {
                "title": "Year"
            }
        };
        graph.view = {
            colums: [0,1,2]
        };
        
        $scope.graphs.push(graph);  
    };

	componentHandler.upgradeDom();
});	
