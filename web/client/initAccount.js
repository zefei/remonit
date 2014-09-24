'use strict'

angular.module('remonit')

.factory('initAccount', ['$rootScope', '$autorun', 'node', 'os',
  function($rootScope, $autorun, node, os) {
  return function(user) {
    $rootScope.newAccount = false

    if (node) {
      var Monitors = new PouchDB(user._id + '/monitors')
      var monitorTemplates = {
        mac: ['diskMac', 'loadMac', 'topCpuMac', 'topMemoryMac', 'logMac', 'datetime'],
        linux: ['diskLinux', 'loadLinux', 'topCpuLinux', 'topMemoryLinux', 'logLinux', 'datetime'],
        win: ['diskWin', 'loadWin', 'topMemoryWin', 'datetime']
      }

      _.each(monitorTemplates[os], function(template) {
        Monitors.post(new Monitor(template, true))
      })
    }

    Meteor.call('dashboards', function(err, result) {
      var dashboard = result[0]
      var monletTemplates = {
        mac: ['time', 'date', 'loadTitle', 'loadUnix', 'diskTitle', 'disk', 'topCpu', 'topMemory'],
        linux: ['time', 'date', 'loadTitle', 'loadUnix', 'diskTitle', 'disk', 'topCpu', 'topMemory'],
        win: ['time', 'date', 'loadTitle', 'loadWin', 'diskTitle', 'disk', 'topWin']
      }

      _.each(monletTemplates[os], function(template) {
        Monlets.insert(new Monlet(user, template, dashboard))
      })

      if (os !== 'win') {
        var screen = Dashboards.addScreen(dashboard)
        Monlets.insert(new Monlet(user, 'logfile', dashboard, screen))
      }
    })
  }
}])
