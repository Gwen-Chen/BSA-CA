define('task_editor_dialog/task_editor_dialog',
    ['editable_label/editable_label', 'services', 'utils'], function() {
  return angular.module('TaskEditorDialogModule', ['EditableLabelModule',
      'ServicesModule', 'UtilsModule'])
    .directive('taskEditorDialog',
        function(rpc, utils) {
          return {
            scope: {},
            link: function(scope) {
              scope.reload = function() {
                rpc.get_tasks().then(function(response) {
                  scope.tasks = response.data;
                  scope.tasks[0] = {
                    name: '新建任务模板' 
                  };
                });
              };
              
              scope.update = function(task, departmentId) {
                if (departmentId) {
                  task.department_id = departmentId;
                }
                rpc.update_task(task).then(function() {
                  scope.reload();
                });
              };
              
              scope.remove = function(task) {
                rpc.remove_task(task.id).then(function() {
                  scope.reload();
                });
              };

              scope.reload();
            },
            templateUrl : 'js/task_editor_dialog/task_editor_dialog.html'
          };
        });
});
