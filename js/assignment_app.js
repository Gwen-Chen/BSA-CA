define('assignment_app', [
    'app_bar/app_bar',
    'assignment_preview/assignment_preview',
    'services',
    'permission',
    'utils'],
    function() {

  angular.module('AppModule', [
      'AppBarModule',
      'AssignmentPreviewModule',
      'ServicesModule',
      'PermissionModule',
      'UtilsModule',
      ])
      .directive('body', function(rpc, perm, utils) {
        return {
          link: function(scope) {
            function getUrlParameter(name) {
              var result = null;
              var params = location.search.substr(1).split("&");
              for (var i in params) {
                  var pair = params[i].split('=');
                  if (pair[0] === name) return pair[1];
              }
            }
            scope.department_id = 
                parseInt(getUrlParameter('department_id') || 0);
            rpc.get_user().then(function(user) {
              perm.user = user;
              if (!perm.isSysAdmin() && !perm.isYearLeader()) {
                utils.redirect('./index.html');
                return;
              }

              scope.user = user;
            });
          }
        };
      });

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});

require(['assignment_app']);
