// mscdex/ssh2 wrapper
//
Connection = function(ssh, server, timeout, wait) {
  this.ssh = ssh // ssh2 instance
  this.server = server
  this.timeout = timeout
  this.wait = wait
}

_.extend(Connection.prototype, {
  setStatus: function(status) {
    var self = this
    self.timeout(function() {
      self.status = status
    }, 0)
  },

  connect: function(status) {
    if (this.ended || this.status === 'connecting' || this.status === 'connected') return

    var self = this
    self.conn = new self.ssh()
    self.setStatus('connecting')

    self.conn.on('ready', function() {
      self.setStatus('connected')
    })

    self.conn.on('error', function() {
      self.reconnect('error')
    })

    self.conn.on('end', function() {
      self.reconnect('disconnected')
    })

    self.conn.on('close', function() {
      self.reconnect('disconnected')
    })

    var config
    if (self.server.auth === 'password') {
      config = _.pick(self.server, 'host', 'port', 'username', 'password')
    } else {
      config = _.pick(self.server, 'host', 'port', 'username', 'passphrase', 'privateKey')
    }

    try {
      self.conn.connect(config)
    } catch (e) {
      self.reconnect('error')
    }
  },

  reconnect: function(status) {
    if (this.ended || this.timer) return

    var self = this
    self.setStatus(status)

    self.timer = self.timeout(function() {
      self.timer = null
      self.disconnect()
      self.connect()
    }, self.wait)
  },

  disconnect: function() {
    if (this.conn) this.conn.end()
  },

  end: function() {
    this.ended = true
    this.disconnect()
  },

  exec: function(command, callback) {
    if (this.ended || this.status !== 'connected') return

    var self = this
    var stdout = '', stderr = ''

    this.conn.exec(command, function(err, stream) {
      if (self.ended) return

      if (err) {
        if (callback) callback(err, null, null)
        return
      }

      stream.on('data', function(data, extended) {
        if (self.ended) return
        if (extended === 'stderr') {
          stderr += data
        } else {
          stdout += data
        }
      })

      stream.on('exit', function() {
        if (self.ended) return
        if (callback) callback(null, stdout, stderr)
      })
    })
  }
})
