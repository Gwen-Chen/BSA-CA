define('task_history/task_history', ['utils',
    'services'], function() {
  return angular.module('TaskHistoryModule', ['UtilsModule',
      'ServicesModule']).directive('taskHistory',
      function(utils, rpc) {
    return {
      scope: {
        hideTaskList: '@',
        selectedTask: '=',
        user: '='
      },
      restrict: 'E',
      link: function(scope, element, attrs) {
        scope.$watch('user', function() {
          if (!scope.user) return;
          if (scope.user.classInfo) {
            var depId = scope.user.classInfo.department_id;
            rpc.get_tasks(depId).then(function(response) {
              scope.tasks = response.data;
              scope.selectedTask = utils.first(scope.tasks);
            });
          } else {
            scope.reloadTaskHistory();
          }
        });

        scope.$watch('selectedTask', function() {
          if (!scope.selectedTask) return;

          scope.reloadTaskHistory();
        });
        
        scope.reloadTaskHistory = function() {
          rpc.get_task_history(scope.user.id, scope.selectedTask.id)
              .then(function(response) {
            scope.task_history = response.data;
            var sum = 0;
            var totalDuration = 0;
            for (var index = 0; index < scope.task_history.length; index++) {
              var record = scope.task_history[index];
              record.count = parseInt(record.count);
              record.duration = parseInt(record.duration);
              record.sub_index = parseInt(record.sub_index);
              record.sum = (sum += record.count);
              record.totalDuration = (totalDuration += record.duration);
            }
            scope.buildHistogram();
          });
        };
        
        scope.remove = function(record) {
          var message = scope.selectedTask.duration ? ',用时:{2}]' : ']';
          message = ('您确认要删除这条记录吗？[时间:{0},数量:{1}' + message)
              .format(record.ts, record.count, record.duration);
          if (!confirm(message)) return;
          rpc.remove_task_record(record.id).then(function(response) {
            if (response.data.deleted) {
              scope.reloadTaskHistory();
            }
          });
        };
        
        scope.buildHistogram = function() {
          scope.histogram = [];
          if (!(scope.task_history instanceof Array) ||
              !scope.task_history.length) return;

          var sum = 0;
          var values = [], cutOff;
          if (scope.selectedTask.duration) {
            scope.task_history.forEach(function(record) {
              values[record.sub_index] = 
                  (values[record.sub_index] || 0) + record.duration;
              sum += record.duration;
            });
            cutOff = Math.round(1.5 * sum / values.length);
            for (var index = 0;index < values.length; index++) {
              var value = values[index] || 0;
              scope.histogram.push(['' + (index + 1), Math.min(cutOff, value)]);
            }
          } else {
            values = scope.task_history.map(function(record) {
              sum += record.count;
              return record.count;
            });
            values.sort();
            // Use median * 1.5 as cut off.
            cutOff = Math.round(1.5 * values[Math.round(values.length / 2)]);
            scope.histogram = scope.task_history.map(function(record) {
              return [record.ts, Math.min(cutOff, record.count)];
            });
          }
          
          scope.sum = sum;
          scope.chartOptions = '{"vAxis": {"minValue": 0, "maxValue": {0}}}'.
              format(cutOff);
        };
      },
      templateUrl : 'js/task_history/task_history.html'
    };
  });
});
