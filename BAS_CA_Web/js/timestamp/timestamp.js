define('timestamp/timestamp', ['utils'], function() {
  return angular.module('TimestampModule', ['UtilsModule'])
    .directive('timestamp', function(utils) {
      return {
        require: 'ngModel',
        restrict: 'A',
        link: function(scope, elements, attrs, ngModel) {
          ngModel.$formatters.push(function(unixTimestamp) {
            return utils.toDateTime(unixTimestamp);
          });

          ngModel.$parsers.push(function(value) {
            return utils.unixTimestamp(value);
          });
        }
      };
    });
});
