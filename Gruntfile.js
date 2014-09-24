"use strict"

var version = require('fs').readFileSync('VERSION').toString().trim()

module.exports = function(grunt) {
  grunt.initConfig({
    nodewebkit: {
      options: {
        version: '0.9.2',
        app_name: 'Remonit',
        app_version: version,
        linux32: true,
        linux64: true,
        mac_icns: './design/osx.icns',
        linux_icon: './design/medium-48x48.png',
        build_dir: './build'
      },
      src: ['./nw.release/**/*']
    }
  })

  grunt.loadNpmTasks('grunt-node-webkit-builder')
  grunt.registerTask('nwLinux', nwLinux(grunt))
  grunt.registerTask('nw', ['nodewebkit', 'nwLinux'])
}

var fs = require('fs'),
    path = require('path')

function nwLinux(grunt) {
  return function() {
    var config = grunt.config('nodewebkit.options')

    ;['linux32', 'linux64'].forEach(function(linux) {
      if (!config[linux]) return

      var buildDir = config.build_dir
      var appName = config.app_name
      var dir = path.join(buildDir, 'releases', appName, linux, appName)

      var iconFile = config.linux_icon
      if (iconFile) {
        grunt.file.copy(iconFile, path.join(dir, 'icon.png'))
      }

      var binFile = path.join(dir, appName)
      fs.renameSync(binFile, binFile + '-bin')
      fs.chmodSync(binFile + '-bin', '755')
      grunt.file.write(binFile, linuxWrapper(appName))
      fs.chmodSync(binFile, '755')
    })
  }
}

function linuxWrapper(appName) {
  return '#!/bin/bash\n' +
         '\n' +
         'MYAPP_NAME="' + appName + '"\n' +
         '\n' +
         '# script path\n' +
         'export MYAPP_WRAPPER="`readlink -f "$0"`"\n' +
         'HERE="`dirname "$MYAPP_WRAPPER"`"\n' +
         '\n' +
         '# link libudev.so.0\n' +
         'if [ ! -f "$HERE/libudev.so.0" ]; then # if not linked yet\n' +
         '  udevDependent=`which udisks 2> /dev/null` # Ubuntu, Mint\n' +
         '  if [ -z "$udevDependent" ]; then\n' +
         '    udevDependent=`which systemd 2> /dev/null` # Fedora, SUSE\n' +
         '  fi\n' +
         '  if [ -z "$udevDependent" ]; then\n' +
         '    udevDependent=`which findmnt` # Arch\n' +
         '  fi\n' +
         '  udevso=`ldd $udevDependent | grep libudev.so | awk \'{print $3;}\'`\n' +
         '  if [ -e "$udevso" ]; then\n' +
         '    ln -sf "$udevso" "$HERE/libudev.so.0"\n' +
         '  fi\n' +
         'fi\n' +
         '\n' +
         '# use script directory as lib path\n' +
         'if [[ -n "$LD_LIBRARY_PATH" ]]; then\n' +
         '  LD_LIBRARY_PATH="$HERE:$HERE/lib:$LD_LIBRARY_PATH"\n' +
         'else\n' +
         '  LD_LIBRARY_PATH="$HERE:$HERE/lib"\n' +
         'fi\n' +
         'export LD_LIBRARY_PATH\n' +
         '\n' +
         '# execute actual app\n' +
         'exec -a "$0" "$HERE/$MYAPP_NAME-bin"  "$@"\n'
}
