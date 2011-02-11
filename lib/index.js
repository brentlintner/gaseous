var map = require('./map'),
    server = require('./server'),
    bus = require('./observable').Observable();

map.watch(bus);
server.watch(bus);

module.exports = {
    listen: server.listen,
    map: map.map,
    modules: server.modules
};
