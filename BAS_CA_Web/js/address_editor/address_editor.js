define('address_editor/address_editor', ['services', 'utils'], function() {
  return angular.module('AddressEditorModule', ['ServicesModule',
      'UtilsModule']).directive('addressEditor', function(rpc, utils) {
    return {
      scope: {
        editing: '@',
        user: '=',
        withContact: '@',
      },
      link: function(scope) {
        scope.countryLabels = window.countryData.getCountryMap();
        scope.$watch('user', function() {
          if(!scope.user) return;
          scope.setupAddressLists(scope.user);
        });

        scope.setupAddressLists = function(user) {
          scope.countries = utils.keys(scope.countryLabels);
          
          scope.onCountryChange(user);
        };
        
        scope.onCountryChange = function(user) {
          var index = window.countryData.getCountryIndex(user.country);
          scope.stateMap = window.countryData.getStates(index);
          scope.states = utils.keys(scope.stateMap);

          utils.setCountryLabels(user);
        };
        
        scope.lookup = function() {
          var user = scope.user;
          rpc.lookup(user.zip).then(function(results) {
            if (!results) return;

            var address = 
                window.countryData.fromGoogleResults(user.zip, results);            
            user.city = address.city;
            user.country = address.countryCode;
            user.state = address.stateIndex; 
          });
        };
        
        scope.$watch('user.country', function() {
          if (scope.user) scope.onCountryChange(scope.user);
        });
        scope.$watch('user.state', function() {
          if (scope.user) utils.setCountryLabels(scope.user);
        });
      },

      templateUrl : 'js/address_editor/address_editor.html?tag=201806141132'
    };
  });
});
