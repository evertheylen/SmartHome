angular.module("overwatch", ['angular.css.injector', 'ui.bootstrap', 'ngRoute', 'ngTagsInput', 'ngMessages', 'ngCookies', 'googlechart', 'chart.js', 'ui.router']);

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
		.state('social.state_group', {
		    url : "/social/group",
		    templateUrl: "/html/partials/social_group_tmp.html"
		})
		.state('state_admin', {
			url : "/admin",
			templateUrl: "/html/partials/admin_tmp.html"
		})
		.state('state_help', {
			url : "/help",
			templateUrl: "/html/partials/help_tmp.html"
		})
		.state('state_report', {
			url : "/report",
			templateUrl: "/html/partials/report_tmp.html"
		});
		
	$locationProvider.html5Mode(true);
}]);

angular.module("overwatch").config(["ChartJsProvider", function(ChartJsProvider) {
	ChartJsProvider.setOptions({
        scaleShowLabels: false,
		colours: ['#FF5252', "#FF8A80"],
		responsive: true
	});

}]);

