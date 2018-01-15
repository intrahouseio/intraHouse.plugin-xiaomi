function getDeviceTypeFromModel(model) {
  if (model === '') {
    return false;
  }

  switch (model) {
    case 'sensor_motion.aq2':
      return 'motion';
    case 'weather.v1':
      return 'weather';
    case 'sensor_magnet.aq2':
      return 'magnet';
    case 'smoke':
      return 'smoke';
    case 'plug':
      return 'plug';
    default:
      return model;
  }
}

function getDevicePropertiesFromModel(model) {
  switch (model) {
    case 'sensor_motion.aq2':
      return ['voltage', 'status', 'lux'];
    case 'weather.v1':
      return ['voltage', 'temperature', 'humidity', 'pressure'];
    case 'sensor_magnet.aq2':
      return ['voltage', 'status'];
    case 'smoke':
      return ['voltage', 'alarm'];
    case 'plug':
      return ['voltage', 'status', 'inuse', 'power_consumed', 'load_power'];
    case '':
      return ['voltage', 'channel_0'];
    default:
      return [];
  }
}

function getDeviceValueFromModel(value) {
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
    case 'motion':
      return 1;
      break;
    case 'no_motion':
      return 0;
      break;
    case null:
      return 0;
      break;
    default:
      return value;
  }
}

module.exports = {
  getDeviceTypeFromModel,
  getDevicePropertiesFromModel,
  getDeviceValueFromModel,
};
