# Remonit - Remote monitoring from any device

Documentation is totally lacking at the moment. I will add them once I have 
time.

## Project structure

Source files are under web/ folder. Inside it's a meteor.js project that 
requires meteor to run. Meteor.js is used as backend, and frontend is angularjs.

nw.dev/ and nw.release/ contain node-webkit frontend files. Node-webkit is the 
outmost wrapper.

www/ contains static web site.

## Build

Build relies on grunt.js, you can install related packages using `npm install`. 
To build, run `grunt nw | ./zip`.

## License

MIT.
