# Remonit

Remonit lets you run simple scripts to monitor your computer and/or servers. 
Gathered stats are shown in nice web dashboards that zoom with display size. 

Documentation is totally lacking at the moment. I will add them once I have 
time.

## Project structure

Remonit uses meteor.js as backend and angularjs as frontend. It is then packaged 
in node-webkit for cross-platform distribution.

Main source files are under web/ folder. Inside it's the meteor.js project.

nw.dev/ and nw.release/ contain node-webkit frontend files.

www/ contains static web site.

## Build

Build relies on grunt.js, you can install related packages using `npm install`. 
To build, run `grunt nw | ./zip`.

## License

MIT.
