var s,
    fs = require('fs'),
    sys = require('sys'),
    server = require('./../lib/gaseous/server'),
    cli = require('./../lib/gaseous/cli');

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
        var txt = require('fs').readFileSync(__dirname + "/../README.md", "utf-8"); 
        s.mock(sys).expects("puts").once().withExactArgs(txt);
        cli.interpret(["node", "file.js", "help"]);
        test.done();
    },

    "interprets no args as help": function (test) {
        var txt = require('fs').readFileSync(__dirname + "/../README.md", "utf-8"); 
        s.mock(sys).expects("puts").once().withExactArgs(txt);
        cli.interpret(["node", "file.js"]);
        test.done();
    },

    "creates a server on default port": function (test) {
        s.mock(server)
            .expects("bind")
            .once()
            .withExactArgs(process.cwd())
            .returns({
                listen: s.mock().once().withExactArgs(8888)
            });

        cli.interpret(["node", "file.js", "server"]);
        test.done();
    },

    "creates a server on custom port": function (test) {
        s.mock(server)
            .expects("bind")
            .once()
            .withExactArgs(process.cwd())
            .returns({
                listen: s.mock().once().withExactArgs(9797)
            });

        cli.interpret(["node", "file.js", "server", "-p", "9797"]);
        test.done();
    },

    "creates a server on custom directory": function (test) {
        var directory = "relative/directory";

        s.mock(server)
            .expects("bind")
            .once()
            .withExactArgs(process.cwd() + "/" + directory)
            .returns({
                listen: s.mock().once().withExactArgs(5454)
            });

        cli.interpret(["node", "file.js", "server", "-p", "5454", "-d", directory]);
        test.done();
    }
});
