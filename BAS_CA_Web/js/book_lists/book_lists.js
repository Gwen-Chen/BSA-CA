define('book_lists/book_lists', 
    ['book_list_details/book_list_details',
     'editable_label/editable_label',
     'services', 
     'utils'], function() {
  return angular.module('BookListsModule', [
      'BookListDetailsModule',
      'EditableLabelModule',
      'ServicesModule',
      'UtilsModule']).directive('bookLists', function(rpc, utils) {
    return {
      link: function(scope) {
        scope.years = [];
        scope.selectedClass = {id: 0};
        scope.year = (new Date()).getFullYear();
        for (var year = 2011;year <= scope.year; year++) {
          scope.years.push(year);
        }
        scope.yearChanged = function() {
          return rpc.get_class_book_lists(scope.year)
              .then(function(response) {
                return scope.classes = response.data;
              });
        };
        scope.updateClassTerm = function(classInfo) {
          rpc.update_class_term(classInfo).then(function(response) {
            if (response.data.updated) {
              // Make a copy to trigger a change.
              scope.selectedClass = angular.copy(classInfo);
            }
          });
        };
        function getDepartments() {
          return rpc.get_departments().then(function(response) {
            scope.depIds = utils.keys(response.data);
            return scope.departments = response.data;
          });
        }
        utils.requestOneByOne([getDepartments, scope.yearChanged]);
      },
      templateUrl : 'js/book_lists/book_lists.html?tag=201706062300'
    };
  });
});
