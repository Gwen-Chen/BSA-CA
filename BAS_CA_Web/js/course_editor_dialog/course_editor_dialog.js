define('course_editor_dialog/course_editor_dialog', 
    ['create_course_dialog/create_course_dialog',
     'editable_label/editable_label', 'services', 'utils'], function() {
	return angular.module('CourseEditorDialogModule', [
      'CreateCourseDialogModule', 'EditableLabelModule',
      'ServicesModule', 'UtilsModule'])
		.directive('courseEditorDialog',
				function(rpc, utils) {
					return {
					  scope: {
					    groupId: '=',
					    onSave: '&'
					  },
					  link: function($scope, element) {
					    $scope.selected = {id: 0};

					    function getCategories() {
					      return rpc.get_item_categories(99).then(function(response) {
					        $scope.categoryIds = [];
					        for (var id in response.data) {
					          $scope.categoryIds.push(id);
					        }
					        return $scope.categories = response.data;
					      });
					    }
					    
					    function getCourseGroups() {
	              return rpc.get_course_groups().then(function(response) {
	                $scope.course_groups = response.data;
	                $scope.groupIds = utils.positiveKeys($scope.course_groups);
	                if ($scope.groupId) {
	                  $scope.select($scope.groupId);
	                }
	                return true;
	              });
					    }

					    utils.requestOneByOne([getCategories, getCourseGroups]);
					    
					    $scope.createGroup = function(category) {
					      var dialog = document.querySelector('#create-course-dialog');
					      var scope = angular.element(dialog).scope();
					      scope.category = category;
					      scope.categories = $scope.categories;
					      scope.categoryIds = $scope.categoryIds;
					      scope.onCreate = function(group) {
					        $scope.updateGroup(group);
					      };
					      dialog.open();
					      
					      var self = document.querySelector('#course-editor-dlg');
					      self.close();
					      
					      dialog.addEventListener('iron-overlay-closed', function() {
					        self.open();
					      });
					    };

              $scope.updateGroup = function(group) {
                var creatingNew = !group.id;
                rpc.update_course_group(group).then(function(response) {
                  group = response.data.group;
                  if (group && group.id && creatingNew) {
                    group.courses = {};
                    $scope.course_groups[group.id] = group;
                    $scope.groupIds = utils.positiveKeys($scope.course_groups);
                    $scope.select(group.id);
                  }
                });                
              };
              
              $scope.removeGroup = function(group) {
                if (group.courses && 
                    utils.any(group.courses, function(course) {
                      return course.id;
                    })) {
                  alert('请先删除所有课程，再删除课程组。');
                  return;
                }

                rpc.remove_course_group(group.id).then(function(response) {
                  if (parseInt(response.data.deleted) == 1) {
                    delete $scope.course_groups[group.id];
                    $scope.groupIds = utils.positiveKeys($scope.course_groups);
                  }
                });
              };
              
              $scope.updateCourse = function(course) {
                if (!course.id) return;

                return rpc.update_course(course);
              };
              
              $scope.appendCourse = function(group) {
                var id = utils.maxKey(group.courses) + 1;
                var length = utils.keys(group.courses).length;
                var name;
                if (length > 0) {
                  name = utils.getNextName(group.courses[id-1].name);
                } else {
                  '{0}第{1}节'.format(group.name, length + 1);
                }
                group.courses[id] = {
                  id: 0,
                  group_id: group.id,
                  name: name
                };
                setTimeout(function() {
                  var course = element[0].querySelector('.course-list .css-table-row:last-child');
                  course.scrollIntoView();
                }, 150);
              };
              
              $scope.select = function(id) {
                if (!$scope.course_groups) return;

                $scope.selected.id = id;
                $scope.group = $scope.course_groups[id];
                $scope.categories[$scope.group.category].expanded = true;

                var course_group = $scope.course_groups[id];
                if (!course_group.courses) {
                  rpc.get_courses(id).then(function(courses) {
                    course_group.courses = courses;
                  });
                }
                setTimeout(function() {
                  var item = element[0].querySelector('.selected');
                  item.scrollIntoView();
                }, 100);
              };
              
              $scope.hasNewCourses = function() {
                return $scope.group && $scope.group.courses &&
                    utils.any($scope.group.courses, function(course) {
                      return !course.id;
                    });
              };

              function _close() {
                var dialog = document.querySelector('#course-editor-dlg');
                dialog.close();
              }

              $scope.saveNewCourses = function() {
                function isNew(course) {return !course.id;}
                var newCourses = utils.where($scope.group.courses, isNew);
                function toRequest(course) {
                  return function() {
                    return rpc.update_course(course).then(function(response) {
                      return course.id = response.data.id;
                    }); 
                  }
                }
                // Save courses one by one to keep their order.
                var requests = utils.map(newCourses, toRequest);
                utils.requestOneByOne(requests).then(function() {
                  var courses = {};
                  utils.forEach($scope.group.courses, function(course) {
                    courses[course.id] = course;
                  });
                  $scope.group.courses = courses;
                  $scope.onSave($scope.group);
                  _close();
                });
              };
              
              $scope.removeCourse = function(course) {
                rpc.remove_course(course.id).then(function(response) {
                  if (!response.data.deleted) return;
                  delete $scope.group.courses[course.id];
                });
              };
              
              $scope.search = function() {
                if (!$scope.coursePrefix) return;
                
                for (var id in $scope.course_groups) {
                  var group = $scope.course_groups[id];
                  if (group.name.startsWith($scope.coursePrefix)) {
                    $scope.select(id);
                    break;
                  }
                }
              };
					  },
						templateUrl : 'js/course_editor_dialog/course_editor_dialog.html?tag=20180621'
					};
				});
});
