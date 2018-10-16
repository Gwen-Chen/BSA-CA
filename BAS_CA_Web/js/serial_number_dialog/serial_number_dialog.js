define('serial_number_dialog/serial_number_dialog',
    ['editable_label/editable_label', 'services', 'utils'], function() {
  return angular.module('SerialNumberDialogModule', ['EditableLabelModule',
      'ServicesModule', 'UtilsModule']).directive('serialNumberDialog',
        function(rpc, utils) {
          return {
            scope: {
              classId: '=',
              users: '='
            },
            link: function(scope) {
              scope.errors = [];

              var backup = {};

              if (scope.users && scope.classId) {
                initBase(scope.users);
              } else {
                scope.$watch('users', initBase);
              }

              function getDepLetter(depId) {
                return {'2': 'C', '3': 'A', '4': 'B'}[depId];
              }

              function initBase(users) {
                back(users);
                rpc.get_classes(scope.classId).then(function(response) {
                  var classInfo = response.data[scope.classId];
                  var dep = getDepLetter(classInfo.department_id);
                  var year = (new Date()).getFullYear() % 100;
                  var weekday = classInfo.weekday || 7;
                  scope.base = '{0}{1}-0{2}-01'.format(dep, year, weekday);
                });
              }

              function back(users) {
                utils.forEach(users, function(user) {
                  backup[user.id] = user.internal_id;
                });
              }

              scope.restore = function() {
                function restoreUser(user) {
                  user.internal_id = backup[user.id];
                }
                utils.forEach(scope.users, restoreUser);
              };

              scope.modified = function(user) {
                return user.internal_id != backup[user.id];
              };

              function updateUserRequest(user) {
                return function() {
                  return rpc.update_user(user).then(function(response) {
                    if (scope.errors[user.id] = response.data.error) return false;
                    backup[user.id] = user.internal_id;
                    return user;
                  });
                }
              }

              function close() {
                document.querySelector('#serial-number-dlg').close();
                return utils.truePromise();
              }

              scope.save = function(user) {
                var requests;
                if (user) {
                  requests = [updateUserRequest(user)];
                } else {
                  requests = utils.map(utils.where(scope.users, scope.modified),
                      updateUserRequest);
                }
                utils.requestOneByOne(requests.concat([close]));
              };

              function sameFormat(s1, s2) {
                return s1.split('-').length == s2.split('-').length;
              }
              
              scope.allocate = function() {
                scope.base = scope.base || getDefaultBase();
                var parts = scope.base.split('-');
                var base = parseInt(parts.pop());
                var prefix = parts.join('-');
                utils.forEach(scope.users, function(user) {
                  if (user.internal_id &&
                      sameFormat(scope.base, user.internal_id)) return;
                  var index = base < 10 ? ('0' + base) : base;
                  user.internal_id = '{0}-{1}'.format(prefix, index);
                  base++;
                });
              };

              scope.clear = function() {
                utils.forEach(scope.users, function(user) {
                  user.internal_id = null;
                });
              };
            },
            templateUrl : 'js/serial_number_dialog/serial_number_dialog.html?tag=201712170938'
          };
        });
});

