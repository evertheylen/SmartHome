angular.module("overwatch").controller("mainController", function($scope, $rootScope, $location, Auth, $http, $state, transferProfile, $timeout) {
	$rootScope.$state = $state;
	$scope.i18n = function(input) {
		return html_strings[input][$scope.language];
	};
	$rootScope.tab = "";
	
	$scope.setProfile = function(who) {
	    if (who=="self"){
	        transferProfile.setProfile($rootScope.auth_user.UID);
	        $rootScope.$broadcast('profile changed');
	    }
	}
	
	$rootScope.page_title = "OverWatch"
	$rootScope.logged_in = Auth.isLoggedIn();
    $rootScope.auth_user = Auth.getUser();
	$scope.logout = function() {
		console.log("Logging Out");
		setCookie("session", "", 1);
		$rootScope.logged_in = Auth.isLoggedIn();
		$location.path("/");
		setCookie("user", "", 365);
	}
	
	$scope.get_hash = function (email) {
	if ($location.path() != "/") {
		return calcMD5(email.trim().toLowerCase());
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
	//$scope.shown = false;
	$scope.$watch(function() {
			return hasClass(document.getElementById('testsnackbar'),'mdl-snackbar--active');
		}, function(newValue, oldValue){
				if (newValue != oldValue) {
						if (hasClass(document.getElementById("testsnackbar"), "snackbarpos")) {
								removeClass(document.getElementById('testsnackbar'), "snackbarpos");
								componentHandler.upgradeDom();
            }
        }
		})
	
	$scope.show_snack = function() {
			console.log("Showing snackbar");
			//$scope.shown=true;
			addClass(document.getElementById("testsnackbar"), "snackbarpos");
			componentHandler.upgradeDom();
	    var notification = document.getElementById("testsnackbar");
			var data = {
				message: 'Message Sent',
				actionHandler: function(event) {},
				actionText: 'Undo',
				timeout: 5000
			};
			removeClass(document.getElementById("testsnackbar"), "mdl-js-snackbar");
			componentHandler.upgradeDom();
			addClass(document.getElementById("testsnackbar"), "mdl-js-snackbar");
			componentHandler.upgradeDom();
			notification.MaterialSnackbar.showSnackbar(data);
			componentHandler.upgradeDom();
	}
	$timeout(function(){$scope.show_snack();$scope.show_snack();}, 0);
	
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
	
	if (Auth.getLanguage() != 0 || Auth.getLanguage() != 1) {
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
        $scope.logout();
    }

    errors.push({name: "not_logged_in", func: not_logged_in});
		
		$rootScope.simple_css = false;
});

