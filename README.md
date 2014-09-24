# Remonit

Remonit lets you run simple scripts to monitor your computer and/or servers.  
Gathered stats are shown in nice web dashboards that zoom with display size. 

Documentation is totally lacking at the moment. I will add them once I have 
time.

## Project structure

Remonit uses meteor.js as backend and angularjs as frontend. It is then packaged 
in node-webkit for cross-platform distribution.

Main source files are under src/ folder. Inside it's the meteor.js project.

nw.dev/ and nw.release/ contain node-webkit frontend files.

## Running dev server and client

Remonit needs node.js, meteor.js and node-webkit to run, install these to start.  
You also need to install some packages for node-webkit client:

    cd nw.dev | npm install
    cd ..

Then you can start the meteor server under src/ folder:

    cd src
    meteor

Then you need to change node-webkit client configurations to set up correct url: 
change `'main'` and `'node-remote'` values in `nw.dev/package.json` to your 
local url.

Finally, you can start the node-webkit client (assume you link `nw` to 
node-webkit executable):

    nw ./nw.dev

## Build

Build relies on grunt.js, you can install related packages using npm, you also 
need to install packages for the node-webkit frondend, so:

    npm install
    cd nw.release | npm install
    cd ..

Then, like running dev client, you need to change server url for nw client: 
change `'main'` and `'node-remote'` values in `nw.release/package.json` to your 
actual server.

Finally, to build, use grunt:

    grunt nw
    sh ./zip

## License

MIT.
