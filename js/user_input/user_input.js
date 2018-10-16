define('user_input/user_input', ['services'], function() {
  var users = {};
  
  return angular.module('UserInputModule', ['ServicesModule'])
	.directive('userTypeAhead', function(rpc) {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function(scope, element, attrs, ngModel) {
        var searchTimer;

        ngModel.$formatters.push(function(userId) {
          return users[userId];
        });
        ngModel.$parsers.push(function(userLabel) {
          if (!userLabel) {
            scope.$parent.userId = 0;
            return 0;
          }

          var userId = users[userLabel];
          if (userId) {
            scope.$parent.userId = userId;
            return userId;
          }

          if (searchTimer) {
            clearTimeout(searchTimer);
          }

          searchTimer = setTimeout(function() {
            searchTimer = null;            
            rpc.searchByName(userLabel).then(function(response) {
              if (!response.data) return;

              scope.hints = [];
              response.data.forEach(function(user) {
                var label = user.nickname ? 
                    '{0}({1})'.format(user.name, user.nickname) : user.name;
                users[user.id] = label;
                users[label] = user.id;
                scope.hints.push(user);
              });
            });
          }, 1000);
        });
      }
    };
  }).directive('userInput', function(rpc) {
  	return {
  	  scope: {
  	    userId: '='
  	  },
  	  link: function(scope) {
  	    scope.editor = {};
        scope.users = users;

  	    function init(userId) {
  	      if (!userId) return;

  	      if (users[userId]) return;

  	      rpc.getUserLabel(userId).then(function(response) {
  	        users[userId] = response.data.label;
  	      });
  	    }
  	    if (scope.userId) {
  	      init(scope.userId);
  	    }
  	    scope.$watch('userId', init);
  
  	    scope.keyPressed = function(event) {
  	      if (event.keyCode == 13 || event.keyCode == 27) {
  	        scope.editor.editing = false;
  	        event.preventDefault();
  	      }
  	    };
  	  },
  		templateUrl : 'js/user_input/user_input.html'
  	};
  });
});
