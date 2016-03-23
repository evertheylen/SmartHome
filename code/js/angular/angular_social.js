angular.module("overwatch").controller("socialController", function($scope, $rootScope, Auth) {
    $rootScope.auth_user = Auth.getUser();
    $rootScope.tab = "sociallink";
    $rootScope.page_title = "OverWatch - " + i18n($rootScope.tab);
    componentHandler.upgradeDom();
});
