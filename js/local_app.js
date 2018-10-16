define('local_app', [
    'app_bar/app_bar',
    'address_filter/address_filter',
    'checkbox_filter/checkbox_filter',
    'users/users',
    'services',
    'permission',
    'utils'],
    function() {

  angular.module('AppModule', [
      'AppBarModule',
      'AddressFilterModule',
      'CheckboxFilterModule',
      'UsersModule',
      'PermissionModule',
      'ServicesModule',
      'UtilsModule',
      ])
      .directive('body', function(rpc, perm, utils) {
        return {
          link: function($scope) {
            rpc.get_user().then(function(user) {
              perm.user = user;
              if (!perm.isSysAdmin()) {
                utils.redirect('./index.html');
                return;
              }

              $scope.user = user;
            });
            $scope.$on('users-selected', function(event, users) {
              $scope.allUsers = users;
              $scope.users = users;
              $scope.aggregateClassYears();
            });
            $scope.classYearChanged = function() {
              $scope.users = utils.where($scope.allUsers, function(user) {
                var classYear = $scope.classes[user.classId].start_year;
                return $scope.classYears[classYear].checked;
              });
            };

            /// Initializes the [classYears] list by aggregating over all
            /// [users].
            $scope.aggregateClassYears = function() {
              var classIds = {};
              utils.forEach($scope.users, function(user) {
                classIds[user.classId] = user.classId;
              });

              rpc.get_classes().then(function(response) {
                var classYears = {};
                utils.forEach(classIds, function(classId) {
                  $scope.classes = response.data;
                  var start_year = response.data[classId].start_year;
                  if (classYears[start_year]) return;
                  classYears[start_year] = {
                    label: start_year,
                    checked: true
                  };
                });
                $scope.classYears = classYears;
              });
            };
          }
        };
      }).config( ['$compileProvider', function( $compileProvider ) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob):/);
      }]);;

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});

require(['local_app']);
