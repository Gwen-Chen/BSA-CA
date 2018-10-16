define('checkbox_filter/checkbox_filter', [
    'utils'], function() {
  return angular.module('CheckboxFilterModule', [
      'UtilsModule']).directive('checkboxFilter',
          function($rootScope, rpc, utils) {
      return {
        scope: {
          options: '=',
          selectionChanged: '&'
        },
        templateUrl : 'js/checkbox_filter/checkbox_filter.html'
      };
    });
});
