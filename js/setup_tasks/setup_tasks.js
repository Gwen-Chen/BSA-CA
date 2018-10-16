define('setup_tasks/setup_tasks',
    ['bit_editor/bit_editor', 'services', 'utils'], function() {
  return angular.module('SetupTasksModule', ['BitEditorModule',
      'ServicesModule', 'UtilsModule'])
      .directive('setupTasks', function($rootScope, rpc, utils) {
      return {
        scope: {
          user: '='
        },
        link: function(scope) {
          scope.updateEnroll = function() {
            var user = scope.user;
            rpc.update_user({id: user.id, enroll_tasks: user.enroll_tasks});
          };
          rpc.get_class_candidates().then(function(response) {
            scope.classes = response.data;
            scope.classIds = utils.keys(scope.classes);
          });
          rpc.get_class_prefs().then(function(response) {
            scope.class_pref = response.data[scope.user.id];
            if (utils.isEmpty(scope.class_pref)) {
              scope.class_pref = {};
            }
          });
          scope.update_pref = function() {
            var prefs = utils.mix_in(scope.class_pref, {
              department_id: scope.user.classId == 1 ? 0 : 1
            });
            rpc.update_class_prefs(prefs);
          };
          scope.getClassLabel = function(id) {
            var classInfo = scope.classes[id];
            if (!classInfo) return '请重新选择';

            return utils.getClassLabel(classInfo);
          };
          
        },
        templateUrl: 'js/setup_tasks/setup_tasks.html?tag=201705261302'
      };
    });
});
