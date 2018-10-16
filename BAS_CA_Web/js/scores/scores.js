define('scores/scores', ['services', 
    'utils',
    'zb_sync_button/zb_sync_button'], function() {

  return angular.module('ScoresModule', ['ServicesModule',
      'UtilsModule', 'ZBSyncButtonModule'])
        .directive('scores', function(rpc, utils) {
      return {
        scope: {
          classId: '@'
        },
        restrict: 'E',
        link: function(scope) {
          scope.types = utils.examLabels;

          scope.$watch('classId', function(classId) {
            if (!classId) return;

            rpc.get_users(null, classId).then(function(response) {
              scope.users = response.data;

              rpc.get_scores(classId).then(function(response) {
                utils.forEach(scope.users, function(user) {
                  var score = response.data[user.id];
                  if (!score) return;

                  score.type1 = parseInt(score.type1) || 0;
                  score.type2 = parseInt(score.type2) || 0;
                  score.score1 = parseInt(score.score1) || 0;
                  score.score2 = parseInt(score.score2) || 0;
                  
                  utils.mix_in(user, score);
                });
              });
            });
          });
          scope.save = function(user) {
            var score = {
              user_id: user.id,
              type1: user.type1 || 0,
              score1: user.score1 || '',
              type2: user.type2 || 0,
              score2: user.score2 || ''
            };
            rpc.update_scores(score).then(function(response) {
              if (!response.data.updated) {
                alert(response.data.error);
              } else {
                scope.selectedUser = null;
              }
            });
          };
          scope.select = function(user, $index) {
            scope.selectedUser = user;
            scope.selectedTop = $index * 28;
          };
          scope.selectedTop = 0;
        },
        templateUrl : 'js/scores/scores.html?tag=201705122003'
      };
    });
});
