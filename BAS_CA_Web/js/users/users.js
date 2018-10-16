define('users/users', ['bit_editor/bit_editor',
    'importers', 'permission', 'services',
    'user_editor/user_editor',
    'utils'], function() {

  return angular.module('UsersModule', ['BitEditorModule',
    'ImportersModule',
    'PermissionModule', 'ServicesModule',
    'UserEditorModule', 'UtilsModule'])
        .directive('users', function($rootScope, importers, perm, rpc, utils) {
      return {
        scope: {
          users: '=',
          classId: '=',
          onDelete: '&'
        },
        restrict: 'E',
        link: function($scope) {
          $scope.entrances = ['本站', '微信', 'zbfw'];
          $scope.isNewClass = function() {
            return $scope.classId === 1;
          };

          $scope.$watch('users', function(users) {
            $scope.isNotEmpty = !utils.isEmpty($scope.users);
            $scope.userNames = {};
            for (var id in $scope.users) {
              var user = $scope.users[id];
              $scope.userNames[user.id] = user.name;
              utils.setCountryLabels(user);
            }
            $scope.editingUser = $scope.editingUser &&
                utils.firstElement($scope.users, 'id', $scope.editingUser.id);
            if ($scope.exportedUrl) {
              window.URL.revokeObjectURL($scope.exportedUrl);
              $scope.exportedUrl = null;
            }
          });
          $scope.isSysAdmin = function() {
            return perm.isSysAdmin();
          };
          $scope.isAdmin = function(user) {
            return user.permission > perm.ROLES.STUDENT;
          };
          $scope.showInfo = function(user, index) {
            $scope.editingUser = user;
            $scope.selectedTop = index * 32;
          };
          $scope.$on('editing-user-changed', function(event, editingUser) {
            $scope.editingUser = editingUser;
          });
          $scope.remove = function(user) {
            var message = '请确认删除用户"{0}"({1}).'.format(user.name, 
                user.email);
            if (!confirm(message)) return;

            rpc.remove_user(user.id).then(function(response) {
              if (response.data.deleted) $scope.onDelete();
            });
          };
          $scope.selected = function(user) {
            return $scope.editingUser && $scope.editingUser.id === user.id;
          };
          $scope.updateEnroll = function(user) {
            rpc.update_user({id: user.id, enroll_tasks: user.enroll_tasks});
          };
          $scope.userCount = function() {
            return $scope.users && utils.keys($scope.users).length;
          };
          $scope.exportUsers = function() {
            importers.userImporter.exportUsers($scope.users,
                $scope.exportedUrl).then(function(url) {
                  $scope.exportedUrl = url;
                });
          };
          $scope.showSerialNumberDlg = function() {
            document.querySelector('#serial-number-dlg').open();
          };
        },
        templateUrl : 'js/users/users.html?tag=201705162307'
      };
    });
});
