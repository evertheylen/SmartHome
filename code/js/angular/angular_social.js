angular.module("overwatch").controller("socialController", function($scope, $rootScope, Auth, $state, transferGroup, transferProfile) {
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
        for: {
            what: "User",
            UID: $scope.auth_user.UID
        }
    }, function(response) {
        $scope.groups = response.objects;
        $scope.$apply();
    });
    
    $scope.$on("joined group", function (){
        ws.request({
            type: "get_all",
            what: "Group",
            for: {
                what: "User",
                UID: $scope.auth_user.UID
            }
        }, function(response) {
            $scope.groups = response.objects;
            $scope.$apply();
        });   
    });
    
    $scope.open_dialog = function(element_id) {
        var element = document.getElementById(element_id);
        element.showModal();
        $rootScope.$emit(element_id + "_open");
        componentHandler.upgradeDom();
    }
    $scope.setGroup = function(group){
        transferGroup.setGroup(group);
        $rootScope.$broadcast('GROUP CHANGED');
    };
    componentHandler.upgradeDom();
});

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

angular.module("overwatch").controller("statusIndexController", function ($scope, $rootScope, Auth) {
    $rootScope.auth_user = Auth.getUser();
    $scope.statuses = [];
    ws.request({type: "get_all", what: "Status", for: {what: "Wall", WID: $rootScope.auth_user.wall_WID}}, function(response) {
        $scope.statuses = response.objects;  
        ws.request({
            type: "get_all",
            what: "Friendship",
            for: {
              what: "User",
              UID: $rootScope.auth_user.UID
            }
        }, function(response) {
            var friendships = response.objects;
            console.log(response.objects);
            for(var i = 0; i < friendships.length; i++) {
                var friend_UID = -1;
                friend_UID = friendships[i].user1_UID;
                if(friendships[i].user1_UID === $rootScope.auth_user.UID)
                    friend_UID = friendships[i].user2_UID;
                ws.request({
                    type: "get",
                    what: "User",
                    data: {
                        UID: friend_UID
                    }
                }, function(response) {
                    ws.request({
                        type: "get_all",
                        what: "Status",
                        for: {
                          what: "Wall",
                          WID: response.object.wall_WID
                        }
                    }, function(response) {
                        for (var statusIndex = 0; statusIndex < response.objects.length; statusIndex++)
                            $scope.statuses.push(response.objects[statusIndex]);
                        $scope.$apply();
                    });
                });
            }
        });
    });

    $scope.post_status = function () {
        if ($scope.status_text != "") {
            var _date = Date.now() / 1000;
            ws.request({
                type: "add",
                what: "Status",
                data: {
                    author_UID: Auth.getUser().UID,
                    date: _date,
                    date_edited: _date,
                    wall_WID: Auth.getUser().wall_WID,
                    text: $scope.status_text,
                    graph: null
                }
            }, function (response) {
                $scope.statuses.push(response.object);
                $scope.$apply();   
            });
        }
    };
    componentHandler.upgradeDom();
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

angular.module("overwatch").controller("profileController", function($scope, $rootScope, Auth, transferProfile) {
    $rootScope.auth_user = Auth.getUser();
    $scope.user = null;
    ws.request({
        type: "get",
        what: "User",
        data: {
            UID: transferProfile.getProfile()
        }
    }, function (response) {
        $scope.user = response.object;
        $scope.$apply();
    });
    
    $scope.$on('profile changed', function() {
        ws.request({
            type: "get",
            what: "User",
            data: {
                UID: transferProfile.getProfile()
            }
        }, function (response) {
            $scope.user = response.object;
            $scope.$apply();
        });
    });
    componentHandler.upgradeDom();
});

angular.module("overwatch").controller("friendsController", function($scope, $rootScope, Auth, transferProfile) {
    $scope.setProfile = function (id) {
        transferProfile.setProfile(id);
    } 
    
    $rootScope.auth_user = Auth.getUser();
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
            var friend_UID = -1;
            friend_UID = friendships[i].user1_UID;
            if(friendships[i].user1_UID === $rootScope.auth_user.UID)
                friend_UID = friendships[i].user2_UID;
            ws.request({
                type: "get",
                what: "User",
                data: {
                  UID: friend_UID
                }
            }, function(response) {
              $scope.friends.push(response.object);
              $scope.$apply();
            });
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
    componentHandler.upgradeDom();
});

angular.module("overwatch").controller("find_friendsController", function($scope, $rootScope, Auth) {
    $rootScope.auth_user = Auth.getUser();
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
            $scope.users.splice(index, 1);
            $scope.$apply();
        });
    }
    componentHandler.upgradeDom();
});

angular.module("overwatch").controller("shareController", function($scope, $rootScope, Auth, $timeout, graphShare) {
    $rootScope.auth_user = Auth.getUser();
    $scope.groups = []

    $scope.$on("dialog share", function () {
        console.log("Doing group request in shareController of angular_social");
        ws.request({
            type: "get_all",
            what: "Group",
            for: {
                what: "User",
                UID: $scope.auth_user.UID
            }
        }, function(response) {
            $scope.groups = response.objects;
            $scope.$apply();
        });
    });

//    console.log("Doing group request in shareController of angular_social");
  /*  ws.request({
        type: "get_all",
        what: "Group",
        for: {
            what: "User",
            UID: $scope.auth_user.UID
        }
    }, function(response) {
        $scope.groups = response.objects;
        $scope.$apply();
    });
    
    $scope.$on('joined group', function() {
        ws.request({
            type: "get_all",
            what: "Group",
            for: {
                what: "User",
                UID: $scope.auth_user.UID
            }
        }, function(response) {
            $scope.groups = response.objects;
                $timeout(function() {
		    if (hasClass(document.getElementById("select_share"), "mdl-js-menu")) {
			removeClass(document.getElementById("select_share"), "mdl-js-menu");
		    }
		    addClass(document.getElementById("select_share"), "mdl-js-menu");
		}, 0);
            $scope.$apply();
        });   
    });*/
    
    $scope.share_type = null;
    
    $timeout(function() {
		    if (hasClass(document.getElementById("select_share"), "mdl-js-menu")) {
			removeClass(document.getElementById("select_share"), "mdl-js-menu");
		    }
		    addClass(document.getElementById("select_share"), "mdl-js-menu");
		}, 0);
		
	$scope.click_select = function() {
    	removeClass(document.getElementById('select_share').parentNode, 'is-visible');
	    $timeout(function() {
		    if (hasClass(document.getElementById("select_share"), "mdl-js-menu")) {
			removeClass(document.getElementById("select_share"), "mdl-js-menu");
		    }
		    addClass(document.getElementById("select_share"), "mdl-js-menu");
		}, 0);
	}
		
  	$scope.dropDownClick = function (value, menu, button, ng_model) {
  	        /*ws.request({
            type: "get_all",
            what: "Group",
            for: {
                what: "User",
                UID: $scope.auth_user.UID
            }
        }, function(response) {
            $scope.groups = response.objects;
                $timeout(function() {
		    if (hasClass(document.getElementById("select_share"), "mdl-js-menu")) {
			removeClass(document.getElementById("select_share"), "mdl-js-menu");
		    }
		    addClass(document.getElementById("select_share"), "mdl-js-menu");
		}, 0);
            $scope.$apply();
        });  */
		var toChange = document.getElementById(button);
		toChange.innerHTML = value;
		switch (ng_model) {
			case 'share':
			    	if (value === null) {
					    toChange.innerHTML = $scope.i18n("pick_share");
					    break;
			    	} else {
			    	    toChange.innerHTML = value.title;
			    	}
				    $scope.share_type = value;
				    break;
		    case 'wall':
		            if(value === null){
		                toChange.innerHTML = $scope.i18n("pick_share");
		                break;
		            } else {
		                toChange.innerHTML = value;
		            }
		            $scope.share_type = $rootScope.auth_user;
		}
		removeClass(document.getElementById(menu).parentNode, "is-visible");
	}
  
    $scope.back = function () {
        document.getElementById('dlgShare').close();
    };
    
    $scope.continue = function () {
        // TODO!!
        if ($scope.share_type != null) {
            document.getElementById("dlgShare").close();
        }

        // If you are sharing a graph.
        if(graphShare.getGraph() !== "") {
            ws.request({
                type: "add",
                what: "Graph",
                data: {
                    GID: graphShare.getGraph()
                }
                }, function(response) {
                var _date = Date.now() / 1000;
                var status = new Status(-1, _date, _date, $rootScope.auth_user.UID, $scope.share_type.wall_WID, "Look at my Graph!", response.GID);
                delete status.SID;
                 ws.request({
                    type: "add",
                    what: "Status",
                    data: status.toJSON()
                }, function(response) {
                    $scope.$apply();
                });                 
                $scope.$apply();
            });                   
            // Reset the graph cookie.    
	        graphShare.setGraph("");
        }
    }
    
    $scope.dropDownClick(null, 'select_share', 'dropDownShare','share');
    componentHandler.upgradeDom();
});

angular.module("overwatch").controller("join_groupController", function($scope, $rootScope, $timeout, Auth) {
    $rootScope.auth_user = Auth.getUser();
    $scope.groups = []
    $scope.join_group = null;
    
    $scope.$on("joined group", function() {
      ws.request({
            type: "get_all",
            what: "Group",
        }, function(response) {
            $scope.groups = response.objects;
            ws.request({
                type: "get_all",
                what: "Group",
                for: {
                    what: "User",
                    UID: $scope.auth_user.UID
                }
            }, function(response) {
                for (i = 0; i< response.objects.length; i++) {
                    $scope.groups.splice($scope.groups.indexOf(response.objects[i]), 1);
                };
                $scope.$apply();
            });
            dropDownClick(null, 'select_group', 'dropDownGroup', 'group');
            $scope.$apply();
        });
    });
    
    ws.request({
        type: "get_all",
        what: "Group",
    }, function(response) {
        $scope.groups = response.objects;
        ws.request({
            type: "get_all",
            what: "Group",
            for: {
                what: "User",
                UID: $scope.auth_user.UID
            }
        }, function(response) {
            for (i = 0; i< response.objects.length; i++) {
                $scope.groups.splice($scope.groups.indexOf(response.objects[i]), 1);
            };
            $scope.$apply();
        });
        $scope.$apply();
    });
    
    $timeout(function() {
	    if (hasClass(document.getElementById("select_group"), "mdl-js-menu")) {
			removeClass(document.getElementById("select_group"), "mdl-js-menu");
	    }
	    addClass(document.getElementById("select_group"), "mdl-js-menu");
	}, 0);
	
    $scope.dropDownClick = function(value, menu, button, ng_model) {
        var toChange = document.getElementById(button);
        toChange.innerHTML = value;
        switch (ng_model) {
            case 'group':
                if (value === null) {
                    toChange.innerHTML = $scope.i18n("pick_group");
                    break;
                } else {
                    toChange.innerHTML = value.title;
                }
                $scope.join_group = value;
                break;
        }
        removeClass(document.getElementById(menu).parentNode, "is-visible");
    }
    
    $scope.joinGroup = function() {
        if ($scope.join_group != null) {
            ws.request({
                type: "add",
                what : "Membership",
                data : {
                    status: 'MEMBER',
                    last_change: Math.round(Date.now() / 1000),
                    user_UID : Auth.getUser().UID,
                    group_GID : $scope.join_group.GID            
                }
            }, function (response){
                document.getElementById('dlgJoinGroup').close();
                $rootScope.$broadcast("joined group");
                $scope.$apply();
            })
            console.log("Joining group " + $scope.join_group.title);
                
        }
    }
    
    $scope.back = function () {
        document.getElementById("dlgJoinGroup").close();
    }
    componentHandler.upgradeDom();
});

angular.module("overwatch").controller("create_groupController", function($scope, $rootScope, Auth) {
    $rootScope.auth_user = Auth.getUser();
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
    componentHandler.upgradeDom();
});

angular.module("overwatch").controller("groupController", function($scope, $rootScope, Auth, transferGroup, $location) {
    $rootScope.auth_user = Auth.getUser();
    $scope.group = transferGroup.getGroup();
    
    $scope.leave = function() {
        ws.request({
            "type": "delete",
            "what":"Membership",
            "data":{"user_UID": $rootScope.auth_user.UID,
            "group_GID": $scope.group.GID
            }
        }, function (response) {
            $rootScope.$broadcast("joined group");
            $location.path('/social/index');
        });
    };
    $scope.members = [];
    
    ws.request({
        type: "get_all",
        what: "Membership",
        for: {
            what: "Group",
            GID: $scope.group.GID
        }
    }, function (response) {
        for (var i = 0; i < response.objects.length; i++) {
            ws.request({
                type: "get",
                what: "User",
                data: {
                    UID: response.objects[i].user_UID
                }            
            }, function (response) {
                if (response.object.UID != $rootScope.auth_user.UID) {
                    $scope.members.push(response.object);
                    $scope.$apply();
                }
            });
        }
        $scope.$apply();
    });
    
    $scope.$on('GROUP CHANGED', function () {
        $scope.group = transferGroup.getGroup();
        $scope.statuses = [];
        ws.request({type: "get_all", what: "Status", for: {what: "Wall", WID: $scope.group.wall_WID}}, function(response) {
            $scope.statuses = response.objects;  
            $scope.$apply();
        });

    });
    $scope.statuses = [];
    
    ws.request({type: "get_all", what: "Status", for: {what: "Wall", WID: $scope.group.wall_WID}}, function(response) {
        $scope.statuses = response.objects;  
        $scope.$apply();
    });

    
    $scope.post_status = function () {
        if ($scope.status_text != "") {
            var _date = Date.now() / 1000;
            ws.request({
                type: "add",
                what: "Status",
                data: {
                    author_UID: Auth.getUser().UID,
                    date: _date,
                    date_edited: _date,
                    wall_WID: $scope.group.wall_WID,
                    text: $scope.status_text,
                    graph: null
                }
            }, function (response) {
                $scope.statuses.push(response.object);
                $scope.$apply();   
            });
        }
    };
    componentHandler.upgradeDom();
});

angular.module("overwatch").controller("commentController", function ($scope, $rootScope, Auth) {
    $rootScope.auth_user = Auth.getUser();
    $scope.author = null;
    ws.request({
        type: "get",
        what: "User",
        data: {
            UID: $scope.comment.author_UID
        }
    }, function(response) {
        $scope.comment.author = response.object;
        $scope.$apply();
    });
    
    $scope.fancy_date = function () {   
        console.log("formatting " + $scope.comment.date_edited*1000);
        return date_format($scope.comment.date_edited*1000);
    };
    
    componentHandler.upgradeDom();
});

angular.module("overwatch").controller("statusController", function($scope, $rootScope, Auth) {   
    $rootScope.auth_user = Auth.getUser();
    $scope.comments = [];
    $scope.author = null;
    if ($rootScope.auth_user != $scope.status.author_UID) {
        ws.request({
            type: "get",
            what: "User",
            data: {
                UID: $scope.status.author_UID
            }
        }, function(response) {
            $scope.author = response.object;
            $scope.$apply();
        });
    }
    
    ws.request({
        type: "get_all",
        what: "Comment",
        for: {
            what: "Status",
            SID: $scope.status.SID
        }
    }, function(response) {
        $scope.comments = response.objects;
    });

    console.log("Status GID: ");
    console.log("sGID2: " + $scope.status.graph);
    if ($scope.status.graph != null) {
        ws.request({
            type: "get",
            what: "Graph",
            data: {
                GID: $scope.status.graph
            }
        }, function(response) {
            $scope.graph = {};
            $scope.graph.type = "Line";
            $scope.graph.labels = [];
            $scope.graph.series = [];
            $scope.graph.data = [];

            var db_graph = response.object;

            // Convert db_graph to a normal graph.
            var valueType = db_graph.timespan.valueType;
            var start_date = new Date(db_graph.timespan.start);
            var end_date = new Date(db_graph.timespan.end);
            var total_days = (end_date.getTime() - start_date.getTime()) / (1000*60*60*24);

            switch (valueType) {
                case 'HourValue':
                    var total_hours = (end_date - start_date) / (1000*60*60);
                    for (var i = 0; i < total_hours; i++) 
                        $scope.graph.labels.push("hour " + i);
                    break;
                case 'DayValue':
                    for (var i = 0; i < total_days; i++)
                        $scope.graph.labels.push("day " + i);
                    break;
                case 'MonthValue':
                    for (var i = 0; i < total_days; i += 30)
                        $scope.graph.labels.push("month " + i / 30);
                    break;
                case 'YearValue':
                    for (var i = 0; i < total_days; i += 365) 
                        $scope.graph.labels.push("year " + i / 365);
            }

            var lines = db_graph.lines;

            for (var groupIndex = 0; groupIndex < lines.length; groupIndex++) {
                var sensor_data = [];
                for (var valueIndex = 0; valueIndex < lines[groupIndex].values.length; valueIndex++) 
                    sensor_data.push(lines[groupIndex].values[valueIndex][1]);
                // Series will be a ton of work.
                $scope.graph.series.push("");
                $scope.graph.data.push(sensor_data);
            }

            $scope.$apply();
        });
    }
    
    $scope.delete_status = function () {
        ws.request({
            type: "delete",
            what: "Status",
            data: {
                SID: $scope.status.SID
            }
        }, function (response) {
            $scope.statuses.splice($scope.statuses.indexOf($scope.status), 1);
            $scope.$apply();
        });
    }

    $scope.delete = function(index) {
        ws.request({
            type: "delete",
            what: "Comment",
            data: {
                CID: index
            }
        }, function (response) {
            for (i = 0; i < $scope.comments.length; i++) {
                if ($scope.comments[i].CID === index) {
                    $scope.comments.splice(i, 1);
                    break;
                }
            }
            $scope.$apply();
        });
    }

    $scope.likes = 0;
    $scope.dislikes = 0;
    $scope.user_like = null;

    ws.request({type: "get_all", what: "Like", for: {what: "Status", SID: $scope.status.SID}}, function(response) {
        for(i = 0; i < response.objects.length; i++) {
            var like = response.objects[i];
            if(like.user_UID == $rootScope.auth_user.UID) {
                $scope.user_like = like; 
                if($scope.user_like.positive) {
                    removeClass(document.getElementById('likes_click-'+$scope.status.SID), 'notClicked');
                    addClass(document.getElementById('likes_click-'+$scope.status.SID), 'clicked');      
                }
                else {
                    removeClass(document.getElementById('dislikes_click-'+$scope.status.SID), 'notClicked');
                    addClass(document.getElementById('dislikes_click-'+$scope.status.SID), 'clicked');
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
                if (hasClass(document.getElementById('likes_click-'+$scope.status.SID), 'notClicked')) {
                    $scope.likes++;  
                    if (hasClass(document.getElementById('dislikes_click-'+$scope.status.SID), 'clicked')) {
                        $scope.user_like.positive = true;
                        $scope.dislikes--;
                    	ws.request({type: "edit", what: "Like", data: $scope.user_like.toJSON()}, function(response) {
		                    $scope.$apply();
                        });

                        removeClass(document.getElementById('dislikes_click-'+$scope.status.SID), 'clicked');
                        addClass(document.getElementById('dislikes_click-'+$scope.status.SID), 'notClicked');
                    }
                    else {
                        $scope.user_like = new Like(true, $scope.status.SID, $rootScope.auth_user.UID);
                    	ws.request({type: "add", what: "Like", data: $scope.user_like.toJSON()}, function(response) {
		                    $scope.$apply();
                        });
                    }              
                    removeClass(document.getElementById('likes_click-'+$scope.status.SID), 'notClicked');
                    addClass(document.getElementById('likes_click-'+$scope.status.SID), 'clicked');
                }
                break;
            case 'dislikes':
                if (hasClass(document.getElementById('dislikes_click-'+$scope.status.SID), 'notClicked')) {
                    $scope.dislikes++;
                    if (hasClass(document.getElementById('likes_click-'+$scope.status.SID), 'clicked')) {
                        $scope.user_like.positive = false;
                        $scope.likes--;
                    	ws.request({type: "edit", what: "Like", data: $scope.user_like.toJSON()}, function(response) {
		                    $scope.$apply();
                        });                 
                        removeClass(document.getElementById('likes_click-'+$scope.status.SID), 'clicked');
                        addClass(document.getElementById('likes_click-'+$scope.status.SID), 'notClicked');
                    }
                    else {
                        $scope.user_like = new Like(false, $scope.status.SID, $rootScope.auth_user.UID);
                    	ws.request({type: "add", what: "Like", data: $scope.user_like.toJSON()}, function(response) {
		                    $scope.$apply();
                        });
                    }
                    removeClass(document.getElementById('dislikes_click-'+$scope.status.SID), 'notClicked');
                    addClass(document.getElementById('dislikes_click-'+$scope.status.SID), 'clicked');
                }
                break;
        }
    };

    $scope.push_comment = function() {
        if ($scope.new_comment != "") {
            //var comment = {};
            //comment.name = Auth.getUser().first_name + " " + Auth.getUser().last_name;
            //comment.text = $scope.new_comment;
            //comment.date = getCurrentDate();
            var _date = Date.now()/1000;
            ws.request({
                type: "add",
                what: "Comment",
                data: {
                    author_UID: Auth.getUser().UID,
                    date: _date,
                    date_edited: _date,
                    status_SID: $scope.status.SID,
                    text: $scope.new_comment                
                }
            }, function (response) {
                var comment = response.object;
                $scope.comments.push(comment);
                removeClass(document.getElementById('comment_parent-'+$scope.status.SID), 'is-focused');
                removeClass(document.getElementById('comment_parent-'+$scope.status.SID), 'is-dirty');
                $scope.new_comment = "";
                componentHandler.upgradeDom();
                $scope.$apply();
            });
        }
    }
    
    $scope.fancy_date = function (date) {
        console.log("formatting " + date);
        return date_format(date);
    };
    componentHandler.upgradeDom();
});
