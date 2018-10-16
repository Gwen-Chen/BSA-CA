define('order_admin_app', [
    'app_bar/app_bar',
    'book_lists/book_lists',
    'orders/orders',
    'order_stats/order_stats',
    'services',
    'permission',
    'utils'],
    function() {

  angular.module('AppModule', [
      'AppBarModule',
      'BookListsModule',
      'OrdersModule',
      'OrderStatsModule',
      'ServicesModule',
      'PermissionModule',
      'UtilsModule',
      ])
      .directive('body', function($rootScope, rpc, perm, utils) {
        return {
          link: function(scope) {
            rpc.get_user().then(function(user) {
              perm.user = user;
              scope.user = user;
              if (!perm.isOrderAdmin() && !perm.isAdmin()) {
                utils.redirect('./index.html');
              }
            });
            
            scope.isOrderAdmin = function() {
              return perm.isOrderAdmin();
            };

            scope.year = new Date().getFullYear();
            scope.pageLoaded = [];

            var pages = document.querySelector('iron-pages');
            var tabs = document.querySelector('paper-tabs');
       
            tabs.addEventListener('iron-select', function() { 
              scope.pageLoaded[pages.selected = tabs.selected] = true;
              setTimeout(function() {
                scope.$apply();
              }, 0);
            });
          }
        };
      });

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});

require(['order_admin_app']);
