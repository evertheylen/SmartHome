angular.module("overwatch").controller("sensorController", function($scope, $rootScope, $filter, $timeout, Auth, dlgLocation_setup, dlgSensor_setup, $q, $state) {
    $rootScope.$state = $state;
    $rootScope.simple_css = false;
    $rootScope.tab = "sensorslink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    $rootScope.auth_user = Auth.getUser();

    $scope.reset_loc = function reset_loc() {
        dlgLocation_setup.setLocation(null);
    }

    $scope.reset_sen = function reset_sen() {
        dlgSensor_setup.setSensor(null, null);
    }

    $scope.reset_sen();
    $scope.reset_loc();

    document.getElementById('btnLocationBack').addEventListener('click', function() {
        document.getElementById('dlgLocation').close();
    });

    document.getElementById('btnSensorBack').addEventListener('click', function() {
        document.getElementById('dlgSensor').close();
    });

    document.getElementById('btnNoLocationOk').addEventListener('click', function() {
        document.getElementById('dlgNoLocation').close();
    });

    /*var delete_id = null; // TODO Nasty global vars
    var delete_from = null;

    $scope.delete = function(id, from) {
        $rootScope.confirm_dialog.showModal();
        componentHandler.upgradeDom();
        //console.log($scope.sensors + " ID: " + id + " from " + from);
        delete_id = id;
        delete_from = from;
    };*/

    componentHandler.upgradeDom();
});

/* 
 * Every Location in the Location table has a controller
 * that handles all operation on this object.
*/ 
angular.module("overwatch").controller("location_objController", function($scope, $rootScope, dlgLocation_setup) {
    $scope.open_dialog = function() {
        var element = document.getElementById("dlgLocation");
        dlgLocation_setup.setLocation($scope.house);
        element.showModal();
        $rootScope.$emit("dlgLocation_open");
        componentHandler.upgradeDom();
    }
});

angular.module("overwatch").factory('dlgLocation_setup', function($rootScope) {
    var loc;
    return {
        setLocation: function(location) {
            loc = location;
        },

        getLocation: function() {
            return loc;
        }
    }
});

angular.module("overwatch").factory('dlgSensor_setup', function($rootScope) {
    var sen;
    var scope;
    return {
        setSensor: function(sensor, _scope) {
            sen = sensor;
            scope = _scope;
        },

        getSensor: function() {
            return sen;
        },

        getScope: function() {
            return scope;
        }
    }
});

angular.module("overwatch").controller("location_controller", function($scope, $rootScope, dlgLocation_setup) {
    $scope.houses = [];

    ws.request({
        type: "get_all",
        what: "Location",
        for: {
            what: "User",
            UID: $rootScope.auth_user.UID
        }
    }, function(response) {
        $scope.houses = response.objects;
        $scope.$apply();
    });
    var delete_id = null;
    var delete_from = null;
    $scope.delete_loc = function(id, from) {
        $rootScope.confirm_dialog.showModal();
        componentHandler.upgradeDom();
        //console.log($scope.sensors + " ID: " + id + " from " + from);
        delete_id = id;
        delete_from = from;
    };
    
    $scope.$on("confirmation", function(event, value) {
        if (value) {
            if (delete_from == $scope.houses) {
                ws.request({
                    type: "delete",
                    what: "Location",
                    data: {
                        LID: $scope.houses[delete_id].LID
                    }
                }, function(success) {
                    $scope.$apply();
                });
                cache.removeObject("Location", $scope.houses[delete_id].LID);
                if (delete_from.length === 1) {
                    delete_from.length = 0;
                    return;
                }
                delete_from.splice(delete_id, 1);
            }
        }
    });
    $scope.open_dialog = function(elem) {
        var element;
        var emit = true;
        /*if (elem === 'dlgSensor') {
            if ($scope.houses.length === 0) {
                element = document.getElementById("dlgNoLocation");
                emit = false;
            } else {
                element = document.getElementById("dlgSensor");
                dlgSensor_setup.setSensor($scope.sensor, $scope);
            }
        } else {*/
            element = document.getElementById("dlgLocation");
        //}
        element.showModal();
        if (emit) {
            $rootScope.$emit(elem + "_open");
        }
        componentHandler.upgradeDom();
    }    
})

angular.module("overwatch").controller("sensor_controller", function($scope, $rootScope, dlgSensor_setup, $timeout, $q) {
    var delete_id = null;
    var delete_from = null;
    $scope.delete_sen = function(id, from) {
        $rootScope.confirm_dialog.showModal();
        componentHandler.upgradeDom();
        //console.log($scope.sensors + " ID: " + id + " from " + from);
        delete_id = id;
        delete_from = from;
    };  
    $scope.houses = [];

    ws.request({
        type: "get_all",
        what: "Location",
        for: {
            what: "User",
            UID: $rootScope.auth_user.UID
        }
    }, function(response) {
        $scope.houses = response.objects;
        $scope.$apply();
    });
$scope.add_autocomplete = function(tag) {};

    $scope.check_autocomplete = function($query) {
            var deferred = $q.defer();
            deferred.resolve($filter('filter')($scope.tags, {
                text: $query
            }));
            return deferred.promise;
        }

    // Fill all the $scope arrays using the database.
    $scope.sensors = [];

    ws.request({
        type: "get_all",
        what: "Sensor",
        for: {
            what: "User",
            UID: $rootScope.auth_user.UID
        }
    }, function(response) {
        $scope.sensors = response.objects;
        updateFilteredSensors();
        $scope.$apply();
    });

    $scope.tags = [];

    ws.request({
        type: "get_all",
        what: "Tag"
    }, function(response) {
        $scope.tags = response.objects;
        /*
        var temp_tags = response.objects;
        for (var i = 0; i < temp_tags.length; i++) {
            var exists = false;
            for (j = 0; j < $scope.tags.length; j++) {
                if (temp_tags[i].text == $scope.tags[j].text) {
                    exists = true;
                    break;
                }
            }
            if (!exists)
                $scope.tags.push(temp_tags[i]);
        }
        */
        updateFilteredSensors();
        $scope.$apply();
    });

    // Set up the pages to display the sensors.
    $scope.required = true;
    $scope.selected_order = null;

    $scope.filteredSensors = [], $scope.currentPage = 1, $scope.numPerPage = 10, $scope.maxSize = 5;
    $scope.pages_css = "";

    $scope.$watch("currentPage + numPerPage", function() {
        var begin = (($scope.currentPage - 1) * $scope.numPerPage),
            end = begin + $scope.numPerPage;

        if ($scope.sensors.length - 1 < $scope.numPerPage * ($scope.maxSize - 1)) {
            var length = Math.floor(($scope.sensors.length - 1) / $scope.numPerPage) + 1;
            $scope.pages_css = "pagination--length" + length;
        } else {
            $scope.pages_css = 'pagination--full';
        }
        $scope.filteredSensors = $scope.sensors.slice(begin, end);
    });

    updateFilteredSensors = function() {
        var begin = (($scope.currentPage - 1) * $scope.numPerPage),
            end = begin + $scope.numPerPage;
        if ($scope.sensors.length - 1 < $scope.numPerPage * ($scope.maxSize - 1)) {

            var length = Math.floor(($scope.sensors.length - 1) / $scope.numPerPage) + 1;
            $scope.pages_css = "pagination--length" + length;
        } else {
            $scope.pages_css = 'pagination--full';
        }
        $scope.filteredSensors = $scope.sensors.slice(begin, end);
    };

    
    $scope.$watch('houses', function() {
        $timeout(function() {
            if (hasClass(document.getElementById("select_house"), "mdl-js-menu")) {
                removeClass(document.getElementById("select_house"), "mdl-js-menu");
            }
            addClass(document.getElementById("select_house"), "mdl-js-menu");
        }, 0);
    }, true);

    $scope.$watch('types', function() {
        $timeout(function() {
            if (hasClass(document.getElementById("select_type"), "mdl-js-menu")) {
                removeClass(document.getElementById("select_type"), "mdl-js-menu");
            }
            addClass(document.getElementById("select_type"), "mdl-js-menu");
        }, 0);
    }, true);
  
    // Set up front end side aggregation for the sensor table.

    $scope.set_order = function set_order(orderBy, elementId) {
        if (hasClass(document.getElementById("sort_sensor"), "up")) {
            removeClass(document.getElementById("sort_sensor"), "up");
        }
        if (hasClass(document.getElementById("sort_sensor"), "down")) {
            removeClass(document.getElementById("sort_sensor"), "down");
        }
        if (hasClass(document.getElementById("sort_house"), "up")) {
            removeClass(document.getElementById("sort_house"), "up");
        }
        if (hasClass(document.getElementById("sort_house"), "down")) {
            removeClass(document.getElementById("sort_house"), "down");
        }
        if (hasClass(document.getElementById("sort_type"), "up")) {
            removeClass(document.getElementById("sort_type"), "up");
        }
        if (hasClass(document.getElementById("sort_type"), "down")) {
            removeClass(document.getElementById("sort_type"), "down");
        }
        if (hasClass(document.getElementById("sort_tags"), "up")) {
            removeClass(document.getElementById("sort_tags"), "up");
        }
        if (hasClass(document.getElementById("sort_tags"), "down")) {
            removeClass(document.getElementById("sort_tags"), "down");
        }
        if (hasClass(document.getElementById("sort_price"), "up")) {
            removeClass(document.getElementById("sort_price"), "up");
        }
        if (hasClass(document.getElementById("sort_price"), "down")) {
            removeClass(document.getElementById("sort_price"), "down");
        }
        if ($scope.selected_order === orderBy) {
            $scope.selected_order = '-' + orderBy;
            addClass(document.getElementById(elementId), "up");
        } else {
            $scope.selected_order = orderBy;
            addClass(document.getElementById(elementId), "down");
        }
    }
    $scope.$on("confirmation", function(event, value) {
        if (value) {
            if (delete_from == $scope.sensors) {
                var delete_sensor_SID = $scope.sensors[delete_id].SID;
                ws.request({
                    type: "delete",
                    what: "Tag",
                    for: {
                        what: "Sensor",
                        SID: delete_sensor_SID
                    }
                }, function(success) {
                    ws.request({
                        type: "delete",
                        what: "Sensor",
                        data: {
                            SID: delete_sensor_SID
                        }
                    }, function(success) {
                        updateFilteredSensors();
                        $scope.$apply();
                    });
                    cache.removeObject("Sensor", delete_sensor_SID);
                    $scope.$apply();
                });
                /*if ($scope.sensors.length === 1) {
                    delete_from.length = 0;
                    return;
                }*/
                delete_from.splice(delete_id, 1);
            }
        }
    });
    $scope.open_dialog = function(elem) {
        var element;
        var emit = true;
        //if (elem === 'dlgSensor') {
            if ($scope.houses.length === 0) {
                element = document.getElementById("dlgNoLocation");
                emit = false;
            } else {
                element = document.getElementById("dlgSensor");
                dlgSensor_setup.setSensor($scope.sensor, $scope);
            }
        /*} else {
            element = document.getElementById("dlgLocation");
        }*/
        element.showModal();
        if (emit) {
            $rootScope.$emit(elem + "_open");
        }
        componentHandler.upgradeDom();
    }        
});

angular.module("overwatch").controller("sensor_objController", function($scope, $rootScope, dlgSensor_setup) {
    $scope.open_dialog = function() {
        var element;
        if ($scope.houses.length === 0) {
            element = document.getElementById("dlgNoLocation");
        } else {
            element = document.getElementById("dlgSensor");
            dlgSensor_setup.setSensor($scope.sensor, $scope);
        }
        element.showModal();
        if ($scope.houses.length > 0) {
            $rootScope.$emit("dlgSensor_open");
        }
        componentHandler.upgradeDom();
    }

    $scope.get_loc = function() {
        ws.request({
            type: "get",
            what: "Location",
            data: {
                LID: $scope.sensor.location_LID
            }
        }, function(response) {
            $scope.location_name = response.object.description;
            $scope.$apply();
        });
    }

    $scope.get_tags = function() {
        ws.request({
            type: "get_all",
            what: "Tag",
            for: {
                what: "Sensor",
                SID: $scope.sensor.SID
            }
        }, function(response) {
            $scope.sensor.tags = response.objects;
            $scope.$apply();
        });
    }

    $rootScope.$on("tag_update", function() {
        console.log("tag_update");
        $scope.get_tags();
    })

    $scope.get_loc();
    $scope.get_tags();
});

angular.module("overwatch").controller("sensor_dialogController", function($scope, $rootScope, dlgSensor_setup, $timeout) {
    $scope.sen_added_tags = [];
    $scope.sen_deleted_tags = [];
    var sen_original_tags = [];
    $scope.add_tag = function(tag) {
       if (edit) {
          console.log("checking for adding: " + tag.text);
          console.log("Originals: " + sen_original_tags);
          var add = true;
          for (i = 0; i < sen_original_tags.length; i++) {
              console.log("Original: " + sen_original_tags[i]);
              if (sen_original_tags[i] === tag.text) {
                add = false;
                console.log("match");
                break;
              }
          }
          if (add) {
              $scope.sen_added_tags.push(tag);
              console.log("added tag:" + tag);
          }
       }
    }
    
    $scope.delete_tag = function(tag) {
        if (edit) {
            if ($scope.sen_deleted_tags.indexOf(tag) === -1 && sen_original_tags.indexOf(tag.text) != -1) {
                $scope.sen_deleted_tags.push(tag);
                console.log("deleted tag:" + tag);
            }
            if ($scope.sen_added_tags.indexOf(tag) != -1) {
                $scope.sen_added_tags.splice($scope.sen_added_tags.indexOf(tag), 1);
            }
        }
    }
  
    $rootScope.$on("dlgSensor_open", function() {
        $scope.houses = [];

        ws.request({
            type: "get_all",
            what: "Location",
            for: {
                what: "User",
                UID: $rootScope.auth_user.UID
            }
        }, function(response) {
            $scope.houses = response.objects;
            $scope.$apply();
        });
        var sen = dlgSensor_setup.getSensor();
        
            if (sen != null) {
                console.log("In sensor_dialogController edit right now");
                edit = true;
                $scope.sen_name = sen.title;
                $scope.sen_type = sen.type;
                $scope.sen_tags = sen.tags;
                $scope.sen_added_tags = [];
                $scope.sen_deleted_tags = [];
                sen_original_tags = [];
                for (i = 0; i < $scope.sen_tags.length; i++) {
                    sen_original_tags.push($scope.sen_tags[i].text);
                    console.log("added to sen_originals");
                }
                //sen_original_tags = sen.tags;
                $scope.sen_house = sen.location_LID;
                $scope.sen_SID = sen.SID;
                $scope.sen_scope = dlgSensor_setup.getScope();
                $scope.sen_unit_price = sen.EUR_per_unit;
                $scope.dropDownClick(sen.type, 'select_type', 'dropDownType', 'type');
                $scope.dropDownClick(sen.location_LID, 'select_house', 'dropDownLocation', 'house');
    
                addClass(document.getElementById("txtfield_SensorName"), "is-dirty");
                // addClass(document.getElementById("txtfield_SensorTags"), "is-dirty");
                addClass(document.getElementById("txtfield_SensorUnitPrice"), "is-dirty");
                if (hasClass(document.getElementById("txtfield_SensorUnitPrice"), "is-invalid")) {
                    removeClass(document.getElementById("txtfield_SensorUnitPrice"), "is-invalid");
                }
                if (hasClass(document.getElementById("txtfield_SensorName"), "is-invalid")) {
                    removeClass(document.getElementById("txtfield_SensorName"), "is-invalid");
                }
                if (hasClass(document.getElementById("txtfield_SensorLocation"), "is-invalid")) {
                    removeClass(document.getElementById("txtfield_SensorLocation"), "is-invalid");
                }
                if (hasClass(document.getElementById("txtfield_SensorType"), "is-invalid")) {
                    removeClass(document.getElementById("txtfield_SensorType"), "is-invalid");
                }
                $scope.edit_sen = $scope.i18n("edit_sensor");
            } else {
                console.log("In sensor_dialogController NOT edit right now");
                edit = false;
                $scope.sen_SID = null;
                $scope.sen_name = null;
                $scope.sen_house = null;
                $scope.sen_type = null;
                $scope.sen_tags = [];
                $scope.sen_unit_price = null;
                $scope.dropDownClick(null, 'select_house', 'dropDownLocation', 'house');
                $scope.dropDownClick(null, 'select_type', 'dropDownType', 'type');
                $scope.edit_sen = $scope.i18n("add_sensor");
                if (hasClass(document.getElementById("txtfield_SensorName"), "is-dirty")) {
                    removeClass(document.getElementById("txtfield_SensorName"), "is-dirty");
                }
                if (hasClass(document.getElementById("txtfield_SensorUnitPrice"), "is-dirty")) {
                    removeClass(document.getElementById("txtfield_SensorUnitPrice"), "is-dirty");
                }
                // if (hasClass(document.getElementById("txtfield_SensorTags"), "is-dirty")) {
                // removeClass(document.getElementById("txtfield_SensorTags"), "is-dirty");
                //}
                if (!hasClass(document.getElementById("txtfield_SensorName"), "is-invalid")) {
                    addClass(document.getElementById("txtfield_SensorName"), "is-invalid");
                }
                if (!hasClass(document.getElementById("txtfield_SensorLocation"), "is-invalid")) {
                    addClass(document.getElementById("txtfield_SensorLocation"), "is-invalid");
                }
                if (!hasClass(document.getElementById("txtfield_SensorType"), "is-invalid")) {
                    addClass(document.getElementById("txtfield_SensorType"), "is-invalid");
                }
            }
        componentHandler.upgradeDom();
    });

    $scope.save_sen = function save_sen() {
        if ($scope.sensor_form.$valid) {
            if (edit) {
                // Delete removed Tags.
                for (var tagIndex = 0; tagIndex < $scope.sen_deleted_tags.length; tagIndex++) {
                    ws.request({
                        type: "delete",
                        what: "Tag",
                        data: { 
                            sensor_SID: $scope.sen_SID,
                            text: $scope.sen_deleted_tags[tagIndex].text
                        }
                    }, function(success) {
                        $scope.$apply();
                    });
                }

                // Add new Tags.
                for (var tagIndex = 0; tagIndex < $scope.sen_added_tags.length; tagIndex++) {
                    ws.request({
                        type: "add",
                        what: "Tag",
                        data: {sensor_SID: $scope.sen_SID, text: $scope.sen_added_tags[tagIndex].text},
                        for: {
                            what: "Sensor",
                            SID: $scope.sen_SID
                        }
                    }, function(response) {
                        for (j = 0; j < $scope.tags.length; j++) {
                            if (response.object.text === $scope.tags[j].text)
                                return;
                        }
                        $scope.tags.push(response.object);
                    });
                }

                // TODO Same as with edit location and updates. DONT FORGET TO UPDATE FILTEREDSENSORS AS WELL!
                // TODO Don't forget the unit price when the format updates :)

                // Edit Sensor
                var sensor = new Sensor($scope.sen_SID, $scope.sen_type, $scope.sen_name, $scope.sen_unit_price, $rootScope.auth_user.UID, $scope.sen_house);
                var sensorObject = sensor.toJSON();
                delete sensorObject.index;
                ws.request({
                    type: "edit",
                    what: "Sensor",
                    data: sensorObject
                }, function(response) {
                    for (var i = 0; i < $scope.sensors.length; i++) {
                        if ($scope.sensors[i].SID === response.SID) {
                            $scope.sensors[i] = response;
                            $scope.sen_scope.get_tags();
                            updateFilteredSensors();
                            $scope.$apply();
                        }
                    }
                });
            } else {
                // Add Sensor
                // TODO Don't forget the unit price when the format updates :)				
                var new_sensor = new Sensor(-1, $scope.sen_type, $scope.sen_name, $scope.sen_unit_price, $rootScope.auth_user.UID, $scope.sen_house);
                delete new_sensor.SID;
                var sensorObject = new_sensor.toJSON();
                ws.request({
                    type: "add",
                    what: "Sensor",
                    data: sensorObject
                }, function(response) {
                    new_sensor = response.object;
                    // Add Tags
                    for (var i = 0; i < $scope.sen_tags.length; i++) {
                        ws.request({
                            type: "add",
                            what: "Tag",
                            data: {sensor_SID: new_sensor.SID, text: $scope.sen_tags[i].text},
                            for: {
                                what: "Sensor",
                                SID: new_sensor.SID
                            }
                        }, function(response) {
                            for (j = 0; j < $scope.tags.length; j++) {
                                if (response.object.text === $scope.tags[j].text)
                                    return;
                            }
                            $scope.tags.push(response.object);
                        });
                    }
                    $scope.sensors.push(new_sensor);
                    updateFilteredSensors();
                    $scope.$apply();
                });
            }
            document.getElementById("dlgSensor").close();
        }
    }

    $scope.dropDownClick = function(value, menu, button, ng_model) {
        var toChange = document.getElementById(button);
        toChange.innerHTML = value;
        switch (ng_model) {
            case 'type':
                if (value === null) {
                    toChange.innerHTML = $scope.i18n("pick_type");
                    break;
                } else {
                    toChange.innerHTML = $scope.i18n(value);
                }
                $scope.sen_type = value;
                break;
            case 'house':
                if (value === null) {
                    toChange.innerHTML = $scope.i18n("pick_loc");
                    break;
                }
                ws.request({
                    type: "get",
                    what: "Location",
                    data: {
                        LID: value
                    }
                }, function(response) {
                    toChange.innerHTML = response.object.description;
                    $scope.sen_house = value;
                    $scope.$apply();
                });
                break;
        }
        removeClass(document.getElementById(menu).parentNode, "is-visible");
    }

});

angular.module("overwatch").controller("location_dialogController", function($scope, $rootScope, dlgLocation_setup) {
    $rootScope.$on("dlgLocation_open", function() {
        var loc = dlgLocation_setup.getLocation();
        if (loc != null) {
            edit = true;
            $scope.loc_country = loc.country;
            $scope.loc_city = loc.city;
            $scope.loc_postalcode = loc.postalcode;
            $scope.loc_street = loc.street;
            $scope.loc_number = loc.number;
            $scope.loc_elec_price = loc.elec_price;
            $scope.loc_description = loc.description;
            $scope.loc_LID = loc.LID;
            addClass(document.getElementById("txtfield_LocationCountry"), "is-dirty");
            addClass(document.getElementById("txtfield_LocationCity"), "is-dirty");
            addClass(document.getElementById("txtfield_LocationZip"), "is-dirty");
            addClass(document.getElementById("txtfield_LocationStreet"), "is-dirty");
            addClass(document.getElementById("txtfield_LocationNr"), "is-dirty");
            addClass(document.getElementById("txtfield_LocationDesc"), "is-dirty");
            if (hasClass(document.getElementById("txtfield_LocationCountry"), "is-invalid")) {
                removeClass(document.getElementById("txtfield_LocationCountry"), "is-invalid");
            }
            if (hasClass(document.getElementById("txtfield_LocationCity"), "is-invalid")) {
                removeClass(document.getElementById("txtfield_LocationCity"), "is-invalid");
            }
            if (hasClass(document.getElementById("txtfield_LocationZip"), "is-invalid")) {
                removeClass(document.getElementById("txtfield_LocationZip"), "is-invalid");
            }
            if (hasClass(document.getElementById("txtfield_LocationStreet"), "is-invalid")) {
                removeClass(document.getElementById("txtfield_LocationStreet"), "is-invalid");
            }
            if (hasClass(document.getElementById("txtfield_LocationNr"), "is-invalid")) {
                removeClass(document.getElementById("txtfield_LocationNr"), "is-invalid");
            }
            if (hasClass(document.getElementById("txtfield_LocationDesc"), "is-invalid")) {
                removeClass(document.getElementById("txtfield_LocationDesc"), "is-invalid");
            }
            $scope.edit_loc = $scope.i18n("edit_location");
        } else {
            edit = false;
            $scope.loc_country = null;
            $scope.loc_city = null;
            $scope.loc_postalcode = null;
            $scope.loc_street = null;
            $scope.loc_number = null;
            $scope.loc_elec_price = null;
            $scope.loc_description = null;
            $scope.loc_LID = null;
            if (hasClass(document.getElementById("txtfield_LocationCountry"), "is-dirty")) {
                removeClass(document.getElementById("txtfield_LocationCountry"), "is-dirty");
            }
            if (hasClass(document.getElementById("txtfield_LocationCity"), "is-dirty")) {
                removeClass(document.getElementById("txtfield_LocationCity"), "is-dirty");
            }
            if (hasClass(document.getElementById("txtfield_LocationZip"), "is-dirty")) {
                removeClass(document.getElementById("txtfield_LocationZip"), "is-dirty");
            }
            if (hasClass(document.getElementById("txtfield_LocationStreet"), "is-dirty")) {
                removeClass(document.getElementById("txtfield_LocationStreet"), "is-dirty");
            }
            if (hasClass(document.getElementById("txtfield_LocationNr"), "is-dirty")) {
                removeClass(document.getElementById("txtfield_LocationNr"), "is-dirty");
            }
            if (hasClass(document.getElementById("txtfield_LocationDesc"), "is-dirty")) {
                removeClass(document.getElementById("txtfield_LocationDesc"), "is-dirty");
            }
            if (!hasClass(document.getElementById("txtfield_LocationCountry"), "is-invalid")) {
                addClass(document.getElementById("txtfield_LocationCountry"), "is-invalid");
            }
            if (!hasClass(document.getElementById("txtfield_LocationCity"), "is-invalid")) {
                addClass(document.getElementById("txtfield_LocationCity"), "is-invalid");
            }
            if (!hasClass(document.getElementById("txtfield_LocationZip"), "is-invalid")) {
                addClass(document.getElementById("txtfield_LocationZip"), "is-invalid");
            }
            if (!hasClass(document.getElementById("txtfield_LocationStreet"), "is-invalid")) {
                addClass(document.getElementById("txtfield_LocationStreet"), "is-invalid");
            }
            if (!hasClass(document.getElementById("txtfield_LocationNr"), "is-invalid")) {
                addClass(document.getElementById("txtfield_LocationNr"), "is-invalid");
            }
            if (!hasClass(document.getElementById("txtfield_LocationDesc"), "is-invalid")) {
                addClass(document.getElementById("txtfield_LocationDesc"), "is-invalid");
            }
        }
        componentHandler.upgradeDom();
    });

    $scope.save_loc = function save_loc() {
        if ($scope.house_form.$valid) {
            if (edit) {
                // Edit house 
                /*
                TODO This doesnt get locally updated anymore because via the live system Jeroen will issue an update 
                     to the updated location! (So for the moment only updates on get_all == f5)
				    $scope.houses[edit_loc_id].description = $scope.loc_description;
				    $scope.houses[edit_loc_id].number = $scope.loc_number;
				*/

                var house = new Location($scope.loc_LID, $scope.loc_description, $scope.loc_number,
                    $scope.loc_street, $scope.loc_city, $scope.loc_postalcode,
                    $scope.loc_country, $rootScope.auth_user.UID);
                var houseObject = house.toJSON();
                ws.request({
                    type: "edit",
                    what: "Location",
                    data: houseObject
                }, function(response) {
                    //$scope.houses[edit_loc_id] = response.object; //TODO Will be done through jeroen's updates
                    for (var i = 0; i < $scope.houses.length; i++) {
                        if ($scope.houses[i].LID === response.LID) {
                            $scope.houses[i] = response;
                            $scope.$apply();
                        }
                    }
                });
            } else {
                // Add house
                var new_house = new Location(-1, $scope.loc_description, $scope.loc_number, $scope.loc_street, $scope.loc_city, $scope.loc_postalcode, $scope.loc_country,
                    $rootScope.auth_user.UID);
                delete new_house.LID;
                var houseObject = new_house.toJSON();
                ws.request({
                    type: "add",
                    what: "Location",
                    data: houseObject
                }, function(response) {
                    new_house = response.object;
                    console.log("Pre house added");
                    $scope.houses.push(new_house);
                    console.log("house added");
                    console.log("Response verwerkt");
                    $scope.$apply();
                });
            }
            document.getElementById("dlgLocation").close();
            console.log("Dialog closed");
        }
    }
});

