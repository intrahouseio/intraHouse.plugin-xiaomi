const Plugin = require('./lib/plugin.js');
const Xiaomi = require('./lib/xiaomi');
const { getDeviceValueFromModel } = require('./lib/utils');

const plugin = new Plugin();

let channelsList = [];

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
    return { id: `${desc}_${sid}`, value: getDeviceValueFromModel(data[desc]) };
  });
}

function start(options) {
  const xiaomi = new Xiaomi(options);

  xiaomi.on('device', device => {
    const channels = device.props.map(item => mapChanelType(device.sid, item));
    const data = mapChanelData(device.sid, device.data)
    channelsList = channelsList.concat(channels);
    plugin.setChannels(channelsList);
    plugin.setChannelsData(data);
    process.send({ type: 'log', txt: JSON.stringify(channelsList), level: 4 });
    process.send({ type: 'log', txt: JSON.stringify(data), level: 3 });
  });

  xiaomi.on('data', device => {
    const data = mapChanelData(device.sid, device.data)
    plugin.setChannelsData(data);
    process.send({ type: 'log', txt: JSON.stringify(data), level: 2 });
  });
}
