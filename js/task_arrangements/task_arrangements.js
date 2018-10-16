define('task_arrangements/task_arrangements', ['services', 'utils',
    'zb_sync_button/zb_sync_button'
],
    function() {
  return angular.module('TaskArrangementsModule', ['ServicesModule',
      'UtilsModule','ZBSyncButtonModule'])
      .directive('taskArrangements', function(rpc, utils) {
      return {
        scope: {
          classId: '='
        },
        link: function(scope) {
          scope.half_terms = [];
          scope.termLabels = ['',''];
          scope.task_arrange = {};
          for (var term = 1; term < 9; term++) {
            var label = '第{0}学期{1}半学期';
            scope.termLabels.push(label.format(term, '上'));
            scope.termLabels.push(label.format(term, '下'));
            scope.half_terms.push(term * 2);
            scope.half_terms.push(term * 2 + 1);
          }

          scope.isNotEmpty = true;

          scope.$watch('classId', function() {
              scope.loadTasks();
          });
          scope.$on('reload-task-arrange', function() {
            scope.loadTasks();
          });
          
          function getClassInfo() {
            return rpc.get_classes(scope.classId).then(function(response) {
              return scope.classInfo = response.data[scope.classId];
            });
          }
          
          function getTaskArranges() {
            var classId = scope.classInfo.id;
              var depId = parseInt(scope.classInfo.department_id);
              if (depId != 3) {
                scope.tasks = [];
                scope.isNotEmpty = false;
                return utils.futureValue(false);
              }
              return utils.getTasks(rpc, depId, classId).then(function(tasks) {
                scope.isNotEmpty = !utils.isEmpty(tasks);
                return scope.tasks = tasks;
              });
          }

          scope.loadTasks = function() {
            if (!scope.classId) return;
            utils.requestOneByOne([getClassInfo, getTaskArranges]);
          };
              
          scope.updateTaskArrange = function(task) {
            rpc.update_task_arranges(scope.classInfo.id, task.id,
                task.starting_half_term,
                task.report_half_term).then(function(response) {
                  if (!parseInt(response.data.updated)) {
                    scope.loadTasks();
                  }
                });
          };
        },
        templateUrl: 'js/task_arrangements/task_arrangements.html?tag=201707031255'
      };
    });
});
