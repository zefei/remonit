Sandbox = function(console) {
  this.iframe = document.createElement('iframe')
  this.iframe.style.display = 'none'
  document.body.appendChild(this.iframe)
  this.window = this.iframe.contentWindow
  this.window.console = this.console = console || window.console
}

_.extend(Sandbox.prototype, {
  inject: function(name, obj) {
    this.window[name] = obj
    return this
  },

  run: function(code, interval) {
    var self = this
    var tryRun = function() {
      var c = '(function() {\n"use strict";\n' + code + '\n})();'
      try {
        self.window.eval(c)
      } catch (e) {
        self.console.error(e)
      }
    }

    if (interval) {
      var loop = function() {
        tryRun()
        self.timer = self.window.setTimeout(loop, interval)
      }
      loop()
    } else {
      tryRun()
    }

    return this
  },

  stop: function() {
    if (this.timer) {
      this.window.clearTimeout(this.timer)
      this.timer = null
    }
  },

  close: function() {
    this.stop()
    document.body.removeChild(this.iframe)
  }
})
