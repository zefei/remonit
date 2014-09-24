'use strict'

angular.module('remonit')

.controller('Designer', [
  '$scope', '$autorun', 'compileTemplate', 'useResource', 'throttledUpdate', 'getUrl', 'open',
  function($scope, $autorun, compileTemplate, useResource, throttledUpdate, getUrl, open) {
    $scope.controller = 'designer'

    useResource($scope, 'dashboard', 'monlets', 'stats')

    $scope.selectNone = function() {
      Session.set('selectedMonlet', false)
      Session.set('selectedScreen', false)
    }

    $scope.addScreen = function() {
      var screen = Dashboards.addScreen($scope.dashboard)
      Session.set('selectedScreenId', screen)
      Session.set('selectedScreen', true)
      Session.set('selectedMonlet', false)

      setTimeout(function() {
        var board = $('.designer-dashboard')
        board.animate({scrollTop: board.prop('scrollHeight')})
      }, 0)
    }

    $scope.isStatsEmpty = function() {
      return _.isEmpty(_.omit($scope.stats, $scope.constants.reservedNames))
    }

    $scope.isFirstScreen = function() {
      var screen = Session.get('selectedScreenId')
      var screens = $scope.dashboard.screens
      return screen === _.first(screens)
    }

    $scope.isLastScreen = function() {
      var screen = Session.get('selectedScreenId')
      var screens = $scope.dashboard.screens
      return screen === _.last(screens)
    }

    $scope.isOnlyScreen = function() {
      var screens = $scope.dashboard.screens
      return _.size(screens) <= 1
    }

    $scope.moveScreen = function(direction) {
      var screen = Session.get('selectedScreenId')
      var screens = $scope.dashboard.screens
      var index = _.indexOf(screens, screen)
      var len = _.size(screens)

      if (direction < 0 && index > 0) {
        screens[index] = screens[index - 1]
        screens[index - 1] = screen
      } else if (direction > 0 && index < len - 1) {
        screens[index] = screens[index + 1]
        screens[index + 1] = screen
      } else {
        return
      }

      Dashboards.$save($scope.dashboard, 'screens')
    }

    $scope.removeScreen = function() {
      var warning = 'Are you sure to remove this screen?\n' +
                    'All monlets in this screen will be removed, too.'
      if (!confirm(warning)) return

      var screen = Session.get('selectedScreenId')
      var screens = $scope.dashboard.screens

      if (_.size(screens) <= 1) return
      $scope.dashboard.screens = _.without(screens, screen)

      Dashboards.$save($scope.dashboard, 'screens')
      Session.set('selectedScreen', false)
    }

    $scope.codemirrorOptions = {
      mode: 'null',
      lineWrapping: true,
      extraKeys: {
        Tab: function(cm) {
          cm.replaceSelection('  ', 'end');
        }
      },
      onLoad: function(cm) {
        $scope.codemirror = cm
      }
    }

    $scope.dashboardUrl = getUrl(function(location) {
      location.url('/dashboard')
    })

    $scope.linkPopover = {
      html: true,
      placement: 'bottom',
      content: compileTemplate('linkPopover.html', $scope),
      container: 'body'
    }

    $scope.openDashboard = function() {
      open($scope.dashboardUrl)
    }

    $scope.$watch('monlet.type', function(type) {
      if (type === 'Text') {
        $scope.codemirrorOptions.mode = 'null'
      } else if (type === 'HTML') {
        $scope.codemirrorOptions.mode = {name: 'xml', htmlMode: true}
      } else if (type === 'Markdown') {
        $scope.codemirrorOptions.mode = 'markdown'
      }
    })

    $scope.$on('jsonViewer:click', function(ev, key, obj) {
      var tip
      if (_.isObject(obj)) {
        tip = '{{#each ' + key + '}} {{/each}}'
      } else {
        tip = '{{' + key + '}}'
      }
      $scope.codemirror.replaceSelection(tip)
    })

    var autorun
    $scope.$watch('monlets', function() {
      if (autorun) autorun.stop()
      autorun = $autorun($scope, function() {
        $scope.monlet = _.find($scope.monlets, function(monlet) {
          return monlet._id === Session.get('selectedMonletId')
        })
      })
    })

    $scope.updateMonlet = throttledUpdate(Monlets, $scope, 'monlet')
    $scope.updateConfig = throttledUpdate(Dashboards, $scope, 'dashboard', 'config')

    $('body').droppable({
      tolerance: 'pointer',
      over: function(ev, ui) {
        ui.helper.addClass('remove').removeClass('add')
      }
    })
  }
])

.directive('monletAvatar', ['$rootScope', function($rootScope) {
  return {
    scope: true,
    templateUrl: 'monletAvatar.html',
    replace: true,

    link: function(scope, element, attrs) {
      function addMonlet(monlet) {
        var id = Monlets.insert(monlet)
        Session.set('selectedMonletId', id)
        Session.set('selectedMonlet', true)
        Session.set('selectedScreen', false)
      }

      element.draggable({
        appendTo: 'body',
        helper: 'clone',
        scroll: false,
        zIndex: 2000,

        stop: function(ev, ui) {
          if (ui.helper.hasClass('remove') || !ui.helper.screen) return

          var monlet = new Monlet(scope.user, attrs.type, scope.dashboard, ui.helper.screen)
          var offset = ui.helper.board.offset()
          var zoom = ui.helper.zoom

          monlet.position.top = Math.round((ev.pageY - offset.top) / zoom - 150)
          monlet.position.left = Math.round((ev.pageX - offset.left) / zoom - 150)

          addMonlet(monlet)
        }
      })
    }
  }
}])
