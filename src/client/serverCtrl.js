'use strict'

angular.module('remonit')

.factory('serverCtrl', ['$autorun', 'throttledUpdate',
  function($autorun, throttledUpdate) {
    return function($scope) {
      function selectServer(id) {
        Session.set('selectedServerId', id)
        Session.set('selectedServer', true)
        Session.set('selectedMonitor', false)
      }

      $scope.addServer = function() {
        Servers.post(new Server(), function(err, result) {
          selectServer(result.id)
        })
      }

      $scope.selectServer = function(server) {
        selectServer(server._id)
      }

      $scope.isSelectedServer = function(server) {
        return Session.get('selectedServer') &&
               Session.get('selectedServerId') === server._id
      }

      $scope.serverStatus = function(server) {
        if (server && server.enabled && $scope.connections[server._id]) {
          switch ($scope.connections[server._id].status) {
            case 'connecting': return ['connecting', 'blue']
            case 'error': return ['waiting (error)', 'red']
            case 'disconnected': return ['waiting (disconnected)', 'yellow']
            case 'connected': return ['connected', 'green']
          }
        } else {
          return ['disconnected', 'gray']
        }
      }

      $scope.isUniqueServerName = function() {
        if (!$scope.server) return true
        var count = _.filter($scope.servers, function(server) {
          return server.name === $scope.server.name
        }).length
        return count <= 1
      }

      var updateServer = throttledUpdate(Servers, $scope, 'server')

      $scope.updateServer = function() {
        if (!$scope.server) return
        $scope.server.enabled = false
        updateServer()
      }

      $scope.connectServer = function() {
        if (!$scope.server) return
        $scope.server.enabled = true
        updateServer()
      }

      $scope.connectAllServers = function() {
        _.each($scope.servers, function(server) {
          server.enabled = true
          Servers.$save(server)
        })
      }

      $scope.disconnectServer = function() {
        if (!$scope.server) return
        $scope.server.enabled = false
        updateServer()
      }

      $scope.disconnectAllServers = function() {
        _.each($scope.servers, function(server) {
          server.enabled = false
          Servers.$save(server)
        })
      }

      $scope.removeServer = function() {
        if (!$scope.server) return
        var name = $scope.server.name
        if (confirm('Are you sure to remove server "' + name + '"?')) {
          _.each($scope.monitors, function(monitor) {
            if (monitor.location === $scope.server._id) {
              monitor.enabled = false
              Monitors.$save(monitor)
            }
          })

          Servers.$remove($scope.server)
          Session.set('selectedServer', false)
        }
      }

      var autorun
      $scope.$watch('servers', function() {
        if (autorun) autorun.stop()
        autorun = $autorun($scope, function() {
          $scope.server = _.find($scope.servers, function(server) {
            return Session.get('selectedServerId') === server._id
          })
        })
      })
    }
  }
])
