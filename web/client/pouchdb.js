'use strict'

angular.module('pouchdb', [])

.run(function() {
  _.extend(PouchDB.prototype, {
    bind: function(scope, model, options) {
      var self = this
      var bindDep = new Deps.Dependency
      bindDep.depend()

      var cancel
      self.allDocs({include_docs: true}, function(err, response) {
        if (scope[model] && scope[model].cancel) scope[model].cancel()
        scope[model] = _.map(response.rows, function(row) {
          return row.doc
        })
        scope[model].cancel = cancel

        setTimeout(function() {
          scope.$apply()
        }, 0)
      })

      options = options || {}
      _.defaults(options, {create: true, update: true, delete: true})
      self.changes({complete: function(err, response) {
        cancel = self.changes({
          since: response.last_seq,
          continuous: true,
          onChange: function(change) {
            var existed = _.find(scope[model], function(obj) {
              return obj._id === change.id
            })

            if (!existed && options.create
              || existed && !change.deleted && options.update
              || change.deleted && options.delete) {
              bindDep.changed()
            }
          }
        }).cancel
        if (scope[model]) scope[model].cancel = cancel
      }})
    }
  })
})

_.extend(PouchDB.prototype, {
  $save: function(obj) {
    var self = this
    self.get(obj._id, function(err, response) {
      obj._rev = response._rev
      self.put(obj, function(err, response) {
        obj._rev = response.rev
      })
    })
  },

  $remove: function(obj) {
    var self = this
    self.get(obj._id, function(err, response) {
      obj._rev = response._rev
      self.remove(obj)
    })
  }
})
