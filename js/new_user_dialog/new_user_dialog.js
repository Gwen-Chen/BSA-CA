define('new_user_dialog/new_user_dialog',
    ['importers', 'services', 'user_editor/user_editor'], function() {
  return angular.module('NewUserDialogModule', ['ImportersModule', 'ServicesModule',
      'UserEditorModule'])
    .directive('newUserDialog',
        function(importers, rpc) {
          return {
            scope: {
              refresh: '&'
            },
            link: function(scope) {
              scope.input = {};
              scope.user = null;

              scope.preview = function() {
                var text = scope.input.emailBody;
                if (!text) {
                  return;
                }

                var prepareTsv = function() {
                  var lines = text.split(/[\r\n]+/g);
                  var headers = [], values = [];
                  for (var row in lines) {
                    var line = lines[row];
                    var parts = line.split('：');
                    if (parts[0] && parts[1]) {
                      headers.push(parts[0].trim());
                      values.push(parts[1].trim());
                    }
                  }

                  return headers.join('\t') + '\n' + values.join('\t');
                };

                var callback = function (index, m, record, result) {
                  scope.user = (result.records && result.records[0]) || null;
                  if (!scope.user) {
                    if (text === scope.input.emailBody) {
                      text = prepareTsv();
                      scope.error = null;
                      importers.userImporter.analyze(text, callback, scope);
                    } else {
                      scope.error = 'Invalid input, check fields like emails.';
                    }
                  } else {
                    scope.user.entrance = (text === scope.input.emailBody
                        ? 1 : 2);
                  }
                  return false;
                };

                importers.userImporter.analyze(text, callback, scope);
              };
              
              scope.save = function() {
                rpc.update_user(scope.user).then(function(response) {
                  var submitted = (1 === response.data.updated);
                  if (submitted) {
                    document.getElementById('new-user-dlg').close();
                    scope.refresh();
                  } else {
                    scope.error = response.data.error;
                  }
                });
              };

              scope.reset = function() {
                scope.user = null;
                scope.error = null;
              };
            },
            templateUrl : 'js/new_user_dialog/new_user_dialog.html'
          };
        });
});

