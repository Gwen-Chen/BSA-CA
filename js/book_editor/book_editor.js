define('book_editor/book_editor', 
    ['services', 'utils'], function() {
  return angular.module('BookEditorModule', [
      'ServicesModule',
      'UtilsModule']).directive('bookEditor', function(rpc, utils) {
    return {
      scope: {
        book: '=',
        categories: '=',
        items: '=',
        onCancel: '&',
        onSave: '&'
      },
      link: function(scope) {
        scope.$watch('categories', function(categories) {
          if (categories) {
            scope.categoryIds = utils.keys(categories);
          }
        });
      },
      templateUrl : 'js/book_editor/book_editor.html?tag=201707041052'
    };
  });
});
