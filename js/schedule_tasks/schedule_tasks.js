define('schedule_tasks/schedule_tasks', ['navigate_bar/navigate_bar',
    'services', 'utils'], function() {
  return angular.module('ScheduleTasksModule', ['NavigateBarModule',
    'ServicesModule', 'UtilsModule'])
    .directive('scheduleTasks', function($rootScope, rpc, utils) {
          return {
            scope: {
              user: '='
            },
            link: function($scope) {
              $scope.attendOptions = ['缺席', '出席', '请假'];
              $scope.vacation = function(schedule) {
                return !parseInt(schedule.course_id); 
              };

              $scope.getWeeklyTime = function(group, index) {
                return utils.getWeeklyTime(group.start_time, index);
              };
              
              $scope.$watch('user', function() {
                if (!$scope.user) return;
                $scope.reload();
              });

              $scope.reload = function(term) {
                rpc.get_schedules($scope.user.classId, term || 0, 'mine')
                    .then(function(response) {
                  if (!$scope.setHalfTerm(response.data.groups)) return;

                  $scope.schedule_groups = response.data.groups;
                  $scope.users = response.data.users;
                  $scope.records = $scope.users[$scope.user.id].records;
                  utils.forEach($scope.schedule_groups, utils.calcMiddleWeek);
                });
              };
              
              $scope.setHalfTerm = function(groups) {
                var lastSchedule = utils.last(groups);
                if (!lastSchedule) return false;

                $scope.term = lastSchedule.term;
                var half_term = $scope.term * 2;
                var midTerm = utils.getMidTerm(lastSchedule);
                var now = utils.unixTimestamp(new Date());
                if (now > midTerm) {
                  half_term++;
                } 
                $rootScope.$broadcast('set-half-term', half_term);
                return true;
              };
              
              $scope.reportTask = function (course_id) {
                if ($scope.user.classId == 1) return;

                var record = $scope.records[course_id];
                record.course_id = course_id;
                rpc.report_schedule_task(record);
              };
              
              $scope.navigate = function(direction) {
                var term = $scope.term;
                switch (direction) {
                case 0:
                case 2:
                  term = 0;
                  break;
                case 1:
                case -1:
                  term = $scope.term + direction;
                  break;
                case -2:
                  term = 1;
                  break;
                }
                $scope.reload(term);
              };
              
              $scope.hasLimitedCourses = function(group) {
                return utils.keys(group.limited_courses).length > 0;
              };
              $scope.endTimeLabel = function(group) {
                var tm = group && group.end_time;
                return tm ?
                    '报数已截止于' + utils.toDateTime(tm).toLocaleString() : '';
              };
            },
            templateUrl : 'js/schedule_tasks/schedule_tasks.html?tag=201806062203'
          };
        });
});
