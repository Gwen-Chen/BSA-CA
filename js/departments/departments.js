define('departments/departments', ['services', 'utils'], function() {
	return angular.module('DepartmentsModule', ['ServicesModule', 'UtilsModule'])
		.directive('departments', function(rpc, utils) {
			return {
			  scope: {
			    departmentId: '=',
			    onChange: '&'
			  },
			  link: function(scope) {
			    scope.selected = {
			      id: parseInt(scope.departmentId)
			    };
	        rpc.get_departments().then(function(response) {
	          scope.departments = response.data;
	          scope.depIds = utils.map(utils.keys(scope.departments), parseInt);
	        });
	        scope.update = function() {
	          scope.departmentId = scope.selected.id;
	          if (scope.onChange) {
	            scope.onChange({department: scope.departmentId});
	          }
	        };
	        scope.$watch('departmentId', function(id) {
	          scope.selected.id = parseInt(id);
	        });
			  },
				templateUrl : 'js/departments/departments.html'
			};
		});
});
