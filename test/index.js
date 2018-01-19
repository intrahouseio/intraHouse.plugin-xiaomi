const child = require('child_process');
const modulepath = './xia.js';

const unitid = 'plugin_emu'

const params = {
  host: '192.168.0.127',
  port: 9898,
  token: '44cbc0b8974e5fd75a758539b72aefa1',
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
    console.log('-------------data-------------', new Date().toLocaleString());
    console.log(data.data);
    console.log('');
  }

  if (data.type === 'channels') {
    console.log('-----------channels-----------', new Date().toLocaleString());
    console.log(data.data);
    console.log('');
  }
});

ps.on('close', code => {
  // console.log('close');
});

const temp = JSON.parse('[{"id":"plug_158d00019c9f2b","value":1,"desc":"plug","command":"on"}]');

// setTimeout(() => ps.send({type: 'act', data: temp }), 1500);
