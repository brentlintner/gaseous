gaseous.client.listen("127.0.0.1", 8888, function (client) {
    client.fs.stat("example/client.html", function (err, data) {
        console.log("client.html stats:");
        console.log(data);
    });

    client.fs.readFile("HELP", "utf-8", function (err, data) {
        document.querySelector('body').innerHTML = "<pre>" + data + "</pre>";
    });

    client.fs.writeFile("TEST.md", "HELLO WORLD!", function (err) {
        if (err) {
            throw err;
        }
        console.log("TEST.md was saved!");
    });
});
