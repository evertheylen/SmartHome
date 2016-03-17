angular.module("overwatch").controller("homeController", function($scope, $rootScope) {
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
    for (var i = 0; i < 6; i ++ ) {
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
                id: "fucks",
                label: "Fucks",
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
            "title": "Amount of fucks given",
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
