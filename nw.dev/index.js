'use strict'

process.on('uncaughtException', function(err) {
  console.error(err)
})

var os = require('os')
var gui, win, tray

exports.ready = function() {
  gui = window.require('nw.gui')
  win = gui.Window.get()

  win.on('close', function(flag) {
    if (flag === 'quit') {
      quit()
    } else {
      hide()
    }
  })

  gui.App.on('open', show)

  gui.App.on('reopen', show)

  if (!tray && os.platform() !== 'darwin') addTray()
}

function hide() {
  win.hide()
  window.setIdle(true)
}

function show() {
  window.setIdle(false)
  win.show()
  win.focus()
}

function quit() {
  win.close(true)
}

function addTray() {
  tray = new gui.Tray({
    icon: 'small-16x16.png',
    menu: new gui.Menu()
  })

  tray.menu.append(new gui.MenuItem({label: 'Open Remonit', click: show}))

  tray.menu.append(new gui.MenuItem({label: 'Quit', click: quit}))

  tray.on('click', show)
}
