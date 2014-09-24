'use strict'

angular.module('remonit')

.factory('monitorCtrl', ['$autorun', 'compileTemplate', 'throttledUpdate', 'os',
  function($autorun, compileTemplate, throttledUpdate, os) {
    return function($scope) {
      function selectMonitor(id) {
        Session.set('selectedMonitorId', id)
        Session.set('selectedMonitor', true)
        Session.set('selectedServer', false)
      }

      $scope.addMonitor = function(type) {
        Monitors.post(new Monitor(type), function(err, result) {
          selectMonitor(result.id)
        })
      }

      $scope.selectMonitor = function(monitor) {
        selectMonitor(monitor._id)
      }

      $scope.isSelectedMonitor = function(monitor) {
        return Session.get('selectedMonitor') &&
               Session.get('selectedMonitorId') === monitor._id
      }

      $scope.locationText = function(monitor) {
        if (monitor.location === '<local>') {
          return '<local>'
        } else {
          var server = _.find($scope.servers, function(server) {
            return server._id === monitor.location
          })

          if (server) {
            return server.name
          } else {
            return '<removed>'
          }
        }
      }

      $scope.locationOptions = function() {
        var options = [['<local>', '<local>']]
        var servers = _.map($scope.servers, function(server) {
          return [server._id, server.name]
        })

        return options.concat(servers)
      }

      $scope.isUniqueMonitorName = function() {
        if (!$scope.monitor) return true
        var count = _.filter($scope.monitors, function(monitor) {
          return monitor.name === $scope.monitor.name
        }).length
        return count <= 1
      }

      $scope.isValidMonitorName = function() {
        if (!$scope.monitor) return true
        return !_.contains($scope.constants.reservedNames, $scope.monitor.name)
      }

      var updateMonitor = throttledUpdate(Monitors, $scope, 'monitor')

      $scope.updateMonitor = function() {
        if (!$scope.monitor) return
        $scope.monitor.enabled = false
        updateMonitor()
      }

      $scope.startMonitor = function() {
        if (!$scope.monitor) return
        $scope.monitor.enabled = true
        updateMonitor()
      }

      $scope.startAllMonitors = function() {
        _.each($scope.monitors, function(monitor) {
          monitor.enabled = true
          Monitors.$save(monitor)
        })
      }

      $scope.stopMonitor = function() {
        if (!$scope.monitor) return
        $scope.monitor.enabled = false
        updateMonitor()
      }

      $scope.stopAllMonitors = function() {
        _.each($scope.monitors, function(monitor) {
          monitor.enabled = false
          Monitors.$save(monitor)
        })
      }

      $scope.removeMonitor = function() {
        if (!$scope.monitor) return
        var name = $scope.monitor.name
        if (confirm('Are you sure to remove monitor "' + name + '"?')) {
          if ($scope.isValidMonitorName() && name in $scope.stats) {
            var field = {}
            field[name] = ''
            Stats.update($scope.stats._id, {$unset: field})
          }

          Monitors.$remove($scope.monitor)
          Session.set('selectedMonitor', false)
        }
      }

      $scope.addMonitorPopover = {
        html: true,
        placement: 'bottom',
        content: compileTemplate('addMonitorPopover.html', $scope),
        container: 'body'
      }

      $scope.codemirrorOptions = {
        mode: 'javascript',
        lineWrapping: true,
        extraKeys: {
          Tab: function(cm) {
            cm.replaceSelection('  ', 'end');
          }
        }
      }

      $scope.isWin = os === 'win'

      var autorun
      $scope.$watch('monitors', function() {
        if (autorun) autorun.stop()
        autorun = $autorun($scope, function() {
          $scope.monitor = _.find($scope.monitors, function(monitor) {
            return Session.get('selectedMonitorId') === monitor._id
          })

          if ($scope.monitor) {
            $scope.console = $scope.consoles[$scope.monitor._id] || {}
          }
        })
      })
    }
  }
])
