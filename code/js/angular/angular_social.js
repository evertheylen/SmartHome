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
    comment.text = '&lt;disconnected from your channel&gt;';
    comment.date = '30/04/1945';
    $scope.comments.push(comment);
});