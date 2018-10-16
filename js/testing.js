require.config({
  paths : {
    'angular-mocks': 'angular-mocks/angular-mocks',
    'jasmine' : '../jasmine/lib/jasmine-2.4.1/jasmine',
    'jasmine-html' : '../jasmine/lib/jasmine-2.4.1/jasmine-html',
    'boot' : '../jasmine/lib/jasmine-2.4.1/boot',
    'spec' : '../jasmine/spec'
  },
  shim : {
    'jasmine' : {
      exports : 'window.jasmineRequire'
    },
    'jasmine-html' : {
      deps : [ 'jasmine' ],
      exports : 'window.jasmineRequire'
    },
    'boot' : {
      deps : [ 'jasmine', 'jasmine-html' ],
      exports : 'window.jasmineRequire'
    }
  }
});

require(['text', 'boot'], function() {
  var specs = ['testing/user_editor_test'];

  require(specs, function() {
    window.onload();
  });
});
