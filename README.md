# 1506class

Database Design (out of date)
---------------
[Database structure](https://docs.google.com/document/d/1SACT2kfJpqAU_GyAZNAFLb-LTRKl3gU1wRCzh0vSRVQ/edit?usp=sharing)

[Access control](https://docs.google.com/document/d/1NxK2zozyfGPyECCN5seXgqHlCDPok4f0kDeiv4VNpAo/edit?usp=sharing)

Backend Overview
----------------
### Dependencies

[MySQL](https://www.mysql.com/) is used as the database.

[PHP](https://secure.php.net/) is used to handle client requests.

[Medoo](http://medoo.in/), "The lightest PHP database framework" is used to access the database.

### Usage of PHP
PHP is only used to handle requests, but not to render contents. That is, HTML are rendered from the client side instead of mixed with the PHP tags. This makes the code look clean and more readable.

As a result, the server code is really thin thus easy to be replaced (If you prefer a different language, just rewrite it).

Fontend Overview
----------------
### Dependencies
[RequireJS](http://requirejs.org/) is used to dynamically load JavaScript files on demand.

[AngularJS](https://angularjs.org/) is used to handle events and to define [custom directives](https://docs.angularjs.org/guide/directive). With the custom directives the page is built by blocks and looks really simple and clean, like:

```html
<iron-pages selected="0">
    <div>
		<tasks class="left" ng-controller="TasksController"></tasks>
		<schedule-tasks class="left" ng-controller="ScheduleTasksController"></schedule-tasks>
    </div>
    <div>
    	<div class="center">
	    	<h1>个人信息</h1>
	    	<user ng-controller="UserController"></user>
    	</div>
	</div>
</iron-pages>
```


Also [Polymer](https://www.polymer-project.org/1.0/) is used as a widget library.

### Module management and custom directives
[RequireJS](http://requirejs.org/) and [AngularJS](https://angularjs.org/) are used to define modules and separate the application to small pieces. However [RequireJS](http://requirejs.org/) is really not used since all JavaScript files are always combined to a single one to reduce HTTP requests. So every time a JavaScript file is modified please run 'aggregate.sh' to re-generate the combined single JavaScript file (admin.js or index.js).

A typical directive (or component if you prefer this name) looks like:

```JavaScript
define(['services'], function() {
	return angular.module('UserModule', ['ServicesModule'])
		.controller('UserController', function($scope, rpc) {
			$scope.$on('user-loaded', function(event, user) {
				$scope.user = user;
			});
		})
		.directive('user', function() {
			return {
				templateUrl : 'js/user/user.html'
			};
		});
});`
```

And with custom directives HTML code is separated from JavaScript as templates:
```html
<div class="padded-element white user-info">
	<div class="section">
		<div class="css-table">
			<div class="css-table-row padded-element">
				<div class="css-table-cell">姓名</div>
				<div class="css-table-cell">{{user.name}}</div>
				<div class="css-table-cell">
					<iron-icon class="selectable" icon="chevron-right"></iron-icon>
				</div>					
			</div>
			<div class="css-table-row padded-element">
				<div class="css-table-cell">性别</div>
				<div class="css-table-cell">{{user.sex == '1' ? '男' : '女'}}</div>
				<div class="css-table-cell">
					<iron-icon class="selectable" icon="chevron-right"></iron-icon>
				</div>					
			</div>
			<div class="css-table-row padded-element">
				<div class="css-table-cell">地址</div>
				<div class="css-table-cell">{{user.street}}</div>
				<div class="css-table-cell">
					<iron-icon class="selectable" icon="chevron-right"></iron-icon>
				</div>					
			</div>
		</div>
	</div>
</div>
```

Getting started to contribute
-----------------------------
### Environment setup
1. Install an [Apache](http://www.apache.org/) server if you don't have one. On some systems like Linux or Mac an Apache server might be pre-installed. Setup ([Mac](https://discussions.apple.com/docs/DOC-3083)) and launch it.
2. Install [PHP](https://secure.php.net/) and [MySQL](https://www.mysql.com/). Modify your Apache configuration to enable PHP and MySQL. Restart Apache if necessary ([Mac](https://discussions.apple.com/docs/DOC-3082)). Edit php.ini to enable the following two lines:
```ini
extension=php_mysqli.dll
extension=php_pdo_mysql.dll
```
Export a 'sql' file from the server's [mysql admin page](/phpmyadmin/). Import to your local mysql database using any mysql client.
3. Install a [github](https://github.com) client or command line tool.
4. Install any IDE like [Eclipse](http://www.eclipse.org).
5. Download the code using your github client, put it under your Apache's web home directory, e.g. '/Users/xipanxiao/Sites'.
6. Find the 'data' directory from the root directory of the source code, find 'config.php', modify the MySQL connection information based on your setup.
7. Run 'aggregate.sh' then browse to the path of 'index.html', e.g. 'http://localhost/~xipanxiao/buddcoursesdev/index.html'.
8. Open [issues](https://github.com/XipanXiao/1506class/issues).
9. Create a 'pull request' using your github client. Inform me to review your code.

### Backup and restore
The system automatically backups a snapshot of the database under ~/app-root/data everyday of the week. So there are 7 backups under that folder named like "buddcourses_[0-6].sql". The files are also copied to /tmp. Whenever you run "git push" to update the server the backups under ~/app-root/data will be deleted! Be sure to make a manual backup (export from phpmyadmin) before running "git push".