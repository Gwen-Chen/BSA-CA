define('class_editor/class_editor', ['departments/departments',
    'department_editor_dialog/department_editor_dialog', 
    'editable_label/editable_label',
    'time/time',
    'permission', 'services',
    'user_input/user_input',
    'user_picker/user_picker',
    'utils',
    'zb_services'], function() {

  return angular.module('ClassEditorModule',
      ['DepartmentEditorDialogModule',
       'DepartmentsModule', 'EditableLabelModule', 'TimeModule', 
       'ServicesModule',
       'UserInputModule',
       'UserPickerModule', 'UtilsModule',
       'ZBServicesModule']).directive('classEditor',
        function($rootScope, perm, rpc, utils, zbrpc) {
          return {
            scope: {
              classId: '='
            },
            link: function(scope) {
              scope.isSysAdmin = function() {
                return perm.isSysAdmin();
              };
              scope.dayLabels = ['星期日', '星期一', '星期二', '星期三', '星期四',
                  '星期五', '星期六'];
              scope.setupPermissionEditor = function(classInfo) {
                scope.permissionLabel = {};
                for (var permission in perm.permissions) {
                  var label = perm.permissions[permission];
                  scope.permissionLabel[perm.level(permission)] = label; 
                }
                
                scope.permissions = utils.keys(scope.permissionLabel);
              };
              
              scope.save = function() {
                rpc.update_class(scope.classInfo).then(function(response) {
                  if (response.data.updated) {
                    var id = scope.classInfo.id || response.data.updated;
                    $rootScope.$broadcast('class-updated', id);
                    scope.reload(id);
                  } else {
                    scope.error = response.data.error;
                  }
                });
              };
              
              scope.remove = function() {
                var id = scope.classInfo.id;
                rpc.remove_class(id).then(function(response) {
                  if (response.data.deleted) {
                    $rootScope.$broadcast('class-deleted', id);
                  }
                });
              };
              
              scope.$watch('classId', function(classId) {
                scope.reload(classId);
              });
              
              scope.years = [''];
              for (var index = 1; index < 25; index++) {
                scope.years[index] = 2010 + index;
              }
              
              scope.reload = function(classId) {
                if (classId == 0) {
                  scope.classInfo = utils.classTemplate();
                  scope.oldInfo = angular.copy(scope.classInfo);
                  scope.setupPermissionEditor(scope.classInfo);
                } else if (classId) {
                  rpc.get_classes(classId).then(function(response) {
                    scope.classInfo = response.data[classId];
                    if (!scope.classInfo) return;

                    scope.oldInfo = angular.copy(scope.classInfo);
                    scope.setupPermissionEditor(scope.classInfo);
                    scope.zbUrl = zbrpc.getClassUrl(scope.classInfo.zb_id);
                  });
                }
              };
              
              scope.cancel = function() {
                scope.reload(scope.classId);
              };
              
              scope.isDirty = function() {
                return !angular.equals(scope.classInfo, scope.oldInfo);
              };
              
              scope.openDepartmentEditor = function() {
                document.querySelector('#department-editor-dlg').open();
              };
              
              scope.needsAssignment = function() {
                return scope.classId == 1 || 
                    scope.classInfo && scope.classInfo.department_id == 1;
              };
            },
            templateUrl : 'js/class_editor/class_editor.html?tag=201806152243'
          };
        });
});
