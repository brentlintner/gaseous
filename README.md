# Gaseous

Note: currently a work in progress.

Gaseous exposes nodejs module apis to the browser (asynchronously).
Currently there is only support for the fs module, but any non-blocking module call can be supported.
That is, a call like fs.readFileSync will not work as expected whereas fs.readFile will.

## Install

    npm install gaseous

## Server

A server binds to a local directory and listens on a port for any client connections.

    // initiate a server
    var gaseous = require('gaseous');
    gaseous.server.bind("relative/directory").listen(5678);

    // with the cli
    gaseous server -p 5678 -d relative/directory

## Client

The browser client is built as a single file, and is used to connect and interact with a server instance from the browser.

For example: reading the contents of a file.

    gaseous.client.listen("127.0.0.1", 5678, function (api) {
        api.fs.readFile("relative/directory/file", "utf-8", function (err, data) {
            // woot
        });
    });

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

    // start a server in this directory
    bin/gaseous server

    // open example/client.html in a browser
    chromium-browser example/client.html

## How It Works

The client side api is mapped to its respective nodejs module.
The client/server runs on top of socket.io.

There is a caveat in that everything is async, so only certain methods are feasible. 
When a method call is made, the client will post the method and appropriate paramaters via a stringified data packet to the server.
So if you want to use something like fs.readFileSync it will not work as expected.

For example, for fs.readFile the packet would look something like this:

    var packet = {
        "id": "uuid",
        "method": "fs-readFile",
        "args": [
            "relative/directory/file",
            "utf-8",
            null
        ]
    };

## TODO

* mixin EventEmitter instead of using Observable class
* agnosticise the server module for any api call
* handle multiple connections
* pass in an optional server to bind to instead of creating one (i.e. support express, connect etc)