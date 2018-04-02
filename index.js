const Plugin = require('./lib/plugin.js');
const Xiaomi = require('./lib/xiaomi');
const { getDeviceValue, getDeviceAction, getGatewayCommand } = require('./lib/utils');

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

function parseId(string) {
  const temp = string.split('_');

  if (temp.length > 2) {
   const id = temp[temp.length - 1];
   const alias = temp.slice(0, temp.length - 1).join('_');
   return { id, alias };
  }
 return { id: temp[1], alias: temp[0] };
}

function getChanel(sid, desc) {
  return { id: `${desc}_${sid}`, desc };
}

function getChanelList(device) {
  return Object.keys(device.props)
      .filter(key => device.props[key] && device.props[key].type !== 'ext')
      .map(key => getChanel(device.sid, device.props[key].alias));
}

function getChanelData(sid, props, data) {
  const ext =  Object.keys(data)
    .filter(key => props[key] && props[key].type === 'ext')
    .reduce((l, n) => Object.assign({}, l, { [props[n].alias]: getDeviceValue(data[n]) }), {})

  return Object.keys(props)
    .filter(key => props[key].type !== 'ext')
    .map(key => {
      if (data[key]) {
        return { id: `${props[key].alias}_${sid}`, value: getDeviceValue(data[key]), ext  }
      }
      return { id: `${props[key].alias}_${sid}`, ext  }
    });
}

function compareDeviceList(old, now) {
  if (old.length === now.length) {
    let temp = false;
    old.forEach(id => {
      temp = !now.includes(id);
    });
    return temp;
  }
  return true;
}

function commandRemove(data) {
  const xiaomi = this.xiaomi;
  const { id, alias } = parseId(data.id);

  function check(list) {
    clear();
    const old = xiaomi.getDeviceListOrigin();
    const test = compareDeviceList(old, list);
    if (test) {
      xiaomi.setDeviceListOrigin(list)
      plugin.removeChannel(data.id);
      plugin.response('command', data);
    } else {
      plugin.response('command', data);
      console.log('no!');
    }
  }

  function clear() {
    xiaomi.removeListener('devicelist', check);
  }

  xiaomi.on('devicelist', check);
  xiaomi.sendAction(getGatewayCommand(xiaomi.getGatewayId(), 'remove_device', { id }));
  xiaomi.getDeviceList();
}

function start(options) {
  const xiaomi = new Xiaomi(options);
  const _commandRemove = commandRemove.bind({ xiaomi });

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

  plugin.on('actions', data => {
    data.forEach(item => {
      const { id, alias } = parseId(item.id);
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

  plugin.on('command', data => {
    switch (data.command) {
      case 'scan':
        xiaomi.sendAction(getGatewayCommand(xiaomi.getGatewayId(), 'add_device'));
        break;
      case 'remove':
        _commandRemove(data);
        break;
      default:
    }
  });
}
