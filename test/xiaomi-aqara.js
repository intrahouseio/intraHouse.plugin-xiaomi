const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const HOST = '192.168.0.127';
const PORT = 9898;

socket.on('error', error);
socket.on('message', message);
socket.on('listening', listen);
socket.bind(PORT, start);


let DEVICES_LIST = {};
let TOKEN = '';

const commandList = {
  plug: {
    id: '158d00019c9f2b',
    model: 'ctrl_neutral1',
    prop: 'channel_0',
    value: { a: 'off', b: 'on' }
  },
  switch: {
    id: '158d0001f99dfb',
    model: 'ctrl_neutral1',
    prop: 'channel_0',
    value: { a: 'off', b: 'on' }
  },
  gw_rgb: {
    id: '7811dcb23d9d',
    model: 'gateway',
    prop: 'rgb',
    value: { a: 0, b: getColor(255, 0, 0, 100)}  // alfa procent
  },
  gw_mid: {
    id: '7811dcb23d9d',
    model: 'gateway',
    prop: 'mid',
    value: { a: 9, b: 9 }, // 0 - 8, 10 - 13, 20 - 29, custom 10001 | vol 3 > 1, 0 - standart, 10 - 100
  },
  gw_add: {
    id: '7811dcb23d9d',
    model: 'gateway',
    prop: 'join_permission',
    value: { a: 'no', b: 'yes' },
  },
  gw_del: {
    id: '7811dcb23d9d',
    model: 'gateway',
    prop: 'remove_device',
    value: { a: '158d00019c9f2b', b: '158d00019c9f2b' },
  },
  test: {
    id: '158d0001f99dfb',
    model: 'ctrl_neutral1',
    prop: 'status',
    value: { a: 'off', b: 'on' },
  },
};

const keyboard_command = 'gw_rgb';


function getColor(r, g, b, a) {

  return new Buffer([a, r, g, b]).readUInt32BE();
}

function colorOn() {
  sendCommand(null, 'b', 'gw_rgb');
  setTimeout(colorOff, 600)
}

function colorOff() {
  sendCommand(null, 'a', 'gw_rgb');
  setTimeout(colorOn, 600)
}

function alarm() {
   sendCommand(null, 'b', 'gw_mid');
  colorOn();
}

function worker() {
  // sendCommand(null, 'b', 'gw_rgb');
  //  alarm();
   sendCommand(null, 'b', 'gw_add');
  // sendCommand(null, 'b', 'gw_mid');
  // sendCommand(null, 'b', 'gw_del');

  // sendCommand(null, 'b', 'test');


}

//---------------------------------------------------

function sendCommand(id, value, v = keyboard_command) {
  let cmd = commandList[v];

  const data = {
    [cmd.prop]: cmd.value[value],
    key: getKey(),
  };

  const payload = {
    sid: cmd.id,
    // short_id: 0,
    cmd: 'write',
    model: cmd.model,
    data,
  };
  const string = JSON.stringify(payload);
  // console.log('-->', '', string)
  send(string);
}

function command(value) {
  const id = null;
  switch (value) {
    case 'exit':
      process.exit();
      break;
    case '0':
      sendCommand(id, 'a');
      break;
    case '1':
      sendCommand(id, 'b');
      break;
    default:
  }
  listenKeyboard();
}

function listenKeyboard() {
  rl.question('', command);
}

//----------------------------------------------------

function error(err) {
  console.log(`server error:\n${err.stack}`);
  server.close();
}

function listen() {

}

function message(data) {
//  console.log(data.toString());
  const msg = JSON.parse(data.toString());
  const print = parseMessage(msg);

  print && console.log('Unknown type msg', print)
}

function parseDeviceList(msg) {
  DEVICES_LIST = msg.data;
  TOKEN = msg.token;
  console.log('DEVICES_LIST:' , msg.data);
  console.log('----------------------------')
  worker();
}

function parseHeartbeat(msg) {
  if (msg.hasOwnProperty('token')) {
    TOKEN = msg.token;
  } else {
    if (msg.hasOwnProperty('data')) {
      print('info', msg);
    }
  }
}

function parseReport(msg) {
  print('report', msg);
}

function parseAck(msg) {
  print('status', msg);
}

function parseWriteAck(msg) {
  print('command', msg);
}

function parseMessage(msg) {
  switch (msg.cmd) {
    case 'get_id_list_ack':
      parseDeviceList(msg);
      return 0;
    case 'heartbeat':
      parseHeartbeat(msg);
      return 0
    case 'report':
      parseReport(msg);
      return 0
    case 'read_ack':
      parseAck(msg);
    case 'write_ack':
      parseWriteAck(msg);
      return 0
    default:
      return msg;
  }
}

function getStatusDevices() {
  send(`{"cmd":"read","sid":"158d0001b1cbf5"}`);
}

function checkStatusDevices() {
  setInterval(getStatusDevices, 2 * 1000);
}

function getKey() {
  let cipher = crypto.createCipheriv('aes-128-cbc', new Buffer('pnikapx23m8fryef'), new Buffer('F5ltCT0o3bO6aVoub1hWLg==', 'base64'));
  let encryptedData = cipher.update(TOKEN, 'utf8', 'hex') + cipher.final('hex');
  return encryptedData.toUpperCase().slice(0, 32);
}

function send(msg) {
  socket.send(msg, 0, msg.length, PORT, HOST);
}

function print(type, msg) {
  console.log(new Date().toLocaleString(), type.padEnd(8, ' '), '-->  ', msg.sid.padEnd(14, ' '), '', msg.data);
}

function start() {
   console.log('Start app...')
   socket.setBroadcast(true);
   socket.setMulticastTTL(128);
   socket.addMembership('224.0.0.50');
   send('{"cmd" : "get_id_list"}');
   listenKeyboard();
   // checkStatusDevices();
}
