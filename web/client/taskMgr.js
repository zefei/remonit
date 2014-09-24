'use strict'

angular.module('remonit')

.run(['$rootScope', 'node', function($rootScope, node) {
  if (!node) return

  var process = require('child_process')
  var scope = $rootScope
  var sandboxes = scope.tasks = {}
  var consoles = scope.consoles = {}

  scope.$watch('monitors', function(monitors) {
    addConsoles(monitors)
    addRunningMonitors(monitors)
    removeStoppedMoinitors(monitors)
  }, true)

  function addConsoles(monitors) {
    _.each(monitors, function(monitor) {
      var id = monitor._id
      var existed = id in consoles
      if (!existed) consoles[id] = new Console(scope)
    })
  }

  function addRunningMonitors(monitors) {
    _.each(monitors, function(monitor) {
      var id = monitor._id
      var existed = id in sandboxes

      if (monitor.enabled && !existed) {
        consoles[id].clear()
        sandboxes[id] = new Sandbox(consoles[id])
        .inject('require', require)
        .inject('$return', function(obj) {
          if (_.contains(scope.constants.reservedNames, monitor.name)) return
          if (scope.stats && !_.isEqual(scope.stats[monitor.name], obj)) {
            scope.stats[monitor.name] = obj
            Stats.$save(scope.stats, monitor.name)
          }
        })
        .inject('$exec', getExec(monitor, consoles[id]))
        .run(monitor.code, monitor.frequency * 1000)
      }
    })
  }

  function removeStoppedMoinitors(monitors) {
    _.each(sandboxes, function(sandbox, id) {
      var existed = _.find(monitors, function(monitor) {
        return monitor._id === id && monitor.enabled
      })

      if (!existed) {
        sandbox.stop()
        delete sandboxes[id]
      }
    })
  }

  function cbWrapper(fn, console) {
    return function() {
      try {
        return(fn.apply(this, arguments))
      } catch(e) {
        console.error(e)
      }
    }
  }

  function getExec(monitor, console) {
    if (monitor.location === '<local>') {
      return function(command, callback) {
        process.exec(command, cbWrapper(callback, console))
      }
    } else {
      return function(command, callback) {
        var conn = scope.connections[monitor.location]
        if (conn) conn.exec(command, cbWrapper(callback, console))
      }
    }
  }
}])
