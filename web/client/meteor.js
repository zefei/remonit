// meteor.js and angularjs integration
// see https://medium.com/@zfxuan/the-wonderful-duo-using-meteor-and-angularjs-together-4d603a4651bf
//
'use strict'

angular.module('meteor', [])

.config(['$interpolateProvider', function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[').endSymbol(']]')
}])

.factory('$autorun', function() {
  return function(scope, fn) {
    var comp = Deps.autorun(function(c) {
      fn(c)
      if (!c.firstRun) setTimeout(function() {
        scope.$apply()
      }, 0)
    })

    scope.$on('$destroy', function() {
      comp.stop()
    })

    return comp
  }
})

.run(['$templateCache', function($templateCache) {
  angular.forEach(Template, function(template, name) {
    if (name[0] !== '_') {
      var node = document.createElement('div')
      UI.insert(UI.render(template), node)
      $templateCache.put(name, node.innerHTML)
    }
  })
}])
