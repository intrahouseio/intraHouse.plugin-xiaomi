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
      return 'weather';
    case 'sensor_magnet.aq2':
    case 'magnet':
      return 'magnet';
    case 'smoke':
      return 'smoke';
    case 'plug':
      return 'plug';
    case 'switch':
      return 'button';
    default:
      return model;
  }
}

function getDevicePropertiesFromModel(model) {
  switch (model) {
    case 'gateway':
      return {
        rgb: { alias: 'gw_rgb', type: 'write'},
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
      };
    case 'motion':
      return {
        status: { alias: 'motion', type: 'read'},
        no_motion: { alias: 'no_motion', type: 'ext'},
        voltage: { alias: 'voltage', type: 'ext'},
      };
    case 'sensor_motion.aq2':
      return {
        status: { alias: 'motion', type: 'read'},
        lux: { alias: 'illumination', type: 'read'},
        no_motion: { alias: 'no_motion', type: 'ext'},
        voltage: { alias: 'voltage', type: 'ext'},
      };
    case 'weather.v1':
      return {
        temperature: { alias: 'temperature', type: 'read'},
        humidity: { alias: 'humidity', type: 'read'},
        pressure: { alias: 'pressure', type: 'read'},
        voltage: { alias: 'voltage', type: 'ext'},
      };
    case 'magnet':
    case 'sensor_magnet.aq2':
      return {
        status: { alias: 'magnet', type: 'read'},
        voltage: { alias: 'voltage', type: 'ext'},
        no_close: { alias: 'no_close', type: 'ext'},
      };
    case 'smoke':
      return {
        alarm: { alias: 'smoke', type: 'read'},
        density: { alias: 'density', type: 'ext'},
        voltage: { alias: 'voltage', type: 'ext'},
      };
    case 'plug':
      return {
        status: { alias: 'plug', type: 'write' },
        inuse: { alias: 'inuse', type: 'ext'},
        power_consumed: { alias: 'power_consumed', type: 'ext'},
        load_power: { alias: 'load_power', type: 'ext'},
        voltage: { alias: 'voltage', type: 'ext'},
      };
   case 'switch':
      return {
        status: { alias: 'button', type: 'read'},
      };
    case 'false':
      return {
        channel_0: { alias: 'switch', type: 'write'},
        voltage: { alias: 'voltage', type: 'ext'},
      };
    default:
      return {};
  }
}

function getDeviceAction(sid, alias, values = []) {
  switch (alias) {
    case 'plug':
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
        data: { rgb: new Buffer([values[4] || 0, values[0] || 0, values[1] || 0, values[2] || 0]).readUInt32BE() },
      };
    default:
      return false;
  }
}

function getDeviceValue(value) {
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
    case 'click':
      return 0;
    case 'double_click':
      return 1;
    case 'long_click_press':
      return 2;
    case null:
      return 0;
    default:
      return value;
  }
}

module.exports = {
  getDeviceTypeFromModel,
  getDevicePropertiesFromModel,
  getDeviceValue,
  getDeviceAction,
};
