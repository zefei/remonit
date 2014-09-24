Console = function(scope) {
  this.text = ''
  this.apply = _.throttle(function() {
    setTimeout(function() {
      scope.$apply()
    }, 0)
  }, 1000)
}

_.extend(Console.prototype, {
  log: function(obj) {
    this.text += '<span class="text-default">' + obj + '</span><br />\n'
    this.apply()
  },

  info: function(obj) {
    this.text += '<span class="text-info">' + obj + '</span><br />\n'
    this.apply()
  },

  warn: function(obj) {
    this.text += '<span class="text-warning">' + obj + '</span><br />\n'
    this.apply()
  },

  error: function(obj) {
    this.text += '<span class="text-danger">' + obj + '</span><br />\n'
    this.apply()
  },

  clear: function() {
    this.text = ''
    this.apply()
  }
})
