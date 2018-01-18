const Plugin = require('./lib/plugin.js');
const Xiaomi = require('./lib/xiaomi');
const { getDeviceValue, getDeviceAction } = require('./lib/utils');

const plugin = new Plugin();

let channelsList = [];
let cache = {};


plugin.on('params', params => {
  start(params);
});

plugin.on('channels', channels => {
  // console.log(channels);
});

function getChanel(sid, desc) {
  return { id: `${desc}_${sid}`, desc };
}

function getChanelList(device) {
  return Object.keys(device.props)
      .filter(key => device.props[key] && device.props[key].type !== 'ext')
      .map(key => getChanel(device.sid, device.props[key].alias));
}

function getChanelData(sid, props, data) {
  const temp = checkChanelDataDiff(sid, data);
  const ext =  Object.keys(temp)
    .filter(key => props[key] && props[key].type === 'ext')
    .reduce((l, n) => Object.assign({}, l, { [props[n].alias]: getDeviceValue(temp[n]) }), {})

  return Object.keys(temp)
    .filter(key => props[key] && props[key].type !== 'ext')
    .map(key => ({ id: `${props[key].alias}_${sid}`, value: getDeviceValue(temp[key]), ext  }));
}

function checkChanelDataDiff(sid, data) {
  if (!cache[sid]) {
    cache[sid] = {};
  }

  let temp = {};
  Object.keys(data).forEach(key => {
    if (cache[sid][key] !== data[key]) {
      cache[sid][key] = data[key];
      temp[key] = data[key];
    }
  });
  return temp;
}

function start(options) {
  const xiaomi = new Xiaomi(options);

  xiaomi.on('device', device => {
    plugin.setChannels(getChanelList(device));
    plugin.setChannelsData(getChanelData(device.sid, device.props, device.data));
  });

  xiaomi.on('data', device => {
    const temp = getChanelData(device.sid, device.props, device.data);
    if (temp.length > 0) {
      plugin.setChannelsData(temp);
    }
  });

  plugin.on('actions', data => {
    data.forEach(item => {
      const [alias, id] = item.id.split('_');
      const value = item.value;
      const command = item.command;

      switch (command) {
        case 'on':
          xiaomi.sendAction(getDeviceAction(id, alias, ['on']));
          break;
        case 'off':
          xiaomi.sendAction(getDeviceAction(id, alias, ['off']));
          break;
        default:
      }
    });
  });
}
