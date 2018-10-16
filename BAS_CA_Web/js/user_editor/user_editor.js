define('user_editor/user_editor',
    ['services', 'utils',
     'address_editor/address_editor',
     'bit_editor/bit_editor', 'classes/classes',
     'permission_editor/permission_editor',
     'permission'], function() {
  return angular.module('UserEditorModule', ['ServicesModule',
      'AddressEditorModule',
      'BitEditorModule', 'ClassesModule',
      'PermissionEditorModule',
      'PermissionModule', 'UtilsModule']).directive('userEditor',
          function($rootScope, perm, rpc, utils) {
    return {
      scope: {
        classMates: '=',
        user: '='
      },
      link: function($scope) {
        for (var key in utils) {
          if (key.endsWith('Labels')) {
            $scope[key] = utils[key];
          }
        }
        $scope.getDisplayLabel = function(key) {
          return $scope.user && utils.getDisplayLabel($scope.user, key);
        };

        $scope.permissionLabel = perm.permissions;
        $scope.permissions = perm.lowerPermissions();
        $scope.isSysAdmin = function() {
          return perm.isSysAdmin();
        };
        $scope.isAdmin = function() {
          return perm.isAdmin();
        };
        $scope.isYearLeader = function() {
          return perm.isYearLeader();
        };

        $scope.$watch('user', function() {
          $scope.editing = null;
          if ($scope.user && !$scope.user.classInfo) {
            getClassInfo();
          }
        });

        function getClassInfo() {
          var classId = $scope.user.classId;
          return rpc.get_classes(classId).then(function(response) {
            return $scope.user.classInfo =
              response.data[classId] || response.data['' + classId];
          });
        }
        
        /// Clears all learning record by deleting the user and cloning a new 
        /// one.
        function clearLearningRecord() {
          return rpc.clone_user($scope.user.id).then(function(response) {
            if (!response.data.updated) return false;
            return $scope.user.id = response.data.updated;
          });
        }

        /// Checks whether the user's learning records need to be cleared.
        function checkClassChange() {
          var classInfo = $scope.user.classInfo;
          var previousInfo = $scope.originalUser.classInfo;
          if (parseInt(previousInfo.department_id) == 1 &&
              parseInt(classInfo.department_id) != 1) {
            return utils.truePromise();
          }
          if (classInfo.department_id != previousInfo.department_id ||
              classInfo.start_year != previousInfo.start_year) {
            if (confirm('需要清除{0}的所有学修记录吗？'.format($scope.user.name))) { 
              return clearLearningRecord();
            }
          }
          return utils.truePromise();
        }
        
        $scope.$watch('editing', function() {
          if (!$scope.editing) return;
          document.querySelector('div.user-info-editor').scrollIntoView();
          $scope.originalUser = utils.mix_in({}, $scope.user);
          $scope.error = null;
        });

        $scope.save = function(editing) {
          var user = $scope.user;
          var data = {id: user.id};
          editing = editing || $scope.editing;
          switch (editing) {
          case 'address':
            data.street = user.street;
            data.city = user.city;
            data.state = user.state;
            data.country = user.country;
            data.zip = user.zip;
            break;
          case 'password':
            if (user.password != user.confirm) return;
          default:
            data[editing] = user[editing];
            break;
          }

          function updateUser() {
            return rpc.update_user(data).then(function(response) {
              if (response.data.updated && editing == 'classId') {
                $rootScope.$broadcast('class-updated', user.classId);
                return true;
              }
              
              if (response.data.updated) {
                $scope.editing = null;
              } else {
                utils.mix_in($scope.user, $scope.originalUser);
                $scope.user.confirm = null;
                $scope.error = response.data.error;
              }
              return false;
            });
          }
          
          utils.requestOneByOne([updateUser, getClassInfo]);
        };
        
        $scope.admining = window.location.href.indexOf('admin.html') > 0;
      },

      templateUrl : 'js/user_editor/user_editor.html?tag=201806141350'
    };
  });
});
