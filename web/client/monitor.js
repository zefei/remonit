'use strict'

angular.module('remonit')

.controller('Monitor', ['$scope', 'useResource', 'monitorCtrl', 'serverCtrl',
  function($scope, useResource, monitorCtrl, serverCtrl) {
    $scope.controller = 'monitor'

    if (!$scope.node) return

    useResource($scope, 'stats')

    $scope.selectNone = function() {
      Session.set('selectedMonitor', false)
      Session.set('selectedServer', false)
    }

    monitorCtrl($scope)
    serverCtrl($scope)
  }
])
