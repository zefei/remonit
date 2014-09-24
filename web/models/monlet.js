Monlets = new Meteor.Collection('monlets')

Monlet = function(user, type, dashboard, screen) {
  var template
  if (type in Monlet.templates) {
    template = Monlet.templates[type]
  } else {
    template = Monlet.templates.Text
  }

  this.userId = user._id
  this.type = template.type
  this.dashboard_id = dashboard._id
  this.screenId = screen || dashboard.screens[0]
  this.position = _.clone(template.position)
  this.position.scroll = this.position.scroll || 'top'
  this.content = template.content
  this.styles = {
    font: template.font,
    fontSize: template.fontSize,
    textAlign: template.textAlign,
    color: 'rgb(255,255,255)',
    backgroundColor: 'rgba(0,0,0,0)',
    zIndex: 0
  }
}

Monlet.templates = {
  Text: {
    type: 'Text',
    position: {left: _.random(400), top: _.random(300), width: 300, height: 200},
    font: 'Inconsolata',
    fontSize: 24,
    textAlign: 'left',
    content:
    'Click to edit this monlet\n\n' +
    '{{! You can use Handlebars templates to include any monitored stats }}\n\n' +
    '{{! Text monlets preserve whitespaces }}'
  },

  HTML: {
    type: 'HTML',
    position: {left: _.random(400), top: _.random(300), width: 300, height: 200},
    font: 'Open Sans',
    fontSize: 24,
    textAlign: 'left',
    content:
    '<b>Click</b> to edit this monlet\n\n' +
    '{{! You can use Handlebars templates to include any monitored stats }}\n\n' +
    '{{! Basic HTML <tags> are supported }}'
  },

  Markdown: {
    type: 'Markdown',
    position: {left: _.random(400), top: _.random(300), width: 300, height: 200},
    font: 'Open Sans',
    fontSize: 24,
    textAlign: 'left',
    content:
    '__Click__ to edit this monlet\n\n' +
    '{{! You can use Handlebars templates to include any monitored stats }}\n\n' +
    '{{! We use GitHub Flavored Markdown }}'
  },

  time: {
    type: 'Markdown',
    position: {left: 10, top: 0, width: 300, height: 130},
    font: 'Open Sans',
    fontSize: 100,
    textAlign: 'center',
    content:
    '__{{datetime.hours}}:{{datetime.minutes}}__'
  },

  date: {
    type: 'Markdown',
    position: {left: 10, top: 120, width: 300, height: 80},
    font: 'Open Sans',
    fontSize: 45,
    textAlign: 'center',
    content:
    '{{datetime.day}},\n' +
    '{{datetime.month}}\n' +
    '{{datetime.date}}'
  },

  loadTitle: {
    type: 'Markdown',
    position: {left: 25, top: 220, width: 300, height: 60},
    font: 'Open Sans',
    fontSize: 40,
    textAlign: 'left',
    content:
    '__System Load__'
  },

  loadUnix: {
    type: 'Text',
    position: {left: 25, top: 275, width: 300, height: 80},
    font: 'Inconsolata',
    fontSize: 22,
    textAlign: 'left',
    content:
    'Load:    {{load.load._1m}}\n' +
    'CPU:     {{load.cpu.used}}%\n' +
    'Memory:  {{load.mem.used}}%'
  },

  loadWin: {
    type: 'Text',
    position: {left: 25, top: 275, width: 300, height: 80},
    font: 'Inconsolata',
    fontSize: 22,
    textAlign: 'left',
    content:
    'CPU:     {{load.cpu.used}}%\n' +
    'Memory:  {{load.mem.used}}%'
  },

  diskTitle: {
    type: 'Markdown',
    position: {left: 25, top: 350, width: 300, height: 60},
    font: 'Open Sans',
    fontSize: 40,
    textAlign: 'left',
    content:
    '__Disk Usage__'
  },

  disk: {
    type: 'Text',
    position: {left: 25, top: 405, width: 300, height: 80},
    font: 'Inconsolata',
    fontSize: 22,
    textAlign: 'left',
    content:
    '{{#each disk}}{{this.dev}}: {{this.used}}%\n' +
    '{{/each}}'
  },

  topCpu: {
    type: 'Text',
    position: {left: 350, top: 10, width: 250, height: 485},
    font: 'Inconsolata',
    fontSize: 22,
    textAlign: 'left',
    content:
    '{{topCpu}}'
  },

  topMemory: {
    type: 'Text',
    position: {left: 630, top: 10, width: 250, height: 485},
    font: 'Inconsolata',
    fontSize: 22,
    textAlign: 'left',
    content:
    '{{topMemory}}'
  },

  topWin: {
    type: 'Text',
    position: {left: 400, top: 10, width: 450, height: 485},
    font: 'Inconsolata',
    fontSize: 22,
    textAlign: 'left',
    content:
    '{{topMemory}}'
  },

  logfile: {
    type: 'HTML',
    position: {left: 5, top: 0, width: 860, height: 500, scroll: 'bottom'},
    font: 'Inconsolata',
    fontSize: 15,
    textAlign: 'left',
    content:
    '<pre style="white-space:pre-wrap">\n' +
    '{{logfile}}</pre>'
  }
}
