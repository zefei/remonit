'use strict'

angular.module('remonit')

.run(['$rootScope', 'open', 'constants', function($rootScope, open, constants) {
  $rootScope.openHomepage = function() {
    open(constants.homepage)
  }

  $rootScope.signout = function() {
    Meteor.logout()
  }
}])
