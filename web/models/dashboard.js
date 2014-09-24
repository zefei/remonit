Dashboards = new Meteor.Collection('dashboards')

Dashboard = function(user) {
  this.userId = user._id

  this.config = {
    name: 'My Dashboard',
    aspect: '16:9',
    background: 'color',
    backgroundColor: 'rgb(40,40,40)'
  }

  this.screens = [Random.id()]
}

_.extend(Dashboards, {
  addScreen: function(dashboard) {
    var id = Random.id()
    dashboard.screens.push(id)
    Dashboards.$save(dashboard, 'screens')
    return id
  },

  removeScreen: function(dashboard, id) {
    if (dashboard.screens.length <= 1) return false
    if (!_.contains(dashboard.screens, id)) return false

    var monlets = Monlets.find({userId: dashboard.userId, screenId: id}).fetch()
    _.each(monlets, function(monlet) {
      Monlets.remove(monlet._id)
    })

    dashboard.screens = _.without(dashboard.screens, id)
    Dashboards.$save(dashboard, 'screens')

    return true
  }
})
