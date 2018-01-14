const Plugin = require('./lib/plugin.js');
const Xiaomi = require('./lib/xiaomi');

const options = {
  host: '192.168.0.127',
  port: 9898,
  password: 'guxlbxgbhyax6oyc',
}

const plugin = new Plugin();

plugin.on('params', params => {
  start(params);
});

plugin.on('channels', channels => {
  // console.log(channels);
});

function start() {
  const xiaomi = new Xiaomi(options);

  xiaomi.on('device', device => {
    console.log('device', device);
  });

  xiaomi.on('data', device => {
    console.log('data', device);
  });
}


/*

plugin.setChannels([
  {id : 'xiaomi1', desc: 'motion'},
  {id : 'xiaomi2', desc: 'plug'},
  {id : 'xiaomi6', desc: 'humidity'},
]);

plugin.setChannelsData([
  { id: 'xiaomi1', value: 0 },
  { id: 'xiaomi3', value: 0},
  { id: 'xiaomi6', value: 24 },
]);

*/
