'use strict'

angular.module('remonit')

.controller('Dashboard', ['$scope', '$location', '$swipe', 'useResource',
  function($scope, $location, $swipe, useResource) {
    $scope.controller = 'dashboard'

    useResource($scope, 'dashboard', 'monlets', 'stats')

    var moved = false
    var showUI = false

    $swipe.bind($('.dashboard-container'), {
      start: function() {
        moved = false
      },

      move: function() {
        moved = true
      },

      end: function() {
        if (moved) return
        showUI = !showUI
        if (showUI) {
          $('.dashboard-topbar').fadeIn()
          $('.rn-carousel-indicator').fadeIn()
        } else {
          $('.dashboard-topbar').fadeOut()
          $('.rn-carousel-indicator').fadeOut()
        }
      }
    })

    $scope.index = 0

    $scope.$watch('dashboard.screens', function(screens) {
      var len = _.size(screens)
      if ($scope.index >= len && len > 0) {
        $scope.index = len - 1
      }
    })

    $('body').on('keydown', function(ev) {
      if (ev.keyCode === 27) {
        $scope.$apply(function() {
          $location.url('/designer')
        })
      }

      if (ev.keyCode === 37 || ev.keyCode === 38) {
        $scope.$apply(function() {
          $scope.index--
          if ($scope.index < 0) $scope.index = 0
        })
      }

      var len = _.size($scope.dashboard.screens)
      if (ev.keyCode === 39 || ev.keyCode === 40) {
        $scope.$apply(function() {
          $scope.index++
          if ($scope.index >= len) $scope.index = len - 1
        })
      }
    })

    $('.dashboard-help').on('click', function() {
      $('.dashboard-help').fadeOut()
    })

    setTimeout(function() {
      $('.dashboard-help').fadeOut()
    }, 3000)
  }
])
