define('classes/classes', ['importers', 'import_dialog/import_dialog',
    'permission', 'services', 'utils'], function() {
  return angular.module('ClassesModule', ['ImportDialogModule',
      'PermissionModule', 'ServicesModule', 'UtilsModule'])
    .directive('classes', function($rootScope, importers, perm, rpc, utils) {
      return {
        scope: {
          classId: '=',
          listType: '@',
          permission: '@'
        },
        link: function($scope) {
          $scope.initUser = function() {
            return rpc.get_user().then(function(user) {
              return perm.user = user;
            });
          };

          $scope.reload = function() {
            return rpc.get_classes().then(function(response) {
              $scope.showImportDialog = false;
              var classes = response.data;
              if (utils.isEmpty(classes)) return;

              $scope.alumnis = utils.groupBy(classes, 'start_year');
              $scope.years =
                  utils.map(utils.positiveKeys($scope.alumnis), parseInt);
              var classInfo = classes[$scope.classId] || utils.first(classes);
              $scope.classId = classInfo.id;
  
              $scope.currentClass = {
                  year: parseInt(classInfo.start_year),
                  id: $scope.classId
              };
              
              $scope.yearChanged = function() {
                $scope.classes = $scope.alumnis[$scope.currentClass.year];

                // Classes without a 'start_year' field are pinned for all years.
                for (var id in response.data) {
                  var info = response.data[id];
                  if (!info.start_year) { $scope.classes[id] = info; }
                }

                $scope.classIds = utils.map(utils.keys($scope.classes), parseInt);
              };
  
              $scope.yearChanged();
              return true;
            });
          };
          
          utils.requestOneByOne([$scope.initUser, $scope.reload]);

          $scope.select = function (id) {
            $scope.lastClassId = $scope.classId;
            $scope.classId = id;
            $scope.currentClass.id = id;
          };
          
          $scope.locateClass = function (classInfo) {
            $scope.currentClass.year = classInfo.start_year;
            $scope.yearChanged();
            $scope.select(classInfo.id);
          };
          
          $scope.$on('editing-user-changed', function(event, editingUser) {
            if (!editingUser) {
              return;
            }
            if (editingUser.classId !== $scope.classId ) {
              $scope.locateClass(editingUser.classInfo);
            }
          });
          
          $scope.$on('class-updated', function(event, classId) {
            $scope.classId = classId;
            $scope.reload();
          });

          $scope.$on('class-deleted', function(event, classId) {
            if ($scope.classId === classId) {
              $scope.classId = $scope.lastClassId;
            }
            $scope.reload();
          });
          
          $scope.createNewClass = function() {
            $scope.classes[0] = utils.classTemplate();
            $scope.select(0);
            $rootScope.$broadcast('select-page', 0);
          };
          
          $scope.isSysAdmin = function() {
            return perm.isSysAdmin();
          };
          
          $scope.exportUsers = function() {
            importers.userImporter.exportUsers($scope.classIds,
                $scope.exportedUrl).then(function(url) {
                  $scope.exportedUrl = url;
                });
          };
        },
        templateUrl : 'js/classes/classes.html'
      };
    });
});
