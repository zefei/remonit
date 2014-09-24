'use strict'

angular.module('remonit')

.directive('jsonViewer', ['compileTemplate', 'constants',
  function(compileTemplate, constants) {
    return {
      scope: {
        value: '=jsonViewer',
        name: '='
      },
      controller: ['$scope', '$element', function($scope, $element) {
        $element.html(compileTemplate('jsonViewer.html', $scope))

        var validName = /^[a-zA-Z_][a-zA-Z0-9_]*$/
        function normalize(name) {
          name = name.toString()
          if (!!name.match(validName)) {
            return name
          } else {
            return '[' + name + ']'
          }
        }

        $scope.click = function() {
          $scope.$emit('click', normalize($scope.name), $scope.value)
        }

        $scope.$on('click', function(ev, name, value) {
          if (ev.targetScope === ev.currentScope) return
          ev.stopPropagation()
          if (_.isUndefined($scope.name)) {
            $scope.$parent.$emit('jsonViewer:click', name, value)
          } else {
            $scope.$emit('click', normalize($scope.name) + '.' + name, value)
          }
        })

        var maxLength = 100
        $scope.truncate = function(string) {
          if (_.size(string) > maxLength) {
            return string.substring(0, maxLength) + '...'
          } else {
            return string
          }
        }

        $scope.getType = function() {
          var n = $scope.name, v = $scope.value
          var type

          if (_.isUndefined(n)) {
            type = 'unnamed'
          } else if (_.contains(constants.reservedNames, n)) {
            type = 'reserved'
          } else if (_.isObject(v)) {
            if (_.isEmpty(v)) {
              type = _.isArray(v) ? 'emptyArray' : 'emptyObject'
            } else {
              type = _.isArray(v) ? 'array' : 'object'
            }
          } else if (_.isString(v)) {
            type = 'string'
          } else if (_.isNumber(v)) {
            type = 'number'
          } else if (_.isBoolean(v)) {
            type = 'boolean'
          } else if (_.isNull(v)) {
            type = 'null'
          } else if (_.isUndefined(v)) {
            type = 'undefined'
          } else {
            type = 'unknown'
          }

          return type
        }
      }]
    }
  }
])
