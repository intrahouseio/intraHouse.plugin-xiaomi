const EventEmitter = require('events');
const dgram = require('dgram');
const crypto = require('crypto');

const { getDeviceTypeFromModel, getDevicePropertiesFromModel } = require('./devices');

class Xiaomi extends EventEmitter {
  constructor(options) {
    super();

    this.options = {
      host: options.host || '',
      port: options.port || 9898,
      password: options.password || '',
    }
    this.lastToken = false;
    this.deviceList = {};
    this.socket = dgram.createSocket('udp4');
    this.socket.on('error', this.error.bind(this));
    this.socket.on('message', this.message.bind(this));
    this.socket.bind(this.options.port, this.start.bind(this));
  }

  error() {

  }

  send(msg) {
    this.socket.send(msg, 0, msg.length, this.options.port, this.options.host);
  }

  message(data) {
    const msg = JSON.parse(data.toString());
    this.parseMessage(msg);
  }

  setToken(token) {
    this.lastToken = token;
  }

  setDeviceList(string) {
    const temp = JSON.parse(string);
    this.deviceList = temp.reduce((l, n) => {
      return { ...l, [n]: { sid: n, type: false, props: [], data: {} } };
    }, {});
  }

  setDeviceType(sid, model) {
    const device = this.deviceList[sid];
    const type = getDeviceTypeFromModel(model);
    device.type = type || `unknown_${sid}`;
    device.model = type && model;
  }

  setDeviceProperties(sid, model) {
    const device = this.deviceList[sid];
    const props = getDevicePropertiesFromModel(model);
    device.props = props;
  }

  setDeviceInitData(sid, data) {
    const device = this.deviceList[sid];

    const temp1 = device.props.reduce((l, n) => ({ ...l, [n]: null }), {});
    const temp2 = JSON.parse(data);

    device.data = { ...temp1, ...temp2 };
  }

  setDeviceNewData(sid, data) {
    const device = this.deviceList[sid];
    const temp = JSON.parse(data);

    device.data = { ...device.data, ...temp };
  }

  checkDevice(sid) {
    return this.deviceList.hasOwnProperty(sid);
  }

  parseMessage(msg) {
    switch (msg.cmd) {
      case 'get_id_list_ack':
        this.parseDeviceList(msg);
        return 0;
      case 'heartbeat':
        this.parseHeartbeat(msg);
        return 0
      case 'report':
        this.parseReport(msg);
        return 0
      case 'read_ack':
        this.parseReport(msg);
        return 0
      default:
        return msg;
    }
  }

  parseDeviceList(msg) {
    this.setToken(msg.token);
    this.setDeviceList(msg.data);
    this.getDeviceTypes();
  }

  parseHeartbeat() {

  }

  parseReport(msg) {
    if(this.checkDevice(msg.sid)) {
      const device = this.deviceList[msg.sid];
      if (!device.type) {
        this.setDeviceType(msg.sid, msg.model);
        this.setDeviceProperties(msg.sid, msg.model);
        this.setDeviceInitData(msg.sid, msg.data);
        this.emit('device', device)
      } else {
        this.setDeviceNewData(msg.sid, msg.data);
        this.emit('data', device)
      }
    } else {
      // console.log('new device!');
    }
  }

  getDeviceTypes() {
    Object.keys(this.deviceList)
      .forEach(sid => this.getDeviceState(sid));
  }

  getDeviceState(sid) {
    this.send(`{"cmd":"read","sid":"${sid}"}`);
  }

  getDeviceList() {
    this.send('{"cmd" : "get_id_list"}');
  }

  start() {
    this.socket.setBroadcast(true);
    this.socket.setMulticastTTL(128);
    this.socket.addMembership('224.0.0.50');
    this.getDeviceList();
  }
}

module.exports = Xiaomi;


/*
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
*/
