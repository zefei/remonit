function simplePublish(collection, name){
  Meteor.publish(name, function () {
    return collection.find({userId: this.userId})
  })

  collection.allow({
    insert: function (userId, doc) {
      return userId && doc.userId === userId
    },

    update: function (userId, doc, fields, modifier) {
      return doc.userId === userId
    },

    remove: function (userId, doc) {
      return doc.userId === userId
    },

    fetch: ['userId']
  })

  collection.deny({
    update: function (userId, docs, fields, modifier) {
      return _.contains(fields, 'userId')
    },

    fetch: []
  })

  var methods = {}

  methods[name] = function() {
    return collection.find({userId: this.userId}).fetch()
  }

  methods[name + 'Save'] = function(obj) {
    var doc = collection.find({_id: obj._id, userId: this.userId}).fetch()
    if (doc) collection.$save(obj)
  }

  Meteor.methods(methods)
}

var collections = [
  [Dashboards, 'dashboards'],
  [Monlets, 'monlets'],
  [Stats, 'stats']
]

_.each(collections, function(collection) {
  simplePublish(collection[0], collection[1])
})
