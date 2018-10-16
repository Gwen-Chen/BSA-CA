define('class_info/class_info', ['bit_editor/bit_editor',
    'class_editor/class_editor',
    'new_user_dialog/new_user_dialog', 
    'serial_number_dialog/serial_number_dialog',
    'users/users',
    'permission', 'services',
    'utils',
    'zb_sync_button/zb_sync_button'], function() {

  return angular.module('ClassInfoModule', ['BitEditorModule',
    'ClassEditorModule',
    'NewUserDialogModule',
    'SerialNumberDialogModule',
    'UsersModule',
    'PermissionModule', 'ServicesModule',
    'UtilsModule', 'ZBSyncButtonModule'])
        .directive('classInfo', function($rootScope, perm, rpc, 
            utils) {
      return {
        scope: {
          classId: '='
        },
        restrict: 'E',
        link: function($scope) {
          $scope.isNewClass = function() {
            return $scope.classId === 1;
          };
          $scope.reload = function(classId) {
            if (!classId) return; 
            rpc.get_users(null, classId).then(function(response) {
              if (!(response.data instanceof String)) {
                $scope.users = response.data;
              }
            });
          };
          $scope.$watch('classId', function(classId) {
            $scope.reload(classId);
          });
          $scope.showNewUserDialog = function() {
            document.getElementById('new-user-dlg').open();
          };
        },
        templateUrl : 'js/class_info/class_info.html'
      };
    });
});
