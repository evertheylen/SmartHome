// TODO
//  Cookie for the internationalization


angular.module("overwatch", ['angular.css.injector', 'ui.bootstrap', 'ngRoute', 'ngTagsInput', 'ngMessages', 'ngCookies', 'googlechart', 'chart.js', 'ui.router'])
	.directive('onFinishRender', function ($timeout) {
	return {
		restrict: 'A',
		link: function (scope, element, attr) {
			if (scope.$last === true) {
				$timeout(function () {
					scope.$emit('ngRepeatFinished');
				});
			}
		}
	}
});

angular.module("overwatch").directive('onFinishRenderComments', function ($timeout) {
	return {
		restrict: 'A',
		link: function (scope, element, attr) {
			if (scope.$last === true) {
				$timeout(function () {
					scope.$emit('ngRepeatFinishedComments');
				});
			}
		}
	}
});

angular.module('overwatch').filter('startFrom', function() {
	return function(input, start) {
		if(input) {
			start = +start; //parse to int
			return input.slice(start);
		}
		return [];
	}
});

angular.module("overwatch").run(function($rootScope, $location, Auth, $state) {
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
		//console.log(Auth.getUser());
		console.log(Auth.isLoggedIn());
		if (!Auth.isLoggedIn() && $location.path() != '/') {
			event.preventDefault();
			console.log("Gandalf calmly states that you have no rights to access these pages...\n'YOU SHALL NOT PASS - Gandalf'");
			$location.path('/');
			$state.transitionTo('state_index');
		} else if (Auth.isLoggedIn() &&$location.path() == "/admin" && !Auth.getUser().admin) {
			event.preventDefault();
			console.log("Gandalf calmly states that you have no rights to access these pages...\n'YOU SHALL NOT PASS - Gandalf'");
			$location.path('/');
			$state.transitionTo('state_index');
			//$location.path('/');
			//$state.transitionTo(fromState.name);   */
		}else if ($location.path() != '/') {
			console.log("Pass :)");
		}  
	});  
});

angular.module('overwatch').run(['$state', '$stateParams',
	function($state, $stateParams) {
		//this solves page refresh and getting back to state
}]);

angular.module("overwatch").factory('Auth', function($rootScope, cssInjector) {
	return {
		setUser : function(user) {
			console.log("USER COOKIE: " + JSON.stringify(user.toJSON()));
			setCookie("user", JSON.stringify(user.toJSON()), 365);
		},
		
		getUser : function() {
			if (getCookie("user") != "") {
				var temp_user = JSON.parse(getCookie("user"));
				console.log(temp_user);
				var user =  new User(temp_user["UID"], temp_user["first_name"], temp_user["last_name"], temp_user["email"], temp_user["wall_WID"], temp_user["admin"]);
				if (user.admin) {
				cssInjector.add("/static/adminColors.css");
				} else {
				cssInjector.removeAll();
				}
				console.log(user);
				return user;
			} else {
				return null;            
			}
		},
	
		isLoggedIn : function() {
			return (getCookie("session") != "");
		},
		
		setLanguage : function(language) {
			console.log("Language COOKIE: " + language);
			setCookie("language", language);
		},
		
		getLanguage : function() {
			console.log("getting language: " + getCookie("language")); 
			return getCookie("language");
		}
	}
});

angular.module("overwatch").controller("mainController", function($scope, $rootScope, $location, Auth, $http) {
	$scope.i18n = function(input) {
		return html_strings[input][$scope.language];
	};
	$rootScope.tab = "";
	
	$rootScope.page_title = "OverWatch"
	$rootScope.logged_in = Auth.isLoggedIn();
	//$rootScope.auth_user = Auth.getUser();
	$scope.logout = function() {
		console.log("logging Out");
		setCookie("session", "", 1);
		$rootScope.logged_in = Auth.isLoggedIn();
		$location.path("/");
		setCookie("user", "", 365);
	}
	
	$scope.get_hash = function () {
	if ($location.path() != "/") {
		return calcMD5($rootScope.auth_user.email.trim().toLowerCase());
	}
	}
	
	$scope.$on("ngRepeatFinished", function(ngRepeatFinishedEvent) {
		componentHandler.upgradeDom();
	});

	$scope.$on("ngRepeatFinishedComments", function(ngRepeatFinishedEvent) {
		document.getElementById("comment_section").scrollTop = document.getElementById("comment_section").scrollHeight;
		console.log("height set for comments");
		componentHandler.upgradeDom();
	});
	
	$rootScope.share = function() {
	document.getElementById("dlgShare").showModal();
	}
	
	$rootScope.confirm_dialog = document.getElementById('dlgConfirm');
	$rootScope.confirm = function (value) {  
		$scope.$broadcast("confirmation", value);
		$rootScope.confirm_dialog.close();
	}

	$scope.open_dialog = function () {
		document.getElementById("dlgData").showModal();
	}

	$scope.close_dialog = function () {
		document.getElementById("dlgData").close();
	}
	
	// Stijn kijk hier
	$scope.error_sending = false;
	$scope.send_data = function () {
		$scope.error_sending = false;
		var form = document.getElementById("uploadData");
		var formData = new FormData(form);
		$http({
			url: "/upload",
			method: "POST",
			data: formData,
			headers: {'Content-Type': undefined}
		})
		.success(function(data, status, headers, config) {
			console.log("Success");
			document.getElementById("dlgData").close();
		}).error(function(data, status, headers, config) {
			$scope.error_sending = true;
			console.log("Failure");
			
		});
	}
	
	$scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
		console.log("Changing Location: " + $location.path());
	/* if ($location.path() === "/admin" && !Auth.getUser.admin) {
		console.log(oldUrl + " <- old new -> " + newUrl);
		$location.url(oldUrl);
	}*/
	});
	
	/*$scope.$on('$locationChangeSuccess', function() {
		console.log("New Location: " + $location.path());
	});*/
	
	$rootScope.auth_user = Auth.getUser();

	console.log("Auth user is : " + $rootScope.auth_user);
	
	$scope.hideDrawer = function () {
		console.log(document.getElementsByClassName('mdl-layout__drawer'));
		console.log(document.getElementsByClassName('mdl-layout__obfuscator'));
		removeClass(document.getElementsByClassName('mdl-layout__drawer')[0],'is-visible');
		removeClass(document.getElementsByClassName('mdl-layout__obfuscator')[0], 'is-visible');
	}
	
	if (Auth.getLanguage() === "") {
		Auth.setLanguage(0);
	}
	
	$scope.language = Auth.getLanguage();
	
	$scope.changeLang = function(new_language) {
		Auth.setLanguage(new_language);
		$scope.language = new_language;
		$rootScope.page_title = "OverWatch"
		if ($rootScope.tab != "") {
			$rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
		}
	componentHandler.upgradeDom();
	};
	
	$rootScope.types = ["electricity", "gas", "water"];
	
	$rootScope.update_me = function(scope) {
		scope.$apply();
	};

    // Error handling functions
    var not_logged_in = function not_logged_in_error() {
        console.log("logging out");
        $scope.logout();
    }

    errors.push(name: "not_logged_in", func: not_logged_in);
});

angular.module("overwatch").config(["$stateProvider", "$urlRouterProvider", "$locationProvider", function($stateProvider, $urlRouterProvider, $locationProvider) {
	$urlRouterProvider.otherwise("/");
	
	$stateProvider
		.state('state_index', {
			url: "/",
			templateUrl: "/html/partials/index_tmp.html"
		})
		.state('state_home', {
			url: "/home",
			templateUrl: "/html/partials/home_tmp.html"
		})
		.state('state_statistics', {
			url: "/statistics",
			templateUrl: "/html/partials/statistics_tmp.html"
		})        
		.state('state_sensors', {
			url: "/sensors",
			templateUrl: "/html/partials/sensors_tmp.html"
		})
		.state('social', {
			url: "",
			abstract: true,
			templateUrl: "/html/partials/social_tmp.html"
		})
		.state('social.index', {
			url : "/social/index",
			templateUrl: "/html/partials/social_status_tmp.html"
		})
		.state('social.profile', {
			url : "/social/profile",
			templateUrl: "/html/partials/social_profile_tmp.html"
		})
		.state('social.friends', {
			url : "/social/friends",
			templateUrl: "/html/partials/social_friends_tmp.html"
		})
		.state('social.find_friends', {
			url : "/social/find_friends",
			templateUrl: "/html/partials/social_find_friends_tmp.html"
		})
		.state('state_admin', {
			url : "/admin",
			templateUrl: "/html/partials/admin_tmp.html"
		})
		.state('state_help', {
			url : "/help",
			templateUrl: "/html/partials/help_tmp.html"
		});
		
	$locationProvider.html5Mode(true);
}]);

angular.module("overwatch").config(["ChartJsProvider", function(ChartJsProvider) {
	ChartJsProvider.setOptions({
		colours: ['#FF5252', "#FF8A80"],
		responsive: true
	});

}]);


