define('navigate_bar/navigate_bar', [], function() {
  return angular.module('NavigateBarModule', [])
    .directive('navigateBar', function() {
      return {
        scope: {
          navigate: '&'
        },
        link: function(scope) {
          scope.go = function(direction) {
            scope.navigate({'direction': direction});
          };
        },
        templateUrl : 'js/navigate_bar/navigate_bar.html'
      };
    });
});
