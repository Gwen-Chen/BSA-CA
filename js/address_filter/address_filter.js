define('address_filter/address_filter', [
    'services',
    'utils'], function() {
  return angular.module('AddressFilterModule', [
      'ServicesModule',
      'UtilsModule']).directive('addressFilter',
          function($rootScope, rpc, utils) {
      return {
        scope: {
          country: '=',
          state: '='
        },
        link: function(scope) {
          var worldData = window.countryData;
          scope.countries = worldData.countries;
          scope.countryIndexes = utils.keys(scope.countries);

          scope.countryChanged = function() {
            var countryIndex = scope.localGroup.countryIndex;
            if (!countryIndex) return;

            var stateLabels = worldData.getStates(countryIndex);
            var countryCode = scope.getCountryCode();
            rpc.get_state_stats(countryCode).then(function(response) {
              scope.states = {};
              for (var index in response.data) {
                scope.states[index] = {
                  index: index,
                  label: stateLabels[index],
                  checked: index == scope.state,
                  students: response.data[index]
                };
              }
              if (scope.state) {
                scope.stateSelected(scope.states[scope.state]);
              }
            });
          };

          scope.getCountryCode = function() {
            return worldData.getCountryCode(scope.localGroup.countryIndex);
          };
          
          scope.stateSelected = function(state) {
            if (!state.checked || state.cities) {
              scope.reloadUsers();
              if (state.checked) {
                scope.locateUser();
              }
              return;
            }
            
            var countryCode = scope.getCountryCode();
            rpc.get_state_users(countryCode, state.index).then(function(resp) {
              state.cityKeys = [];
              state.cities = {};
              resp.data.forEach(function(user) {
                var key = (user.city || '').toLowerCase().trim();
                var city = state.cities[key];
                if (!city) {
                  city = {
                    label: user.city,
                    users: [],
                    checked: true
                  };
                  state.cities[key] = city;
                  state.cityKeys.push(key);
                }
                city.users.push(user);
              });
              state.cityKeys.sort();
              scope.reloadUsers();
              scope.locateUser();
            });
          };
          
          scope.reloadUsers = function() {
            $rootScope.$broadcast('users-selected', scope.collectUsers());
          };
          
          scope.collectUsers = function() {
            var states = utils.where(scope.states, function(state) {
              return state.checked;
            });
            var getCities = function(state) {
              return utils.where(state.cities, function(city) {
                return city.checked;
              });
            };
            return utils.fold(states, function(state, users) {
              var cities = getCities(state);
              return utils.fold(cities, function(city, users) {
                return users.concat(city.users);
              }, users);
            }, []);
          };

          scope.$watch('country', function() {
            if (!scope.country) return;

            scope.localGroup = {
              countryIndex: window.countryData.getCountryIndex(scope.country)
            };
            scope.countryChanged();
          });

          scope.$on('editing-user-changed', function(event, editingUser) {
            scope.editingUser = editingUser;
            scope.locateUser();
          });
          
          scope.locateUser = function() {
            var editingUser = scope.editingUser;
            if (!editingUser) return;

            if (editingUser.country != scope.country) {
              scope.country = editingUser.country;
              return;
            }
            var state = scope.states[editingUser.state];
            if (state.checked) return;

            state.checked = true;
            scope.stateSelected(state);
          };
          
          scope.selectCities = function(state, options) {
            if (!options.none && !options.invert) return;
            utils.forEach(state.cities, function(city) {
              city.checked = options.none ? false : !city.checked;
            });
            scope.reloadUsers();
          };
        },
        templateUrl : 'js/address_filter/address_filter.html'
      };
    });
});
