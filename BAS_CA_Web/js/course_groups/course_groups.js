define('course_groups/course_groups',
    ['services', 'permission', 'utils'], function() {
	return angular.module('CourseGroupsModule', ['ServicesModule',
      'PermissionModule',
      'UtilsModule'])
		.directive('courseGroups',
				function(rpc, perm, utils) {
					return {
					  scope: {
					    groupId: '=',
					    onChange: '&'
					  },
					  link: function($scope) {
					    $scope.selected = {id: 0};
					    
					    $scope.isSysAdmin = function() {
					      return perm.isSysAdmin();
					    };

              rpc.get_course_groups().then(function(response) {
                $scope.course_groups = response.data;
                var groupIds = utils.positiveKeys($scope.course_groups);
                groupIds.sort(function(id1, id2) {
                  return response.data[id1].name
                      .localeCompare(response.data[id2].name);
                });
                $scope.groupIds = [0].concat(groupIds);
                $scope.course_groups[0] = {name: '-- 清除 --'};
                $scope.select($scope.groupId);
              });

              $scope.$watch('groupId', function() {
                $scope.select($scope.groupId);
              });  

              $scope.expand = function() {
                var dialog = document.querySelector('#course-editor-dlg');
                dialog.open();
                var scope = angular.element(dialog).scope();
                if ($scope.groupId) {
                  scope.select($scope.groupId);
                }
                scope.onSave = function(group) {
                  $scope.course_groups[group.id] = group;
                  var id = parseInt(group.id);
                  if ($scope.groupIds.indexOf(id) < 0) {
                    $scope.groupIds.push(id);
                  }
                  $scope.select(id);
                };
              };
              
              $scope.select = function(id) {
                if (!$scope.course_groups) return;

                $scope.selected.id = id;
                $scope.group = $scope.course_groups[id];

                if (!id) {
                  $scope.onChange({courses: {}});
                  return;
                }
                
                $scope.groupId = id;

                var course_group = $scope.course_groups[id];
                if (course_group.courses) {
                  $scope.onChange({courses: course_group.courses});
                } else {
                  rpc.get_courses(id).then(function(courses) {
                    $scope.course_groups[id].courses = courses;
                    $scope.onChange({courses: courses});
                  });
                }
              };
					  },
						templateUrl : 'js/course_groups/course_groups.html?tag=201705252126'
					};
				});
});
