angular.module("overwatch").controller("socialController", function($scope, $rootScope, Auth, $state) {
    $rootScope.$state = $state;
    $rootScope.simple_css = false;
    $rootScope.auth_user = Auth.getUser();
    $rootScope.tab = "sociallink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    componentHandler.upgradeDom();

    $scope.groups = []

    ws.request({
        type: "get_all",
        what: "Group",
    }, function(response) {
        $scope.groups = response.objects;
        $scope.$apply();
    });
    
    $scope.open_dialog = function(element_id) {
        var element = document.getElementById(element_id);
        element.showModal();
        $rootScope.$emit(element_id + "_open");
        componentHandler.upgradeDom();
    }
});

angular.module("overwatch").controller("statusIndexController", function ($scope, $rootScope) {
    $scope.statuses = [];
    ws.request({type: "get_all", what: "Status", for: {what: "Wall", WID: $rootScope.auth_user.wall_WID}}, function(response) {
        statuses = response.object;  
        $scope.$apply();
    });

});

angular.module("overwatch").directive('myEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});

angular.module("overwatch").controller("profileController", function($scope, $rootScope) {
});

angular.module("overwatch").controller("friendsController", function($scope, $rootScope) {
    $scope.friends = [];
    ws.request({
        type: "get_all",
        what: "Friendship",
        for: {
          what: "User",
          UID: $rootScope.auth_user.UID
        }
    }, function(response) {
        var friendships = response.objects;
        for(var i = 0; i < friendships.length; i++) {
	        console.log("user1UID: " + friendships[i].user1_UID);
	        console.log("user2UID: " + friendships[i].user2_UID);
            console.log("i: " + i);
            if(friendships[i].user1_UID === $rootScope.auth_user.UID) {
                ws.request({
                    type: "get",
                    what: "User",
                    data: {
                      UID: friendships[i].user2_UID
                    }
                }, function(response) {
                  $scope.friends.push(response.object);
                  $scope.$apply();
                });
                continue;
            }
            ws.request({
                type: "get",
                what: "User",
                data: {
                  UID: friendships[i].user1_UID
                }
            }, function(response) {
              $scope.friends.push(response.object);
              $scope.$apply();
            });
           // $scope.friends.push(friendships[i].user1_UID);
        }
        $scope.$apply();
    });

    $scope.delete_friend = function(friend_UID) {    
        var _user1_UID = $rootScope.auth_user.UID;
        var _user2_UID = friend_UID;
        if (friend_UID < $rootScope.auth_user.UID) {
            _user1_UID = friend_UID;
            _user2_UID = $rootScope.auth_user.UID;
        }

        ws.request({
            type: "delete",
            what: "Friendship",
            data: {
                user1_UID: _user1_UID,
                user2_UID: _user2_UID
            }
        }, function(response) {
            if (_user1_UID === $rootScope.auth_user.UID) {
              for (i=0; i < $scope.friends.length; i++ ) {
                if ($scope.friends[i].UID === _user2_UID) {
                  $scope.friends.splice(i, 1);
                  break;
                }
              }
            } else {
              for (i=0; i < $scope.friends.length; i++ ) {
                if ($scope.friends[i].UID === _user1_UID) {
                  $scope.friends.splice(i, 1);
                  break;
                }
              }
            }
            //$scope.friends = $scope.friends.filter(function delFriend(el) {return (el.user_UID1 !== friend_UID && el.user_UID2 !== friend_UID);})
            cache.removeObject("Friendship", [_user1_UID, _user2_UID]);
            $scope.$apply();
        });
    }
});

angular.module("overwatch").controller("find_friendsController", function($scope, $rootScope) {
    $scope.users = [];
    ws.request({
        type: "get_all",
        what: "User",
        for: {
            what: "User",
            UID: $rootScope.auth_user.UID
        }
    }, function(response) {
        $scope.users = response.objects;
        for (i = 0; i < $scope.users.length; i++) {
            $scope.users[i].full_name = $scope.users[i].first_name + " " + $scope.users[i].last_name;
        }
        $scope.$apply();
    });
    ws.request({
        type: "get_all",
        what: "Friendship",
        for: {
          what: "User",
          UID: $rootScope.auth_user.UID
        }
    }, function(response) {
        var friendships = response.objects;
        for(var i = 0; i < friendships.length; i++) {
            if(friendships[i].user1_UID == $rootScope.auth_user.UID) {
                for (j=0;j < $scope.users.length; j++) {
                  if ($scope.users[j].UID === friendships[i].user2_UID) {
                      $scope.users.splice(j,1);
                  }
                }
                //$scope.friends.push(friendships[i].user2_UID);
                continue;
            }
            for (j=0;j < $scope.users.length; j++) {
              if ($scope.users[j].UID === friendships[i].user1_UID) {
                  $scope.users.splice(j,1);
              }
            }
        }
        $scope.$apply();
    });

    $scope.add_friend = function(index) {
        ws.request({
            type: "add",
            what: "Friendship",
            data: {
                user1_UID: $rootScope.auth_user.UID,
                user2_UID: $scope.users[index].UID
            }
        }, function(response) {
            // TODO
            $scope.$apply();
        });
    }
});

angular.module("overwatch").controller("shareController", function($scope, $rootScope, Auth, $timeout) {
    $scope.groups = []

    ws.request({
        type: "get_all",
        what: "Group",
    }, function(response) {
        $scope.groups = response.objects;
        $scope.$apply();
    });
    
    $timeout(function() {
		    if (hasClass(document.getElementById("select_share"), "mdl-js-menu")) {
			removeClass(document.getElementById("select_share"), "mdl-js-menu");
		    }
		    addClass(document.getElementById("select_share"), "mdl-js-menu");
		}, 0);
  	$scope.dropDownClick = function (value, menu, button, ng_model) {
		var toChange = document.getElementById(button);
		toChange.innerHTML = value;
		switch (ng_model) {
			case 'share':
			    	if (value === null) {
					    toChange.innerHTML = $scope.i18n("pick_share");
					    break;
			    	} else {
			    	    toChange.innerHTML = value;
			    	}
				    $scope.share_type = value;
				    break;
		}
		removeClass(document.getElementById(menu).parentNode, "is-visible");
	}
  
    $scope.back = function () {
        document.getElementById('dlgShare').close();
    };
    
    $scope.continue = function () {
        // TODO!!
        if ($scope.shareForm.$valid) {
            document.getElementById("dlgShare").close();
        }
    }
    
    $scope.dropDownClick(null, 'select_share', 'dropDownShare','share');
});

angular.module("overwatch").controller("create_groupController", function($scope, $rootScope) {
    $scope.group_public = true;
    $scope.create_group = function() {
        if ($scope.group_form.$valid) {
            var wall = new Wall(-1, false);
            delete wall.WID;
            var group = new Group(-1, $scope.group_name, "desc", $scope.group_public, 0);
            delete group.GID;
            ws.request({
                type: "add",
                what: "Wall",
                data: wall.toJSON()
            }, function(response) {
                wall = response.object;
                group.wall_WID = wall.WID;
                ws.request({
                    type: "add",
                    what: "Group",
                    data: group.toJSON()
                }, function(response) {
                    group = response.object;
                    $scope.groups.push(group);
                    $scope.$apply();
                });
                $scope.$apply();
            });

            document.getElementById('dlgGroup').close();
        }
    }
    $scope.back = function() {
        document.getElementById('dlgGroup').close();
    }
});

angular.module("overwatch").controller("statusController", function($scope, $rootScope, Auth) {   
    $scope.comments = [];

    $scope.delete = function(index) {
        $scope.comments.splice(index, 1);
    }

    $scope.likes = 0;
    $scope.dislikes = 0;
    var user_like = null;
    
    $scope.user_like = null;
    ws.request({type: "get_all", what: "Like", for: {what: "Status", SID: $scope.SID}}, function(response) {
        for(i = 0; i < response.objects.length; i++) {
            var like = response.objects[i];
            if(like.user_UID == $rootScope.auth_user.UID) {
                user_like = like; 
                if(user_like.positive) {
                    removeClass(document.getElementById('likes_click'), 'notClicked');
                    addClass(document.getElementById('likes_click'), 'clicked');      
                }
                else {
                    removeClass(document.getElementById('dislikes_click'), 'notClicked');
                    addClass(document.getElementById('dislikes_click'), 'clicked');
                }
            }
            if (like.positive) {
                $scope.likes++;
                continue;
            }
            $scope.dislikes++;
        }
        $scope.$apply();
    });

    $scope.add = function(what) {
        switch (what) {
            case 'likes':
                if (hasClass(document.getElementById('likes_click'), 'notClicked')) {
                    user_like.positive = true;
                    $scope.likes++;  
                    if (hasClass(document.getElementById('dislikes_click'), 'clicked')) {
                        $scope.dislikes--;
                    	ws.request({type: "edit", what: "Like", data: $scope.user_like.toJSON()}, function(response) {
		                    $scope.$apply();
                        });

                        removeClass(document.getElementById('dislikes_click'), 'clicked');
                        addClass(document.getElementById('dislikes_click'), 'notClicked');
                    }
                    else {
                        user_like = new Like(true, $scope.SID, $rootScope.auth_user.UID);
                    	ws.request({type: "add", what: "Like", data: $scope.user_like.toJSON()}, function(response) {
		                    $scope.$apply();
                        });
                    }              
                    removeClass(document.getElementById('likes_click'), 'notClicked');
                    addClass(document.getElementById('likes_click'), 'clicked');
                }
                break;
            case 'dislikes':
                if (hasClass(document.getElementById('dislikes_click'), 'notClicked')) {
                    user_like.positive = false;
                    $scope.dislikes++;
                    if (hasClass(document.getElementById('likes_click'), 'clicked')) {
                        $scope.likes--;
                    	ws.request({type: "edit", what: "Like", data: $scope.user_like.toJSON()}, function(response) {
		                    $scope.$apply();
                        });                 
                        removeClass(document.getElementById('likes_click'), 'clicked');
                        addClass(document.getElementById('likes_click'), 'notClicked');
                    }
                    else {
                        user_like = new Like(false, $scope.SID, $rootScope.auth_user.UID);
                    	ws.request({type: "add", what: "Like", data: $scope.user_like.toJSON()}, function(response) {
		                    $scope.$apply();
                        });
                    }
                    removeClass(document.getElementById('dislikes_click'), 'notClicked');
                    addClass(document.getElementById('dislikes_click'), 'clicked');
                }
                break;
        }
    };

    $scope.push_comment = function() {
        if ($scope.new_comment != "") {
            var comment = {};
            comment.name = Auth.getUser().first_name + " " + Auth.getUser().last_name;
            comment.text = $scope.new_comment;
            comment.date = getCurrentDate();
            $scope.comments.push(comment);
            removeClass(document.getElementById('comment_parent'), 'is-focused');
            removeClass(document.getElementById('comment_parent'), 'is-dirty');
            console.log("new comment :D");
            console.log(comment);
            $scope.new_comment = "";
            componentHandler.upgradeDom();

        }
    }

    var comment = {};
    comment.name = 'Adolf Hitler';
    comment.text = 'Gutentag Poland, wir kommen für ihren arschen.';
    comment.date = '01/09/1939';
    $scope.comments.push(comment);

    var comment = {};
    comment.name = 'Maciej Rataj';
    comment.text = 'Kurwa, Briton and Croissant, you come for help so Poland can into space right?';
    comment.date = '01/09/1939';
    $scope.comments.push(comment);

    var comment = {};
    comment.name = 'Winston Churchill';
    comment.text = "We sure as hell aren't going to surrender to those jerry wankers.";
    comment.date = '01/09/1939';
    $scope.comments.push(comment);

    var comment = {};
    comment.name = 'Charles De Gaulle';
    comment.text = "JE SURRENDER!";
    comment.date = '01/09/1939';
    $scope.comments.push(comment);

    var comment = {};
    comment.name = 'Maciej Rataj';
    comment.text = 'Kurwa, bratwurst and vodka are stronk. Quick question, trains can into space right?';
    comment.date = '08/10/1939';
    $scope.comments.push(comment);

    var comment = {};
    comment.name = 'Joseph Stalin';
    comment.text = 'Comrade Hitler, is you attacking me?';
    comment.date = '22/06/1941';
    $scope.comments.push(comment);

    var comment = {};
    comment.name = 'Adolf Hitler';
    comment.text = 'Nein nein, ich schwer es!';
    comment.date = '22/06/1941';
    $scope.comments.push(comment);

    var comment = {};
    comment.name = 'Theodore Roosevelt jr.';
    comment.text = "Looks like y'all need some democracy!";
    comment.date = '06/06/1944';
    $scope.comments.push(comment);

    var comment = {};
    comment.name = 'Adolf Hitler';
    comment.text = 'HACKERS!!! I FUCKING REPORT U!!! MY DAD WORKS FOR MICROSOFT HAHAHAHA!!!';
    comment.date = '30/04/1945';
    $scope.comments.push(comment);

    var comment = {};
    comment.name = 'Adolf Hitler';
    comment.text = '<disconnected from your channel>';
    comment.date = '30/04/1945';
    $scope.comments.push(comment);
});
