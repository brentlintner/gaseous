var _this = module.exports = {
    server: require('./server'),
    fs: require('./fs'),
    bus: require('./observable').Observable()
};

_this.fs.watch(_this.bus);
_this.server.watch(_this.bus);
