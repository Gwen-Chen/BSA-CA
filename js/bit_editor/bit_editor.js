define('bit_editor/bit_editor', ['utils'], function() {
  return angular.module('BitEditorModule', ['UtilsModule'])
      .directive('bitIndex', function(utils) {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function(scope, element, attrs, ngModel) {
        var index = attrs.bitIndex;
        
        ngModel.$formatters.push(function(bits) {
          return utils.isBitSet(bits, index);
        });
        ngModel.$parsers.push(function(boolValue) {
          var bits = ngModel.$modelValue;
          return boolValue ? utils.setBit(bits, index)
              : utils.clearBit(bits, index);
        });
      }
    };
  });
});
