'use strict'

angular.module('remonit')

.constant('constants', {
  homepage: 'http://zef.io/remonit/',

  reservedNames: ['_id', '_rev', 'userId', 'each', 'if', 'unless', 'with', 'log'],

  reconnectWait: 10000,

  authOptions: ['password', 'public key'],

  monletTypes: ['Text', 'HTML', 'Markdown'],

  rateLimit: 500,

  defaultHeight: 500,

  aspects: ['16:9', '16:10', '3:2', '4:3'],

  fonts: ['Open Sans', 'Inconsolata', 'Droid Serif', 'Play', 'Quicksand', 'Oswald'],

  fontStyles: {
    'Open Sans': ["<link href='http://fonts.googleapis.com/css?family=Open+Sans:400,700' rel='stylesheet' type='text/css'>", "'Open Sans', sans-serif"],
    'Inconsolata': ["<link href='http://fonts.googleapis.com/css?family=Inconsolata:400,700' rel='stylesheet' type='text/css'>", "'Inconsolata', monospace"],
    'Droid Serif': ["<link href='http://fonts.googleapis.com/css?family=Droid+Serif:400,700' rel='stylesheet' type='text/css'>", "'Droid Serif', serif"],
    'Play': ["<link href='http://fonts.googleapis.com/css?family=Play:400,700' rel='stylesheet' type='text/css'>", "'Play', sans-serif"],
    'Quicksand': ["<link href='http://fonts.googleapis.com/css?family=Quicksand:400,700' rel='stylesheet' type='text/css'>", "'Quicksand', sans-serif"],
    'Oswald': ["<link href='http://fonts.googleapis.com/css?family=Oswald:400,700' rel='stylesheet' type='text/css'>", "'Oswald', sans-serif"]
  }
})
