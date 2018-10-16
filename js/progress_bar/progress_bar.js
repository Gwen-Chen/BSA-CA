define('progress_bar/progress_bar', function() {
  return angular.module('ProgressBarModule', [])
    .directive('progressBar', function() {
      return {
        scope: {
          max: '@',
          value: '@'
        },
        templateUrl: 'js/progress_bar/progress_bar.html'
      };
    });
});
