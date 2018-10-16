define('zb_choose_root_dialog/zb_choose_root_dialog', [], function() {
  return angular.module('ZBChooseRootDialogModule', [])
  .directive('zbChooseRootDialog',
    function() {
      return {
        link: function(scope) {
          scope.$on('init-zb-roots', function(event, args) {
            scope.zb = args;
          });
        },
        templateUrl : 'js/zb_choose_root_dialog/zb_choose_root_dialog.html'
      };
    }).filter('htmlToPlaintext', function() {
      return function(text) {
        var div = document.createElement('div');
        div.innerHTML = text;
        return div.textContent || div.innerText || "";
      }
    });
});
