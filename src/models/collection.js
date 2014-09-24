// patch meteor collection for easy saving object
//
_.extend(Meteor.Collection.prototype, {
  $save: function(obj) {
    if (!obj._id) return

    var fields
    if (arguments.length === 1) {
      fields = _.omit(obj, '_id', 'userId')
    } else {
      fields = _.pick(obj, _.rest(arguments, 1))
    }

    this.update(obj._id, {$set: fields})
  }
})
