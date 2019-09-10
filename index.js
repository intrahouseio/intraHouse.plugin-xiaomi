const Plugin = require('./lib/plugin');
const Xiaomi = require('./lib/xiaomi');
const { commandScan, commandRemove, parseId } = require('./command');
const { getDeviceValue, getDeviceAction } = require('./lib/utils');

const plugin = new Plugin();

let channelsList = [];
let debug = false;


plugin.on('params', params => {
  start(params);
});

plugin.on('channels', channels => {
  // console.log(channels);
});

plugin.on('debug', mode => {
  debug = mode;
});

function getChanel(sid, desc) {
  return { id: `${desc}_${sid}`, desc };
}

function getChanelList(device) {
  return Object.keys(device.props)
      .filter(key => device.props[key] && device.props[key].type !== 'ext')
      .map(key => getChanel(device.sid, device.props[key].alias));
}

function getChanelData(sid, props, data, error) {
  const ext =  Object.keys(data)
    .filter(key => props[key] && props[key].type === 'ext')
    .reduce((l, n) => Object.assign({}, l, { [props[n].alias]: getDeviceValue(data[n], props[n].alias) }), {})

  return Object.keys(props)
    .filter(key => props[key].type !== 'ext')
    .map(key => {
      if (data.hasOwnProperty(key)) {
        if (error) {
          return { id: `${props[key].alias}_${sid}`, err: 'Device timeout!' }
        }
        return { id: `${props[key].alias}_${sid}`, value: getDeviceValue(data[key], props[key].alias), ext  }
      }
      return { id: `${props[key].alias}_${sid}`, ext  }
    });
}

function start(options) {
  plugin.debug("version: 0.0.55");
  const xiaomi = new Xiaomi(options);
  const _commandScan = commandScan.bind({ xiaomi, plugin });
  const _commandRemove = commandRemove.bind({ xiaomi, plugin });

  xiaomi.on('message', data => {
    if (debug) {
      plugin.debug(data);
    }
  });

  xiaomi.on('send', data => {
    if (debug) {
      plugin.debug(data);
    }
  });


  xiaomi.on('device', device => {
    plugin.setChannels(getChanelList(device));
    plugin.setChannelsData(getChanelData(device.sid, device.props, device.data));
  });

  xiaomi.on('data', device => {
    plugin.setChannelsData(getChanelData(device.sid, device.props, device.data));
  });

  xiaomi.on('error', device => {
    plugin.setChannelsData(getChanelData(device.sid, device.props, device.data, true));
  });

  plugin.on('actions', data => {
    data.forEach(item => {
      const { id, alias } = parseId(item.id);
      const value = item.value;
      const command = item.command;

      switch (command) {
        case 'on':
          xiaomi.sendAction(getDeviceAction(id, alias, ['on', value]));
          break;
        case 'off':
          xiaomi.sendAction(getDeviceAction(id, alias, ['off', value]));
          break;
        case 'set':
          xiaomi.sendAction(getDeviceAction(id, alias, ['set', value]));
          break;
        default:
      }
    });
  });

  plugin.on('command', data => {
    switch (data.command) {
      case 'scan':
        _commandScan(data);
        break;
      case 'remove':
        _commandRemove(data);
        break;
      default:
    }
  });
}
