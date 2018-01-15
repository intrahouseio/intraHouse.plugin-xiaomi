const child = require('child_process');
const modulepath = './xia.js';

const unitid = 'plugin_emu'

const params = {
  host: '192.168.0.127',
  port: 9898,
  password: 'guxlbxgbhyax6oyc',
}

const config = [];

const ps = child.fork(modulepath, [unitid]);

ps.on('message', data => {
  if (data.type === 'get' && data.tablename === 'params/plugin_emu') {
    ps.send({ type: 'get', params });
  }

  if (data.type === 'get' && data.tablename === 'config/plugin_emu') {
    ps.send({ type: 'get', config: {} });
  }

  if (data.type === 'data') {
    console.log('-------------data-------------', Date.now());
    console.log(data.data);
    console.log('');
  }

  if (data.type === 'channels') {
    console.log('-----------channels-----------', Date.now());
    console.log(data.data);
    console.log('');
  }
});

ps.on('close', code => {
  // console.log('close');
});

setTimeout(() => ps.send({
  type: 'act',
  data: [
    {
      id: 'plug_158d00019c9f2b',
      value: 1,
      desc: 'plug',
    },
  ],
}), 3000);
