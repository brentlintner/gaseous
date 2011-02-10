module.exports = function build() {
    var buffer,
        fs = require('fs'),
        socketio = fs.readFileSync(__dirname + "/../packages/Socket.IO/socket.io.js", "utf-8"),
        uuid = fs.readFileSync(__dirname + "/../packages/Math.uuid.js", "utf-8"),
        client = fs.readFileSync(__dirname + "/../lib/client.js", "utf-8");
    

    buffer = socketio + uuid +
            "\nvar gaseous = {client: (function (global, module) {\n" +
                client +
                "return module.exports;\n" +
            "}(window, {exports: {}}))};\n";

    fs.writeFile('gaseous.js', buffer, "utf-8", function (err) {
        if (err) throw err;
        require('sys').puts("\\m/");
    });
};
