define('invoice_app', [
    'invoice/invoice',
    'permission',
    'services',
    'utils'],
    function() {

  angular.module('AppModule', [
      'InvoiceModule',
      'PermissionModule',
      'ServicesModule',
      'UtilsModule'
      ])
      .directive('body', function(perm, rpc, utils) {
        function parseMoney(value) {
          return value && parseFloat(value) || 0.00;
        }
        return {
          link: function(scope) {
            var order_id;
            var params = location.search.substring(1).split('&');
            for (var i = 0;i < params.length; i++) {
              var pair = params[i].split('=');
              if (pair[0] == 'order_id') {
                order_id = pair[1];
                break;
              }
            }
            function getUser() {
              return rpc.get_user().then(function(user) {
                return perm.user = user;
              });
            }
            function getOrder() {
              return rpc.get_order(order_id).then(function(response) {
                return scope.order = response.data;
              });
            }
            function getItems() {
              var level = perm.isOrderAdmin() && 99;
              return rpc.get_items(null, level).then(function(response) {
                var items = response.data;

                var order = scope.order;
                order.sub_total = parseMoney(order.sub_total);
                order.shipping = parseMoney(order.shipping);
                order.int_shipping = parseMoney(order.int_shipping);
                order.paid = parseMoney(order.paid);

                order.items.forEach(function(item) {
                  item.name = items[item.item_id].name;
                });
                return true;
              });
            }
            utils.requestOneByOne([getUser, getOrder, getItems]);
          }
        };
      });

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});

require(['invoice_app']);
