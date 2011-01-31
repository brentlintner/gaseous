window.addEventListener("load", function (event) {
    gaseous.client.listen("127.0.0.1", 8888, function (lib) {
        lib.fs.readFile("README.md", "utf-8", function (err, data) {
            document.querySelector('body').innerHTML = "<pre>" + data + "</pre>";
        });
    });
});
