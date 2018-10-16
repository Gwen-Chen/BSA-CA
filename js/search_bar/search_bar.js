define('search_bar/search_bar', ['services'], function() {

  var extractEmail = function(value) {
    var match = /.+ <(.+)>/.exec(value);
    var email = match && match[1];
    if (!email) {
      match = /(.+) \(.+\)/.exec(value);
      return match && match[1];
    }
    
    return email;
  };

  return angular.module('SearchBarModule', ['ServicesModule'])
    .directive('searchBar',
        function($rootScope, rpc) {
          return {
            scope: {
              admining: '@',
            },
            link: function($scope) {
              $scope.inputChanged = function() {
                if (!$scope.value || $scope.lastInput == $scope.value ||
                    extractEmail($scope.value)) return;
                
                var lastInput = $scope.value;
                
                setTimeout(function() {
                  if (lastInput != $scope.value) return;
                  rpc.search($scope.value).then(function(response) {
                    if ($scope.value == lastInput) {
                      $scope.hints = response.data;
                      
                      $scope.lastInput = lastInput;
                    }
                  });
                }, 1000);
                
              };
              
              $scope.search = function() {
                var email = extractEmail($scope.value);
                if (email) {
                  rpc.get_user(email).then(function(user) {
                    $rootScope.$broadcast('editing-user-changed', user);
                  });
                }
              };
            },
            templateUrl : 'js/search_bar/search_bar.html'
          };
        });
});
