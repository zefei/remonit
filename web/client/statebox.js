'use strict'

angular.module('statebox', [])

.directive('statebox', ['$parse', function($parse) {
  return {
    scope: true,
    controller: ['$scope', '$attrs', function($scope, $attrs) {
      var states, value = $parse($attrs.statebox)($scope)
      if (angular.isObject(value)) {
        states = value
      } else {
        states = {undefined: value}
      }

      $scope.statebox = function(name) {
        var state = {
          set: function(value) {
            states[name] = value
          },

          get: function() {
            return states[name]
          },

          is: function(value) {
            return state.get() === value
          },

          toggle: function() {
            states[name] = !states[name]
          },

          loop: function() {
            var args = arguments
            if (args.length === 1 && angular.isArray(args[0])) {
              args = args[0]
            }

            var i
            for (i = 0; i < args.length; i++) {
              if (state.is(args[i])) break
            }
            i++
            if (i >= args.length) i = 0

            state.set(args[i])
          }
        }

        return state
      }

      $scope.sb = $scope.statebox()
    }]
  }
}])
