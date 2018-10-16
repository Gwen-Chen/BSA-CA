define('user_picker/user_picker', ['services'], function() {
  return angular.module('UserPickerModule', ['ServicesModule'])
    .directive('userPicker', function(rpc) {
      var indexOf = function(map, obj) {
        for (var key in map) {
          if (obj == map[key]) return key;
        }
        
        return null;
      };
      
      return {
        scope: {
          userPicked: '&',
          userId: '=',
          userList: '='
        },
        link: function($scope) {
          $scope.showPicker = false;
          $scope.selectedUser = {};
          
          function initSelection() {
            if (!$scope.userList) return;
            $scope.userList[0] = '';
            $scope.selectedUser = {name: $scope.userList[$scope.userId]};
          }
          
          $scope.$watch("userList", initSelection);
          $scope.$watch("userId", initSelection);

          $scope.edit = function() {
            $scope.showPicker = true;
          };
          
          $scope.select = function() {
            $scope.userId = indexOf($scope.userList, $scope.selectedUser.name);
            if ($scope.userPicked) $scope.userPicked({userId: $scope.userId});
            $scope.showPicker = false;
          };
          
          $scope.keyPressed = function(event) {
            if (event.keyCode == 27) $scope.showPicker = false;
          };
        },
        templateUrl : 'js/user_picker/user_picker.html'
      };
    });
});
