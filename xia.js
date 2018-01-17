const Plugin = require('./lib/plugin.js');
const Xiaomi = require('./lib/xiaomi');
const { getDeviceValue, getDeviceDataFromAlias } = require('./lib/utils');

const plugin = new Plugin();

let channelsList = [];
let devicesList = {};

plugin.on('params', params => {
  start(params);
});

plugin.on('channels', channels => {
  // console.log(channels);
});

function mapChanelType(sid, desc) {
  return { id: `${desc}_${sid}`, desc };
}

function mapChanelData(sid, props, data) {
  const ext =  Object.keys(data)
    .filter(key => props[key] && props[key].type === 'ext')
    .reduce((l, n) => Object.assign({}, l, { [props[n].alias]: getDeviceValue(data[n]) }), {})

  return Object.keys(data)
    .filter(key => props[key] && props[key].type !== 'ext')
    .map(key => ({ id: `${props[key].alias}_${sid}`, value: getDeviceValue(data[key]), ext  }));
}

function actions() {

}

function start(options) {
  const xiaomi = new Xiaomi(options);

  xiaomi.on('device', device => {
    const channels = Object.keys(device.props)
      .filter(key => device.props[key] && device.props[key].type !== 'ext')
      .map(key => mapChanelType(device.sid, device.props[key].alias));
    channelsList = channelsList.concat(channels);
    devicesList[device.sid] = device;
    plugin.setChannels(channelsList);

    const data = mapChanelData(device.sid, device.props, device.data)
    plugin.setChannelsData(data);
  });

  xiaomi.on('data', device => {
    const data = mapChanelData(device.sid, device.props, device.data)
    plugin.setChannelsData(data);
  });

  plugin.on('actions', data => {
    data.forEach(item => {
      const temp = item.id.split('_')
      const id = temp[1];
      const desc = temp[0];
      const device = devicesList[id];

      if (device) {
        const find = Object
          .keys(device.props)
          .find(key => device.props[key].alias === desc && device.props[key].type === 'write' && device.props[key].action);
        if (find) {
          xiaomi.sendCommand(id, device.props[find].action, item.value);
        }
      }
    });
  });
}
