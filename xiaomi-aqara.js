const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const HOST = '192.168.0.127';

socket.on('error', error);
socket.on('message', message);
socket.on('listening', listen);
socket.bind(9898, start);


let DEVICES_LIST = {};
let TOKEN = '';


//---------------------------------------------------

function sendCommand(id, value) {
  const payload = {
    sid: id,
    short_id: 4343,
    cmd: 'write',
    model: 'ctrl_neutral1',
    data: {
      channel_01: value,
      key: getKey(),
    },
  };

  const old = '{"id":7,"method":"toggle_ctrl_neutral","params":["neutral_0","on"],"sid":"158d00019c9f2b"}';
  send(old);
  send(JSON.stringify(payload));
}

function command(value) {
  const id = '158d0001f99dfb'; // 158d00019c9f2b   158d0001f99dfb

  switch (value) {
    case 'exit':
      process.exit();
      break;
    case '0':
      sendCommand(id, 'off');
      break;
    case '1':
      sendCommand(id, 'on');
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
  const msg = JSON.parse(data.toString());
  const print = parseMessage(msg);

  print && console.log('Unknown type msg', print)
}

function parseDeviceList(msg) {
  DEVICES_LIST = msg.data;
  TOKEN = msg.token;
  console.log('DEVICES_LIST:' , msg.data);
  console.log('----------------------------')
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
      return 0
    default:
      return msg;
  }
}

function getStatusDevices() {
  send(`{"cmd":"read","sid":"158d00016c3dea"}`);
}

function checkStatusDevices() {
  setInterval(getStatusDevices, 2 * 1000);
}

function getKey() {
  let cipher = crypto.createCipheriv('aes-128-cbc', new Buffer('guxlbxgbhyax6oyc'), new Buffer('F5ltCT0o3bO6aVoub1hWLg==', 'base64'));
  let encryptedData = cipher.update(TOKEN, 'utf8', 'hex') + cipher.final('hex');
  return encryptedData.toUpperCase().slice(0, 32);
}

function send(msg) {
  socket.send(msg, 0, msg.length, 9898, HOST);
}

function print(type, msg) {
  console.log(new Date().toLocaleString(), type.padEnd(8, ' '), '-->  ', msg.sid.padEnd(14, ' '), msg.model, '', msg.data);
}

function start() {
   console.log('Start app...')
   socket.setBroadcast(true);
   socket.setMulticastTTL(128);
   socket.addMembership('224.0.0.50');
   send('{"cmd" : "get_id_list"}');
   listenKeyboard();
  //  checkStatusDevices();
}
