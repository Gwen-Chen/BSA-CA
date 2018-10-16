define('tasks/tasks', ['progress_bar/progress_bar', 'services', 'utils'],
    function() {
  return angular.module('TasksModule', ['ProgressBarModule', 'ServicesModule',
      'UtilsModule']).directive('tasks', function($rootScope, rpc, utils) {
      return {
        scope: {
          classInfo: '='
        },
        link: function($scope) {
          $scope.$watch('classInfo', $scope.loadTasks);

          $scope.loadTasks = function() {
            if (!$scope.classInfo || !$scope.half_term) return;

            var classId = $scope.classInfo.id;
            var depId = $scope.classInfo.department_id;
            utils.getTasks(rpc, depId, classId).then(function(tasks) {
              $scope.tasks = [];
              
              angular.forEach(tasks, function(task) {
                if ($scope.half_term < task.starting_half_term) return;

                task = angular.copy(task);
                rpc.get_last_task_record(task.id).then(function(response) {
                  var lastRecord = response.data;
                  task.lastRecord = lastRecord.ts ? lastRecord : {
                    sub_index: 0
                  };
                });
                
                task.lastRecord = null;
                task.record = {count: 0};
                
                var subTasks = task.sub_tasks;
                if (task.name.indexOf('/') > 0) {
                  task.subTaskNames = task.name.split('/');
                  subTasks = task.subTaskNames.length;
                }
                task.sub_indexes = Array.apply(null, {length: subTasks})
                    .map(Number.call, Number);
                
                $scope.tasks.push(task);
              });
              $scope.isNotEmpty = !utils.isEmpty($scope.tasks);
            });
          };
              
          $scope.reportTask = function(task) {
            var data = {
              task_id: task.id,
              count: task.record.count,
              sub_index: task.lastRecord.sub_index,
              duration: task.record.duration || 0
            };

            if (!utils.validateTaskInput(task, data)) return;

            $scope.reporting = true;
            rpc.report_task(data).then(function (response) {
              task.lastRecord = response.data;
              $rootScope.$broadcast('task-reported');
            }).finally(function() {
              $scope.reporting = false;
            });

            task.record.count = null;
            task.record.duration = null;
          };

          $scope.removeLastRecord = function(task) {
            var record = task.lastRecord;
            var message = record.duration ? ',用时:{2}]' : ']';
            message = ('您确认要删除这条记录吗？[时间:{0},数量:{1}' + message)
                .format(utils.toDateTime(record.ts), record.count,
                    record.duration);
            if (!confirm(message)) return;
            rpc.remove_task_record(record.id).then(function (response) {
              if (response.data.deleted) {
                task.lastRecord = response.data.last;
              }
            });
          };

          $scope.subTaskSelected = function(task) {
            var sub_index = task.lastRecord.sub_index;

            rpc.get_last_task_record(task.id, sub_index)
                .then(function(response) {
              var lastRecord = response.data;
              task.lastRecord =
                  lastRecord.ts ? lastRecord : {sub_index: sub_index};
            });
          };
          
          $scope.toLocalTime = function(uts) {
            return utils.toDateTime(uts).toLocaleString();
          };
          $scope.$on('set-half-term', function(event, half_term) {
            $scope.half_term = half_term;
            $scope.loadTasks();
          });
          $scope.tasks = [];
        },
        templateUrl: 'js/tasks/tasks.html?tag=201707031255'
      };
    });
});
