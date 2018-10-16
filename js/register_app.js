require(["class_groups/class_groups", "classes/classes"], function() {
	angular.module('RegisterAppModule', ['ClassGroupsModule', 'ClassesModule']);

	angular.element(document).ready(function() {
		angular.bootstrap(document, ['RegisterAppModule']);
	});
});
