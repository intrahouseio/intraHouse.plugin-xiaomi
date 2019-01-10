function getExtendedChannels(props, options) {
  const temp = {};
  if (props) {
    Object.keys(props).forEach(key => {
      if (options[`channel_${key}`]) {
        props[key].type = 'read';
      }
      temp[key] = props[key];
    });
  }
  return temp;
}

function getDeviceTypeFromModel(model) {
  if (model === '') {
    return false;
  }

  switch (model) {
    case 'gateway':
      return 'gateway';
    case 'motion':
    case 'sensor_motion.aq2':
      return 'motion';
    case 'weather.v1':
    case 'sensor_ht':
      return 'weather';
    case 'sensor_magnet.aq2':
    case 'magnet':
      return 'magnet';
    case 'smoke':
      return 'smoke';
    case 'natgas':
      return 'gas';
    case 'plug':
      return 'plug';
    case 'ctrl_86plug.aq1':
    case 'ctrl_ln1.aq1':
	  case 'ctrl_neutral1':
      return 'ctrl';
    case 'ctrl_neutral2':
    case 'ctrl_ln2.aq1':
      return 'ctrl2';
    case 'sensor_switch.aq3':
    case 'switch':
    case '86sw2':
      return 'button';
    case 'cube':
      return 'cube';
    case 'sensor_wleak.aq1':
      return 'wleak';
    default:
      return model;
  }
}

function getDevicePropertiesFromModel(model) {
  switch (model) {
    case 'gateway':
      return {
        rgb: { alias: 'gw_rgb', type: 'write'},
        mid: { alias: 'gw_mid', type: 'write'},
        illumination: { alias: 'gw_illumination', type: 'read'},
        heartbeat: { alias: 'gateway', type: 'read'},
        proto_version: { alias: 'proto_version', type: 'ext'},
        life: {alias: 'life', type: 'ext' },
        cfg_time: {alias: 'cfg_time', type: 'ext' },
        mac: {alias: 'mac', type: 'ext' },
        fw_ver: {alias: 'fw_ver', type: 'ext' },
        hw_ver: {alias: 'hw_ver', type: 'ext' },
        model: {alias: 'model', type: 'ext' },
        mcu_fw_ver: {alias: 'mcu_fw_ver', type: 'ext' },
        wifi_fw_ver: {alias: 'wifi_fw_ver', type: 'ext' },
        rssi: {alias: 'rssi', type: 'ext' },
        ssid: {alias: 'ssid', type: 'ext' },
        bssid: {alias: 'bssid', type: 'ext' },
        localIp: {alias: 'localIp', type: 'ext' },
        mask: {alias: 'mask', type: 'ext' },
        gw: {alias: 'gw', type: 'ext' },
        gw_mac: {alias: 'gw_mac', type: 'ext' },
        mmfree: {alias: 'mmfree', type: 'ext' },
        ot: {alias: 'ot', type: 'ext' },
        otu_stat: {alias: 'otu_stat', type: 'ext' },
        ott_stat: {alias: 'ott_stat', type: 'ext' },
        sid: {alias: 'sid', type: 'ext' },
        active: {alias: 'active', type: 'ext' },
      };
    case 'motion':
      return {
        status: { alias: 'motion', type: 'read'},
        no_motion: { alias: 'no_motion', type: 'ext'},
        voltage: { alias: 'voltage', type: 'ext'},
        active: {alias: 'active', type: 'ext' },
      };
    case 'sensor_motion.aq2':
      return {
        status: { alias: 'motion', type: 'read'},
        lux: { alias: 'illumination', type: 'read'},
        no_motion: { alias: 'no_motion', type: 'ext'},
        voltage: { alias: 'voltage', type: 'ext'},
        active: {alias: 'active', type: 'ext' },
      };
    case 'sensor_ht':
      return {
        temperature: { alias: 'temperature', type: 'read'},
        humidity: { alias: 'humidity', type: 'read'},
        voltage: { alias: 'voltage', type: 'ext'},
        active: {alias: 'active', type: 'ext' },
      };
    case 'weather.v1':
      return {
        temperature: { alias: 'temperature', type: 'read'},
        humidity: { alias: 'humidity', type: 'read'},
        pressure: { alias: 'pressure', type: 'read'},
        voltage: { alias: 'voltage', type: 'ext'},
        active: {alias: 'active', type: 'ext' },
      };
    case 'magnet':
    case 'sensor_magnet.aq2':
      return {
        status: { alias: 'magnet', type: 'read'},
        voltage: { alias: 'voltage', type: 'ext'},
        no_close: { alias: 'no_close', type: 'ext'},
        active: {alias: 'active', type: 'ext' },
      };
    case 'cube':
      return {
        status: { alias: 'cube_action', type: 'read'},
        rotate: { alias: 'cube_rotate', type: 'read'},
        voltage: { alias: 'voltage', type: 'ext'},
        active: {alias: 'active', type: 'ext' },
      };
    case 'sensor_wleak.aq1':
      return {
        status: { alias: 'wleak', type: 'read'},
        voltage: { alias: 'voltage', type: 'ext'},
        active: {alias: 'active', type: 'ext' },
      };
    case 'smoke':
      return {
        alarm: { alias: 'smoke', type: 'read'},
        density: { alias: 'density', type: 'ext'},
        voltage: { alias: 'voltage', type: 'ext'},
        active: {alias: 'active', type: 'ext' },
      };
    case 'natgas':
      return {
        alarm: { alias: 'gas', type: 'read'},
        density: { alias: 'density', type: 'ext'},
        voltage: { alias: 'voltage', type: 'ext'},
        active: {alias: 'active', type: 'ext' },
      };
    case 'plug':
      return {
        status: { alias: 'plug', type: 'write' },
        inuse: { alias: 'inuse', type: 'ext'},
        power_consumed: { alias: 'power_consumed', type: 'ext'},
        load_power: { alias: 'load_power', type: 'ext'},
        voltage: { alias: 'voltage', type: 'ext'},
        active: {alias: 'active', type: 'ext' },
      };
    case 'ctrl_86plug.aq1':
      return {
        status: { alias: 'ctrl', type: 'write' },
        voltage: { alias: 'voltage', type: 'ext'},
        inuse: { alias: 'inuse', type: 'ext'},
        active: {alias: 'active', type: 'ext' },
      };
    case 'ctrl_ln1.aq1':
	  case 'ctrl_neutral1':
      return {
        channel_0: { alias: 'ctrl', type: 'write' },
        voltage: { alias: 'voltage', type: 'ext'},
        active: {alias: 'active', type: 'ext' },
      };
   case 'ctrl_neutral2':
   case 'ctrl_ln2.aq1':
     return {
        channel_0: { alias: 'ctrl2_0', type: 'write' },
	      channel_1: { alias: 'ctrl2_1', type: 'write' },
        voltage: { alias: 'voltage', type: 'ext'},
        active: {alias: 'active', type: 'ext' },
      };
   case 'sensor_switch.aq3':
   case 'switch':
      return {
        status: { alias: 'button', type: 'read'},
        active: {alias: 'active', type: 'ext' },
      };
    case '86sw2':
      return {
         channel_0: { alias: 'button_0', type: 'read' },
         channel_1: { alias: 'button_1', type: 'read' },
         dual_channel: { alias: 'button_dual', type: 'read' },
         voltage: { alias: 'voltage', type: 'ext'},
         active: {alias: 'active', type: 'ext' },
       };
    default:
      return {};
  }
}

function getDeviceAction(sid, alias, values = [],) {
  switch (alias) {
    case 'plug':
      return {
        sid: sid || '',
        cmd: 'write',
        model: 'plug',
        data: { channel_0: values[0] },
      };
	case 'ctrl2_0':
      return {
        sid: sid || '',
        cmd: 'write',
        model: 'plug',
        data: { channel_0: values[0] },
      };
	case 'ctrl2_1':
      return {
        sid: sid || '',
        cmd: 'write',
        model: 'plug',
        data: { channel_1: values[0] },
      };
	case 'ctrl':
      return {
        sid: sid || '',
        cmd: 'write',
        model: 'plug',
        data: { channel_0: values[0] },
      };
    case 'switch':
      return {
        sid: sid || '',
        method: 'toggle_ctrl_neutral',
        params: ['neutral_0', values[0]],
      };
    case 'gw_rgb':
      return {
        sid: sid || '',
        cmd: 'write',
        model: 'gateway',
        data: { rgb: new Buffer([values[1][3], values[1][0], values[1][1], values[1][2]]).readUInt32BE() },
      };
    case 'gw_mid':
      return {
        sid: sid || '',
        cmd: 'write',
        model: 'gateway',
        data: { mid: values[1][0], vol: values[1][1]},
      };
    default:
      return false;
  }
}

function getGatewayCommand(sid, command, params = {}) {
  switch (command) {
    case 'add_device':
      return {
        sid: sid || '',
        cmd: 'write',
        model: 'gateway',
        data: { join_permission: 'yes' },
      };
    case 'remove_device':
      return {
        sid: sid || '',
        cmd: 'write',
        model: 'gateway',
        data: { remove_device: params.id || '' },
      };
    default:
      return false;
  }
}

function getDeviceValue(value) {
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  if (typeof value === 'number') {
    let buf = Buffer.allocUnsafe(4);
    buf.writeUInt32BE(value)
    return [x.readUIntBE(1), x.readUIntBE(2), x.readUIntBE(3), x.readUIntBE(0)];
  }
  switch (value) {
    case 'on':
      return 1;
    case 'off':
      return 0;
    case 'close':
      return 0;
    case 'open':
      return 1;
    case 'motion':
      return 1;
    case 'no_motion':
      return 0;
    case 'leak':
      return 1;
    case 'no_leak':
      return 0;
    case null:
      return 0;
    default:
      return value;
  }
}

module.exports = {
  getExtendedChannels,
  getDeviceTypeFromModel,
  getDevicePropertiesFromModel,
  getDeviceValue,
  getDeviceAction,
  getGatewayCommand,
};
