'use strict'

angular.module('remonit')

.directive('monletBoard', ['constants', function(constants) {
  return {
    scope: {
      monlets: '=',
      config: '=',
      stats: '=',
      screen: '=',
      designer: '='
    },
    templateUrl: 'monletBoard.html',
    replace: true,

    controller: ['$scope', function($scope) {
      if (!$scope.designer) return

      $scope.selectScreen = function() {
        Session.set('selectedScreenId', $scope.screen)
        Session.set('selectedScreen', true)
        Session.set('selectedMonlet', false)
      }

      $scope.isSelectedScreen = function() {
        return Session.get('selectedScreen') &&
               Session.get('selectedScreenId') === $scope.screen
      }

      this.selectMonlet = $scope.selectMonlet = function(monlet) {
        Session.set('selectedMonletId', monlet._id)
        Session.set('selectedMonlet', true)
        Session.set('selectedScreen', false)
        $scope.$broadcast('selectMonlet', monlet)
      }

      this.isSelectedMonlet = $scope.isSelectedMonlet = function(monlet) {
        return Session.get('selectedMonlet') &&
               Session.get('selectedMonletId') === monlet._id
      }
    }],

    link: function(scope, element, attrs, ctrl) {
      var anchor = 'width'
      if (attrs.width) element.css({width: attrs.width})
      if (attrs.height) {
        element.css({height: attrs.height})
        if (attrs.width) {
          anchor = 'both'
          element.css({height: attrs.height})
        } else {
          anchor = 'height'
        }
      }

      var resize
      scope.$watch('config.aspect', function(aspect) {
        if (!aspect) return

        if (resize) element.off('resize', resize)

        resize = function() {
          var dim = aspect.split(':')
          var ratio = parseFloat(dim[0]) / parseFloat(dim[1])
          var width, height

          if (anchor === 'width') {
            width = element.width()
            height = width / ratio
            element.height(height)
          } else if (anchor === 'height') {
            height = element.height()
            width = height * ratio
            element.width(width)
          } else if (anchor === 'both') {
            width = element.width()
            height = width / ratio
            if (height > element.height()) {
              height = element.height()
              width = height * ratio
            }
            element.find('.monlet-board').width(width).height(height)
          }

          var zoom = height / constants.defaultHeight
          if (ctrl.zoom != zoom) {
            ctrl.zoom = zoom
            scope.$broadcast('zoom', zoom)
          }
        }

        resize()
        element.on('resize', resize)
      })

      scope.$watch('config.backgroundColor', function(color) {
        element.css('background-color', color)
      })

      element.find('.monlet-board').droppable({
        greedy: true,
        tolerance: 'pointer',
        over: function(ev, ui) {
          ui.helper.removeClass('remove').addClass('add')
          ui.helper.board = element.find('.monlet-board')
          ui.helper.screen = scope.screen
          ui.helper.zoom = ctrl.zoom
        }
      })
    }
  }
}])

.directive('monletDummy', function() {
  return {
    require: '^monletBoard',
    scope: {
      monlet: '=monletDummy'
    },
    template: '<div class="monlet-dummy" tabindex="0"></div>',
    replace: true,

    link: function(scope, element, attrs, board) {
      var hasFocus = false

      element.on('focus', function(){
        hasFocus = true
        board.selectMonlet(scope.monlet)
      })

      scope.$on('select', function(ev, monlet) {
        if (monlet === scope.monlet) {
          if (!hasFocus) element.focus()
          hasFocus = true
        } else {
          hasFocus = false
        }
      })
    }
  }
})

.directive('monlet', ['$sanitize', 'constants', 'useFont',
  function($sanitize, constants, useFont) {
    return {
      require: '^monletBoard',
      scope: {
        monlet: '=',
        stats: '=',
        designer: '='
      },
      templateUrl: 'monlet.html',
      replace: true,

      link: function(scope, element, attrs, board) {
        function scroll() {
          var el = element.find('.monlet-content')
          if (scope.monlet.position.scroll === 'bottom') {
            var offset = (scope.monlet.position.height - el.height()) * board.zoom
            el.css('margin-top', offset)
          } else {
            el.css('margin-top', 0)
          }
        }

        function paint() {
          var zoom = board.zoom
          var pos = scope.monlet.position

          element.css({
            top: pos.top * zoom + 'px',
            left: pos.left * zoom + 'px',
            width: pos.width * zoom + 'px',
            height: pos.height * zoom + 'px'
          })

          element.find('.monlet-content').css({
            width: pos.width + 'px',
            '-webkit-transform': 'scale(' + zoom + ')',
            '-moz-transform': 'scale(' + zoom + ')',
            '-o-transform': 'scale(' + zoom + ')',
            '-ms-transform': 'scale(' + zoom + ')',
            transform: 'scale(' + zoom + ')'
          })

          scroll()
        }

        paint()
        scope.$on('zoom', paint)
        scope.$watch('monlet.position', paint, true)

        function stylize() {
          var styles = scope.monlet.styles
          var font = styles.font in constants.fontStyles ? styles.font : 'Open Sans'

          element.css({
            'background-color': styles.backgroundColor,
            'z-index': styles.zIndex
          })

          element.find('.monlet-content').css({
            'font-family': constants.fontStyles[font][1],
            'font-size': styles.fontSize + 'px',
            'text-align': styles.textAlign,
            'color': styles.color,
          })

          useFont(font)
          scroll()
        }

        stylize()
        scope.$watch('monlet.styles', stylize, true)

        var template
        function compile() {
          var content
          if (scope.monlet.type === 'Text') {
            var escapedContent = scope.monlet.content
            .replace('<', '&lt;', 'g')
            .replace('>', '&gt;', 'g')
            content = '<pre>' + escapedContent + '</pre>'
          } else if (scope.monlet.type === 'HTML') {
            content = scope.monlet.content
          } else if (scope.monlet.type === 'Markdown') {
            content = marked(scope.monlet.content)
          }

          try {
            template = handlebars.compile(content)
            link()
          } catch (e) {}
        }

        function link() {
          try {
            var html = $sanitize(template(scope.stats))
            element.find('.monlet-content').html(html)
          } catch (e) {}
          scroll()
        }

        compile()
        scope.$watch('monlet.type', compile)
        scope.$watch('monlet.content', compile)
        scope.$watch('stats', link, true)

        if (!scope.designer) return

        scope.select = function(ev) {
          if (ev) ev.stopPropagation()
          board.selectMonlet(scope.monlet)
        }

        scope.isSelected = function() {
          return board.isSelectedMonlet(scope.monlet)
        }

        scope.remove = function(ev) {
          if (ev) ev.stopPropagation()
          if (confirm('Are you sure to remove this monlet?')) {
            Monlets.remove(scope.monlet._id)
            Session.set('selectedMonlet', false)
          }
        }

        element.draggable({
          appendTo: 'body',
          helper: 'clone',
          scroll: false,
          zIndex: 2000,

          start: function(ev, ui) {
            element.hide()
          },

          stop: function(ev, ui) {
            if (ui.helper.hasClass('remove')) {
              ui.helper.hide()
              scope.remove()
            } else {
              var pos = scope.monlet.position
              var monletOffset = ui.helper.offset()
              var boardOffset = ui.helper.board.offset()
              pos.top = Math.round((monletOffset.top - boardOffset.top) / board.zoom)
              pos.left = Math.round((monletOffset.left - boardOffset.left) / board.zoom)

              scope.monlet.screenId = ui.helper.screen
              Monlets.$save(scope.monlet, 'screenId', 'position')
            }

            element.show()
            scope.$apply()
          }
        })

        element.resizable({
          handles: {se: element.find('.monlet-resize')},
          minWidth: 40,
          minHeight: 40,

          stop: function(ev, ui) {
            var pos = scope.monlet.position
            pos.width = Math.round(ui.helper.width() / board.zoom)
            pos.height = Math.round(ui.helper.height() / board.zoom)
            Monlets.$save(scope.monlet, 'position')
          }
        })
      }
    }
  }
])
