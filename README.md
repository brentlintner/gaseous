# Gaseous

Expose nodejs modules in the browser (asynchronously).

Note: Gaseous was initially developed in a black box (sans knowledge of mature and powerful alternative(s) like dnode - github.com/substack/dnode).
But even though gaseous and dnode are (or could be) very similar, the initial goal of gaseous was to write an 
evented, decoupled, and modular client/server framework for accessing nodejs modules in the browser. Since then dnode has been an inspiring project.

So, if you find this useful or cool, give it a spin or dive into the source.

## Install

    npm install gaseous

## Server

A server binds to a local directory and listens on a port for any client connections.

    // bind fs and initiate a server
    var gaseous = require('gaseous');
    gaseous.map({
        fs: require('fs')
    }).listen(5678);

    // with the cli
    gaseous server -p 5678 -m fs

## Client

The browser client is built as a single file, and is used to connect and interact with a server instance from the browser.

For example: reading the contents of a file.

    var options = {host: "127.0.0.1", port: 5678};
    gaseous.connect(function (modules) {
        // gaseous.modules can now be referenced
        modules.fs.readFile("relative/directory/file", "utf-8", function (err, data) {
            // woot
        });
    }, options);

## Getting Started

To build and include the client you need to do a few things:

    // configure and install any dependencies
    ./configure

    // build browser client (creates gasious.js)
    jake
    jake build

    // unit tests
    jake test

    // code stats
    jake stats

## Example

    // build the gaseous.js client file
    jake build

    // run the server example (or use the cli)
    node example/server.js

    // open example/client.html in a browser
    chromium-browser example/client.html

## How It Works

The client/server runs on top of socket.io.

There is a caveat in that everything is async, so only certain methods are feasible. 
When a method call is made, the client will post the method and appropriate paramaters via a stringified data packet to the server.
So if you want to use something like fs.readFileSync it will not work as expected.

For example, for fs.readFile the packet would look something like this:

    {
        "id": "uuid",
        "method": "fs-readFile",
        "args": [
            "relative/directory/file",
            "utf-8",
            "[Function]"
        ]
    }

The server will then process the packet, call the appropriate module method and a message will be sent back to the client with the results of the call.

For example, a successful call (to say fs.readFile) would look something like this:

    {
        "id": "uuid",
        "callback": 2 // the index of the callback invoked
        "args": [
            null,
            "file_data"
        ]
    }

## TODO

* handle Buffer objects properly (get mangled in stringify)
* mixin EventEmitter instead of using Observable class
* handle multiple connections (i.e. listen on multiple ports)
* pass in an optional server to bind to instead of creating one (i.e. support express, connect etc)
* support recursive objects (i.e. at the moment, only second level functions are mapped)
* client uses events and supports connect/disconnect/ready events (and anything else worthy)
* make client compat lib for older browsers (ex. Object.keys)
