'use strict'

angular.module('remonit')

.directive('statsEditor', function() {
  return {
    scope: {
      stats: '=statsEditor'
    },
    templateUrl: 'statsEditor.html',

    controller: ['$scope', function($scope) {
      $scope.removeStats = function(name) {
        if (name in $scope.stats) {
          if (confirm('Are you sure to remove stats "' + name + '"?')) {
            var field = {}
            field[name] = ''
            Stats.update($scope.stats._id, {$unset: field})
          }
        }
      }
    }]
  }
})
