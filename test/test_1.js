const child = require('child_process');
const readline = require('readline');
const modulepath = './index.js';

const unitid = 'plugin_emu'
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const params = {
  host: '192.168.0.145',
  port: 9898,
  token: '13de1b2f04bf17c2f5bfa8ba60775f11',
  volume_control: true,
  alarm_volume: 0,
  doorbell_volume: 0,
  radio_volume: 0,
  gateway_volume: 0,
  channel_active: 1,
  channel_inuse: true,
  channel_voltage: true,
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

  if (data.type === 'debug') {
    console.log('-------------debug------------', new Date().toLocaleString());
    console.log(data.txt);
    console.log('');
  }

  if (data.type === 'command') {
    console.log('-------------command------------', new Date().toLocaleString());
    console.log(data);
    console.log('');
  }
});

ps.on('close', code => {
  // console.log('close');
});

const temp = JSON.parse('[{"id":"plug_158d00019c9f2b","value":1,"desc":"plug","command":"on"}]');
const temp1 = {
  uuid: 'ae9dfadd-69ee-41da-a164-a3936dcc572d',
   type: 'command',
   unit: 'xiaomi1',
   command: 'remove',
   id: 'magnet_158d00016c3dea',
   value: '',
};

const temp2 = {
  uuid: 'ae9dfadd-69ee-41da-a164-a3936dcc572d',
   type: 'command',
   unit: 'xiaomi1',
   command: 'remove',
   id: 'motion_158d0001b1cbf5',
   value: '',
};

const temp3 = {
  uuid: 'ae9dfadd-69ee-41da-a164-a3936dcc572d',
   type: 'command',
   unit: 'xiaomi1',
   command: 'remove',
   id: 'temperature_158d0001fa8897',
   value: '',
};

const temp4 = {
  uuid: 'a3dc4211-52f2-489f-8c6d-53e912d9f8e0',
  type: 'command',
  unit: 'xiaomi1',
  command: 'scan',
  id: '',
  value: '' ,
}

const temp5 = {
  uuid: 'ae9dfadd-69ee-41da-a164-a3936dcc572d',
   type: 'command',
   unit: 'xiaomi1',
   command: 'remove',
   id: 'ctrl2_0_158d0002117c45',
   value: '',
}

const temp6 = {
  uuid: 'ae9dfadd-69ee-41da-a164-a3936dcc572d',
   type: 'command',
   unit: 'xiaomi1',
   command: 'remove',
   id: 'ctrl_158d0001f99dfb',
   value: '',
}

const temp7 = {
  uuid: 'ae9dfadd-69ee-41da-a164-a3936dcc572d',
   type: 'command',
   unit: 'xiaomi1',
   command: 'remove',
   id: 'plug_158d00019c9f2b',
   value: '',
}

const temp8 = {
  uuid: 'ae9dfadd-69ee-41da-a164-a3936dcc572d',
   type: 'command',
   unit: 'xiaomi1',
   command: 'remove',
   id: 'cube_action_158d00010ed4a3',
   value: '',
}


function clear() {
  // setTimeout(() => ps.send(temp1), 0);
  // setTimeout(() => ps.send(temp2), 50);
  // setTimeout(() => ps.send(temp3), 100);
  // setTimeout(() => ps.send(temp5), 150);
  // setTimeout(() => ps.send(temp6), 200);
  // setTimeout(() => ps.send(temp7), 250);
  setTimeout(() => ps.send(temp8), 300);
}

function command(value) {
  switch (value) {
    case 'exit':
      process.exit();
      break;
    case '+':
      setTimeout(() => ps.send(temp4), 0);
      break;
    case '-':
      clear();
      break;
    default:
      break;
  }
  listenKeyboard();
  console.log(value);
}

function listenKeyboard() {
  rl.question('', command);
}


listenKeyboard();

ps.send({type: 'debug', mode: true });
