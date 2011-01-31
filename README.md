# Gaseous

Transparent, async file io for the browser.

## Install

    npm install gaseous

## Server

You can boot a server to serve up files in a directory

	var gaseous = require('gaseous');
	gaseous.server.bind("relative/directory").listen(5678);

or with the cli:

	gaseous server -p 5678 -d relative/directory

## Client

The client can be used to bind and interact with the local filesystem.

	// build and include the gaseous.js client file in <head>
    // once ready, you can alternatively reference fs through gaseous.fs
	gaseous.client.listen("127.0.0.1", 5678, function (lib) {
        lib.fs.readFile("relative/directory/file", "utf-8", function (err, data) {
            // woot
        });
    });

## Building

    // to prep
    git clone <url>
    git submodule init
    git submodule update

    // npm install jake nodeunit sinon catchjs glob

    // build browser client (creates gasious.js)
    jake
    jake build

    // unit tests
    jake test

    // code stats
    jake stats

## Examples

    // build the gaseous.js client file
    jake build

    // start a server in this directory
    bin/gaseous server

    // open example/client.html in a browser
    chromium-browser example/client.html

## How It Works

The api is the same as the nodejs fs module api (only async methods will work client side).
The client/server runs on top of socket.io. When a method call is made, the client will post 
the method and appropriate paramaters via a stringified data packet.

For example, for fs.readFile the packet would look something like this:

	var packet = {
		"id": "uuid",
		"method": "readFile",
		"args": [
			"relative/directory/file",
			"utf-8"
		]
	};

## TODO

* mixin EventEmitter instead of using Observable class
* agnosticise the server module for any api call (socket-receive)
* handle multiple connections
