angular.module("overwatch").controller("socialController", function($scope, $rootScope, Auth) {
    $rootScope.auth_user = Auth.getUser();
    $rootScope.tab = "sociallink";
    $rootScope.page_title = "OverWatch - " + $scope.i18n($rootScope.tab);
    componentHandler.upgradeDom();
});

angular.module("overwatch").controller("statusController", function($scope, $rootScope) {
    $scope.comments = [];
    
    var comment = {};
    comment.name = 'Adolf Hitler';
    comment.text = 'Gutentag Poland, wir kommen für ihren arschen.';
    comment.date = '01/09/1939';
    
    $scope.comments.push(comment);
});