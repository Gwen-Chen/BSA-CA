define('schedule_group_editor/schedule_group_editor',
    ['course_groups/course_groups', 'timestamp/timestamp',
    'services', 'utils'], function() {

  return angular.module('ScheduleGroupEditorModule',
      ['CourseGroupsModule', 'TimestampModule', 'ServicesModule',
       'UtilsModule']).directive('scheduleGroupEditor',
        function($rootScope, rpc, utils) {
          return {
            scope: {
              group: '='
            },
            link: function(scope) {
              scope.saveGroup = function(group) {
                if (!parseInt(group.term) || !parseInt(group.course_group)) {
                  alert('请选择课程组和学期');
                  return;
                }
                rpc.update_schedule_group(group).then(function(response) {
                  if (parseInt(response.data.updated)) {
                    group.editing = false;
                    scope.reloadGroup(group.term);
                  }
                });
              };
              
              scope.reloadGroup = function(term) {
                $rootScope.$broadcast('reload-schedules', term);
              };

              scope.getCourseIds = function(group) {
                return rpc.get_courses(group).then(function(courses) {
                  return utils.keys(courses);
                });
              };
              scope.merge_courses = function(course_ids1, course_ids2) {
                var group = scope.group;
                if (scope.sequential) {
                  return course_ids1.concat(course_ids2);
                } else {
                  var alternate = [];
                  for (var index = 0;index < course_ids1.length; index++) {
                    alternate.push(course_ids1[index]);
                    alternate.push(course_ids2[index]);
                  }
                  return alternate;
                }
              };
              scope.courseGroupChanged = function(courses, second) {
                var group = scope.group;
                var clearing = utils.isEmpty(courses);
                if (clearing) {
                  if (second) {
                    group.course_group2 = null;
                  } else if (group.course_group) {
                    alert('主课不能为空');
                    return;
                  }
                }
                var course_ids1, course_ids2, course_ids;
                group.courses = utils.mix_in(group.courses || {}, courses);

                if (second) {
                  course_ids2 = utils.keys(courses);
                } else {
                  course_ids1 = utils.keys(courses);
                }
                var hasSecondCourse = second || parseInt(group.course_group2);
                if (!hasSecondCourse) {
                  return scope.arrange_schedules(course_ids1);
                }
                var groupToLoad = second ?
                    group.course_group : group.course_group2;
                scope.getCourseIds(groupToLoad).then(function(courseIds) {
                  if (!course_ids1) {
                    course_ids1 = courseIds;
                  } else {
                    course_ids2 = courseIds;
                  }

                  if (!clearing && course_ids2.length != course_ids1.length) {
                    if (course_ids2.length > course_ids1.length) {
                      alert('Secondary course should have same lessons as the' +
                          ' primary one.');
                      return;
		    }
                    var len = course_ids1.length - course_ids2.length;
                    course_ids2 = course_ids2.concat(new Array(len).fill(null));
                  }

                  if (!clearing) {
                    courseIds = scope.merge_courses(course_ids1, course_ids2);
                  }
                  scope.arrange_schedules(courseIds, !clearing);
                });
              };

              scope.arrange_schedules = function(course_ids, hasSecondCourse) {
                var week = 0;
                var courseIndex = 0;
                var schedule_id = 0;
                var group = scope.group;
                var weeks = course_ids.length > 10 ? 
                    utils.weeksOfTerm : course_ids.length;
                
                if (group.schedules && utils.keys(group.schedules).length) {
                  // Modifying existing schedules.
                  for (var id in group.schedules) {
                    week++;
                    var schedule = group.schedules[id];
                    if (!parseInt(schedule.course_id)) continue;
                    schedule.course_id = course_ids[courseIndex++];
                    if (hasSecondCourse) {
                      schedule.course_id2 = course_ids[courseIndex++];
                    } else {
                      schedule.course_id2 = null;
                    }
                  }
                  schedule_id = utils.maxKey(group.schedules) + 1;
                } else {
                  group.schedules = {};
                }

                // Appending new schedules.
                for (; week < weeks || courseIndex < course_ids.length; week++) {
                  var courseId = 0;
                  courseId = course_ids[courseIndex++] || null;

                  var schedule = {
                    id: 0,
                    course_id: courseId, 
                    group_id: group.id
                  };
                  if (hasSecondCourse) {
                    schedule.course_id2 = course_ids[courseIndex++] || null;
                  }
                  group.schedules[schedule_id] = schedule;
                  schedule_id++;
                }
                
                setTimeout(function() {
                  scope.$apply();
                }, 0);

                return utils.truePromise();
              };
              scope.mergeTypeChanged = function() {
                var group = scope.group;

                if (!parseInt(group.course_group) ||
                    !parseInt(group.course_group2)) {
                  return;
                }
                
                var courseGroupIds = [group.course_group, group.course_group2];
                scope.courseIds = [];
                function toIdRequest(index) {
                  var course_group = courseGroupIds[index]; 
                  return function() {
                    return scope.getCourseIds(course_group)
                        .then(function(courseIds) {
                      return scope.courseIds[index] = courseIds;
                    });
                  };
                }
                
                var requests = [0, 1].map(toIdRequest);
                utils.requestOneByOne(requests).then(function() {
                  var course_ids1 = scope.courseIds[0];
                  var course_ids2 = scope.courseIds[1];
                
                  if (course_ids2.length != course_ids1.length) {
                    alert('Secondary course should have same lessons as the' +
                        ' primary one.');
                    return;
                  }

                  var courseIds = scope.merge_courses(course_ids1, course_ids2);
                  scope.arrange_schedules(courseIds, true);
                });
              };
              scope.limitedGroupChange = function(courses) {
                scope.group.limited_courses = courses;
              };
              scope.terms = (function() {
                var terms = [];
                for (var index = 1;index <= utils.totalTerms; index++)
                  terms.push(index);
                return terms;
              })();
            },
            templateUrl : 'js/schedule_group_editor/schedule_group_editor.html?tag=201712202243'
          };
        });
});
