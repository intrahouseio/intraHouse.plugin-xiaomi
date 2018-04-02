const { getGatewayCommand } = require('./lib/utils');


function parseId(string) {
  const temp = string.split('_');

  if (temp.length > 2) {
   const id = temp[temp.length - 1];
   const alias = temp.slice(0, temp.length - 1).join('_');
   return { id, alias };
  }
 return { id: temp[1], alias: temp[0] };
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


function commandScan(data) {
  const plugin = this.plugin;
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
  xiaomi.sendAction(getGatewayCommand(xiaomi.getGatewayId(), 'add_device'));
  xiaomi.getDeviceList();
}

function commandRemove(data) {
  const plugin = this.plugin;
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

module.exports = {
  commandScan,
  commandRemove,
  parseId,
};
