define('assignment_preview/assignment_preview', [
    'permission',
    'services',
    'utils'], function() {
  return angular.module('AssignmentPreviewModule', [
    'PermissionModule',
    'ServicesModule',
    'UtilsModule']).directive('assignmentPreview', function(perm, rpc, utils) {
      return {
        restrict: 'E',
        scope: {
          departmentId: '='
        },
        link: function(scope) {
          scope.mergeUsers = function(classId) {
            return rpc.get_users(null, classId).then(function(response) {
              return utils.mix_in(scope.users, response.data);
            });
          };
          scope.getClasses = function() {
            if (scope.departmentId == 0) {
              scope.classes = [1];
              return utils.truePromise();
            }
            return rpc.get_classes(null, scope.departmentId).then(
                function(response) {
                  var classes = response.data;
                  if (utils.isEmpty(classes)) return false;
                  return scope.classes = utils.keys(classes).filter( 
                      function(classId) { return classId != 1; });
                });
          };
          scope.getAllUsers = function() {
            scope.users = {};
            var toFunction = function(classId) {
              return function() {
                return scope.mergeUsers(classId);
              };
            };
            return utils.requestOneByOne(scope.classes.map(toFunction));
          };
          scope.getClassPrefs = function() {
            return rpc.get_class_prefs(scope.departmentId).then(
                function(response) {
                  return scope.classPrefs = 
                      utils.isEmpty(response.data) ? {} : response.data;
                });
          };
          scope.assign = function() {
            var candidates = {};

            for (var user_id in scope.classPrefs) {
              var pref1 = scope.classPrefs[user_id].pref1;
              if (!pref1) return;
              if (!candidates[pref1]) {
                candidates[pref1] = {users: []};
              }
              if (scope.users[user_id]) {
                candidates[pref1].users.push(user_id);
              }
            }
            
            var classIds = utils.keys(candidates);
            return utils.requestOneByOne(classIds.map(function(classId) {
              return function() {
                return scope.getCandidateClassInfo(classId, candidates);
              };
            })).then(function() {
              scope.candidates = candidates;
              scope.candidateIds = utils.keys(candidates);
              return scope.candidates;
            });
          };
          scope.getCandidateClassInfo = function(classId, candidates) {
            return rpc.get_classes(classId).then(function(response) {
              return candidates[classId].classInfo = response.data[classId];
            });
          };
          scope.$watch("departmentId", function() {
            utils.requestOneByOne([
                scope.getClasses, 
                scope.getAllUsers,
                scope.getClassPrefs,
                scope.assign
            ]);
          });
          scope.getClassLabel = function(classId) {
            var candidate = scope.candidates[classId];
            if (!candidate) return '';

            var classInfo = candidate.classInfo;
            if (!classInfo) return '请重新选择';

            return utils.getClassLabel(classInfo);
          };
          
          scope.doAssign = function() {
            if (!confirm('您确定按照预览结果执行分班动作吗？')) {
              return;
            }
            var requests = [];
            scope.candidateIds.forEach(function(classId) {
              var candidate = scope.candidates[classId];
              utils.forEach(candidate.users, function(userId) {
                var request = function() {
                  return rpc.update_user({id: userId, classId: classId});
                };
                requests.push(request);
              });
            });
            return utils.requestOneByOne(requests).then(function() {
              window.location.reload();
            });
          };
          
          /// Method to assign students. If method.even is true, some secondary
          /// preferences might be used to balance the number between classes.
          scope.method = {even: false};
        },
        templateUrl : 'js/assignment_preview/assignment_preview.html'
      };
    });
});
