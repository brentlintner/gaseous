gaseous.client.listen("127.0.0.1", 8888, function (client) {
    client.fs.readFile("README.md", "utf-8", function (err, data) {
        document.querySelector('body').innerHTML = "<pre>" + data + "</pre>";
    });

    client.fs.writeFile("TEST.md", "HELLO WORLD!", "utf-8", function (err) {
        if (err) {
            throw err;
        }

        console.log("Saved!");
    });
});
