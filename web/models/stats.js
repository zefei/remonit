Stats = new Meteor.Collection('stats')

Stat = function(user) {
  this.userId = user._id
}
