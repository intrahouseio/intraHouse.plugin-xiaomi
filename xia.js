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
    return { id: `${desc}_${sid}`, value: transformValue(data[desc]) };
  });
}

function transformValue(value) {
  switch (value) {
    case 'on':
      return 1;
      break;
    case 'off':
      return 0;
      break;
    case 'close':
      return 0;
      break;
    case 'open':
      return 1;
      break;
    case null:
      return 0;
      break;
    default:
      return value;
  }
}

function start(options) {
  const xiaomi = new Xiaomi(options);

  xiaomi.on('device', device => {
    const channels = device.props.map(item => mapChanelType(device.sid, item));
    const data = mapChanelData(device.sid, device.data)
    plugin.setChannels(channels);
    plugin.setChannelsData(data);
    // process.send({ type: 'log', txt: JSON.stringify(data), level: 3 });
  });

  xiaomi.on('data', device => {
    const data = mapChanelData(device.sid, device.data)
    plugin.setChannelsData(data);
    // process.send({ type: 'log', txt: JSON.stringify(data), level: 2 });
  });
}
