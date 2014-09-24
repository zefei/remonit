// account registration at server side
//
'use strict'

Accounts.onCreateUser(function(options, user) {
  if (options.email) {
    user.username = user.email = options.email.toLowerCase()
    Dashboards.insert(new Dashboard(user))
    Stats.insert(new Stat(user))
    return user
  } else {
    throw new Meteor.Error(400, "Email is invalid")
  }
})
