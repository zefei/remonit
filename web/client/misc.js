'use strict'

angular.module('remonit')

.directive('lowercase', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(text) {
        return (text || '').toLowerCase()
      })
    }
  }
})

.directive('unfocusable', function() {
  return {
    link: function(scope, element) {
      element.on('focus', function() {
        this.blur()
      })
    }
  }
})

.directive('selectOnClick', function() {
  return {
    link: function(scope, element) {
      element.on('click', function(ev) {
        this.select()
        ev.stopPropagation()
      })
    }
  }
})

.directive('qrcode', function() {
  return {
    link: function(scope, element, attrs) {
      new QRCode(element[0], scope.$eval(attrs.qrcode))
    }
  }
})

.directive('collapseHandle', function() {
  return {
    require: '^statebox',
    templateUrl: 'collapseHandle.html',
    replace: true,
    transclude: true
  }
})

.directive('resizable', function() {
  return {
    link: function(scope, element, attrs) {
      var handles = attrs.resizable || 'se'
      $(element).resizable({handles: handles})
    }
  }
})

.directive('logViewer', function() {
  return {
    scope: {
      text: '=logViewer'
    },

    link: function(scope, element) {
      scope.$watch('text', function(text) {
        element.html(text)
        element[0].scrollTop = element[0].scrollHeight
      })
    }
  }
})

.directive('popover', function() {
  return {
    link: function(scope, element, attrs) {
      element.popover(scope.$eval(attrs.popover))

      function onClick() {
        element.popover('hide')
        $(window).off('click', onClick)
      }

      element.on('shown.bs.popover', function() {
        $(window).on('click', onClick)
      })
    }
  }
})

.directive('dropdown', function() {
  return {
    link: function(scope, element, attrs) {
      element.dropdown()
    }
  }
})

.filter('noReserved', ['constants', function(constants) {
  return function(obj) {
    return _.omit(obj, constants.reservedNames)
  }
}])

.filter('avoidNaN', function() {
  return function(obj) {
    _.each(obj, function(value, key) {
      if (_.isNaN(value)) obj[key] = null
    })
    return obj
  }
})

.filter('belongsToScreen', function() {
  return function(monlets, screen) {
    return _.filter(monlets, function(monlet) {
      return monlet.screenId === screen
    })
  }
})
