const Xiaomi = require('./xiaomi');

const options = {
  host: '192.168.0.127',
  port: 9898,
  password: 'guxlbxgbhyax6oyc',
}

const xiaomi = new Xiaomi(options);

xiaomi.on('device', device => {
  console.log('device', device);
});

xiaomi.on('data', device => {
  console.log('data', device);
});
