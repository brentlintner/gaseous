var options = {
    host: "127.0.0.1",
    port: 8888
};

function ready(modules) {
    var fs = modules.fs;

    fs.stat("example/client.html", function (err, data) {
        console.log("client.html stats:");
        console.log(data);
    });

    fs.readFile("HELP", "utf-8", function (err, data) {
        document.querySelector('body').innerHTML = "<pre>" + data + "</pre>";
    });

    fs.writeFile("TEST.md", "HELLO WORLD!", function (err) {
        if (err) throw err;
        console.log("TEST.md was saved!");
    });
}

gaseous.connect(ready, options);
