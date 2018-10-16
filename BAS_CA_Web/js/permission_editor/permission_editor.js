define('permission_editor/permission_editor', 
  ['bit_editor/bit_editor', 'permission', 'utils'], function() {

  return angular.module('PermissionEditorModule',
      ['BitEditorModule', 'PermissionModule', 'UtilsModule'])
    .directive('permissionEditor', function(perm, utils) {
      return {
        scope: {
          editable: '@',
          user: '='
        },
        link: function(scope) {
          scope.roles = [
            {name: '--自定义--', permission: 1}
          ];
          scope.permissionLabel = perm.permissions;
          scope.permissions = utils.keys(perm.permissions);
          scope.selectedRole = {};

          function init(user) {
            if (!user) return;

            for (var index in scope.permissions) {
              var permission = scope.permissions[index];
              var role = {name: perm.permissions[permission], 
                  permission: permission};
              scope.roles.push(role);
              if (user.permission == role.permission) {
                scope.selectedRole.role = role;
              }
            }
            // [user] is not a pre-defined role.
            if (!scope.selectedRole.role) {
              var customizedRole = scope.roles[0];
              customizedRole.permission = user.permission;
              scope.selectedRole.role = customizedRole;
              scope.customizing = true;
            }
          }

          if (scope.user) {
            init(scope.user);
          } else {
            scope.$watch('user', init);
          }
          scope.roleChanged = function() {
            scope.customizing = scope.selectedRole.role == scope.roles[0];
            if (scope.customizing) {
              scope.user.permission = (scope.user.permission || perm.ROLES.STUDENT);
            } else {
              scope.user.permission = scope.selectedRole.role.permission;
            }
          };
          scope.canGrant = function(bit) {
            return (perm.user.permission & (1<<bit)) != 0;
          };
        },
        templateUrl : 'js/permission_editor/permission_editor.html?tag=201712190026'
      };
    });
});

