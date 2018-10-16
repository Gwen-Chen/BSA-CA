define('import_dialog/import_dialog', ['importers', 'utils'], function() {
  return angular.module('ImportDialogModule',
      ['ImportersModule', 'UtilsModule'])
      .directive('importDialog', function(importers, utils) {
        return {
          scope: {
            file: '=',
            show: '='
          },
          link: function($scope, element, attributes) {
            $scope.page = -1;

            $scope.result = {
              records: [],
              skipped: []
            };

            var importer = attributes.importer + 'Importer';

            $scope.analyze = function() {
              var reader = new FileReader();

              $scope.openDialog('analysis');
              reader.onload = function(event) {
                var text = event.target.result;

                importers[importer].analyze(text, $scope.progress, $scope);
              };

              reader.readAsText($scope.file, 'UTF-8');
            };
            
            $scope.preview = function() {
              $scope.processed = 0;
              $scope.changed = 0;
              importers[importer].diff($scope.result.records, $scope.progress); 
              $scope.openDialog('preview');
            };
            
            $scope.submit = function() {
              $scope.processed = 0;
              $scope.submitted = 0;
              $scope.errors = 0;
              $scope.ignored = utils.count($scope.result.records,
                  function(record) {
                return !record.checked;
              });
              
              importers[importer].submit($scope.result.records,
                  $scope.progress);
              $scope.openDialog('submit');
            };
            
            $scope.progress = function(value, max, record, result) {
              $scope.processed = value;
              $scope.max = max;
              if (record) {
                if (record.changed) $scope.changed++;
                if (record.submitted) $scope.submitted++;
                else $scope.errors++;
              }

              if (result) $scope.result = result;
              return true;
            };
            
            $scope.diffType = function(record, key) {
              if (!record.oldData) return 'diff-added';
              return record.oldData.hasOwnProperty(key) ?
                  'diff-modified' : 'diff-identical';
            };

            $scope.$watch('show', function() {
              if (!$scope.show) return;
              $scope.openDialog('selector');
              setTimeout(function() {
                $scope.show = false;
                $scope.$apply();
              }, 0);
            });
            
            $scope.openDialog = function(id) {
              document.querySelector('#' + id).open();
            };
            
            $scope.toggleAll = function() {
              $scope.result.records.forEach(function(record) {
                if (record.changed) record.checked = !record.checked;
              });
            };
            
            $scope.refresh = utils.refresh;
          },
          templateUrl : 'js/import_dialog/import_dialog.html'
        };
      }).directive('file', function() {
        return {
          scope: {
            file: '='
          },
          link: function($scope, element) {
            element.bind('change', function(event){
              $scope.file = event.target.files[0];
              $scope.$apply();
            });
          }
        };
      });
});
