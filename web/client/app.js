// main app entry
//
'use strict'

angular.module('remonit', [
  'ngRoute',
  'ngSanitize',
  'ngTouch',
  'ngAttr',
  'ui.bootstrap',
  'ui.codemirror',
  'colorpicker.module',
  'angular-carousel',
  'meteor',
  'pouchdb',
  'statebox'
])

.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/monitor', {templateUrl: 'monitor.html', controller: 'Monitor'})
    .when('/designer', {templateUrl: 'designer.html', controller: 'Designer'})
    .when('/dashboard', {templateUrl: 'dashboard.html', controller: 'Dashboard'})
    .when('/idle', {template: '', controller: 'Idle'})
    .otherwise({redirectTo: '/designer'})

    $locationProvider.html5Mode(true)
  }
])

// test if client is node-webkit or just browsers
.constant('node',
  typeof require === 'undefined' ?
  null : process.mainModule.exports
)

// node-webkit gui instance
.constant('gui',
  typeof require === 'undefined' ?
  null : require('nw.gui')
)

.constant('os',
  !!navigator.platform.match(/Mac/i) ?
  'mac' : (
    !!navigator.platform.match(/Win/i) ?
    'win' : (
      !!navigator.platform.match(/Linux/i) ?
      'linux' : 'unknown'
    )
  )
)

.factory('open', ['gui', function(gui) {
  return function(url) {
    if (gui) {
      gui.Shell.openExternal(url)
    } else {
      window.open(url,'_blank')
    }
  }
}])

// skip current anuglarjs digest cycle
.factory('safeApply', function() {
  return function(scope, fn) {
    setTimeout(function() {
      scope.$apply(fn)
    }, 0)
  }
})

.factory('compileTemplate', ['$compile', '$templateCache',
  function($compile, $templateCache) {
    return function(templateName, scope) {
      return $compile($templateCache.get(templateName))(scope)
    }
  }
])

.factory('throttledUpdate', ['constants', function(constants) {
  return function(collection, scope, model) {
    var fields = _.rest(arguments, 3)

    return _.debounce(function() {
      var args = [scope[model]].concat(fields)
      collection.$save.apply(collection, args)
    }, constants.rateLimit)
  }
}])

.factory('useFont', ['constants', function(constants) {
  var fonts = ['Open Sans', 'Inconsolata']

  return function(font) {
    if (_.contains(fonts, font)) return
    $('head').append(constants.fontStyles[font][0])
  }
}])

.factory('getUrl', ['$location', function($location) {
  return function(locationChanger) {
    var oldUrl = $location.url()
    locationChanger($location)
    var newUrl = $location.absUrl()
    $location.url(oldUrl)
    return newUrl
  }
}])

// register reactive data sources
.factory('useResource', ['$autorun', function($autorun) {
  return function(scope) {
    var resources = _.rest(arguments, 1)
    _.each(resources, function(resource) {
      switch (resource) {
        case 'user':
        $autorun(scope, function() {
          scope.user = Meteor.user()
        })
        break

        case 'monlets':
        $autorun(scope, function() {
          Meteor.subscribe('monlets')
          scope.monlets = Monlets.find().fetch()
        })
        break

        case 'dashboard':
        $autorun(scope, function() {
          Meteor.subscribe('dashboards')
          scope.dashboard = Dashboards.findOne() || {}
          scope.config = scope.dashboard.config || {}
        })
        break

        case 'stats':
        $autorun(scope, function() {
          Meteor.subscribe('stats')
          scope.stats = Stats.findOne() || {}
        })
        break

        case 'monitors':
        $autorun(scope, function() {
          var id = Meteor.userId()
          if (id) {
            window.Monitors = new PouchDB(id + '/monitors')
            Monitors.bind(scope, 'monitors', {update: false})
          } else {
            window.Monitors = new PouchDB('null')
            scope.monitors = []
          }
        })
        break

        case 'servers':
        $autorun(scope, function() {
          var id = Meteor.userId()
          if (id) {
            window.Servers = new PouchDB(id + '/servers')
            Servers.bind(scope, 'servers', {update: false})
          } else {
            window.Servers = new PouchDB('null')
            scope.servers = []
          }
        })
        break
      }
    })
  }
}])

// init globals
.run(['$rootScope', 'useResource', 'constants', 'node', 'initAccount',
  function($rootScope, useResource, constants, node, initAccount) {
    useResource($rootScope, 'user')
    if (node) useResource($rootScope, 'monitors', 'servers')

    $rootScope.$watch('user', function(user) {
      if (user) {
        if ($rootScope.newAccount) initAccount(user)

        Meteor.call('stats', function(err, result) {
          $rootScope.stats = result[0]
        })
      } else {
        $rootScope.stats = {}
      }
    })

    $rootScope.constants = constants

    $rootScope.session = Session

    $rootScope.node = node
  }
])

// set up idle mode for node-webkit
.run(['$rootScope', '$location', 'node', 'safeApply',
  function($rootScope, $location, node, safeApply) {
    if (!node) return

    var url
    window.setIdle = function(idle) {
      if (idle) {
        if ($location.url() === '/idle') return
        url = $location.url()
        $location.url('/idle')
        $location.replace()
        safeApply($rootScope)
      } else {
        if ($location.url() !== '/idle') return
        if (!url || url === '/idle') url = '/designer'
        $location.url(url)
        $location.replace()
        safeApply($rootScope)
      }
    }

    node.ready()
  }
])

.controller('Idle', ['$scope', function($scope) {
  $scope.controller = 'idle'
}])
