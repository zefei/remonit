// patched to be used as a regular module

'use strict';

var name = 'ngAttr';
var selector = true;

angular.module(name, []).directive(name,
  function() {
    var ATTR_MATCH = /\s*([^=]+)(=\s*(\S+))?/;
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        var oldVal;

        scope.$watch(attr[name], function(value) {
          ngAttrWatchAction(scope.$eval(attr[name]));
        }, true);

        attr.$observe(name, function() {
          ngAttrWatchAction(scope.$eval(attr[name]));
        });

        function ngAttrWatchAction(newVal) {
          if (selector === true || scope.$index % 2 === selector) {
            if (oldVal && !angular.equals(newVal,oldVal)) {
              attrWorker(oldVal, removeAttr);
            }
            attrWorker(newVal, setAttr);
          }
          oldVal = angular.copy(newVal);
        }


        function splitAttr(value) {
          var m = ATTR_MATCH.exec(value);
          return m && [m[1].replace(/\s+$/, ''), m[3]];
        }


        function setAttr(value) {
          if (value) {
            if (value[0] === 'undefined' || value[0] === 'null') {
              return;
            }
            element.attr(value[0], angular.isDefined(value[1]) ? value[1] : '');
          }
        }

        function removeAttr(value) {
          if (value) {
            element.removeAttr(value[0]);
          }
        }

        function attrWorker(attrVal, action, compare) {
          if(angular.isString(attrVal)) {
            attrVal = attrVal.split(/\s+/);
          }
          if(angular.isArray(attrVal)) {
            forEach(attrVal, function(v) {
              v = splitAttr(v);
              action(v);
            });
          } else if (angular.isObject(attrVal)) {
            var attrs = [];
            angular.forEach(attrVal, function(v, k) {
              k = splitAttr(k);
              if (v) {
                action(k);
              }
            });
          }
        }
      }
    };
  }
);
