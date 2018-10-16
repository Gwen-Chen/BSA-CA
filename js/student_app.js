define('student_app', ['app_bar/app_bar', 'setup_tasks/setup_tasks',
    'tasks/tasks', 'schedule_tasks/schedule_tasks',
    'score/score',
    'task_history/task_history',
    'user_editor/user_editor',
    'permission', 'services'], function() {

  angular.module('AppModule', ['AppBarModule', 'SetupTasksModule',
      'TasksModule', 'ScheduleTasksModule',
      'ScoreModule',
      'TaskHistoryModule',
      'UserEditorModule',
      'PermissionModule', 'ServicesModule'])
      .directive('body', function(perm, rpc) {
        return {
          link: function($scope) {
            $scope.pageLoaded = [];

            rpc.get_user().then(function(user) {
              $scope.user = user;
              perm.user = user;

              $scope.isFirstClass = function() {
                return user.classInfo && user.classInfo.department_id == 1;
              };
            });

            var pages = document.querySelector('iron-pages');
            var tabs = document.querySelector('paper-tabs');
       
            tabs.addEventListener('iron-select', function() { 
              $scope.pageLoaded[pages.selected = tabs.selected] = true;
              setTimeout(function() {
                $scope.$apply();
              }, 0);
            });
          }
        };
      });

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['AppModule']);
  });
});

require(['student_app']);
