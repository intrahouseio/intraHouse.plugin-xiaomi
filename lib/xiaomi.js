const EventEmitter = require('events');
const dgram = require('dgram');
const crypto = require('crypto');

const IV = new Buffer('F5ltCT0o3bO6aVoub1hWLg==', 'base64');

const { getDeviceTypeFromModel, getDevicePropertiesFromModel } = require('./utils');

class Xiaomi extends EventEmitter {
  constructor(options) {
    super();

    this.options = {
      host: options.host || '192.168.0.127',
      port: options.port || 9898,
      password: new Buffer(options.password || '1234567890123456'),
    }
    this.lastToken = false;
    this.deviceList = {};
    this.manualListReport = [];
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

  setDeviceList(string, gateway) {
    const temp = JSON.parse(string);
    this.deviceList = temp.concat(gateway || []).reduce((l, n) => {
      return Object.assign({}, l, { [n]: { sid: n, type: false, props: [], data: {} } });
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

    const temp1 =  Object.keys(device.props).reduce((l, n) => Object.assign({}, l, { [n]: null }), {});
    const temp2 = JSON.parse(data);

    device.data = Object.assign({}, temp1, temp2);
  }

  setDeviceNewData(sid, data) {
    const device = this.deviceList[sid];
    const temp = JSON.parse(data);

    device.data = Object.assign({}, device.data, temp);
  }

  setDeviceManualReoirt(sid, model) {
    if (!model) {
      this.manualListReport.push(sid);
    }
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
    this.setDeviceList(msg.data, msg.sid);
    this.getDeviceTypes();
  }

  parseHeartbeat(msg) {
    if (msg.hasOwnProperty('token')) {
      this.setToken(msg.token);
    }

    if (msg.hasOwnProperty('data')) {
      this.parseReport(msg);
    }
  }

  parseReport(msg) {
    if(this.checkDevice(msg.sid)) {
      const device = this.deviceList[msg.sid];
      if (!device.type) {
        this.setDeviceType(msg.sid, msg.model);
        this.setDeviceProperties(msg.sid, msg.model);
        this.setDeviceInitData(msg.sid, msg.data);
        this.setDeviceManualReoirt(device.sid, device.model);
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

  getKey() {
    let cipher = crypto.createCipheriv('aes-128-cbc', this.options.password, IV);
    let encryptedData = cipher.update(this.lastToken, 'utf8', 'hex') + cipher.final('hex');
    return encryptedData.toUpperCase().slice(0, 32);
  }

  manualReport() {
    setInterval(() => {
      this.manualListReport.forEach(sid => this.getDeviceState(sid))
    }, 2000);
  }

  sendCommand(sid, command = 'ctrl_neutral1', value, channel = 'channel_0') {
    const payload = {
      sid: sid,
      short_id: 4343,
      cmd: 'write',
      model: command,
      data: {
        [channel]: value ? 'on' : 'off',
        key: this.getKey(),
      },
    };
    this.send(JSON.stringify(payload));
  }

  start() {
    this.socket.setBroadcast(true);
    this.socket.setMulticastTTL(128);
    this.socket.addMembership('224.0.0.50');
    this.getDeviceList();
    this.manualReport();
  }
}

module.exports = Xiaomi;
