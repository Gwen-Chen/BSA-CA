define('admin_app',
    ['app_bar/app_bar', 'classes/classes', 'class_info/class_info',
    'task_stats/task_stats', 'learning_records/learning_records',
    'scores/scores',
    'schedule_editor/schedule_editor', 'services', 'permission', 'utils',
    'zb_login_dialog/zb_login_dialog',
    'zb_choose_root_dialog/zb_choose_root_dialog'],
    function() {

  angular.module('AppModule', ['AppBarModule', 'ClassesModule',
      'ClassInfoModule', 'TaskStatsModule',
      'LearningRecordsModule', 'PermissionModule',
      'ScoresModule',
      'ScheduleEditorModule',
      'ServicesModule', 'UtilsModule', 'ZBLoginDialogModule',
      'ZBChooseRootDialogModule'])
      .directive('body', function(rpc, perm, utils) {
        return {
          link: function($scope) {
            $scope.pageLoaded = [true];
            rpc.get_user().then(function(user) {
              perm.user = user;
              $scope.user = user;
              $scope.classId = user.classId;
            });
            
            var pages = document.querySelector('iron-pages');
            var tabs = document.querySelector('paper-tabs');
             
            tabs.addEventListener('iron-select', function() { 
              $scope.pageLoaded[pages.selected = tabs.selected] = true;
              setTimeout(function() {
                $scope.$apply();
              }, 0);
            });

            $scope.$on('editing-user-changed', function(event, editingUser) {
              if (!editingUser) return;

              tabs.selected = 0;
              pages.selected = 0;
            });

            $scope.$on('select-page', function(event, index) {
              tabs.select(index);
            });

            emailjs.init("user_AZIJ32nwn6RJmV7EzdJy8");
          }
        };
      }).config( ['$compileProvider', function( $compileProvider ) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob):/);
      }]);

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});

require(['admin_app']);
