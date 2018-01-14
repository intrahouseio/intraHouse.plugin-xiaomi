const Plugin = require('./lib/plugin.js');
const Xiaomi = require('./lib/xiaomi');
const plugin = new Plugin();

plugin.on('params', params => {
  start(params);
});

plugin.on('channels', channels => {
  // console.log(channels);
});

function mapChanelType(sid, desc) {
  return { id: `${desc}_${sid}`, desc };
}

function mapChanelData(sid, data) {
  return Object.keys(data).map(desc => {
    return { id: `${desc}_${sid}`, value: data[desc] };
  });
}

function start(options) {
  const xiaomi = new Xiaomi(options);

  xiaomi.on('device', device => {
    const channels = device.props.map(item => mapChanelType(device.sid, item));
    plugin.setChannels(channels);
  });

  xiaomi.on('data', device => {
    const data = mapChanelData(device.sid, device.data)
    plugin.setChannelsData(data);
  });
}
