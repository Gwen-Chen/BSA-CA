define('zb_login_dialog/zb_login_dialog', [], function() {
  return angular.module('ZBLoginDialogModule', []).directive('zbLoginDialog',
    function($rootScope) {
      return {
        scope: {
          name: '='
        },
        link: function(scope) {
          scope.close = function(ok) {
            $rootScope.$broadcast('zb-login-confirmed', ok ? {
              username: document.querySelector('#zb-username').value,
              password: document.querySelector('#zb-password').value,
              editPassword: document.querySelector('#zb-editpassword').value,
              captcha: document.querySelector('#zb_captcha').value
            } : null);
          };
        },
        templateUrl : 'js/zb_login_dialog/zb_login_dialog.html'
      };
    });
});
