define('create_course_dialog/create_course_dialog', 
    ['services', 'utils'], function() {
  return angular.module('CreateCourseDialogModule', [
      'ServicesModule', 'UtilsModule']).directive('createCourseDialog',
    function(rpc, utils) {
      return {
        scope: {
          category: '=',
          categories: '=',
          categoryIds: '=',
          onCreate: '&'
        },
        link: function(scope) {
          scope.create = function() {
            scope.onCreate({
              category: scope.category,
              name: document.querySelector('#course-name-input').value
            });
          };
        },
        templateUrl : 'js/create_course_dialog/create_course_dialog.html?tag=20180621'
      };
    });
});
