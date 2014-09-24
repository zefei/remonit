// manages ssh2 instances, watching $rootScope.servers
//
'use strict'

angular.module('remonit')

.run(['$rootScope', '$timeout', 'node', function($rootScope, $timeout, node) {
  if (!node) return

  var scope = $rootScope
  var connections = scope.connections = {}
  var ssh = require('ssh2')
  var wait = scope.constants.reconnectWait

  scope.$watch('servers', function(servers) {
    addEnabledServers(servers)
    removeDisabledServers(servers)
  }, true)

  function addEnabledServers(servers) {
    _.each(servers, function(server) {
      var id = server._id
      var existed = id in connections

      if (server.enabled && !existed) {
        connections[id] = new Connection(ssh, server, $timeout, wait)
        connections[id].connect()
      }
    })
  }

  function removeDisabledServers(servers) {
    _.each(connections, function(connection, id) {
      var existed = _.find(servers, function(server) {
        return server._id === id && server.enabled
      })

      if (!existed) {
        connection.end()
        delete connections[id]
      }
    })
  }
}])
