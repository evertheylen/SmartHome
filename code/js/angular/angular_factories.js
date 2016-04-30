angular.module("overwatch").factory('transferGroup', function($rootScope) {
	return {
		setGroup : function(_group) {
		    console.log("Setting group to: " + JSON.stringify(_group.toJSON()));
		    setCookie("group",  JSON.stringify(_group.toJSON()), 365);
		},
		
		getGroup : function() {
		    console.log("Getting group: " + JSON.parse(getCookie('group')));
			return JSON.parse(getCookie('group'));            
		}
	}
});

angular.module("overwatch").factory('transferProfile', function($rootScope) {
    return {
        setProfile : function (profile) {
            console.log("Setting profile to: " + profile);
            setCookie("profile", profile, 365);
        },
        getProfile: function() {
            return getCookie('profile');
        }
    }
});

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

angular.module("overwatch").factory('graphShare', function($rootScope) {
	return {
		setGraph : function(graph) {
			setCookie("graph", graph, 365);
		},
		
		getGraph : function() {
            return getCookie("graph");
		}
	}
});

