const EventEmitter = require('events');
const dgram = require('dgram');
const crypto = require('crypto');

const { getDeviceTypeFromModel, getDevicePropertiesFromModel } = require('./utils');

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

    const temp1 = device.props.reduce((l, n) => Object.assign({}, l, { [n]: null }), {});
    const temp2 = JSON.parse(data);

    device.data = Object.assign({}, temp1, temp2);
  }

  setDeviceNewData(sid, data) {
    const device = this.deviceList[sid];
    const temp = JSON.parse(data);

    device.data = Object.assign({}, device.data, temp);
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
    setInterval(() => this.getDeviceState('158d0001f99dfb'), 2000);
  }
}

module.exports = Xiaomi;
