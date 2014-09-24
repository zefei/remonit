'use strict'

angular.module('remonit')

.directive('signin', ['$rootScope', '$autorun', function($rootScope, $autorun) {
  return {
    scope: true,
    templateUrl: 'signin.html',
    replace: true,
    controller: ['$scope', function($scope) {
      function reset() {
        $scope.email = ''
        $scope.password = ''
        $scope.error = ''
        $scope.registering = false
      }
      reset()

      $scope.signin = function() {
        Meteor.loginWithPassword($scope.email, $scope.password, function(err) {
          if (err) {
            if (err.error === 400 || err.error === 403) {
              $scope.error = 'incorrect combo'
            } else {
              $scope.error = 'signing in failed'
            }
          } else {
            reset()
          }
        })
      }

      $scope.register = function() {
        if ($scope.email && $scope.password) {
          Accounts.createUser({email: $scope.email, password: $scope.password}, function(err) {
            if (err) {
              if (err.error === 400) {
                $scope.error = 'email is invalid'
              } else if (err.error === 403) {
                $scope.error = 'email already exists'
              } else {
                $scope.error = 'creating account failed'
              }
            } else {
              $rootScope.newAccount = true
              reset()
            }
          })
        } else {
          $scope.error = 'need valid email and password'
        }
      }

      $scope.submit = function() {
        if ($scope.registering) {
          $scope.register()
        } else {
          $scope.signin()
        }
      }

      $scope.toggleMode = function() {
        $scope.error = ''
        $scope.password = ''
        $scope.registering = !$scope.registering
      }

      $autorun($scope, function() {
        $scope.loggingIn = Meteor.loggingIn()
      })
    }]
  }
}])
