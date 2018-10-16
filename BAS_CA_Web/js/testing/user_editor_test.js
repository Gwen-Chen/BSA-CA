define('testing/user_editor_test', ['text!user_editor/user_editor.html',
    'user_editor/user_editor', 'angular-mocks'], function(templ) {
  describe('Testing user-editor', function() {
    var $compile, $rootScope, $httpBackend;
    var user = {
      "id" : "66",
      "sex" : 1,
      "education" : 4,
      "volunteer" : 0,
      "channel" : 1,
      "enroll_tasks" : 0,
      "entrance" : 0,
      "conversion" : 2011,
      "classId" : 6,
      "permission" : 255,
      "birthyear" : "1978",
      "email" : "a@b.com",
      "password" : null,
      "internal_id" : "A15-06-18",
      "name" : "Adam Jones",
      "nickname" : "",
      "im" : "adamj",
      "phone" : "123-456-7890",
      "city" : "Irvine",
      "state" : 4,
      "country" : "US",
      "occupation" : "\u8f6f\u4ef6\u5de5\u7a0b\u5e08",
      "skills" : null,
      "comments" : "test3",
      "classInfo" : {
        "id" : 6,
        "department_id" : 3,
        "name" : "1506\u5468\u516d\u52a0\u884c",
        "email" : "",
        "class_room" : "99343758",
        "teacher_id" : 0,
        "start_year" : 2015,
        "perm_level" : 2,
        "weekday" : 6
      }
    };
  
    // Load the myApp module, which contains the directive
    beforeEach(module('UserEditorModule'));
  
    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function(_$compile_, _$rootScope_, _$httpBackend_){
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;

      $rootScope.user = user;
      $rootScope.userNames = {};
      $rootScope.userNames[user.id] = user.name;
      
      $httpBackend.when('GET', 'js/user_editor/user_editor.html')
          .respond(templ);
    }));
  
    it('Create a user editor component', function() {
      // Compile a piece of HTML containing the directive
      var element = $compile('<user-editor user="user" class-mates="userNames">'
          + '</user-editor>')($rootScope);
      $rootScope.$digest();
      $httpBackend.flush();

      // Check that the compiled element contains the templated content
      expect(element[0].innerHTML).toContain(user.name);
    });
  });
});
