define('time/time', [], function() {
  return angular.module('TimeModule', [])
    .directive('time', function() {
      return {
        require: 'ngModel',
        restrict: 'A',
        link: function(scope, elements, attrs, ngModel) {
          ngModel.$formatters.push(function(timestring) {
            if (!timestring) return null;
            var parts = timestring.split(':');
            return new Date(0, 0, 0, parseInt(parts[0]), parseInt(parts[1]));
          });

          ngModel.$parsers.push(function(date) {
            var min = date.getMinutes();
            if (min < 10) min = '' + min + '0';
            return '' + date.getHours() + ':' + min + ':00';
          });
        }
      };
    });
});
