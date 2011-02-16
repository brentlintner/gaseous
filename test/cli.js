var s,
    fs = require('fs'),
    sys = require('sys'),
    map = require('./../lib/map'),
    server = require('./../lib/server'),
    cli = require('./../lib/cli');

module.exports = require('nodeunit').testCase({

    setUp: function (done) {
        s = require('sinon').sandbox.create();
        done();
    },

    tearDown: function (done) {
        s.verifyAndRestore();
        done();
    },

    "interprets help": function (test) {
        var txt = require('fs').readFileSync(__dirname + "/../HELP", "utf-8");
        s.mock(sys).expects("print").once().withExactArgs(txt);
        cli.interpret(["node", "file.js", "help"]);
        test.done();
    },

    "interprets no args as help": function (test) {
        var txt = require('fs').readFileSync(__dirname + "/../HELP", "utf-8");
        s.mock(sys).expects("print").once().withExactArgs(txt);
        cli.interpret(["node", "file.js"]);
        test.done();
    },

    "creates a server on default port": function (test) {
        s.stub(map, "map");
        s.mock(server)
            .expects("listen")
            .once()
            .withExactArgs({port: 8888});

        cli.interpret(["node", "file.js", "server"]);
        test.done();
    },

    "creates a server on custom port": function (test) {
        s.mock(server)
            .expects("listen")
            .once()
            .withExactArgs({port: 9797});

        cli.interpret(["node", "file.js", "server", "-p", "9797"]);
        test.done();
    },

    "creates a server with modules": function (test) {
        var directory = "relative/directory",
            modules = {
                fs: require('fs'),
                events: require('events')
            };

        s.stub(server, "listen");
        s.mock(map)
            .expects("map")
            .once()
            .withExactArgs(modules);

        cli.interpret(["node", "file.js", "server", "-m", "fs,events"]);
        test.done();
    }
});
