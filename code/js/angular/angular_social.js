angular.module("overwatch").controller("socialController", function($scope, $rootScope, Auth) {
    $rootScope.auth_user = Auth.getUser();
    $rootScope.page_title = "OverWatch - " + $scope.i18n("sociallink");
    componentHandler.upgradeDom();
});
