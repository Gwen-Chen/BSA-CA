define('flying/flying', [], function() {
  return angular.module('FlyingModule', [])
      .directive('flyingTo', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element = element[0];

        var step, steps = 10;
        var destination = JSON.parse(attrs.flyingTo);
        var origin = {x: element.offsetLeft, y: element.offsetTop};
        var current = {};
        var delta = {
            x: Math.floor((destination.x - origin.x) / steps),
            y: Math.floor((destination.y - origin.y) / steps)
        };
        function distance2(a, b) {
          return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
        }
        function move() {
          current.x += delta.x;
          current.y += delta.y;
          if (step++ < steps) {
            element.style.left = '' + current.x + 'px';
            element.style.top = '' + current.y + 'px';
            setTimeout(move, 50);
          } else {
            element.style.position = '';
            element.style.left = '';
            element.style.top = '';
          }
        } 
        element.onclick = function() {
          step = 0;
          current.x = origin.x;
          current.y = origin.y;
          element.style.position = 'absolute';
          setTimeout(move, 50);
        };
      }
    };
  });
});
