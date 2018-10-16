define('book_list_details/book_list_details', 
    ['book_editor/book_editor', 'services', 'utils'], function() {
  return angular.module('BookListDetailsModule', [
      'BookEditorModule',
      'ServicesModule',
      'UtilsModule']).directive('bookListDetails', function(rpc, utils) {
    return {
      scope: {
        classInfo: '='
      },
      link: function(scope) {
        scope.$watch('classInfo', function(classInfo) {
          if (classInfo) {
            reload(classInfo);
          }
        });
        
        function reload() {
          utils.requestOneByOne([getDepartments, getCategories,
              getDepartmentBooks, getBookList]);
        };
        
        scope.removeItem = function(id) {
          delete scope.classInfo.books[id];
          scope.dirty = true;
        };
        
        scope.clear = function() {
          scope.classInfo.books = {};
          scope.classInfo.adding = true;
          scope.dirty = true;
        };

        scope.save = function() {
          var classInfo = scope.classInfo;
          if (!classInfo.term) {
            alert('请指定订书学期.');
            return;
          }

          var data = {
            department_id: classInfo.department_id,
            term: scope.classInfo.term,
            bookIds: utils.keys(classInfo.books)
          };
          rpc.update_book_list(data).then(function(response) {
            if (response.data.updated) {
              backup();
            }
          });
        };

        scope.restore = function() {
          scope.classInfo = angular.copy(scope.savedInfo);
          scope.dirty = false;
        };

        /// Adds a book from the [items] to the book list.
        scope.addBook = function(item) {
          scope.classInfo.books[item.id] = item;
          scope.dirty = true;
        };
        
        /// Creates a new book, adds it to [items].
        scope.createBook = function() {
          rpc.update_item(scope.classInfo.newBook).then(function(response) {
            var id = response.data.updated;
            if (id) {
              scope.classInfo.newBook.id = id;
              scope.items[id] = scope.classInfo.newBook;
              scope.classInfo.newBook = null;
            } else {
              alert('新建法本失败，请检查是不是同名法本已经存在！');
            }
          });
        };

        function getDepartments() {
          return rpc.get_departments().then(function(response) {
            return scope.departments = response.data;
          });
        }
        function getCategories() {
          return rpc.get_item_categories(99).then(function(response) {
            return scope.categories = response.data;
          });
        }
        function getDepartmentBooks() {
          var dep = scope.departments[scope.classInfo.department_id];
          return rpc.get_items(null, parseInt(dep.level)).then(function(response) {
            scope.classInfo.books = response.data;
            return scope.items = response.data;
          });
        }
        function getBookList() {
          var term = scope.classInfo.term;
          var depId = scope.classInfo.department_id;
          return rpc.get_book_list(depId, term).then(function(response) {
            scope.classInfo.books = {};
            (response.data || []).forEach(function(id) {
              scope.classInfo.books[id] = scope.items[id];
            });
            backup();
            return true;
          });
        }
        function backup() {
          scope.savedInfo = angular.copy(scope.classInfo);
          scope.dirty = false;
        }
      },
      templateUrl : 'js/book_list_details/book_list_details.html?tag=201707031806'
    };
  });
});
