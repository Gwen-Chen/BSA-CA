define('department_editor_dialog/department_editor_dialog',
    ['editable_label/editable_label', 'services', 'utils'], function() {
  return angular.module('DepartmentEditorDialogModule', ['EditableLabelModule',
      'ServicesModule', 'UtilsModule']).directive('departmentEditorDialog',
        function(rpc, utils) {
          return {
            scope: {},
            link: function(scope) {
              scope.reload = function() {
                rpc.get_departments().then(function(response) {
                  scope.departments = response.data;
                  scope.departments[0] = {
                    name: '新建类别' 
                  };
                });
              };
              
              scope.update = function(department) {
                rpc.update_department(department).then(function() {
                  scope.reload();
                });
              };
              
              scope.remove = function(department) {
                rpc.remove_department(department.id).then(function() {
                  scope.reload();
                });
              };

              scope.reload();
            },
            templateUrl :
              'js/department_editor_dialog/department_editor_dialog.html'
          };
        });
});
