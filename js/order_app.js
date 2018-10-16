define('order_app', [
    'app_bar/app_bar',
    'item_list/item_list',
    'shopping_cart/shopping_cart',
    'orders/orders',
    'services',
    'permission',
    'utils'],
    function() {

  angular.module('AppModule', [
      'AppBarModule',
      'ItemListModule',
      'ShoppingCartModule',
      'OrdersModule',
      'ServicesModule',
      'PermissionModule',
      'UtilsModule',
      ])
      .directive('body', function($rootScope, rpc, perm, utils) {
        return {
          link: function(scope) {
            scope.pageLoaded = [];
            
            scope.cart = {
              size: 0,
              subTotal: 0.0,
              shipping: 0.0,
              items: {},
              add: function(item) {
                var existing = this.items[item.id];
                if (existing) {
                  existing.count++;
                } else {
                  item.count = 1;
                  this.items[item.id] = item;
                }
                this.update();
              },
              addAll: function(items) {
                var that = this;
                items.forEach(function(item) {that.add(item);});
                scope.selectTab(1);
              },
              remove: function(id) {
                delete this.items[id];
                this.update();
              },
              update: function() {
                this.size = 0;
                this.subTotal = 0.0;
                this.int_shipping = 0.0;
                this.shipping = 0.0;
                for (var id in this.items) {
                  var item = this.items[id];
                  this.size += item.count;
                  this.subTotal += item.count * item.price;
                  this.int_shipping += item.count * item.int_shipping;
                  this.shipping += item.count * item.shipping;
                }
                this.subTotal = this.subTotal.toFixed(2);
                this.int_shipping = this.int_shipping.toFixed(2);
                this.shipping = (this.shipping || 7).toFixed(2);
              },
              clear: function() {
                this.items = {};
                this.update();
              },
              checkOut: function() {
                var user = scope.user;
                var order = {
                  user_id: user.id,
                  sub_total: this.subTotal,
                  int_shipping: this.int_shipping,
                  shipping: this.shipping,
                  name: user.name,
                  phone: user.phone,
                  email: user.email,
                  street: user.street,
                  city: user.city,
                  state: user.state,
                  country: user.country,
                  zip: user.zip,
                  items: []
                };
                for (var id in this.items) {
                  var item = this.items[id];
                  order.items.push({
                    item_id: item.id,
                    price: item.price,
                    count: item.count
                  });
                }
                var cart = this;
                return rpc.update_order(order).then(function(response) {
                  if (response.data.updated) {
                    cart.clear();
                    $rootScope.$broadcast('reload-orders');
                    document.querySelector('#toast0').open();
                    setTimeout(function() {
                      scope.selectTab(2);
                    }, 3000);
                    return true;
                  }
                  return false;
                });
              }
            };

            rpc.get_user().then(function(user) {
              perm.user = user;
              scope.user = user;
            });

            var pages = document.querySelector('iron-pages');
            var tabs = document.querySelector('paper-tabs');
       
            tabs.addEventListener('iron-select', function() { 
              scope.pageLoaded[pages.selected = tabs.selected] = true;
              setTimeout(function() {
                scope.$apply();
              }, 0);
            });
            
            scope.selectTab = function(index) {
              tabs.selected = index;
            };
          }
        };
      });

  angular.element(document.body).ready(function() {
    angular.bootstrap(document.body, ['AppModule']);
  });
});

require(['order_app']);
